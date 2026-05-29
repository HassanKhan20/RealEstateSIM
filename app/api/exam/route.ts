// Thin route handler — all logic lives in backend/ai/exam.ts.
import { NextRequest } from "next/server";
import { generateExam, EXAM_TOPICS } from "@/backend/ai/exam";
import { isConfigured, NOT_CONFIGURED_RESPONSE } from "@/backend/ai/client";
import { rateLimit, TOO_MANY } from "@/backend/ai/guard";

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
    const topic = typeof body?.topic === "string" && body.topic.length < 120 ? body.topic : undefined;
    const count = typeof body?.count === "number" ? body.count : undefined;
    const result = await generateExam(topic, count);
    if (result?.error) {
      return Response.json({ error: result.error }, { status: result.status });
    }
    return Response.json(result);
  } catch (err: any) {
    console.error("exam error", err);
    return Response.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return Response.json({ topics: EXAM_TOPICS });
}
