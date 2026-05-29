// Grade a roleplay transcript against a scenario's win conditions.
// Returns structured JSON + computed ELO delta.

import { getClient, MODELS } from "./client";
import { GRADING_INSTRUCTIONS } from "./prompts";
import { getScenario } from "@/shared/scenarios";
import { newRating } from "@/shared/elo";
import type { ChatMessage } from "./chat";

export type GradeResponse = {
  grade: any;
  avg: number;
  newRating: number;
  delta: number;
  opponentRating: number;
};

export async function gradeTranscript(
  slug: string,
  messages: ChatMessage[],
  userRating: number
): Promise<GradeResponse | { error: string; status: number }> {
  const scenario = getScenario(slug);
  if (!scenario) return { error: "Scenario not found", status: 404 };

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

  const completion = await getClient().chat.completions.create({
    model: MODELS.GRADE,
    max_tokens: 1500,
    temperature: 0.2, // tight, factual
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: GRADING_INSTRUCTIONS },
      { role: "user", content: userMsg },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  let grade: any;
  try {
    grade = JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return { error: "Grading model returned no JSON", status: 500 };
    grade = JSON.parse(m[0]);
  }

  const avg =
    (grade.rapport + grade.discovery + grade.objectionHandling + grade.close) /
    4;

  const { newRating: updated, delta } = newRating(
    userRating ?? 1000,
    scenario.baseRating,
    avg
  );

  return {
    grade,
    avg: Math.round(avg),
    newRating: updated,
    delta,
    opponentRating: scenario.baseRating,
  };
}
