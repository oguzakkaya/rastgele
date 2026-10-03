import { describe, expect, it } from "vitest";
import { createChallengeStorage, DEFAULT_PREFERENCES } from "@/lib/storage/challenge-storage";
import { memoryStore } from "@/lib/storage/kv";
import { makeResult, makeTopic } from "./fixtures";

describe("history storage", () => {
  it("saves results newest first and finds them by id", () => {
    const storage = createChallengeStorage(memoryStore());
    storage.saveResult(makeResult("1", "2026-10-01T10:00:00Z"));
    storage.saveResult(makeResult("2", "2026-10-02T10:00:00Z"));
    expect(storage.getHistory().map((r) => r.id)).toEqual(["2", "1"]);
    expect(storage.getResult("1")?.id).toBe("1");
  });

  it("replaces an existing result with the same id", () => {
    const storage = createChallengeStorage(memoryStore());
    storage.saveResult(makeResult("1", "2026-10-01T10:00:00Z", 40));
    storage.saveResult(makeResult("1", "2026-10-01T10:00:00Z", 90));
    expect(storage.getHistory()).toHaveLength(1);
    expect(storage.getHistory()[0]?.evaluation?.overallScore).toBe(90);
  });

  it("survives corrupted data", () => {
    const store = memoryStore();
    store.set("rastgele:history:v1", "{not json");
    store.set("rastgele:prefs:v1", JSON.stringify({ researchDuration: 999 }));
    const storage = createChallengeStorage(store);
    expect(storage.getHistory()).toEqual([]);
    expect(storage.getPreferences()).toEqual(DEFAULT_PREFERENCES);
  });

  it("tracks recent topics", () => {
    const storage = createChallengeStorage(memoryStore());
    storage.addRecentTopic(makeTopic("a"));
    storage.addRecentTopic(makeTopic("b"));
    expect(storage.getRecentTopics().map((e) => e.topicId)).toEqual(["b", "a"]);
  });
});
