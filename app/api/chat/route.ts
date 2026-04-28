import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getScenario } from "@/lib/scenarios";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Msg = { role: "user" | "assistant"; content: string };

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "AI roleplay not configured on this deployment. The owner needs to add ANTHROPIC_API_KEY in Vercel → Settings → Environment Variables." },
        { status: 503 }
      );
    }
    const { slug, messages } = (await req.json()) as {
      slug: string;
      messages: Msg[];
    };

    const scenario = getScenario(slug);
    if (!scenario) {
      return Response.json({ error: "Scenario not found" }, { status: 404 });
    }

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 400,
      system: scenario.systemPrompt,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    });

    const text =
      response.content
        .filter((b) => b.type === "text")
        .map((b: any) => b.text)
        .join("") || "";

    return Response.json({ message: text });
  } catch (err: any) {
    console.error("chat error", err);
    return Response.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
