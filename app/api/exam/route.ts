import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const TOPICS = [
  "Agency and fiduciary duties",
  "Contracts and contract law",
  "Property ownership and types of estates",
  "Real estate finance and mortgages",
  "Real estate math (commissions, prorations, LTV, taxes)",
  "Fair Housing and federal regulations",
  "Listings, disclosures, and MLS",
  "Escrow, title, and closing procedures",
  "Valuation and appraisal",
];

const SYSTEM = `You are a real estate licensing exam writer producing practice questions that feel like the real PSI/Pearson state exam. Questions MUST be unambiguous, legally accurate (use widely-accepted US federal real estate law unless a state is specified), and have exactly one defensibly correct answer.

Return ONLY valid JSON in this exact shape, no preamble, no markdown:

{
  "questions": [
    {
      "id": "q1",
      "topic": "<topic>",
      "stem": "<question text, scenario-first when possible>",
      "choices": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct": 0,
      "explain": "<1-3 sentences explaining why the correct answer is right and why the best distractor is wrong>"
    }
  ]
}

Rules:
- correct is the 0-based index of the correct choice
- Mix difficulty: 1 easy, 2 medium, 2 hard
- At least 2 questions must be scenario-based ("A buyer signs... What is the broker's duty?")
- For math questions, numbers must resolve cleanly
- Never include Fair Housing violations as correct answers
- Never reference a specific state unless given`;

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: "Exam generation not configured on this deployment. Add ANTHROPIC_API_KEY in Vercel settings to enable." },
        { status: 503 }
      );
    }
    const { topic, count } = (await req.json()) as { topic?: string; count?: number };
    const n = Math.max(3, Math.min(10, count ?? 5));
    const chosenTopic = topic && TOPICS.includes(topic) ? topic : "Mixed — any topic";

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 3000,
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `Generate ${n} real estate licensing exam practice questions on: ${chosenTopic}. Return ONLY the JSON.`,
        },
      ],
    });

    const text = response.content
      .filter((b) => b.type === "text")
      .map((b: any) => b.text)
      .join("");

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      return Response.json({ error: "Model returned no JSON" }, { status: 500 });
    }
    const parsed = JSON.parse(match[0]);
    return Response.json(parsed);
  } catch (err: any) {
    console.error("exam error", err);
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}

export async function GET() {
  return Response.json({ topics: TOPICS });
}
