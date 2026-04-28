"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Scenario } from "@/lib/scenarios";
import { AUDIENCE_LABELS } from "@/lib/scenarios";
import ResultsScreen from "./ResultsScreen";
import PersonaAvatar from "./PersonaAvatar";
import { addSession, getSimScore, setSimScore } from "@/lib/store";

type Msg = { role: "user" | "assistant"; content: string };

export default function ChatInterface({ scenario }: { scenario: Scenario }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: scenario.openingMessage },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [grading, setGrading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  // auto-resize textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(160, ta.scrollHeight) + "px";
  }, [input]);

  async function send() {
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
    } catch (e: any) {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: `[error: ${e.message}. Make sure ANTHROPIC_API_KEY is set in .env.local]`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function endCall() {
    setGrading(true);
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

  if (results) {
    return <ResultsScreen results={results} scenario={scenario} />;
  }

  const userTurns = messages.filter((m) => m.role === "user").length;
  const canEnd = userTurns >= 3;

  return (
    <div className="mx-auto flex h-[100dvh] max-w-3xl flex-col px-4 py-4 sm:px-6 sm:py-6">
      {/* Header bar */}
      <div className="card mb-4 flex items-center justify-between gap-3 p-3 sm:p-4">
        <div className="flex min-w-0 items-center gap-3">
          <PersonaAvatar name={scenario.persona} size={42} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-base font-semibold">{scenario.title}</h1>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium capitalize text-amber-700 ring-1 ring-amber-200">
                {scenario.difficulty}
              </span>
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
          <Link href="/" className="btn-secondary hidden text-xs sm:inline-flex">
            Exit
          </Link>
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
      <div
        ref={scrollRef}
        className="card flex-1 space-y-4 overflow-y-auto p-4 sm:p-6"
      >
        {messages.map((m, i) => (
          <Row key={i} side={m.role} persona={scenario.persona}>
            {m.content}
          </Row>
        ))}
        {loading && (
          <Row side="assistant" persona={scenario.persona}>
            <span className="dot-typing">
              <span /><span /><span />
            </span>
          </Row>
        )}
      </div>

      {/* Composer */}
      <div className="mt-4 rounded-2xl bg-white p-2 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-6px_rgba(15,23,42,0.06)]">
        <div className="flex items-end gap-2">
          <textarea
            ref={taRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Type what you'd actually say…"
            className="flex-1 resize-none bg-transparent px-3 py-2 text-sm leading-relaxed outline-none placeholder:text-muted"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-primary !rounded-xl !px-4 !py-2 text-sm disabled:opacity-40"
            aria-label="Send"
          >
            <span className="hidden sm:inline">Send</span>
            <svg className="inline sm:ml-1" width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="mt-1 flex items-center justify-between px-2 pb-1 text-[11px] text-muted">
          <span>
            <span className="kbd">↵</span> send · <span className="kbd">⇧↵</span> newline
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
