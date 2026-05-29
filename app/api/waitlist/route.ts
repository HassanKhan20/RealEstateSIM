// Waitlist capture. Validates the email, then forwards it to whatever
// WAITLIST_WEBHOOK_URL points at (a Google Apps Script web app, Zapier,
// Make, etc.). If no webhook is configured, it logs and still succeeds so
// the front-end flow never breaks.

import { NextRequest } from "next/server";

export const runtime = "nodejs";

function validEmail(e: unknown): e is string {
  return typeof e === "string" && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e) && e.length < 200;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = body?.email;
    if (!validEmail(email)) {
      return Response.json({ error: "Invalid email" }, { status: 400 });
    }

    const payload = {
      email,
      source: typeof body?.source === "string" ? body.source.slice(0, 80) : "waitlist",
      at: new Date().toISOString(),
    };

    const webhook = process.env.WAITLIST_WEBHOOK_URL;
    if (webhook) {
      // Fire to the configured sink (Google Sheet / Zapier / etc.)
      try {
        await fetch(webhook, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } catch (err) {
        console.error("waitlist webhook failed", err);
        // Don't fail the user — they still joined locally.
      }
    } else {
      console.log("[waitlist] (no webhook configured) ->", payload);
    }

    return Response.json({ ok: true });
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
