import { aiEvaluationSchema } from "@/lib/schemas";
import type { Evaluation, TopicSource } from "@/lib/types";

export function clampScore(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n)));
}

const cleanList = (items: string[], max = 5) =>
  items.map((s) => s.trim()).filter(Boolean).slice(0, max);

/**
 * Validates raw evaluation output and normalizes it. Returns null when the
 * shape is unusable so callers can fall back instead of crashing.
 */
export function parseEvaluation(raw: unknown, source: TopicSource): Evaluation | null {
  let value = raw;
  if (typeof raw === "string") {
    try {
      value = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  const parsed = aiEvaluationSchema.safeParse(value);
  if (!parsed.success) return null;
  const d = parsed.data;

  const understanding = clampScore(d.understanding);
  const accuracy = clampScore(d.accuracy);
  const clarity = clampScore(d.clarity);
  const coverage = clampScore(d.coverage);
  const overall = Number.isFinite(d.overallScore)
    ? clampScore(d.overallScore)
    : weightedOverall({ understanding, accuracy, clarity, coverage });

  return {
    overallScore: overall,
    understanding,
    accuracy,
    clarity,
    coverage,
    strengths: cleanList(d.strengths),
    missingPoints: cleanList(d.missingPoints),
    incorrectClaims: cleanList(d.incorrectClaims),
    feedback: d.feedback.trim().slice(0, 800),
    exampleExplanation: d.exampleExplanation.trim().slice(0, 1500),
    source,
  };
}

export function weightedOverall(s: {
  understanding: number;
  accuracy: number;
  clarity: number;
  coverage: number;
}): number {
  return clampScore(s.understanding * 0.35 + s.accuracy * 0.25 + s.coverage * 0.25 + s.clarity * 0.15);
}
