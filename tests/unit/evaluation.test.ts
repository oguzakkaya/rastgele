import { describe, expect, it } from "vitest";
import { heuristicEvaluation } from "@/lib/evaluation/heuristic";
import { clampScore, parseEvaluation } from "@/lib/evaluation/parse";
import { evaluateRequestSchema } from "@/lib/schemas";
import { FALLBACK_TOPICS, getFallbackBrief } from "@/lib/topics/fallback";

const valid = {
  overallScore: 82,
  understanding: 85,
  accuracy: 90,
  clarity: 75,
  coverage: 80,
  strengths: ["Good"],
  missingPoints: [],
  incorrectClaims: [],
  feedback: "Not bad.",
  exampleExplanation: "Example.",
};

describe("score validation", () => {
  it("clamps and rounds scores into 0-100 integers", () => {
    expect(clampScore(120)).toBe(100);
    expect(clampScore(-5)).toBe(0);
    expect(clampScore(72.6)).toBe(73);
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore("88")).toBe(88);
  });
});

describe("evaluation parser", () => {
  it("accepts a valid object", () => {
    expect(parseEvaluation(valid, "ai")).toMatchObject({ overallScore: 82, source: "ai" });
  });

  it("accepts a JSON string", () => {
    expect(parseEvaluation(JSON.stringify(valid), "ai")?.accuracy).toBe(90);
  });

  it("returns null for invalid JSON", () => {
    expect(parseEvaluation("{oops", "ai")).toBeNull();
  });

  it("returns null for unexpected shapes", () => {
    expect(parseEvaluation({ overallScore: "very good" }, "ai")).toBeNull();
    expect(parseEvaluation(null, "ai")).toBeNull();
  });

  it("normalizes out-of-range scores and trims lists", () => {
    const parsed = parseEvaluation(
      { ...valid, overallScore: 140, clarity: -3, strengths: [" a ", "", "b", "c", "d", "e", "f"] },
      "ai",
    );
    expect(parsed?.overallScore).toBe(100);
    expect(parsed?.clarity).toBe(0);
    expect(parsed?.strengths).toEqual(["a", "b", "c", "d", "e"]);
  });
});

describe("request validation", () => {
  it("rejects client-supplied scores and oversized explanations", () => {
    const topic = FALLBACK_TOPICS[0];
    const brief = getFallbackBrief(topic);
    const ok = evaluateRequestSchema.safeParse({
      topic,
      brief,
      explanation: { kind: "text", text: "hello world", durationSeconds: 10 },
      overallScore: 100,
    });
    expect(ok.success).toBe(true);
    expect(ok.data && "overallScore" in ok.data).toBe(false);

    const tooLong = evaluateRequestSchema.safeParse({
      topic,
      brief,
      explanation: { kind: "text", text: "a".repeat(5000), durationSeconds: 10 },
    });
    expect(tooLong.success).toBe(false);
  });
});

describe("offline heuristic evaluator", () => {
  const topic = FALLBACK_TOPICS.find((t) => t.id === "plasebo-etkisi-nasil-calisir")!;
  const brief = getFallbackBrief(topic);

  it("scores a relevant explanation higher than an irrelevant one", () => {
    const good = heuristicEvaluation(
      topic,
      brief,
      "A plasebo is a treatment with no active ingredient, and belief can change how the body responds.",
    );
    const bad = heuristicEvaluation(topic, brief, "The weather was nice and I walked in the park.");
    expect(good.overallScore).toBeGreaterThan(bad.overallScore);
    expect(good.source).toBe("fallback");
    expect(good.incorrectClaims).toEqual([]);
  });
});
