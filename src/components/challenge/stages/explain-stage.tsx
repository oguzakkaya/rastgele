"use client";

import { useEffect, useRef } from "react";
import { useCountdown } from "@/hooks/use-clock";
import { playTickTock, primeTopicSpin } from "@/lib/sound/topic-spin";
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
  const previous = useRef<number | null>(null);
  const warned = useRef(false);

  useEffect(() => {
    primeTopicSpin();
  }, []);

  useEffect(() => {
    const before = previous.current;
    previous.current = left;
    if (warned.current || left <= 0) return;
    const reachedTen = left === 10 || (before !== null && before > 10 && left < 10);
    if (!reachedTen) return;
    warned.current = true;
    playTickTock();
  }, [left]);

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
