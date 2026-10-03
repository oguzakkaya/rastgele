"use client";

import { Shuffle } from "lucide-react";
import { StageHeading } from "@/components/challenge/stage-heading";
import { ButtonLink } from "@/components/ui/button";
import { useHydrated } from "@/hooks/use-hydrated";
import { primeTopicSpin } from "@/lib/sound/topic-spin";
import { getChallengeStorage } from "@/lib/storage/challenge-storage";
import { ResultView } from "./result-view";

export function ResultLoader({ id }: { id: string }) {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="flex-1" />;

  const result = getChallengeStorage().getResult(id);
  if (result) return <ResultView result={result} />;

  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <StageHeading className="text-4xl sm:text-5xl">Bu sonucu bulamadık.</StageHeading>
      <p className="text-ink-2">Sonuçlar şimdilik yalnızca bu cihazda saklanıyor.</p>
      <div>
        <ButtonLink href="/konu?id=yeni" variant="accent" size="lg" onClick={primeTopicSpin}>
          <Shuffle className="size-5" aria-hidden /> Yeni bir konu
        </ButtonLink>
      </div>
    </div>
  );
}
