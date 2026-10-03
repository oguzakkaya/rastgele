import "server-only";
import { NextResponse, type NextRequest } from "next/server";
import type { z } from "zod";
import type { RateLimiter } from "./rate-limit";

const MAX_BODY_BYTES = 32 * 1024;

export function clientKey(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}

export function jsonError(status: number, code: string, headers?: HeadersInit) {
  return NextResponse.json({ error: code }, { status, headers });
}

type Handled<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/** Rate limits, size limits and validates a JSON body. */
export async function readBody<S extends z.ZodType>(
  req: NextRequest,
  schema: S,
  limiter: RateLimiter,
): Promise<Handled<z.infer<S>>> {
  const limit = limiter.check(clientKey(req));
  if (!limit.ok) {
    return {
      ok: false,
      response: jsonError(429, "rate_limited", { "Retry-After": String(limit.retryAfterSeconds) }),
    };
  }

  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > MAX_BODY_BYTES) return { ok: false, response: jsonError(413, "too_large") };

  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) return { ok: false, response: jsonError(413, "too_large") };

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return { ok: false, response: jsonError(400, "invalid_json") };
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) return { ok: false, response: jsonError(400, "invalid_request") };
  return { ok: true, data: parsed.data };
}
