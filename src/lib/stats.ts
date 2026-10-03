import type { ChallengeResult, TopicCategory, UserStats } from "./types";
import { daysBetweenKeys, toDateKey } from "./utils/date";

export type Streaks = { current: number; longest: number };

/**
 * Streaks count distinct calendar days with at least one completion.
 * The current streak stays alive if the last active day is today or yesterday.
 */
export function calculateStreaks(dateKeys: readonly string[], todayKey: string): Streaks {
  const days = [...new Set(dateKeys)].sort();
  if (days.length === 0) return { current: 0, longest: 0 };

  let longest = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = daysBetweenKeys(days[i - 1], days[i]) === 1 ? run + 1 : 1;
    longest = Math.max(longest, run);
  }

  const gap = daysBetweenKeys(days[days.length - 1], todayKey);
  const current = gap <= 1 ? run : 0;
  return { current, longest };
}

export function calculateStats(results: readonly ChallengeResult[], now: Date = new Date()): UserStats {
  const categoryCounts: Partial<Record<TopicCategory, number>> = {};
  let researchSum = 0;

  for (const r of results) {
    const c = r.challenge.topic.category;
    categoryCounts[c] = (categoryCounts[c] ?? 0) + 1;
    researchSum += r.researchSeconds;
  }

  let topCategory: TopicCategory | null = null;
  let topCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts) as [TopicCategory, number][]) {
    if (count > topCount) {
      topCategory = cat;
      topCount = count;
    }
  }

  const streaks = calculateStreaks(
    results.map((r) => toDateKey(new Date(r.completedAt))),
    toDateKey(now),
  );

  return {
    completedCount: results.length,
    currentStreak: streaks.current,
    longestStreak: streaks.longest,
    topCategory,
    totalResearchSeconds: researchSum,
    categoryCounts,
  };
}
