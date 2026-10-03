import type { Evaluation, ResearchBrief, Topic } from "@/lib/types";
import { countWords, normalizeTr } from "@/lib/utils/text";
import { clampScore, weightedOverall } from "./parse";

const STOP_WORDS = new Set(
  "ve ile bir bu şu o da de ki mi ne için gibi daha çok en ama veya ya hem olan olarak her bazı kadar sonra önce göre".split(
    " ",
  ),
);

function contentWords(text: string): Set<string> {
  return new Set(
    normalizeTr(text)
      .split(" ")
      .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
      // Crude Turkish stemming: compare on the first 5 letters.
      .map((w) => w.slice(0, 5)),
  );
}

function overlap(point: string, answer: Set<string>): number {
  const words = [...contentWords(point)];
  if (words.length === 0) return 0;
  return words.filter((w) => answer.has(w)).length / words.length;
}

/**
 * Offline evaluator used when AI is unavailable. It can only estimate
 * coverage from shared vocabulary, so it never reports incorrect claims.
 */
export function heuristicEvaluation(topic: Topic, brief: ResearchBrief, text: string): Evaluation {
  const answer = contentWords(text);
  const words = countWords(text);

  const points = brief.keyPoints.length
    ? brief.keyPoints
    : brief.sections.length
      ? brief.sections.map((section) => section.content)
      : [topic.title];
  const pointScores = points.map((p) => ({ point: p, score: overlap(p, answer) }));
  const covered = pointScores.filter((p) => p.score >= 0.25);
  const pointRatio = points.length ? covered.length / points.length : 0;

  const lengthFactor = Math.min(1, words / 120);
  const coverage = clampScore(pointRatio * 100);
  const understanding = clampScore(coverage * 0.7 + lengthFactor * 30);
  const clarity = clampScore(40 + lengthFactor * 45 + (words > 20 ? 10 : 0));
  const accuracy = clampScore(55 + pointRatio * 35);

  const strengths: string[] = [];
  if (covered.length > 0 && brief.keyPoints.length + brief.sections.length > 0) {
    strengths.push(`${covered.length} önemli noktaya değindin.`);
  }
  if (words >= 80) strengths.push("Konuyu yeterli uzunlukta anlattın.");

  const missingPoints = pointScores
    .filter((p) => p.score < 0.25)
    .slice(0, 4)
    .map((p) => p.point);

  return {
    overallScore: weightedOverall({ understanding, accuracy, clarity, coverage }),
    understanding,
    accuracy,
    clarity,
    coverage,
    strengths,
    missingPoints,
    incorrectClaims: [],
    feedback:
      "Şu an yapay zekâ değerlendirmesi kullanılamıyor. Bu puan, anlatımının araştırma notlarındaki ana fikirlerle ne kadar örtüştüğüne bakan basit bir tahmin.",
    exampleExplanation: brief.keyPoints.slice(0, 4).join(" "),
    source: "fallback",
  };
}
