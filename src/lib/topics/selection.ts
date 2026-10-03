import type { RecentTopicEntry, Topic, TopicCategory } from "@/lib/types";
import { pick, type Rng } from "@/lib/utils/random";

export type SelectionFilters = {
  /** Empty means every category. */
  categories: readonly TopicCategory[];
};

export const RECENT_LIMIT = 20;
const MAX_SAME_CATEGORY_IN_A_ROW = 2;

export function filterTopics(pool: readonly Topic[], filters: SelectionFilters): Topic[] {
  if (filters.categories.length === 0) return [...pool];
  const allowed = new Set(filters.categories);
  return pool.filter((t) => allowed.has(t.category));
}

/**
 * Category that has appeared too many times in a row at the head of the
 * recent list. Topics from it are avoided when the category is free.
 */
export function blockedCategory(recent: readonly RecentTopicEntry[]): TopicCategory | null {
  const head = recent.slice(0, MAX_SAME_CATEGORY_IN_A_ROW);
  if (head.length < MAX_SAME_CATEGORY_IN_A_ROW) return null;
  return head.every((e) => e.category === head[0].category) ? head[0].category : null;
}

/**
 * Picks a topic that:
 * 1. matches the selected categories (or the whole pool, when none are selected),
 * 2. was not shown recently (unless the pool is exhausted),
 * 3. does not extend a run of the same category when more than one category is allowed.
 * Recent entries are ordered newest first.
 */
export function selectTopic(
  pool: readonly Topic[],
  filters: SelectionFilters,
  recent: readonly RecentTopicEntry[],
  rng: Rng = Math.random,
): Topic {
  if (pool.length === 0) throw new Error("Topic pool is empty");

  let candidates = filterTopics(pool, filters);
  if (candidates.length === 0) candidates = [...pool];

  const recentIds = new Set(recent.map((e) => e.topicId));
  const fresh = candidates.filter((t) => !recentIds.has(t.id));
  if (fresh.length > 0) {
    candidates = fresh;
  } else {
    // Pool exhausted: prefer the topic seen longest ago.
    const order = new Map(recent.map((e, i) => [e.topicId, i]));
    const maxIndex = Math.max(...candidates.map((t) => order.get(t.id) ?? -1));
    candidates = candidates.filter((t) => (order.get(t.id) ?? -1) === maxIndex);
  }

  if (filters.categories.length !== 1) {
    const blocked = blockedCategory(recent);
    const balanced = candidates.filter((t) => t.category !== blocked);
    if (balanced.length > 0) candidates = balanced;

    // Pick a category first so categories with many topics don't dominate.
    const categories = [...new Set(candidates.map((t) => t.category))];
    const category = pick(categories, rng);
    candidates = candidates.filter((t) => t.category === category);
  }

  return pick(candidates, rng);
}

export function pushRecent(
  recent: readonly RecentTopicEntry[],
  topic: Topic,
  now: Date = new Date(),
): RecentTopicEntry[] {
  const entry: RecentTopicEntry = {
    topicId: topic.id,
    title: topic.title,
    category: topic.category,
    shownAt: now.toISOString(),
  };
  return [entry, ...recent.filter((e) => e.topicId !== topic.id)].slice(0, RECENT_LIMIT);
}
