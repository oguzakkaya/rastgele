import { NextResponse, type NextRequest } from "next/server";
import { topicRequestSchema } from "@/lib/schemas";
import { generateTopic } from "@/server/ai/services";
import { readBody, jsonError } from "@/server/http";
import { rateLimiters } from "@/server/rate-limit";

export async function POST(req: NextRequest) {
  const body = await readBody(req, topicRequestSchema, rateLimiters.topic);
  if (!body.ok) return body.response;
  try {
    const topic = await generateTopic(
      { categories: body.data.categories },
      body.data.recent,
    );
    return NextResponse.json({ topic });
  } catch {
    return jsonError(500, "topic_failed");
  }
}
