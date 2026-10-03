import { calculateStats } from "@/lib/stats";
import { pushRecent } from "@/lib/topics/selection";
import {
  TOPIC_CATEGORIES,
  type Challenge,
  type ChallengePreferences,
  type ChallengeResult,
  type RecentTopicEntry,
  type ResearchBrief,
  type Topic,
  type TopicCategory,
  type UserStats,
} from "@/lib/types";
import { browserStore, type KeyValueStore } from "./kv";

const KEYS = {
  history: "rastgele:history:v1",
  recent: "rastgele:recent:v1",
  prefs: "rastgele:prefs:v1",
  active: "rastgele:active:v1",
} as const;

const HISTORY_LIMIT = 200;

export const DEFAULT_PREFERENCES: ChallengePreferences = {
  categories: [],
};

function isTopicCategory(value: unknown): value is TopicCategory {
  return typeof value === "string" && (TOPIC_CATEGORIES as readonly string[]).includes(value);
}

/** Drops unknown values. Selecting every category collapses back to "Tümü". */
export function normalizeCategories(values: readonly unknown[]): TopicCategory[] {
  const unique = [...new Set(values.filter(isTopicCategory))];
  return unique.length === TOPIC_CATEGORIES.length ? [] : unique;
}

/**
 * In-progress challenge kept in storage so /konu/[id] survives a reload.
 * Once phase is "explain" the notes must never be shown again.
 */
export type ActiveChallenge = {
  challenge: Challenge;
  brief: ResearchBrief | null;
  phase: "reveal" | "research" | "explain";
  researchStartedAt?: number;
  researchSeconds?: number;
  explainStartedAt?: number;
};

function readJson<T>(store: KeyValueStore, key: string, fallback: T): T {
  const raw = store.get(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function createChallengeStorage(store: KeyValueStore) {
  const write = (key: string, value: unknown) => store.set(key, JSON.stringify(value));

  return {
    getHistory(): ChallengeResult[] {
      const list = readJson<ChallengeResult[]>(store, KEYS.history, []);
      return Array.isArray(list) ? list : [];
    },

    getResult(id: string): ChallengeResult | undefined {
      return this.getHistory().find((r) => r.id === id);
    },

    saveResult(result: ChallengeResult): void {
      const rest = this.getHistory().filter((r) => r.id !== result.id);
      write(KEYS.history, [result, ...rest].slice(0, HISTORY_LIMIT));
    },

    getStats(now?: Date): UserStats {
      return calculateStats(this.getHistory(), now);
    },

    getRecentTopics(): RecentTopicEntry[] {
      const list = readJson<RecentTopicEntry[]>(store, KEYS.recent, []);
      return Array.isArray(list) ? list : [];
    },

    addRecentTopic(topic: Topic): void {
      write(KEYS.recent, pushRecent(this.getRecentTopics(), topic));
    },

    getPreferences(): ChallengePreferences {
      const prefs = readJson<{ categories?: unknown; category?: unknown }>(store, KEYS.prefs, {});
      if (Array.isArray(prefs.categories)) return { categories: normalizeCategories(prefs.categories) };
      if (isTopicCategory(prefs.category)) return { categories: [prefs.category] };
      return DEFAULT_PREFERENCES;
    },

    savePreferences(prefs: ChallengePreferences): void {
      write(KEYS.prefs, prefs);
    },

    getActive(): ActiveChallenge | null {
      return readJson<ActiveChallenge | null>(store, KEYS.active, null);
    },

    setActive(active: ActiveChallenge): void {
      write(KEYS.active, active);
    },

    clearActive(): void {
      store.remove(KEYS.active);
    },
  };
}

export type ChallengeStorage = ReturnType<typeof createChallengeStorage>;

let instance: ChallengeStorage | null = null;

export function getChallengeStorage(): ChallengeStorage {
  if (!instance) instance = createChallengeStorage(browserStore());
  return instance;
}
