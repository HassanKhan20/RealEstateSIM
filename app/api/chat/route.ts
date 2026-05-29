// Thin route handler — all logic lives in backend/ai/chat.ts.
import { NextRequest } from "next/server";
import { processChat } from "@/backend/ai/chat";
import { isConfigured, NOT_CONFIGURED_RESPONSE } from "@/backend/ai/client";
import { rateLimit, validateMessages, validateSlug, TOO_MANY } from "@/backend/ai/guard";

export const runtime = "nodejs";

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
    const body = await req.json();
    if (!validateSlug(body?.slug)) {
      return Response.json({ error: "Invalid scenario slug" }, { status: 400 });
    }
    const v = validateMessages(body?.messages);
    if (!v.ok) {
      return Response.json({ error: v.error }, { status: 400 });
    }
    const result = await processChat(body.slug, v.messages);
    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  } catch (err: any) {
    console.error("chat error", err);
    return Response.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
