"use client";

import { useHydrated } from "@/hooks/use-hydrated";
import { CATEGORY_LABELS } from "@/lib/copy";
import { getChallengeStorage } from "@/lib/storage/challenge-storage";
import { formatDurationTr } from "@/lib/utils/time";
import { cn } from "@/lib/utils/cn";

export function StatsStrip({ detailed = false, className }: { detailed?: boolean; className?: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const stats = getChallengeStorage().getStats();
  if (stats.completedCount === 0) return null;

  if (!detailed) {
    return (
      <p className={cn("text-sm text-ink-2", className)}>
        Tamamlanan: {stats.completedCount} konu · Seri: 🔥 {stats.currentStreak} gün
      </p>
    );
  }

  const items = [
    { label: "Tamamlanan konu", value: String(stats.completedCount) },
    { label: "Günlük seri", value: `🔥 ${stats.currentStreak} gün` },
    { label: "En uzun seri", value: `${stats.longestStreak} gün` },
    { label: "En çok çalışılan", value: stats.topCategory ? CATEGORY_LABELS[stats.topCategory] : "—" },
    { label: "Toplam araştırma", value: formatDurationTr(stats.totalResearchSeconds) },
  ];
  return (
    <dl className={cn("grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3", className)}>
      {items.map((item) => (
        <div key={item.label}>
          <dt className="text-xs text-ink-3">{item.label}</dt>
          <dd className="mt-0.5 font-display text-xl">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
