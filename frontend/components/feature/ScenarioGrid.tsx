"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AUDIENCE_LABELS,
  DIFFICULTY_ORDER,
  SCENARIOS,
  type Audience,
  type Difficulty,
} from "@/shared/scenarios";
import PersonaAvatar from "../shared/PersonaAvatar";

const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  rookie: "bg-emerald-100 text-emerald-700 ring-emerald-200",
  average: "bg-sky-100 text-sky-700 ring-sky-200",
  tough: "bg-amber-100 text-amber-700 ring-amber-200",
  brutal: "bg-red-100 text-red-700 ring-red-200",
};

const AUDIENCE_COLOR: Record<Audience, string> = {
  agent: "text-accent2",
  wholesaler: "text-accent",
  investor: "text-violet-300",
};

export default function ScenarioGrid() {
  const [audience, setAudience] = useState<Audience | "all">("all");
  const [difficulty, setDifficulty] = useState<Difficulty | "all">("all");

  const filtered = useMemo(() => {
    return SCENARIOS.filter(
      (s) =>
        (audience === "all" || s.audience === audience) &&
        (difficulty === "all" || s.difficulty === difficulty)
    );
  }, [audience, difficulty]);

  return (
    <section id="scenarios" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">
            Scenario library
          </div>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
            Pick your fight.
          </h2>
        </div>
        <span className="text-xs text-muted">
          Showing {filtered.length} of {SCENARIOS.length}
        </span>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-2">
        <Group label="Audience">
          <FilterPill active={audience === "all"} onClick={() => setAudience("all")}>
            All
          </FilterPill>
          {(Object.keys(AUDIENCE_LABELS) as Audience[]).map((a) => (
            <FilterPill key={a} active={audience === a} onClick={() => setAudience(a)}>
              {AUDIENCE_LABELS[a]}
            </FilterPill>
          ))}
        </Group>
        <span className="mx-2 hidden h-5 w-px bg-border md:inline-block" />
        <Group label="Difficulty">
          <FilterPill active={difficulty === "all"} onClick={() => setDifficulty("all")}>
            Any
          </FilterPill>
          {DIFFICULTY_ORDER.map((d) => (
            <FilterPill key={d} active={difficulty === d} onClick={() => setDifficulty(d)}>
              <span className="capitalize">{d}</span>
            </FilterPill>
          ))}
        </Group>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted">
          No scenarios match those filters yet. Try widening them.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/practice/${s.slug}`}
              className="card card-hover group relative flex h-full flex-col p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <PersonaAvatar name={s.persona} size={36} />
                  <div>
                    <div className={`text-[11px] font-medium uppercase tracking-widest ${AUDIENCE_COLOR[s.audience]}`}>
                      {AUDIENCE_LABELS[s.audience]}
                    </div>
                    <div className="text-xs text-muted">{s.persona}</div>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ring-1 ${DIFFICULTY_COLOR[s.difficulty]}`}
                >
                  {s.difficulty}
                </span>
              </div>

              <h3 className="mt-5 text-lg font-semibold leading-snug group-hover:text-accent">
                {s.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
                {s.intro}
              </p>

              <div className="mt-auto flex items-center justify-between pt-5 text-xs">
                <span className="inline-flex items-center gap-1.5 text-accent">
                  Start scenario
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
                <span className="font-mono text-muted">elo {s.baseRating}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-white text-muted hover:text-slate-900"
      }`}
    >
      {children}
    </button>
  );
}
