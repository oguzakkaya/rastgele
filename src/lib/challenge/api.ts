import { heuristicEvaluation } from "@/lib/evaluation/heuristic";
import { FALLBACK_TOPICS, getFallbackBrief } from "@/lib/topics/fallback";
import { selectTopic, type SelectionFilters } from "@/lib/topics/selection";
import type { Evaluation, ExplanationInput, RecentTopicEntry, ResearchBrief, Topic } from "@/lib/types";

/** Client-side calls to our API routes, with offline fallbacks. */

export class RequestError extends Error {
  constructor(public status: number) {
    super(`request_failed_${status}`);
  }
}

const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

async function post<T>(url: string, body: unknown, timeoutMs = 30_000): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) throw new RequestError(res.status);
    return (await res.json()) as T;
  } finally {
    clearTimeout(timer);
  }
}

export type Offlineable<T> = { value: T; offline: boolean };

export async function fetchTopic(
  filters: SelectionFilters,
  recent: RecentTopicEntry[],
): Promise<Offlineable<Topic>> {
  if (isOffline()) return { value: selectTopic(FALLBACK_TOPICS, filters, recent), offline: true };
  const { topic } = await post<{ topic: Topic }>("/api/topic", { ...filters, recent });
  return { value: topic, offline: false };
}

function minimalBrief(topic: Topic): ResearchBrief {
  return getFallbackBrief(topic);
}

export async function fetchBrief(topic: Topic): Promise<ResearchBrief> {
  if (isOffline()) return minimalBrief(topic);
  try {
    const { brief } = await post<{ brief: ResearchBrief }>("/api/research", { topic });
    return brief;
  } catch {
    return minimalBrief(topic);
  }
}

export async function fetchEvaluation(
  topic: Topic,
  brief: ResearchBrief,
  explanation: ExplanationInput,
): Promise<Offlineable<Evaluation>> {
  if (isOffline()) {
    const text = explanation.kind === "text" ? explanation.text : explanation.transcript;
    return { value: heuristicEvaluation(topic, brief, text), offline: true };
  }
  const { evaluation } = await post<{ evaluation: Evaluation }>(
    "/api/evaluate",
    { topic, brief, explanation },
    45_000,
  );
  return { value: evaluation, offline: false };
}
