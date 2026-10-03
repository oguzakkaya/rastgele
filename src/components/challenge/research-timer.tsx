"use client";

import { useId } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/utils/cn";
import { formatClock } from "@/lib/utils/time";

const TOP = { y: 18, h: 58 };
const BOTTOM = { y: 92, h: 58 };

/** Sand level follows the remaining time. Grains fall through the neck. */
function Hourglass({ progress, flowing }: { progress: number; flowing: boolean }) {
  const id = useId().replace(/:/g, "");
  const topId = `${id}-top`;
  const bottomId = `${id}-bottom`;
  const topHeight = progress * TOP.h;
  const bottomHeight = (1 - progress) * BOTTOM.h;

  return (
    <svg viewBox="0 0 120 168" className="h-[clamp(7.5rem,26dvh,11rem)] w-auto text-ink" aria-hidden>
      <defs>
        <clipPath id={topId}>
          <path d="M22 18H98L64 76H56Z" />
        </clipPath>
        <clipPath id={bottomId}>
          <path d="M56 92H64L98 150H22Z" />
        </clipPath>
      </defs>

      <rect x="16" y="6" width="88" height="8" rx="2" className="fill-ink" />
      <rect x="16" y="154" width="88" height="8" rx="2" className="fill-ink" />
      <path d="M22 18H98L64 76H56Z" className="fill-paper-2" />
      <path d="M56 92H64L98 150H22Z" className="fill-paper-2" />

      <g clipPath={`url(#${topId})`}>
        <rect x="22" y={TOP.y + TOP.h - topHeight} width="76" height={Math.max(topHeight, 0)} className="fill-accent" />
      </g>
      <g clipPath={`url(#${bottomId})`}>
        <rect
          x="22"
          y={BOTTOM.y + BOTTOM.h - bottomHeight}
          width="76"
          height={Math.max(bottomHeight, 0)}
          className="fill-accent"
        />
      </g>

      <path
        d="M22 18H98L64 76H56Z M56 92H64L98 150H22Z M56 76V92 M64 76V92"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinejoin="round"
      />

      {flowing && (
        <g>
          <circle cx="60" cy="78" r="1.7" className="fill-accent sand-grain" />
          <circle cx="60" cy="78" r="1.25" className="fill-accent sand-grain sand-grain-delay" />
        </g>
      )}
    </svg>
  );
}

export function ResearchTimer({ seconds, total }: { seconds: number; total: number }) {
  const reduced = useReducedMotion();
  const progress = total > 0 ? Math.min(1, Math.max(0, seconds / total)) : 0;
  const urgent = seconds <= 60;
  const announcement = seconds === 60 ? "1 dakika kaldı." : seconds === 10 ? "10 saniye kaldı." : seconds === 0 ? "Süre bitti." : "";

  return (
    <div className="flex flex-col items-center">
      <Hourglass progress={progress} flowing={seconds > 0 && !reduced} />
      <span className="sr-only">Kalan araştırma süresi</span>
      <span
        role="timer"
        aria-hidden
        className={cn(
          "mt-[clamp(1rem,3dvh,2rem)] block text-center font-display text-[clamp(4.25rem,min(18vw,20dvh),8rem)] leading-none tabular-nums tracking-[-0.045em]",
          urgent ? "text-accent-ink" : "text-ink",
        )}
      >
        {formatClock(seconds)}
      </span>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
      {seconds === 0 && (
        <p className="mt-4 text-center font-display text-[clamp(1.75rem,4vw,2.5rem)] text-accent-ink">Süre bitti</p>
      )}
    </div>
  );
}
