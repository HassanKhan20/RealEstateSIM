// Generate licensing exam practice questions.

import { getClient, MODELS } from "./client";
import { EXAM_SYSTEM, EXAM_TOPICS } from "./prompts";

export async function generateExam(
  topic?: string,
  count?: number
): Promise<any | { error: string; status: number }> {
  const n = Math.max(3, Math.min(10, count ?? 5));
  const chosenTopic =
    topic && EXAM_TOPICS.includes(topic) ? topic : "Mixed — any topic";

  const completion = await getClient().chat.completions.create({
    model: MODELS.EXAM,
    max_tokens: 3000,
    temperature: 0.4,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: EXAM_SYSTEM },
      {
        role: "user",
        content: `Generate ${n} real estate licensing exam practice questions on: ${chosenTopic}. Return ONLY the JSON.`,
      },
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  try {
    return JSON.parse(text);
  } catch {
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) return { error: "Model returned no JSON", status: 500 };
    return JSON.parse(m[0]);
  }
}

export { EXAM_TOPICS };
