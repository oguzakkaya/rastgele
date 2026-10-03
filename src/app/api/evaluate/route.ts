import { NextResponse, type NextRequest } from "next/server";
import { evaluateRequestSchema } from "@/lib/schemas";
import { evaluateExplanation } from "@/server/ai/services";
import { readBody, jsonError } from "@/server/http";
import { rateLimiters } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  const body = await readBody(req, evaluateRequestSchema, rateLimiters.evaluate);
  if (!body.ok) return body.response;
  try {
    const { topic, brief, explanation } = body.data;
    const evaluation = await evaluateExplanation(topic, brief, explanation);
    return NextResponse.json({ evaluation });
  } catch {
    return jsonError(500, "evaluation_failed");
  }
}
