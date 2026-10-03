"use client";

import { Shuffle, WifiOff } from "lucide-react";
import { Button, ButtonLink } from "@/components/ui/button";
import { ERROR_COPY, LOADING_COPY } from "@/lib/copy";
import type { Topic } from "@/lib/types";
import { StageHeading } from "../stage-heading";

export function EvaluatingStage({ topic }: { topic?: Topic }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-4 py-16" role="status">
      {topic && <p className="text-ink-3">{topic.title}</p>}
      <p className="flex items-center gap-3 font-display text-3xl sm:text-4xl">
        {LOADING_COPY.evaluation}
        <span aria-hidden className="inline-flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="size-2 animate-pulse rounded-full bg-accent"
              style={{ animationDelay: `${i * 160}ms` }}
            />
          ))}
        </span>
      </p>
    </div>
  );
}

export function ErrorStage({
  title,
  cta,
  onRetry,
  secondary,
}: {
  title: string;
  cta: string;
  onRetry: () => void;
  secondary?: { label: string; onClick: () => void };
}) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <StageHeading className="text-4xl sm:text-5xl">{title}</StageHeading>
      <p className="text-ink-2">Bazen olur. Bir daha deneyelim.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="primary" size="lg" onClick={onRetry}>
          {cta}
        </Button>
        {secondary && (
          <Button variant="ghost" size="lg" onClick={secondary.onClick}>
            {secondary.label}
          </Button>
        )}
      </div>
    </div>
  );
}

export function SkippedStage({ topic, onNext }: { topic: Topic; onNext: () => void }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <p className="text-ink-3">{topic.title}</p>
      <StageHeading className="text-4xl sm:text-5xl">Bunu geçtik.</StageHeading>
      <p className="text-ink-2">Her konu herkese göre değil. Sıradaki belki tam sana göre.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button variant="accent" size="lg" onClick={onNext}>
          <Shuffle className="size-5" aria-hidden /> Bir Tane Daha
        </Button>
        <ButtonLink href="/" variant="ghost" size="lg">
          Ana sayfa
        </ButtonLink>
      </div>
    </div>
  );
}

export function NotFoundStage({ onNew, resultId }: { onNew: () => void; resultId?: string }) {
  return (
    <div className="flex flex-1 flex-col justify-center gap-6 py-16">
      <StageHeading className="text-4xl sm:text-5xl">
        {resultId ? "Bu konuyu zaten anlattın." : "Bu deneme artık burada değil."}
      </StageHeading>
      <p className="text-ink-2">
        {resultId
          ? "Aynı denemeye tekrar girilemiyor ama sonucuna bakabilirsin."
          : "Yarım kalan denemeler yalnızca başladığın cihazda saklanıyor."}
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        {resultId && (
          <ButtonLink href={`/sonuc/${resultId}`} variant="outline" size="lg">
            Sonucu gör
          </ButtonLink>
        )}
        <Button variant="accent" size="lg" onClick={onNew}>
          <Shuffle className="size-5" aria-hidden /> Yeni konu getir
        </Button>
      </div>
    </div>
  );
}

export function OfflineNotice() {
  return (
    <p role="status" className="mt-4 flex items-center gap-2 rounded-full bg-paper-2 px-4 py-2 text-sm text-ink-2">
      <WifiOff className="size-4 shrink-0" aria-hidden />
      {ERROR_COPY.offline.title} Hazır konularla devam edebilirsin.
    </p>
  );
}
