"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { LOADING_COPY } from "@/lib/copy";
import { startTopicSpin } from "@/lib/sound/topic-spin";
import { FALLBACK_TOPICS } from "@/lib/topics/fallback";

/** A quick "slot machine" of titles while the real topic is chosen. */
export function GeneratingStage() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    return startTopicSpin(() => {
      setIndex((i) => (i + 1) % FALLBACK_TOPICS.length);
    });
  }, [reduced]);

  return (
    <div className="flex flex-1 flex-col justify-center py-16" role="status">
      <p className="text-sm font-medium text-accent-ink">{LOADING_COPY.topic}</p>
      <p
        aria-hidden
        className="mt-4 truncate font-display text-[clamp(2rem,8vw,4rem)] leading-tight text-ink-3/50 blur-[1.5px]"
      >
        {reduced ? "?" : FALLBACK_TOPICS[index].title}
      </p>
    </div>
  );
}
