import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { z } from "zod";

export type AiErrorKind = "missing_key" | "timeout" | "rate_limited" | "invalid_output" | "unknown";

export class AiError extends Error {
  constructor(
    public kind: AiErrorKind,
    message?: string,
  ) {
    super(message ?? kind);
  }
}

let client: OpenAI | null = null;

export function isAiEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY) && process.env.RASTGELE_DISABLE_AI !== "1";
}

function getClient(): OpenAI {
  if (!isAiEnabled()) throw new AiError("missing_key");
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: Number(process.env.OPENAI_TIMEOUT_MS ?? 20_000),
      maxRetries: 1,
    });
  }
  return client;
}

export const AI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

/** Runs a structured-output request and returns Zod-validated data. */
export async function structuredCompletion<S extends z.ZodType>(args: {
  schema: S;
  name: string;
  instructions: string;
  input: string;
  temperature?: number;
}): Promise<z.infer<S>> {
  const openai = getClient();
  try {
    const response = await openai.responses.parse({
      model: AI_MODEL,
      instructions: args.instructions,
      input: args.input,
      temperature: args.temperature,
      text: { format: zodTextFormat(args.schema, args.name) },
    });
    const parsed = args.schema.safeParse(response.output_parsed);
    if (!parsed.success) throw new AiError("invalid_output");
    return parsed.data;
  } catch (error) {
    throw toAiError(error);
  }
}

function toAiError(error: unknown): AiError {
  if (error instanceof AiError) return error;
  if (error instanceof OpenAI.APIConnectionTimeoutError) return new AiError("timeout");
  if (error instanceof OpenAI.RateLimitError) return new AiError("rate_limited");
  if (error instanceof OpenAI.AuthenticationError) return new AiError("missing_key");
  if (error instanceof SyntaxError) return new AiError("invalid_output");
  return new AiError("unknown", error instanceof Error ? error.message : undefined);
}
