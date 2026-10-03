"use client";

import { Shuffle } from "lucide-react";
import Link from "next/link";
import { StatsStrip } from "@/components/stats/stats-strip";
import { ButtonLink } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { CATEGORY_LABELS } from "@/lib/copy";
import { primeTopicSpin } from "@/lib/sound/topic-spin";
import { getChallengeStorage } from "@/lib/storage/challenge-storage";
import { formatDateTr } from "@/lib/utils/date";

export function HistoryList() {
  const hydrated = useHydrated();
  if (!hydrated) return null;
  const history = getChallengeStorage().getHistory();

  if (history.length === 0) {
    return (
      <div className="space-y-6 py-10">
        <p className="text-lg text-ink-2">Henüz bir konu anlatmadın. İlki rastgele gelsin.</p>
        <ButtonLink href="/konu/yeni" variant="accent" size="lg" onClick={primeTopicSpin}>
          <Shuffle className="size-5" aria-hidden /> Rastgele Başla
        </ButtonLink>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <StatsStrip detailed />
      <ol className="divide-y divide-line border-y border-line">
        {history.map((r) => (
          <li key={r.id}>
            <Link
              href={`/sonuc/${r.id}`}
              className="group block py-5 transition-colors hover:bg-paper-2 sm:px-3"
            >
              <p className="font-display text-xl leading-snug group-hover:underline sm:text-2xl">
                {r.challenge.topic.title}
              </p>
              <p className="mt-1 text-sm text-ink-3">
                {CATEGORY_LABELS[r.challenge.topic.category]} ·{" "}
                <time dateTime={r.completedAt}>{formatDateTr(r.completedAt)}</time>
              </p>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
