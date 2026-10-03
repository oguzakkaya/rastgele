"use client";

import { useEffect } from "react";
import { useCountdown } from "@/hooks/use-clock";
import { primeTopicSpin } from "@/lib/sound/topic-spin";
import { EXPLAIN_DURATION_SECONDS, type Challenge } from "@/lib/types";
import { SpeakTimer } from "../speak-timer";
import { StageHeading } from "../stage-heading";
import { TopicMeta } from "../topic-meta";

export function ExplainStage({
  challenge,
  startedAt,
  onExpire,
}: {
  challenge: Challenge;
  startedAt: number;
  onExpire: () => void;
}) {
  const left = useCountdown(startedAt, EXPLAIN_DURATION_SECONDS, onExpire);

  useEffect(() => {
    primeTopicSpin();
  }, []);

  return (
    <div className="flex min-h-0 flex-1 flex-col py-6 sm:py-8">
      <header className="mx-auto w-full max-w-2xl text-center">
        <TopicMeta topic={challenge.topic} prefix="Anlat" />
        <StageHeading className="mt-3 text-[clamp(1.35rem,3.4vw,2rem)] leading-snug tracking-[-0.02em]">
          {challenge.topic.title}
        </StageHeading>
      </header>

      <div className="flex flex-1 items-center justify-center">
        <SpeakTimer seconds={left} total={EXPLAIN_DURATION_SECONDS} />
      </div>
    </div>
  );
}
