import { z } from "zod";
import { EXPLANATION_LIMITS } from "./copy";
import { TOPIC_CATEGORIES } from "./types";

const shortText = (max: number) => z.string().trim().min(1).max(max);

export const categorySchema = z.enum(TOPIC_CATEGORIES);

export const topicSchema = z.object({
  id: shortText(120),
  title: shortText(160),
  category: categorySchema,
  source: z.enum(["ai", "fallback"]),
});

export const researchBriefSchema = z.object({
  topicId: shortText(120),
  summary: z.string().max(1500),
  sections: z.array(z.object({ heading: shortText(120), content: shortText(1500) })).max(8),
  keyPoints: z.array(shortText(400)).max(12),
  source: z.enum(["ai", "fallback"]),
});

/* ---------- API request bodies ---------- */

export const topicRequestSchema = z.object({
  categories: z.array(categorySchema).max(TOPIC_CATEGORIES.length).default([]),
  recent: z
    .array(
      z.object({
        topicId: shortText(120),
        title: shortText(160),
        category: categorySchema,
        shownAt: z.string().max(40),
      }),
    )
    .max(30)
    .default([]),
});

export const researchRequestSchema = z.object({ topic: topicSchema });

export const explanationInputSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("text"),
    text: z.string().trim().min(1).max(EXPLANATION_LIMITS.maxChars),
    durationSeconds: z.number().int().min(0).max(36_000),
  }),
  z.object({
    kind: z.literal("voice"),
    transcript: z.string().trim().min(1).max(EXPLANATION_LIMITS.maxChars),
    durationSeconds: z.number().int().min(0).max(36_000),
  }),
]);

export const evaluateRequestSchema = z.object({
  topic: topicSchema,
  brief: researchBriefSchema,
  explanation: explanationInputSchema,
});

/* ---------- AI structured outputs ---------- */
// Kept free of numeric bounds so they stay compatible with strict JSON schema;
// bounds are enforced afterwards by the parsers.

export const aiTopicSchema = z.object({
  title: z.string(),
});

export const aiBriefSchema = z.object({
  summary: z.string(),
  sections: z.array(z.object({ heading: z.string(), content: z.string() })),
  keyPoints: z.array(z.string()),
});

export const aiEvaluationSchema = z.object({
  overallScore: z.number(),
  understanding: z.number(),
  accuracy: z.number(),
  clarity: z.number(),
  coverage: z.number(),
  strengths: z.array(z.string()),
  missingPoints: z.array(z.string()),
  incorrectClaims: z.array(z.string()),
  feedback: z.string(),
  exampleExplanation: z.string(),
});
