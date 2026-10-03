"use client";

import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";
import { formatClock } from "@/lib/utils/time";

const RADIUS = 46;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** A depleting ring with a soft pulse, the speaking countdown. */
export function SpeakTimer({ seconds, total }: { seconds: number; total: number }) {
  const reduced = useReducedMotion();
  const progress = total > 0 ? Math.min(1, Math.max(0, seconds / total)) : 0;
  const urgent = seconds <= 10;
  const flowing = seconds > 0 && !reduced;
  const announcement = seconds === 10 ? "10 saniye kaldı." : seconds === 0 ? "Süre bitti." : "";

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid place-items-center">
      {flowing && (
        <>
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2">
            <span className="speak-pulse block size-full rounded-full border border-accent/60" />
          </span>
          <span className="pointer-events-none absolute left-1/2 top-1/2 size-[58%] -translate-x-1/2 -translate-y-1/2">
            <span className="speak-pulse speak-pulse-delay block size-full rounded-full border border-accent/40" />
          </span>
        </>
      )}
      <svg viewBox="0 0 120 120" className="w-[clamp(16rem,min(56vw,48dvh),22rem)] text-ink" aria-hidden>
        <circle cx="60" cy="60" r={RADIUS} fill="none" className="text-line" stroke="currentColor" strokeWidth="2.5" />
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          className="text-accent"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress)}
          transform="rotate(-90 60 60)"
          style={{ transition: "stroke-dashoffset 900ms linear" }}
        />
      </svg>
      <span className="sr-only">Kalan anlatma süresi</span>
      <span
        role="timer"
        aria-hidden
        className={cn(
          "absolute inset-0 flex items-center justify-center font-display text-[clamp(3.75rem,min(14vw,16dvh),6.5rem)] leading-none tabular-nums tracking-[-0.04em]",
          urgent ? "text-accent-ink" : "text-ink",
        )}
      >
        {formatClock(seconds)}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      </div>
      {seconds === 0 && (
        <p className="mt-6 text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] text-accent-ink">Süre bitti</p>
      )}
    </div>
  );
}
