// Single Groq client used by all AI handlers.
// Groq runs open models (Llama 3.3 70B for chat/grade/exam) plus
// Whisper for speech-to-text — all on their hardware-accelerated stack
// (~5-10x faster than typical inference, much cheaper).
//
// Centralizes API key loading + a "configured?" guard so route handlers
// can stay thin.

import Groq from "groq-sdk";

let _client: Groq | null = null;

export function getClient(): Groq {
  if (!_client) {
    _client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _client;
}

export function isConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}

export const NOT_CONFIGURED_RESPONSE = {
  error:
    "AI features not configured on this deployment. Add GROQ_API_KEY in Vercel → Settings → Environment Variables.",
};

// Models — kept here so swapping is one place.
export const MODELS = {
  CHAT: "llama-3.3-70b-versatile",   // in-character roleplay
  GRADE: "llama-3.3-70b-versatile",  // structured JSON grading
  EXAM: "llama-3.3-70b-versatile",   // structured JSON exam questions
  STT: "whisper-large-v3",           // speech-to-text for voice agents
} as const;
