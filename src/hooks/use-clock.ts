"use client";

import { useEffect, useRef, useState } from "react";
import { remainingSeconds, researchRemainingSeconds } from "@/lib/utils/time";

/** Re-renders periodically and returns the current time in ms. */
export function useNow(intervalMs = 250, active = true): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs, active]);
  return now;
}

/**
 * Countdown derived from a fixed start time, so it stays correct even if
 * the tab is throttled in the background. Calls onDone once at zero.
 */
export function useCountdown(
  startedAt: number,
  durationSeconds: number,
  onDone: () => void,
  speed = 1,
  paceEdges = false,
): number {
  const now = useNow();
  const at = Math.max(now, startedAt);
  const left = paceEdges
    ? researchRemainingSeconds(startedAt, durationSeconds, at, speed)
    : remainingSeconds(startedAt, durationSeconds, at, speed);
  const doneRef = useRef(onDone);
  const firedRef = useRef(false);
  const seenRunning = useRef(false);

  useEffect(() => {
    doneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    if (left > 0) seenRunning.current = true;
    if (left === 0 && seenRunning.current && !firedRef.current) {
      firedRef.current = true;
      doneRef.current();
    }
  }, [left]);

  return left;
}

export function useElapsed(startedAt: number): number {
  const now = useNow(500);
  return Math.max(0, Math.floor((now - startedAt) / 1000));
}
