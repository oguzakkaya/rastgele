import type { ChallengeResult, Topic, TopicCategory } from "@/lib/types";

export function makeTopic(id: string, category: TopicCategory = "bilim", overrides: Partial<Topic> = {}): Topic {
  return {
    id,
    title: `Konu ${id}`,
    category,
    source: "fallback",
    ...overrides,
  };
}

export function makeResult(id: string, completedAt: string, score = 80, overrides: Partial<ChallengeResult> = {}): ChallengeResult {
  return {
    id,
    challenge: {
      id: `c-${id}`,
      topic: makeTopic(`t-${id}`),
      preferences: { categories: [] },
      createdAt: completedAt,
    },
    explanation: { kind: "text", text: "metin", durationSeconds: 30, wordCount: 1, submittedAt: completedAt },
    evaluation: {
      overallScore: score,
      understanding: score,
      accuracy: score,
      clarity: score,
      coverage: score,
      strengths: [],
      missingPoints: [],
      incorrectClaims: [],
      feedback: "",
      exampleExplanation: "",
      source: "fallback",
    },
    researchSeconds: 120,
    completedAt,
    ...overrides,
  };
}
