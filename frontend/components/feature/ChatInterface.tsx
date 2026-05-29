"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Scenario } from "@/shared/scenarios";
import { AUDIENCE_LABELS } from "@/shared/scenarios";
import ResultsScreen from "./ResultsScreen";
import PersonaAvatar from "../shared/PersonaAvatar";
import { addSession, awardSimulationXp, getSimScore, setSimScore } from "@/frontend/lib/store";
import { logEvent } from "@/frontend/lib/analytics";

type Msg = { role: "user" | "assistant"; content: string };

// Pick a deterministic browser TTS voice for each persona name.
function pickVoice(personaName: string): SpeechSynthesisVoice | null {
  if (typeof window === "undefined") return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer en-US/en-GB voices that are NOT the default robotic one.
  const candidates = voices.filter((v) => /en[-_](US|GB|AU)/i.test(v.lang));
  const pool = candidates.length ? candidates : voices;
  let hash = 0;
  for (let i = 0; i < personaName.length; i++)
    hash = (hash * 31 + personaName.charCodeAt(i)) >>> 0;
  return pool[hash % pool.length];
}

function speak(text: string, voice: SpeechSynthesisVoice | null) {
  if (typeof window === "undefined") return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.rate = 1.05;
  utter.pitch = 1.0;
  window.speechSynthesis.speak(utter);
}

export default function ChatInterface({ scenario }: { scenario: Scenario }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: scenario.openingMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState<any>(null);

  // Voice state
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [voiceMode, setVoiceMode] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load TTS voices (browsers populate them asynchronously) + pick one for this persona.
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const update = () => setVoice(pickVoice(scenario.persona));
    update();
    window.speechSynthesis.onvoiceschanged = update;
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
      window.speechSynthesis.cancel();
    };
  }, [scenario.persona]);

  // Speak the opening line once on mount if voice mode is on.
  const spokeOpening = useRef(false);
  useEffect(() => {
    if (autoSpeak && voice && !spokeOpening.current) {
      spokeOpening.current = true;
      speak(scenario.openingMessage, voice);
    }
  }, [voice, autoSpeak, scenario.openingMessage]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading, transcribing]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  }, [input]);

  async function sendText() {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const r = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: scenario.slug, messages: next }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setMessages([...next, { role: "assistant", content: data.message }]);
      if (autoSpeak && voice) speak(data.message, voice);
    } catch (e: any) {
      setMessages([
        ...next,
        { role: "assistant", content: `[error: ${e.message}]` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function startRecording() {
    if (recording || transcribing || loading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      // Cancel any AI voice playing.
      window.speechSynthesis.cancel();

      const mr = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      mr.onstop = handleAudioStop;
      mediaRecorderRef.current = mr;
      mr.start();
      setRecording(true);
    } catch (e: any) {
      alert(`Microphone access denied: ${e.message}`);
    }
  }

  function stopRecording() {
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    mr.stop();
    setRecording(false);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

  async function handleAudioStop() {
    const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
    audioChunksRef.current = [];
    if (blob.size === 0) return;

    setTranscribing(true);
    try {
      const fd = new FormData();
      fd.append("audio", new File([blob], "turn.webm", { type: "audio/webm" }));
      fd.append("slug", scenario.slug);
      fd.append("messages", JSON.stringify(messages));

      const r = await fetch("/api/voice", { method: "POST", body: fd });
      const data = await r.json();
      if (data.error) throw new Error(data.error);

      const next: Msg[] = [
        ...messages,
        { role: "user", content: data.transcript },
        { role: "assistant", content: data.message },
      ];
      setMessages(next);
      if (autoSpeak && voice) speak(data.message, voice);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `[voice error: ${e.message}]` },
      ]);
    } finally {
      setTranscribing(false);
    }
  }

  async function endCall() {
    setGrading(true);
    window.speechSynthesis.cancel();
    try {
      const userRating = getSimScore();
      const r = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: scenario.slug, messages, userRating }),
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setSimScore(data.newRating);
      awardSimulationXp(data.avg);
      logEvent("sim_graded", { slug: scenario.slug, avg: data.avg, delta: data.delta });
      addSession({
        id: `s-${Date.now()}`,
        slug: scenario.slug,
        title: scenario.title,
        persona: scenario.persona,
        difficulty: scenario.difficulty,
        avg: data.avg,
        delta: data.delta,
        newRating: data.newRating,
        opponentRating: data.opponentRating,
        biggestWin: data.grade?.feedback?.biggestWin,
        biggestMiss: data.grade?.feedback?.biggestMiss,
        ethicsFlags: data.grade?.ethicsFlags,
        at: Date.now(),
      });
      setResults(data);
    } catch (e: any) {
      alert(`Grading failed: ${e.message}`);
    } finally {
      setGrading(false);
    }
  }

  if (results) return <ResultsScreen results={results} scenario={scenario} />;

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canEnd = userTurns >= 3;
  const busy = loading || transcribing;

  return (
    <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      {/* Header */}
      <div className="card mb-4 flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <PersonaAvatar name={scenario.persona} size={42} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{scenario.title}</h1>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700 ring-1 ring-amber-200">
                {scenario.difficulty}
              </span>
              {voiceMode && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ring-1 ring-emerald-200">
                  Voice
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>{scenario.persona}</span>
              <span>·</span>
              <span>{AUDIENCE_LABELS[scenario.audience]}</span>
              <span>·</span>
              <span className="font-mono">elo {scenario.baseRating}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAutoSpeak((v) => !v)}
            className={`hidden text-xs sm:inline-flex rounded-lg px-2.5 py-1.5 ${
              autoSpeak
                ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
            }`}
            title="Toggle AI voice playback"
          >
            {autoSpeak ? "🔊 Voice on" : "🔇 Voice off"}
          </button>
          <Link href="/" className="btn-secondary hidden text-xs sm:inline-flex">Exit</Link>
          <button
            onClick={endCall}
            disabled={!canEnd || grading}
            className={`text-xs ${canEnd ? "btn-primary" : "btn-secondary"} disabled:opacity-50`}
          >
            {grading ? "Grading…" : canEnd ? "End call & grade" : `End (${userTurns}/3)`}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="card flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
        {messages.map((m, i) => (
          <Row key={i} side={m.role} persona={scenario.persona}>
            {m.content}
          </Row>
        ))}
        {(loading || transcribing) && (
          <Row side="assistant" persona={scenario.persona}>
            <span className="dot-typing">
              <span /><span /><span />
            </span>
          </Row>
        )}
      </div>

      {/* Composer with mic */}
      <div className="mt-4 rounded-2xl bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-6px_rgba(15,23,42,0.06)]">
        <div className="flex items-end gap-2">
          {/* Mic button */}
          <button
            onClick={recording ? stopRecording : startRecording}
            disabled={busy && !recording}
            aria-label={recording ? "Stop recording" : "Hold to speak"}
            className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-xl transition disabled:opacity-40 ${
              recording
                ? "bg-red-600 text-white shadow-[0_0_0_6px_rgba(220,38,38,0.18)] animate-pulse"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
            title={recording ? "Stop recording" : "Click and talk"}
          >
            {recording ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <rect x="5" y="5" width="14" height="14" rx="2" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v1a7 7 0 0 1-14 0v-1M12 18v4M8 22h8" />
              </svg>
            )}
          </button>

          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
            rows={1}
            placeholder={recording ? "Listening… click stop when done" : "Type or click the mic to speak…"}
            disabled={recording}
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted disabled:opacity-50"
          />

          <button
            onClick={sendText}
            disabled={busy || !input.trim()}
            className="btn-primary !rounded-xl !px-4 !py-2 text-sm disabled:opacity-40"
            aria-label="Send"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="inline sm:ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M4 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between px-2 pb-1 text-[11px] text-muted">
          <span>
            {recording
              ? <span className="text-red-600 font-medium">● Recording — click stop to send</span>
              : transcribing
                ? <span className="text-slate-600">Transcribing…</span>
                : <><span className="kbd">↵</span> send · <span className="kbd">⇧↵</span> newline · 🎤 click to speak</>}
          </span>
          <span>{userTurns} turn{userTurns === 1 ? "" : "s"}</span>
        </div>
      </div>
    </div>
  );
}

function Row({
  side,
  persona,
  children,
}: {
  side: "user" | "assistant";
  persona: string;
  children: React.ReactNode;
}) {
  const isUser = side === "user";
  return (
    <div className={`flex items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && <PersonaAvatar name={persona} size={28} />}
      <div
        className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-[#2563EB] text-white"
            : "bg-[#F1F5F9] text-slate-800 ring-1 ring-border"
        }`}
      >
        {children}
      </div>
      {isUser && (
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-[11px] font-semibold text-accent">
          You
        </div>
      )}
    </div>
  );
}
