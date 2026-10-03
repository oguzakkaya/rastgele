"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";

const LINES = ["Notlar kapanıyor.", "Şimdi sıra sende.", "Konuyu kendi cümlelerinle anlat."];

export function TransitionStage({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(1);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const step = reduced ? 350 : 800;
    const timers = [
      window.setTimeout(() => setShown(2), step),
      window.setTimeout(() => setShown(3), step * 2),
      window.setTimeout(() => doneRef.current(), step * 3 + 300),
    ];
    return () => timers.forEach(window.clearTimeout);
  }, [reduced]);

  return (
    <div className="flex flex-1 flex-col justify-center gap-3 py-16" role="status" aria-live="polite">
      <div aria-hidden className="mb-6 h-24 max-w-md animate-close rounded-xl bg-paper-2" />
      {LINES.slice(0, shown).map((line, i) => (
        <p
          key={line}
          className={cn(
            "animate-rise font-display leading-tight",
            i === LINES.length - 1 ? "text-3xl sm:text-5xl" : "text-2xl text-ink-3 sm:text-3xl",
          )}
        >
          {line}
        </p>
      ))}
    </div>
  );
}
