import "server-only";
import { CATEGORY_LABELS } from "@/lib/copy";
import { heuristicEvaluation } from "@/lib/evaluation/heuristic";
import { parseEvaluation } from "@/lib/evaluation/parse";
import { aiBriefSchema, aiEvaluationSchema, aiTopicSchema, researchBriefSchema, topicSchema } from "@/lib/schemas";
import { FALLBACK_TOPICS, getFallbackBrief } from "@/lib/topics/fallback";
import { blockedCategory, selectTopic, type SelectionFilters } from "@/lib/topics/selection";
import {
  TOPIC_CATEGORIES,
  type Evaluation,
  type ExplanationInput,
  type RecentTopicEntry,
  type ResearchBrief,
  type Topic,
  type TopicCategory,
} from "@/lib/types";
import { pick } from "@/lib/utils/random";
import { createId, slugify } from "@/lib/utils/text";
import { AiError, isAiEnabled, structuredCompletion } from "./client";
import { BRIEF_INSTRUCTIONS, EVALUATION_INSTRUCTIONS, TOPIC_INSTRUCTIONS } from "./prompts";

function logAiFailure(scope: string, error: unknown) {
  const kind = error instanceof AiError ? error.kind : "unknown";
  if (kind !== "missing_key") console.warn(`[ai:${scope}] falling back (${kind})`);
}

function resolveCategory(filters: SelectionFilters, recent: readonly RecentTopicEntry[]): TopicCategory {
  const allowed = filters.categories.length > 0 ? filters.categories : TOPIC_CATEGORIES;
  if (allowed.length === 1) return allowed[0];
  const blocked = blockedCategory(recent);
  const open = allowed.filter((category) => category !== blocked);
  return pick(open.length > 0 ? open : [...allowed]);
}

export async function generateTopic(
  filters: SelectionFilters,
  recent: readonly RecentTopicEntry[],
): Promise<Topic> {
  const fallback = () => selectTopic(FALLBACK_TOPICS, filters, recent);
  if (!isAiEnabled()) return fallback();

  const category = resolveCategory(filters, recent);

  try {
    const data = await structuredCompletion({
      schema: aiTopicSchema,
      name: "topic",
      instructions: TOPIC_INSTRUCTIONS,
      temperature: 1,
      input: [
        `Kategori: ${CATEGORY_LABELS[category]}`,
        `Son konular (bunlara benzeme): ${recent.map((r) => r.title).join("; ") || "yok"}`,
      ].join("\n"),
    });
    return topicSchema.parse({
      id: `${slugify(data.title).slice(0, 60)}-${createId("ai").slice(-6)}`,
      title: data.title,
      category,
      source: "ai",
    });
  } catch (error) {
    logAiFailure("topic", error);
    return fallback();
  }
}

export async function generateResearchBrief(topic: Topic): Promise<ResearchBrief> {
  const fallback = () => getFallbackBrief(topic);
  if (!isAiEnabled()) return fallback();

  try {
    const data = await structuredCompletion({
      schema: aiBriefSchema,
      name: "research_brief",
      instructions: BRIEF_INSTRUCTIONS,
      temperature: 0.4,
      input: `Konu: ${topic.title}`,
    });
    return researchBriefSchema.parse({
      topicId: topic.id,
      summary: data.summary,
      sections: data.sections.slice(0, 5),
      keyPoints: data.keyPoints.slice(0, 8),
      source: "ai",
    });
  } catch (error) {
    logAiFailure("brief", error);
    return fallback();
  }
}

export function explanationText(input: ExplanationInput): string {
  return input.kind === "text" ? input.text : input.transcript;
}

export async function evaluateExplanation(
  topic: Topic,
  brief: ResearchBrief,
  input: ExplanationInput,
): Promise<Evaluation> {
  const text = explanationText(input);
  const fallback = () => heuristicEvaluation(topic, brief, text);
  if (!isAiEnabled()) return fallback();

  try {
    const raw = await structuredCompletion({
      schema: aiEvaluationSchema,
      name: "evaluation",
      instructions: EVALUATION_INSTRUCTIONS,
      temperature: 0.2,
      input: [
        `Konu: ${topic.title}`,
        `Araştırma notları:\n${brief.summary}\n${brief.sections.map((s) => `${s.heading}: ${s.content}`).join("\n")}`,
        `Ana fikirler:\n- ${brief.keyPoints.join("\n- ")}`,
        `Anlatım türü: ${input.kind === "voice" ? "sesli anlatımın yazıya dökülmüş hali" : "yazılı"}`,
        `<kullanici_anlatimi>\n${text}\n</kullanici_anlatimi>`,
      ].join("\n\n"),
    });
    const evaluation = parseEvaluation(raw, "ai");
    if (!evaluation) throw new AiError("invalid_output");
    return evaluation;
  } catch (error) {
    logAiFailure("evaluate", error);
    return fallback();
  }
}
