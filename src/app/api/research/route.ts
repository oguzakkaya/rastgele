import { NextResponse, type NextRequest } from "next/server";
import { researchRequestSchema } from "@/lib/schemas";
import { generateResearchBrief } from "@/server/ai/services";
import { readBody, jsonError } from "@/server/http";
import { rateLimiters } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  const body = await readBody(req, researchRequestSchema, rateLimiters.research);
  if (!body.ok) return body.response;
  try {
    const brief = await generateResearchBrief(body.data.topic);
    return NextResponse.json({ brief });
  } catch {
    return jsonError(500, "research_failed");
  }
}
