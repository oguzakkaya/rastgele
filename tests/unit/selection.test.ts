import { describe, expect, it } from "vitest";
import { FALLBACK_TOPICS } from "@/lib/topics/fallback";
import { blockedCategory, pushRecent, selectTopic } from "@/lib/topics/selection";
import type { RecentTopicEntry } from "@/lib/types";
import { seededRng } from "@/lib/utils/random";
import { makeTopic } from "./fixtures";

const recentOf = (...topics: ReturnType<typeof makeTopic>[]): RecentTopicEntry[] =>
  topics.map((t) => ({ topicId: t.id, title: t.title, category: t.category, shownAt: "2026-10-01T00:00:00Z" }));

describe("topic randomization", () => {
  it("respects the category filter", () => {
    const pool = [makeTopic("a", "tarih"), makeTopic("b", "bilim"), makeTopic("c", "bilim")];
    const topic = selectTopic(pool, { categories: ["tarih"] }, []);
    expect(topic.id).toBe("a");
  });

  it("produces variety over many draws", () => {
    const rng = seededRng(42);
    let recent: RecentTopicEntry[] = [];
    const seen = new Set<string>();
    for (let i = 0; i < FALLBACK_TOPICS.length; i++) {
      const t = selectTopic(FALLBACK_TOPICS, { categories: [] }, recent, rng);
      seen.add(t.id);
      recent = pushRecent(recent, t);
    }
    expect(seen.size).toBe(FALLBACK_TOPICS.length);
  });
});

describe("recent topic exclusion", () => {
  it("never returns a recently shown topic while fresh ones exist", () => {
    const pool = [makeTopic("a"), makeTopic("b"), makeTopic("c")];
    const recent = recentOf(pool[0], pool[1]);
    for (let seed = 0; seed < 20; seed++) {
      expect(selectTopic(pool, { categories: ["bilim"] }, recent, seededRng(seed)).id).toBe("c");
    }
  });

  it("falls back to the oldest seen topic when the pool is exhausted", () => {
    const pool = [makeTopic("a"), makeTopic("b")];
    const recent = recentOf(pool[1], pool[0]); // newest first: b, then a
    expect(selectTopic(pool, { categories: ["bilim"] }, recent).id).toBe("a");
  });

  it("avoids a third topic in a row from the same category", () => {
    const pool = [makeTopic("h1", "tarih"), makeTopic("h2", "tarih"), makeTopic("h3", "tarih"), makeTopic("s1", "bilim")];
    const recent = recentOf(pool[0], pool[1]);
    expect(blockedCategory(recent)).toBe("tarih");
    for (let seed = 0; seed < 20; seed++) {
      expect(selectTopic(pool, { categories: [] }, recent, seededRng(seed)).category).toBe("bilim");
    }
  });

  it("allows same category in a row when explicitly selected", () => {
    const pool = [makeTopic("h1", "tarih"), makeTopic("h2", "tarih"), makeTopic("h3", "tarih")];
    const recent = recentOf(pool[0], pool[1]);
    expect(selectTopic(pool, { categories: ["tarih"] }, recent).id).toBe("h3");
  });

  it("stays inside the selected categories", () => {
    const pool = [makeTopic("a", "tarih"), makeTopic("b", "bilim"), makeTopic("c", "sanat")];
    for (let seed = 0; seed < 20; seed++) {
      const topic = selectTopic(pool, { categories: ["tarih", "sanat"] }, [], seededRng(seed));
      expect(["tarih", "sanat"]).toContain(topic.category);
    }
  });

  it("keeps recent list deduplicated and newest first", () => {
    const a = makeTopic("a");
    const b = makeTopic("b");
    const list = pushRecent(pushRecent(pushRecent([], a), b), a);
    expect(list.map((e) => e.topicId)).toEqual(["a", "b"]);
  });
});
