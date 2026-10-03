import "server-only";

export type RateLimitResult = { ok: boolean; retryAfterSeconds: number };

/** Swap with a Redis/Upstash implementation for multi-instance deployments. */
export type RateLimiter = {
  check(key: string): RateLimitResult;
};

export function createMemoryRateLimiter(limit: number, windowMs: number): RateLimiter {
  const hits = new Map<string, number[]>();
  return {
    check(key) {
      const now = Date.now();
      const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
      if (recent.length >= limit) {
        hits.set(key, recent);
        return { ok: false, retryAfterSeconds: Math.ceil((windowMs - (now - recent[0])) / 1000) };
      }
      recent.push(now);
      hits.set(key, recent);
      if (hits.size > 10_000) hits.clear();
      return { ok: true, retryAfterSeconds: 0 };
    },
  };
}

export const rateLimiters = {
  topic: createMemoryRateLimiter(30, 60_000),
  research: createMemoryRateLimiter(20, 60_000),
  evaluate: createMemoryRateLimiter(10, 60_000),
};
