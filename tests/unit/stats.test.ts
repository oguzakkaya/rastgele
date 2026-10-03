import { describe, expect, it } from "vitest";
import { calculateStats, calculateStreaks } from "@/lib/stats";
import { makeResult } from "./fixtures";

describe("streak calculation", () => {
  it("is zero with no activity", () => {
    expect(calculateStreaks([], "2026-10-03")).toEqual({ current: 0, longest: 0 });
  });

  it("counts consecutive days ending today", () => {
    expect(calculateStreaks(["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-03"], "2026-10-03")).toEqual({
      current: 3,
      longest: 3,
    });
  });

  it("stays alive if the last activity was yesterday", () => {
    expect(calculateStreaks(["2026-10-01", "2026-10-02"], "2026-10-03").current).toBe(2);
  });

  it("breaks after a missed day but keeps the longest", () => {
    const days = ["2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-10-01"];
    expect(calculateStreaks(days, "2026-10-03")).toEqual({ current: 0, longest: 4 });
  });

  it("handles month boundaries", () => {
    expect(calculateStreaks(["2026-09-30", "2026-10-01"], "2026-10-01").current).toBe(2);
  });
});

describe("stats", () => {
  it("aggregates completions, research time and top category", () => {
    const now = new Date("2026-10-03T12:00:00Z");
    const stats = calculateStats(
      [makeResult("1", "2026-10-03T10:00:00Z", 90), makeResult("2", "2026-10-02T10:00:00Z", 71)],
      now,
    );
    expect(stats.completedCount).toBe(2);
    expect(stats.totalResearchSeconds).toBe(240);
    expect(stats.topCategory).toBe("bilim");
    expect(stats.currentStreak).toBe(2);
  });
});
