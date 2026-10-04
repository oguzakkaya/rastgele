import { describe, expect, it } from "vitest";
import { flowReducer, initialFlowState, notesVisible, type FlowState } from "@/lib/challenge/machine";
import { fromActive, toActive } from "@/lib/challenge/persistence";
import { getFallbackBrief } from "@/lib/topics/fallback";
import { RESEARCH_DURATION_SECONDS, type Challenge } from "@/lib/types";
import {
  challengePath,
  formatClock,
  remainingSeconds,
  researchClockSpeed,
  researchRemainingSeconds,
} from "@/lib/utils/time";
import { makeTopic } from "./fixtures";

const topic = makeTopic("t1");
const challenge: Challenge = {
  id: "c1",
  topic,
  preferences: { categories: [] },
  createdAt: "2026-10-03T10:00:00Z",
};
const brief = { ...getFallbackBrief(topic), topicId: topic.id };

function run(...events: Parameters<typeof flowReducer>[1][]): FlowState {
  return events.reduce(flowReducer, initialFlowState);
}

describe("timer state", () => {
  it("counts down from the start time and never goes negative", () => {
    expect(remainingSeconds(0, 180, 0)).toBe(180);
    expect(remainingSeconds(0, 180, 59_900)).toBe(121);
    expect(remainingSeconds(0, 180, 500_000)).toBe(0);
    expect(remainingSeconds(0, 900, 500, 2)).toBe(899);
    expect(remainingSeconds(0, 900, 450_000, 2)).toBe(0);
    expect(researchRemainingSeconds(0, 900, 1_000, 2)).toBe(899);
    expect(researchRemainingSeconds(0, 900, 15_000, 2)).toBe(885);
    expect(researchRemainingSeconds(0, 900, 15_500, 2)).toBe(884);
    expect(researchRemainingSeconds(0, 900, 450_000, 2)).toBe(15);
    expect(researchRemainingSeconds(0, 900, 451_000, 2)).toBe(14);
    expect(researchRemainingSeconds(0, 900, 465_000, 2)).toBe(0);
    expect(researchRemainingSeconds(0, 900, 465_000, 1)).toBe(435);
    expect(researchClockSpeed("2x")).toBe(2);
    expect(researchClockSpeed("3x")).toBe(3);
    expect(researchClockSpeed(null)).toBe(1);
    expect(challengePath("yeni", "2x")).toBe("/konu?id=yeni&speed=2x");
    expect(challengePath("yeni", "3x")).toBe("/konu?id=yeni&speed=3x");
    expect(challengePath("yeni", null)).toBe("/konu?id=yeni");
    expect(researchRemainingSeconds(0, 900, 15_000, 3)).toBe(885);
    expect(researchRemainingSeconds(0, 900, 16_000, 3)).toBe(882);
    expect(researchRemainingSeconds(0, 900, 305_000, 3)).toBe(15);
    expect(researchRemainingSeconds(0, 900, 320_000, 3)).toBe(0);
    expect(formatClock(180)).toBe("03:00");
    expect(formatClock(5)).toBe("00:05");
  });
});

describe("challenge state machine", () => {
  it("walks the happy path", () => {
    const s = run(
      { type: "GENERATE" },
      { type: "TOPIC_READY", challenge },
      { type: "BRIEF_READY", brief },
      { type: "START_RESEARCH", now: 0 },
      { type: "FINISH_RESEARCH", now: 30_000 },
    );
    expect(s.status).toBe("transitioning");
    if (s.status === "transitioning") expect(s.researchSeconds).toBe(Math.min(30, RESEARCH_DURATION_SECONDS));

    const explaining = flowReducer(s, { type: "TRANSITION_DONE", now: 31_000 });
    expect(explaining.status).toBe("explaining");
    expect(notesVisible(explaining)).toBe(false);

    const evaluating = flowReducer(explaining, {
      type: "SUBMIT",
      explanation: { kind: "text", text: "x", durationSeconds: 5 },
    });
    expect(evaluating.status).toBe("evaluating");
    expect(flowReducer(evaluating, { type: "EVALUATION_DONE", resultId: "r1" })).toEqual({
      status: "result",
      resultId: "r1",
    });
  });

  it("cannot start research before the brief is ready", () => {
    const s = run({ type: "GENERATE" }, { type: "TOPIC_READY", challenge }, { type: "START_RESEARCH", now: 0 });
    expect(s.status).toBe("topic_reveal");
  });

  it("caps research time at 15 minutes", () => {
    const s = run(
      { type: "GENERATE" },
      { type: "TOPIC_READY", challenge },
      { type: "BRIEF_READY", brief },
      { type: "START_RESEARCH", now: 0 },
      { type: "FINISH_RESEARCH", now: (RESEARCH_DURATION_SECONDS + 60) * 1000 },
    );
    expect(s.status === "transitioning" && s.researchSeconds).toBe(RESEARCH_DURATION_SECONDS);
  });

  it("keeps the explanation on evaluation failure and can retry", () => {
    const explanation = { kind: "text" as const, text: "explanation", durationSeconds: 5 };
    const failed = run(
      { type: "GENERATE" },
      { type: "TOPIC_READY", challenge },
      { type: "BRIEF_READY", brief },
      { type: "START_RESEARCH", now: 0 },
      { type: "FINISH_RESEARCH", now: 1000 },
      { type: "TRANSITION_DONE", now: 2000 },
      { type: "UPDATE_DRAFT", draft: "explanation" },
      { type: "SUBMIT", explanation },
      { type: "EVALUATION_FAILED" },
    );
    expect(failed.status).toBe("error");
    expect(flowReducer(failed, { type: "RETRY_EVALUATION" }).status).toBe("evaluating");
    const back = flowReducer(failed, { type: "BACK_TO_EXPLAIN" });
    expect(back.status === "explaining" && back.draft).toBe("explanation");
  });

  it("ignores late topic results after skipping", () => {
    const skipped = run({ type: "GENERATE" }, { type: "TOPIC_READY", challenge }, { type: "SKIP" });
    expect(skipped.status).toBe("skipped");
    expect(flowReducer(skipped, { type: "TOPIC_FAILED" })).toBe(skipped);
  });

  it("never reopens notes when resuming after the transition", () => {
    const s = run(
      { type: "GENERATE" },
      { type: "TOPIC_READY", challenge },
      { type: "BRIEF_READY", brief },
      { type: "START_RESEARCH", now: 0 },
      { type: "FINISH_RESEARCH", now: 1000 },
    );
    const active = toActive(s)!;
    expect(active.phase).toBe("explain");
    expect(fromActive(active, 5000).status).toBe("explaining");
  });

  it("keeps an expired research phase on the research screen until the button is pressed", () => {
    const resumed = fromActive(
      { challenge, brief, phase: "research", researchStartedAt: 0 },
      (RESEARCH_DURATION_SECONDS + 30) * 1000,
    );
    expect(resumed.status).toBe("researching");
    if (resumed.status === "researching") expect(resumed.startedAt).toBe(0);
  });
});
