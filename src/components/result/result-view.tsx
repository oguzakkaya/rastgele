"use client";

import { Shuffle } from "lucide-react";
import { StageHeading } from "@/components/challenge/stage-heading";
import { TopicMeta } from "@/components/challenge/topic-meta";
import { ButtonLink } from "@/components/ui/button";
import { primeTopicSpin } from "@/lib/sound/topic-spin";
import type { ChallengeResult } from "@/lib/types";
import { formatDateTr } from "@/lib/utils/date";

export function ResultView({ result }: { result: ChallengeResult }) {
  const { challenge } = result;

  return (
    <article className="flex flex-col gap-8 pb-10 pt-10 sm:pt-16">
      <header className="animate-rise space-y-4">
        <TopicMeta topic={challenge.topic} prefix={formatDateTr(result.completedAt)} />
        <StageHeading className="text-[clamp(2.5rem,9vw,4.5rem)] leading-[1.02] tracking-[-0.02em]">
          {challenge.topic.title}
        </StageHeading>
        <p className="text-lg text-ink-2">Bu konuyu anlattın.</p>
      </header>
      <div>
        <ButtonLink href="/konu?id=yeni" variant="accent" size="lg" onClick={primeTopicSpin}>
          <Shuffle className="size-5" aria-hidden /> Bir Tane Daha
        </ButtonLink>
      </div>
    </article>
  );
}
