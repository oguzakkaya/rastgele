/** Formats seconds as mm:ss (e.g. 180 -> "03:00"). */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

/** Human friendly Turkish duration, e.g. "3 dk", "1 sa 12 dk". */
export function formatDurationTr(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  if (safe < 60) return `${safe} sn`;
  const hours = Math.floor(safe / 3600);
  const minutes = Math.round((safe % 3600) / 60);
  if (hours === 0) return `${minutes} dk`;
  return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
}

/** Turkish copy for the reveal screen: "3 dakikan var." / "1 dakikan var." */
export function minutesCopy(seconds: number): string {
  if (seconds < 60) return `${seconds} saniyen var.`;
  const minutes = Math.max(1, Math.round(seconds / 60));
  return `${minutes} dakikan var.`;
}

/**
 * Pure countdown math so the UI hook and tests share one source of truth.
 * Returns remaining whole seconds, never below zero.
 */
export function remainingSeconds(
  startedAtMs: number,
  durationSeconds: number,
  nowMs: number,
): number {
  const elapsed = Math.floor((nowMs - startedAtMs) / 1000);
  return Math.max(0, durationSeconds - elapsed);
}
