"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ARCHETYPES, QUESTIONS, scoreAnswers, type ArchetypeKey } from "@/shared/onboarding";
import { LEVELS } from "@/shared/levels";
import { saveOnboarding, getOnboarding } from "@/frontend/lib/store";
import { logEvent } from "@/frontend/lib/analytics";
import { fmtMoney } from "@/shared/finance";

type Stage = "intro" | "quiz" | "result";

export default function OnboardingFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("intro");
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [archetype, setArchetype] = useState<ArchetypeKey | null>(null);

  // If they already finished onboarding, route them home unless they explicitly want to retake.
  useEffect(() => {
    const existing = getOnboarding();
    if (existing && stage === "intro" && typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (!params.has("retake")) {
        // Show intro anyway with a hint that they've done this before
      }
    }
  }, [stage]);

  function pickAnswer(idx: number) {
    const next = [...answers, idx];
    setAnswers(next);
    if (qIdx + 1 < QUESTIONS.length) {
      setQIdx(qIdx + 1);
    } else {
      const { dims, archetype: a } = scoreAnswers(next);
      setArchetype(a);
      saveOnboarding({
        completedAt: Date.now(),
        archetype: a,
        dims,
        answers: next,
      });
      logEvent("onboarding_complete", { archetype: a });
      setStage("result");
    }
  }

  function back() {
    if (qIdx === 0) {
      setStage("intro");
      return;
    }
    setQIdx(qIdx - 1);
    setAnswers(answers.slice(0, -1));
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F7F8FA]">
      <div className="mx-auto max-w-3xl px-6 py-12 md:py-20">
        {/* Top brand bar */}
        <div className="mb-12 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-medium text-slate-900">
            Estatify
          </Link>
          {stage === "quiz" && (
            <div className="text-xs font-mono text-slate-500">
              {qIdx + 1} / {QUESTIONS.length}
            </div>
          )}
        </div>

        {stage === "intro" && <Intro onStart={() => setStage("quiz")} />}

        {stage === "quiz" && (
          <Quiz
            qIdx={qIdx}
            onPick={pickAnswer}
            onBack={back}
            answered={answers[qIdx] ?? null}
          />
        )}

        {stage === "result" && archetype && (
          <Result
            archetypeKey={archetype}
            onContinue={() => router.push("/beginner")}
          />
        )}
      </div>
    </main>
  );
}

// ----------------------------------------------------------------------------

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-[#2563EB]">
          Before you start
        </div>
        <h1 className="mt-3 font-display text-5xl font-medium leading-[1.05] text-slate-900 md:text-6xl">
          Are you built for this?
        </h1>
      </div>

      <p className="max-w-xl text-base leading-relaxed text-slate-600 md:text-lg">
        7 questions. 90 seconds. We&rsquo;ll find out what kind of real estate
        investor you are — and tailor your starting capital, available tools,
        and first move accordingly. No signup, no email.
      </p>

      <div className="space-y-3 text-sm text-slate-600">
        <Bullet>Get your <strong>investor archetype</strong> — Closer, Analyst, Builder, or Hustler.</Bullet>
        <Bullet>Start at <strong>Level 1</strong> with capital sized to your archetype.</Bullet>
        <Bullet>Unlock financing, strategies, and properties as you build real reps.</Bullet>
      </div>

      <div className="flex flex-wrap gap-3 pt-4">
        <button
          onClick={onStart}
          className="rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Start the quiz →
        </button>
        <Link
          href="/system"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Skip — show me the product
        </Link>
      </div>
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-[#2563EB]" />
      <span>{children}</span>
    </div>
  );
}

// ----------------------------------------------------------------------------

function Quiz({
  qIdx,
  onPick,
  onBack,
  answered,
}: {
  qIdx: number;
  onPick: (i: number) => void;
  onBack: () => void;
  answered: number | null;
}) {
  const q = QUESTIONS[qIdx];

  return (
    <div className="space-y-8">
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {QUESTIONS.map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition ${
              i < qIdx
                ? "bg-slate-900"
                : i === qIdx
                  ? "bg-[#2563EB]"
                  : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div>
        <div className="text-[11px] uppercase tracking-[0.24em] text-slate-500">
          Question {qIdx + 1}
        </div>
        <h2 className="mt-2 font-display text-3xl font-medium leading-tight text-slate-900 md:text-4xl">
          {q.prompt}
        </h2>
        {q.context && (
          <p className="mt-3 text-sm italic text-slate-500">{q.context}</p>
        )}
      </div>

      <div className="space-y-3">
        {q.answers.map((a, i) => (
          <button
            key={i}
            onClick={() => onPick(i)}
            className={`group flex w-full items-center justify-between rounded-2xl border bg-white px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#2563EB] hover:shadow-[0_8px_20px_-8px_rgba(37,99,235,0.25)] ${
              answered === i ? "border-[#2563EB] ring-2 ring-[#2563EB]/20" : "border-slate-200"
            }`}
          >
            <span className="flex items-center gap-4">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-slate-100 font-mono text-xs text-slate-600 group-hover:bg-[#2563EB] group-hover:text-white">
                {String.fromCharCode(65 + i)}
              </span>
              <span className="text-[15px] text-slate-900">{a.label}</span>
            </span>
            <span className="text-slate-300 group-hover:text-[#2563EB]">→</span>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-900">
          ← Back
        </button>
        <div className="text-xs text-slate-400">No wrong answers</div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------

function Result({
  archetypeKey,
  onContinue,
}: {
  archetypeKey: ArchetypeKey;
  onContinue: () => void;
}) {
  const a = ARCHETYPES[archetypeKey];
  const startingLevel = LEVELS[0];

  return (
    <div className="space-y-8">
      <div>
        <div className="text-[11px] uppercase tracking-[0.28em] text-[#2563EB]">
          Your archetype
        </div>
        <h1
          className="mt-3 font-display text-6xl font-medium leading-[0.95] md:text-7xl"
          style={{ color: a.color }}
        >
          {a.name}
        </h1>
        <p className="mt-3 font-display text-xl italic text-slate-600">
          {a.short}
        </p>
      </div>

      <p className="text-[15px] leading-relaxed text-slate-700 md:text-base">
        {a.description}
      </p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Panel title="Your strengths" tone="good">
          <ul className="space-y-2 text-sm text-slate-700">
            {a.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Watch out for" tone="warn">
          <ul className="space-y-2 text-sm text-slate-700">
            {a.watchouts.map((s) => (
              <li key={s} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      <div className="rounded-2xl bg-slate-900 p-6 text-white">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <Stat label="Starting level" value={startingLevel.name} />
          <Stat label="Starting cash" value={fmtMoney(a.startingCash)} />
          <Stat label="Property limit" value={String(startingLevel.propertyLimit)} />
          <Stat label="Min down payment" value={`${Math.round(startingLevel.maxDownPaymentMin * 100)}%`} />
        </div>
        <div className="mt-5 border-t border-white/15 pt-4 text-sm">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">
            Your first move
          </div>
          <div className="mt-1 text-white/90">{a.firstStep}</div>
        </div>
        <div className="mt-3 text-sm">
          <div className="text-[10px] uppercase tracking-[0.18em] text-white/55">
            To unlock Apprentice (Level 2)
          </div>
          <div className="mt-1 text-white/90">{startingLevel.unlockGoal}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={onContinue}
          className="rounded-full px-6 py-3 text-sm font-semibold text-white transition"
          style={{ background: a.color }}
        >
          Start as {a.name} →
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/result/${archetypeKey}`;
            const text = `I'm ${a.name} on Estatify. ${a.short} What's your investor archetype?`;
            if (navigator.share) {
              navigator.share({ title: `I'm ${a.name}`, text, url }).catch(() => {});
            } else {
              navigator.clipboard?.writeText(`${text} ${url}`);
              alert("Link copied to clipboard!");
            }
          }}
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          Share result
        </button>
        <Link
          href={`/result/${archetypeKey}`}
          target="_blank"
          className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          See public page
        </Link>
        <Link
          href="/onboarding?retake=1"
          className="rounded-full bg-white px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"
        >
          Retake
        </Link>
      </div>
    </div>
  );
}

function Panel({ title, tone, children }: { title: string; tone: "good" | "warn"; children: React.ReactNode }) {
  const ringColor = tone === "good" ? "ring-emerald-200" : "ring-amber-200";
  const bg = tone === "good" ? "bg-emerald-50" : "bg-amber-50";
  const titleColor = tone === "good" ? "text-emerald-700" : "text-amber-700";
  return (
    <div className={`rounded-2xl ${bg} p-5 ring-1 ${ringColor}`}>
      <div className={`text-[11px] font-semibold uppercase tracking-widest ${titleColor}`}>
        {title}
      </div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-widest text-white/55">{label}</div>
      <div className="mt-1 font-display text-xl font-medium">{value}</div>
    </div>
  );
}
