/** Formats seconds as mm:ss (e.g. 180 -> "03:00"). */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Short duration label for the UI. */
export function formatDurationTr(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  if (safe < 60) return `${safe} sn`;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.round((safe % 3600) / 60);
  if (hours === 0) return `${minutes} dk`;
  return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
}

/** Displayed research seconds that stay at real time at each end of 2x mode. */
export const RESEARCH_EDGE_SECONDS = 15;

/** `?speed=2x` on the homepage runs the research clock at double speed. */
export function researchClockSpeed(param: string | null): number {
  return param === "2x" ? 2 : 1;
}

/**
 * Research countdown. In 2x mode the first and last 15 displayed seconds
 * advance once per real second; the middle runs at double speed.
 */
export function researchRemainingSeconds(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number,
  speed = 1,
): number {
  if (speed <= 1) return remainingSeconds(startedAtMs, durationSeconds, nowMs, 1);
  const realSeconds = Math.max(0, nowMs - startedAtMs) / 1000;
  const edge = Math.min(RESEARCH_EDGE_SECONDS, Math.floor(durationSeconds / 2));
  const middleDisplayed = durationSeconds - edge * 2;
  const middleReal = middleDisplayed / speed;
  const fastEnd = edge + middleReal;
  const displayed =
    realSeconds <= edge
      ? realSeconds
      : realSeconds <= fastEnd
        ? edge + (realSeconds - edge) * speed
        : edge + middleDisplayed + (realSeconds - fastEnd);
  return Math.max(0, durationSeconds - Math.min(durationSeconds, Math.floor(displayed)));
}

/** Topic route that keeps a homepage `speed=2x` flag when one was set. */
export function challengePath(id: string, speed: string | null): string {
  const params = new URLSearchParams({ id });
  if (speed === "2x") params.set("speed", "2x");
  return `/konu?${params.toString()}`;
}

/** Duration sentence shown on the topic reveal screen. */
export function minutesCopy(seconds: number): string {
  if (seconds < 60) return `${seconds} saniyen var.`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} dakikan var.`;
}

/**
 * Pure countdown math so the UI hook and tests share one source of truth.
 * Returns remaining whole seconds, never below zero.
 * `speed` is how many displayed seconds pass per real second.
 */
export function remainingSeconds(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number,
  speed = 1,
): number {
  const elapsedMs = Math.max(0, nowMs - startedAtMs);
  const elapsed = Math.floor((elapsedMs * speed) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}
