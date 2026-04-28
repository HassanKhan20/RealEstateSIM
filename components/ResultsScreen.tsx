"use client";

import Link from "next/link";
import type { Scenario } from "@/lib/scenarios";
import PersonaAvatar from "./PersonaAvatar";

type Props = {
  scenario: Scenario;
  results: {
    grade: {
      rapport: number;
      discovery: number;
      objectionHandling: number;
      close: number;
      ethicsFlags: string[];
      feedback: {
        rapport: string;
        discovery: string;
        objectionHandling: string;
        close: string;
        biggestWin: string;
        biggestMiss: string;
      };
    };
    avg: number;
    newRating: number;
    delta: number;
    opponentRating: number;
  };
};

function tone(score: number) {
  if (score >= 80) return { color: "text-emerald-700", bar: "bg-emerald-500" };
  if (score >= 65) return { color: "text-sky-700", bar: "bg-sky-500" };
  if (score >= 50) return { color: "text-amber-700", bar: "bg-amber-500" };
  return { color: "text-red-700", bar: "bg-red-500" };
}

function CircleScore({ value }: { value: number }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  const t = tone(value);
  return (
    <div className="relative h-32 w-32">
      <svg width="128" height="128" viewBox="0 0 128 128" className="-rotate-90">
        <circle
          cx="64" cy="64" r={r}
          stroke="#E2E8F0"
          strokeWidth="10"
          fill="none"
        />
        <circle
          cx="64" cy="64" r={r}
          stroke="currentColor"
          className={t.color}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className={`text-3xl font-semibold ${t.color}`}>{value}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted">avg</div>
      </div>
    </div>
  );
}

function Bar({ label, score, blurb }: { label: string; score: number; blurb: string }) {
  const t = tone(score);
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-slate-700">{label}</span>
        <span className={`font-semibold ${t.color}`}>{score}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full ${t.bar}`} style={{ width: `${score}%` }} />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-slate-500">{blurb}</p>
    </div>
  );
}

export default function ResultsScreen({ scenario, results }: Props) {
  const { grade, avg, newRating, delta, opponentRating } = results;
  const t = tone(avg);
  const positive = delta >= 0;

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      {/* header */}
      <div className="mb-8 flex items-center gap-4">
        <PersonaAvatar name={scenario.persona} size={48} />
        <div>
          <div className="text-[11px] uppercase tracking-widest text-accent">
            Session graded
          </div>
          <h1 className="mt-1 text-2xl font-semibold leading-tight">
            {scenario.title}
          </h1>
          <div className="text-xs text-muted">{scenario.persona}</div>
        </div>
      </div>

      {/* SimScore + ring */}
      <section className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-accent2/[0.08]" />
        <div className="relative grid grid-cols-1 items-center gap-6 sm:grid-cols-[auto_1fr]">
          <CircleScore value={avg} />
          <div className="flex flex-col gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-muted">
                SimScore
              </div>
              <div className="flex items-baseline gap-3">
                <div className="text-5xl font-semibold">{newRating}</div>
                <div
                  className={`text-2xl font-semibold ${
                    positive ? "text-accent" : "text-red-700"
                  }`}
                >
                  {positive ? "+" : ""}{delta}
                </div>
              </div>
              <div className="mt-1 text-xs text-muted">
                Opponent rating <span className="font-mono text-slate-700">{opponentRating}</span>
              </div>
            </div>
            <div className={`text-sm ${t.color}`}>
              {avg >= 80 && "Top-tier execution. You'd close this in real life."}
              {avg >= 65 && avg < 80 && "Solid. A few sharper moves and this is a closed deal."}
              {avg >= 50 && avg < 65 && "Recoverable. Real revenue at risk if you ran this live."}
              {avg < 50 && "Deal-killing behavior. Run it again — that's why we exist."}
            </div>
          </div>
        </div>
      </section>

      {/* Bars + feedback */}
      <section className="card mt-5 grid grid-cols-1 gap-6 p-6 sm:grid-cols-2">
        <Bar label="Rapport" score={grade.rapport} blurb={grade.feedback.rapport} />
        <Bar label="Discovery" score={grade.discovery} blurb={grade.feedback.discovery} />
        <Bar label="Objection handling" score={grade.objectionHandling} blurb={grade.feedback.objectionHandling} />
        <Bar label="Close" score={grade.close} blurb={grade.feedback.close} />
      </section>

      {/* Win + miss */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <div className="card p-5">
          <div className="text-[10px] uppercase tracking-widest text-accent">Biggest win</div>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            {grade.feedback.biggestWin}
          </p>
        </div>
        <div className="card border-orange-400/30 p-5">
          <div className="text-[10px] uppercase tracking-widest text-red-700">
            Biggest miss
          </div>
          <p className="mt-2 text-sm leading-relaxed text-slate-800">
            {grade.feedback.biggestMiss}
          </p>
        </div>
      </div>

      {/* Compliance flags */}
      {grade.ethicsFlags && grade.ethicsFlags.length > 0 && (
        <section className="mt-5 rounded-2xl bg-red-50 p-5 ring-1 ring-red-200">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-red-700">
            Compliance flags
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-800">
            {grade.ethicsFlags.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href={`/practice/${scenario.slug}`} className="btn-primary">
          Run it again
        </Link>
        <Link href="/#scenarios" className="btn-secondary">
          Pick another scenario
        </Link>
      </div>
    </main>
  );
}
