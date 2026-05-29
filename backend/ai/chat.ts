// In-character roleplay handler.
// Takes a scenario slug + message history, returns the next assistant turn.

import { getClient, MODELS } from "./client";
import { getScenario } from "@/shared/scenarios";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export async function processChat(
  slug: string,
  messages: ChatMessage[]
): Promise<{ message: string } | { error: string; status: number }> {
  const scenario = getScenario(slug);
  if (!scenario) return { error: "Scenario not found", status: 404 };

  const completion = await getClient().chat.completions.create({
    model: MODELS.CHAT,
    max_tokens: 400,
    temperature: 0.85, // a bit more persona variety
    messages: [
      { role: "system", content: scenario.systemPrompt },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ],
  });

  const text = completion.choices[0]?.message?.content ?? "";
  return { message: text };
}
