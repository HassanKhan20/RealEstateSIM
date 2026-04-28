import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getScenario } from "@/lib/scenarios";
import { newRating } from "@/lib/elo";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

type Msg = { role: "user" | "assistant"; content: string };

const GRADING_INSTRUCTIONS = `You are a senior real estate sales coach grading a student's practice conversation against an AI character.

Grade ONLY on what actually appeared in the transcript. Do not invent. If a dimension cannot be evaluated from the transcript, return a score of 50 with feedback "insufficient evidence to grade."

Return ONLY valid JSON in this exact shape:
{
  "rapport": <0-100>,
  "discovery": <0-100>,
  "objectionHandling": <0-100>,
  "close": <0-100>,
  "ethicsFlags": [<short string descriptions of any Fair Housing or ethics concerns; empty array if none>],
  "feedback": {
    "rapport": "<one specific sentence citing what they did or didn't do>",
    "discovery": "<one specific sentence>",
    "objectionHandling": "<one specific sentence>",
    "close": "<one specific sentence>",
    "biggestWin": "<one sentence — the single best thing they did>",
    "biggestMiss": "<one sentence — the single most important thing to fix next time>"
  }
}

Scoring guide:
- 90-100: top 5% of agents
- 75-89: solid, professional
- 60-74: acceptable, recoverable mistakes
- 40-59: hurt the deal but salvageable
- 0-39: deal-killing behavior

Be specific and useful. Cite exact phrases from the transcript when possible.`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Grading not configured on this deployment. Add ANTHROPIC_API_KEY in Vercel settings to enable." },
        { status: 503 }
      );
    }
    const { slug, messages, userRating } = (await req.json()) as {
      slug: string;
      messages: Msg[];
      userRating: number;
    };

    const scenario = getScenario(slug);
    if (!scenario) {
      return Response.json({ error: "Scenario not found" }, { status: 404 });
    }

    const transcript = messages
      .map(
        (m) =>
          `${m.role === "user" ? "AGENT" : scenario.persona.toUpperCase()}: ${m.content}`
      )
      .join("\n\n");

    const userMsg = `SCENARIO: ${scenario.title}
PERSONA: ${scenario.persona}
DIFFICULTY: ${scenario.difficulty}
WIN CONDITIONS:
${scenario.winConditions.map((w) => `- ${w}`).join("\n")}

TRANSCRIPT:
${transcript}

Grade this conversation. Return ONLY the JSON object, no preamble.`;

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      system: GRADING_INSTRUCTIONS,
      messages: [{ role: "user", content: userMsg }],
    });

    const text =
      response.content
        .filter((b) => b.type === "text")
        .map((b: any) => b.text)
        .join("") || "";

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Grading model returned no JSON" }, { status: 500 });
    }

    const grade = JSON.parse(jsonMatch[0]);

    const avg =
      (grade.rapport + grade.discovery + grade.objectionHandling + grade.close) / 4;

    const { newRating: updated, delta } = newRating(
      userRating ?? 1000,
      scenario.baseRating,
      avg
    );

    return Response.json({
      grade,
      avg: Math.round(avg),
      newRating: updated,
      delta,
      opponentRating: scenario.baseRating,
    });
  } catch (err: any) {
    console.error("grade error", err);
    return Response.json(
      { error: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
