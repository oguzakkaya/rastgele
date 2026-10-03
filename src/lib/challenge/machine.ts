import { RESEARCH_DURATION_SECONDS, type Challenge, type ExplanationInput, type ResearchBrief } from "@/lib/types";

type WithChallenge = { challenge: Challenge };
type WithBrief = WithChallenge & { brief: ResearchBrief };
type Explaining = WithBrief & { researchSeconds: number; startedAt: number; draft: string };

export type FlowState =
  | { status: "idle" }
  | { status: "generating_topic" }
  | ({ status: "topic_reveal"; brief: ResearchBrief | null } & WithChallenge)
  | ({ status: "researching"; startedAt: number } & WithBrief)
  | ({ status: "transitioning"; researchSeconds: number } & WithBrief)
  | ({ status: "explaining" } & Explaining)
  | ({ status: "evaluating"; explanation: ExplanationInput } & Explaining)
  | { status: "result"; resultId: string }
  | ({ status: "spoken"; researchSeconds: number } & WithChallenge)
  | ({ status: "skipped" } & WithChallenge)
  | { status: "error"; kind: "topic" }
  | ({ status: "error"; kind: "evaluation"; explanation: ExplanationInput } & Explaining);

export type FlowStatus = FlowState["status"];

export type FlowEvent =
  | { type: "GENERATE" }
  | { type: "TOPIC_READY"; challenge: Challenge }
  | { type: "TOPIC_FAILED" }
  | { type: "BRIEF_READY"; brief: ResearchBrief }
  | { type: "START_RESEARCH"; now: number }
  | { type: "FINISH_RESEARCH"; now: number }
  | { type: "TRANSITION_DONE"; now: number }
  | { type: "UPDATE_DRAFT"; draft: string }
  | { type: "RESTART_EXPLANATION"; now: number }
  | { type: "SUBMIT"; explanation: ExplanationInput }
  | { type: "EVALUATION_FAILED" }
  | { type: "EVALUATION_DONE"; resultId: string }
  | { type: "RETRY_EVALUATION" }
  | { type: "BACK_TO_EXPLAIN" }
  | { type: "FINISH_SPEAKING" }
  | { type: "SKIP" }
  | { type: "RESUME"; state: FlowState };

export const initialFlowState: FlowState = { status: "idle" };

/**
 * Pure transition function. Events that don't apply to the current state
 * are ignored, which keeps double clicks and late async results harmless.
 */
export function flowReducer(state: FlowState, event: FlowEvent): FlowState {
  switch (event.type) {
    case "GENERATE":
      return { status: "generating_topic" };

    case "TOPIC_READY":
      if (state.status !== "generating_topic" && state.status !== "idle") return state;
      return { status: "topic_reveal", challenge: event.challenge, brief: null };

    case "TOPIC_FAILED":
      return state.status === "generating_topic" ? { status: "error", kind: "topic" } : state;

    case "BRIEF_READY":
      if (state.status !== "topic_reveal" || event.brief.topicId !== state.challenge.topic.id) return state;
      return { ...state, brief: event.brief };

    case "START_RESEARCH":
      if (state.status !== "topic_reveal" || !state.brief) return state;
      return { status: "researching", challenge: state.challenge, brief: state.brief, startedAt: event.now };

    case "FINISH_RESEARCH": {
      if (state.status !== "researching") return state;
      const limit = RESEARCH_DURATION_SECONDS;
      const elapsed = Math.round((event.now - state.startedAt) / 1000);
      return {
        status: "transitioning",
        challenge: state.challenge,
        brief: state.brief,
        researchSeconds: Math.min(limit, Math.max(0, elapsed)),
      };
    }

    case "TRANSITION_DONE":
      if (state.status !== "transitioning") return state;
      return { ...state, status: "explaining", startedAt: event.now, draft: "" };

    case "UPDATE_DRAFT":
      return state.status === "explaining" ? { ...state, draft: event.draft } : state;

    case "RESTART_EXPLANATION":
      return state.status === "explaining" ? { ...state, draft: "", startedAt: event.now } : state;

    case "SUBMIT":
      if (state.status !== "explaining") return state;
      return { ...state, status: "evaluating", explanation: event.explanation };

    case "EVALUATION_FAILED":
      if (state.status !== "evaluating") return state;
      return { ...state, status: "error", kind: "evaluation" };

    case "RETRY_EVALUATION":
      if (state.status !== "error" || state.kind !== "evaluation") return state;
      return { ...state, status: "evaluating" };

    case "BACK_TO_EXPLAIN":
      if (state.status !== "error" || state.kind !== "evaluation") return state;
      return { ...state, status: "explaining" };

    case "EVALUATION_DONE":
      return state.status === "evaluating" ? { status: "result", resultId: event.resultId } : state;

    case "FINISH_SPEAKING":
      if (state.status !== "explaining") return state;
      return { status: "spoken", challenge: state.challenge, researchSeconds: state.researchSeconds };

    case "SKIP":
      if ("challenge" in state) return { status: "skipped", challenge: state.challenge };
      return state;

    case "RESUME":
      return event.state;
  }
}

/** Research notes may only be shown before the transition starts. */
export function notesVisible(state: FlowState): boolean {
  return state.status === "researching";
}
