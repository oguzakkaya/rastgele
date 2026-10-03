"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

/** Moves focus to the heading on mount so each stage change is announced. */
export function StageHeading({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    ref.current?.focus({ preventScroll: true });
  }, []);
  return (
    <h1 ref={ref} tabIndex={-1} className={cn("font-display text-balance outline-none", className)}>
      {children}
    </h1>
  );
}

export const TOPIC_TITLE_CLASS = "text-[clamp(2.25rem,9vw,4.75rem)] leading-[1.02] tracking-[-0.02em]";
