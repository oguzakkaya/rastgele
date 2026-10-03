import type { ActiveChallenge } from "@/lib/storage/challenge-storage";
import { EXPLAIN_DURATION_SECONDS } from "@/lib/types";
import { remainingSeconds } from "@/lib/utils/time";
import type { FlowState } from "./machine";

/** Snapshot of the flow worth persisting, or null when nothing is in progress. */
export function toActive(state: FlowState): ActiveChallenge | null {
  switch (state.status) {
    case "topic_reveal":
      return { challenge: state.challenge, brief: state.brief, phase: "reveal" };
    case "researching":
      return { challenge: state.challenge, brief: state.brief, phase: "research", researchStartedAt: state.startedAt };
    case "transitioning":
    case "explaining":
    case "evaluating":
    case "error":
      if (!("challenge" in state)) return null;
      return {
        challenge: state.challenge,
        brief: state.brief,
        phase: "explain",
        researchSeconds: state.researchSeconds,
        explainStartedAt: state.status === "explaining" ? state.startedAt : undefined,
      };
    default:
      return null;
  }
}

export function fromActive(active: ActiveChallenge, now: number): FlowState {
  const { challenge, brief } = active;
  if (active.phase === "explain" && brief) {
    const startedAt = active.explainStartedAt ?? now;
    const left = remainingSeconds(startedAt, EXPLAIN_DURATION_SECONDS, now);
    return {
      status: "explaining",
      challenge,
      brief,
      researchSeconds: active.researchSeconds ?? 0,
      startedAt: left > 0 ? startedAt : now - EXPLAIN_DURATION_SECONDS * 1000,
      draft: "",
    };
  }
  if (active.phase === "research" && brief && active.researchStartedAt !== undefined) {
    return { status: "researching", challenge, brief, startedAt: active.researchStartedAt };
  }
  return { status: "topic_reveal", challenge, brief };
}
