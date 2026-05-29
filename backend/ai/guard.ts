// Lightweight request guards for the AI routes: rate limiting + payload limits.
// In-memory limiter is per-serverless-instance — fine for abuse mitigation on a
// small app. For production scale, swap for Upstash/Redis (same interface).

import type { NextRequest } from "next/server";

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

const WINDOW_MS = 60_000; // 1 minute
const MAX_PER_WINDOW = 20; // 20 AI calls / minute / IP

export function clientKey(req: NextRequest): string {
  // Vercel sets x-forwarded-for; fall back to a constant in dev.
  const fwd = req.headers.get("x-forwarded-for");
  return (fwd?.split(",")[0]?.trim()) || "local";
}

export function rateLimit(req: NextRequest): { ok: boolean; retryAfter?: number } {
  const key = clientKey(req);
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }
  if (b.count >= MAX_PER_WINDOW) {
    return { ok: false, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
  }
  b.count += 1;
  return { ok: true };
}

// Validate chat-style message arrays from the client.
export type RawMessage = { role: string; content: string };

export function validateMessages(input: unknown): { ok: true; messages: { role: "user" | "assistant"; content: string }[] } | { ok: false; error: string } {
  if (!Array.isArray(input)) return { ok: false, error: "messages must be an array" };
  if (input.length === 0) return { ok: false, error: "messages cannot be empty" };
  if (input.length > 60) return { ok: false, error: "conversation too long" };
  const clean: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of input as RawMessage[]) {
    if (!m || typeof m.content !== "string") return { ok: false, error: "invalid message shape" };
    if (m.role !== "user" && m.role !== "assistant") return { ok: false, error: "invalid message role" };
    if (m.content.length > 4_000) return { ok: false, error: "message too long" };
    clean.push({ role: m.role, content: m.content });
  }
  return { ok: true, messages: clean };
}

export function validateSlug(input: unknown): input is string {
  return typeof input === "string" && input.length > 0 && input.length < 80 && /^[a-z0-9-]+$/.test(input);
}

export const TOO_MANY = (retryAfter: number) => ({
  error: `Too many requests. Try again in ${retryAfter}s.`,
});
