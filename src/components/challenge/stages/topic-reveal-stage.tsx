"use client";

import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LOADING_COPY } from "@/lib/copy";
import { RESEARCH_DURATION_SECONDS, type Challenge } from "@/lib/types";
import { minutesCopy } from "@/lib/utils/time";
import { StageHeading, TOPIC_TITLE_CLASS } from "../stage-heading";
import { TopicMeta } from "../topic-meta";

type Step = "intro" | "title" | "ready";

export function TopicRevealStage({
  challenge,
  briefReady,
  onStart,
}: {
  challenge: Challenge;
  briefReady: boolean;
  onStart: () => void;
}) {
  const reduced = useReducedMotion();
  const [step, setStep] = useState<Step>("intro");
  const visible = reduced ? "ready" : step;

  useEffect(() => {
    if (reduced) return;
    const t1 = window.setTimeout(() => setStep("title"), 700);
    const t2 = window.setTimeout(() => setStep("ready"), 1700);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [reduced]);

  const { topic } = challenge;

  return (
    <div className="flex flex-1 flex-col justify-center gap-8 py-12 sm:py-20">
      <p className="animate-fade text-lg text-ink-3">Bugünün rastgelesi...</p>

      {visible !== "intro" && (
        <div className="animate-rise space-y-5">
          <TopicMeta topic={topic} />
          <StageHeading className={TOPIC_TITLE_CLASS}>{topic.title}</StageHeading>
        </div>
      )}

      {visible === "ready" && (
        <div className="animate-rise space-y-6">
          <p className="text-2xl font-medium">{minutesCopy(RESEARCH_DURATION_SECONDS)}</p>
          <Button variant="accent" size="lg" onClick={onStart} disabled={!briefReady} className="w-full sm:w-auto">
            {briefReady ? (
              <>
                Araştırmaya Başla <ArrowRight className="size-5" aria-hidden />
              </>
            ) : (
              LOADING_COPY.research
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
