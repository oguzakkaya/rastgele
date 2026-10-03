"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useReducer, useRef } from "react";
import { track } from "@/lib/analytics";
import { fetchBrief, fetchEvaluation, fetchTopic } from "@/lib/challenge/api";
import { flowReducer, initialFlowState, type FlowState } from "@/lib/challenge/machine";
import { fromActive, toActive } from "@/lib/challenge/persistence";
import { playTimeUp, playTopicFound, primeTopicSpin, TOPIC_SPIN_MS } from "@/lib/sound/topic-spin";
import { getChallengeStorage } from "@/lib/storage/challenge-storage";
import type { Challenge, ChallengeResult, ExplanationInput } from "@/lib/types";
import { countWords, createId } from "@/lib/utils/text";

export type FlowOptions = { routeId: string };

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Initial state: resume an in-progress attempt or start generating.
 * Must only run in the browser (reads local storage).
 */
function initFlow(options: FlowOptions): FlowState {
  const active = getChallengeStorage().getActive();
  if (options.routeId === "yeni") return { status: "generating_topic" };
  if (active?.challenge.id === options.routeId) return fromActive(active, Date.now());
  return initialFlowState;
}

export function useChallengeFlow(options: FlowOptions) {
  const router = useRouter();
  const [state, dispatch] = useReducer(flowReducer, options, initFlow);
  const startedRef = useRef(false);
  const briefRequestedFor = useRef<string | null>(null);
  const evaluatingRef = useRef(false);

  const generate = useCallback(async () => {
    primeTopicSpin();
    const storage = getChallengeStorage();
    const prefs = storage.getPreferences();
    dispatch({ type: "GENERATE" });
    track("challenge_started", { categories: prefs.categories.join(",") || "tumu" });
    try {
      const [{ value: topic }] = await Promise.all([
        fetchTopic({ categories: prefs.categories }, storage.getRecentTopics()),
        delay(prefersReducedMotion() ? 0 : TOPIC_SPIN_MS),
      ]);
      const challenge: Challenge = {
        id: createId("k"),
        topic,
        preferences: prefs,
        createdAt: new Date().toISOString(),
      };
      storage.addRecentTopic(topic);
      track("topic_generated", { topicId: topic.id, category: topic.category, source: topic.source });
      // The /konu/[id] page remounts and resumes from this saved attempt.
      storage.setActive({ challenge, brief: null, phase: "reveal" });
      if (!prefersReducedMotion()) playTopicFound();
      router.replace(`/konu?id=${challenge.id}`);
    } catch {
      dispatch({ type: "TOPIC_FAILED" });
    }
  }, [router]);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    if (state.status === "generating_topic") void generate();
  }, [state.status, generate]);

  // Prepare research notes while the reveal animation plays.
  useEffect(() => {
    if (state.status !== "topic_reveal" || state.brief) return;
    const topic = state.challenge.topic;
    if (briefRequestedFor.current === topic.id) return;
    briefRequestedFor.current = topic.id;
    void fetchBrief(topic).then((brief) => dispatch({ type: "BRIEF_READY", brief }));
  }, [state]);

  // Persist the in-progress attempt so a reload doesn't reopen the notes.
  useEffect(() => {
    const storage = getChallengeStorage();
    const active = toActive(state);
    if (active) storage.setActive(active);
    else if (state.status === "result" || state.status === "skipped" || state.status === "spoken") storage.clearActive();
  }, [state]);

  // Evaluate when entering the "evaluating" state.
  useEffect(() => {
    if (state.status !== "evaluating" || evaluatingRef.current) return;
    evaluatingRef.current = true;
    const { challenge, brief, explanation, researchSeconds } = state;

    fetchEvaluation(challenge.topic, brief, explanation)
      .then(({ value: evaluation }) => {
        const text = explanation.kind === "text" ? explanation.text : explanation.transcript;
        const result: ChallengeResult = {
          id: createId("s"),
          challenge,
          explanation: { ...explanation, wordCount: countWords(text), submittedAt: new Date().toISOString() },
          evaluation,
          researchSeconds,
          completedAt: new Date().toISOString(),
        };
        getChallengeStorage().saveResult(result);
        track("challenge_completed", { topicId: challenge.topic.id, score: evaluation.overallScore, source: evaluation.source });
        dispatch({ type: "EVALUATION_DONE", resultId: result.id });
        router.push(`/sonuc?id=${result.id}`);
      })
      .catch(() => dispatch({ type: "EVALUATION_FAILED" }))
      .finally(() => {
        evaluatingRef.current = false;
      });
  }, [state, router]);

  const actions = {
    generate,
    startResearch: () => {
      dispatch({ type: "START_RESEARCH", now: Date.now() });
      if (state.status === "topic_reveal") track("research_started", { topicId: state.challenge.topic.id });
    },
    finishResearch: () => {
      if (state.status === "researching") track("research_completed", { topicId: state.challenge.topic.id });
      dispatch({ type: "FINISH_RESEARCH", now: Date.now() });
    },
    transitionDone: () => dispatch({ type: "TRANSITION_DONE", now: Date.now() }),
    finishSpeaking: () => {
      if (state.status !== "explaining") return;
      playTimeUp();
      const completedAt = new Date().toISOString();
      getChallengeStorage().saveResult({
        id: createId("s"),
        challenge: state.challenge,
        researchSeconds: state.researchSeconds,
        completedAt,
      });
      track("challenge_completed", { topicId: state.challenge.topic.id });
      dispatch({ type: "FINISH_SPEAKING" });
    },
    updateDraft: (draft: string) => dispatch({ type: "UPDATE_DRAFT", draft }),
    restartExplanation: () => dispatch({ type: "RESTART_EXPLANATION", now: Date.now() }),
    explanationStarted: () => track("explanation_started"),
    submit: (explanation: ExplanationInput) => {
      track("explanation_submitted", { kind: explanation.kind, seconds: explanation.durationSeconds });
      dispatch({ type: "SUBMIT", explanation });
    },
    retryEvaluation: () => dispatch({ type: "RETRY_EVALUATION" }),
    backToExplain: () => dispatch({ type: "BACK_TO_EXPLAIN" }),
    skip: () => {
      if ("challenge" in state) track("challenge_skipped", { topicId: state.challenge.topic.id });
      dispatch({ type: "SKIP" });
    },
  };

  return { state, actions };
}

export type ChallengeFlowState = FlowState;
