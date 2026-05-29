// Voice-agent endpoint. Accepts multipart/form-data with an audio file +
// scenario slug + prior message history (JSON-encoded). Returns the
// transcribed user turn and the AI's text reply.

import { NextRequest } from "next/server";
import { voiceTurn } from "@/backend/ai/voice";
import type { ChatMessage } from "@/backend/ai/chat";
import { isConfigured, NOT_CONFIGURED_RESPONSE } from "@/backend/ai/client";
import { rateLimit, validateSlug, TOO_MANY } from "@/backend/ai/guard";

export const runtime = "nodejs";
export const maxDuration = 30;

const MAX_AUDIO_BYTES = 8 * 1024 * 1024; // 8 MB cap

export async function POST(req: NextRequest) {
  if (!isConfigured()) {
    return Response.json(NOT_CONFIGURED_RESPONSE, { status: 503 });
  }
  const limit = rateLimit(req);
  if (!limit.ok) {
    return Response.json(TOO_MANY(limit.retryAfter ?? 60), {
      status: 429,
      headers: { "Retry-After": String(limit.retryAfter ?? 60) },
    });
  }
  try {
    const form = await req.formData();
    const audio = form.get("audio") as File | null;
    const slug = form.get("slug") as string | null;
    const messagesRaw = (form.get("messages") as string | null) ?? "[]";

    if (!audio) return Response.json({ error: "No audio uploaded" }, { status: 400 });
    if (audio.size > MAX_AUDIO_BYTES) return Response.json({ error: "Audio too large" }, { status: 413 });
    if (!validateSlug(slug)) return Response.json({ error: "Invalid scenario slug" }, { status: 400 });

    let priorMessages: ChatMessage[] = [];
    try {
      const parsed = JSON.parse(messagesRaw);
      if (Array.isArray(parsed) && parsed.length <= 60) priorMessages = parsed;
    } catch {}

    const result = await voiceTurn(slug, priorMessages, audio);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  } catch (err: any) {
    console.error("voice error", err);
    return Response.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
