// Voice agent loop — Whisper STT + LLM in one round-trip.
//
//   Input:  audio Blob (webm/ogg/wav/mp3/m4a) + scenario slug + prior messages
//   Output: { transcript, message }
//
// The browser then plays `message` back via speechSynthesis.

import { getClient, MODELS } from "./client";
import { processChat, type ChatMessage } from "./chat";

export async function transcribeAudio(audio: File): Promise<string> {
  const result = await getClient().audio.transcriptions.create({
    file: audio,
    model: MODELS.STT,
    response_format: "text",
  });
  // Groq returns either a string (response_format=text) or { text } object.
  return typeof result === "string" ? result : (result as any).text ?? "";
}

export async function voiceTurn(
  slug: string,
  priorMessages: ChatMessage[],
  audio: File
): Promise<
  | { transcript: string; message: string }
  | { error: string; status: number }
> {
  const transcript = (await transcribeAudio(audio)).trim();
  if (!transcript) return { error: "Could not transcribe audio", status: 400 };

  const nextMessages: ChatMessage[] = [
    ...priorMessages,
    { role: "user", content: transcript },
  ];

  const reply = await processChat(slug, nextMessages);
  if ("error" in reply) return reply;

  return { transcript, message: reply.message };
}
