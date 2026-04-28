"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getExamAttempts,
  getPortfolio,
  getSessions,
  getSimScore,
  getStreak,
  type ExamAttempt,
  type PortfolioState,
  type SessionRecord,
  type StreakState,
} from "@/lib/store";
import { getProperty } from "@/lib/properties";
import { fmtMoney } from "@/lib/finance";

export default function DashboardView() {
  const [rating, setRating] = useState(1000);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [streak, setStreak] = useState<StreakState>({ current: 0, best: 0, lastDay: null });
  const [exams, setExams] = useState<ExamAttempt[]>([]);
  const [p, setP] = useState<PortfolioState>({ cash: 0, holdings: [] });

  useEffect(() => {
    const refresh = () => {
      setRating(getSimScore());
      setSessions(getSessions());
      setStreak(getStreak());
      setExams(getExamAttempts());
      setP(getPortfolio());
    };
    refresh();
    window.addEventListener("storage", refresh);
    return () => window.removeEventListener("storage", refresh);
  }, []);

  const tier = ratingTier(rating);
  const avg = sessions.length
    ? Math.round(sessions.reduce((a, s) => a + s.avg, 0) / sessions.length)
    : 0;
  const winRate = sessions.length
    ? Math.round((sessions.filter((s) => s.avg >= 70).length / sessions.length) * 100)
    : 0;
  const examAvg = exams.length
    ? Math.round(
        (exams.reduce((a, e) => a + e.correct / e.total, 0) / exams.length) * 100
      )
    : 0;
  const monthlyCF = p.holdings.reduce((a, h) => a + h.monthlyCashFlow, 0);

  return (
    <div className="space-y-6">
      <div>
        <div className="text-xs uppercase tracking-widest text-accent">Dashboard</div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
          Your reps, scored.
        </h1>
      </div>

      {/* Hero KPIs */}
      <section className="card relative overflow-hidden p-6">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/[0.08] via-transparent to-accent2/[0.08]" />
        <div className="relative grid gap-6 sm:grid-cols-[auto_1fr]">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted">SimScore</div>
            <div className="flex items-baseline gap-3">
              <div className="text-6xl font-semibold">{rating}</div>
              <div className={`text-sm font-medium ${tier.color}`}>{tier.label}</div>
            </div>
            <div className="mt-1 text-xs text-muted">Next tier at {tier.next}</div>
            <div className="mt-3 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-accent"
                style={{ width: `${tier.pct}%` }}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Current streak" value={`${streak.current}d`} />
            <Kpi label="Best streak" value={`${streak.best}d`} />
            <Kpi label="Sessions" value={String(sessions.length)} />
            <Kpi label="Win rate" value={`${winRate}%`} good={winRate >= 50} />
            <Kpi label="Avg grade" value={String(avg || "—")} good={avg >= 70} />
            <Kpi label="Exam avg" value={exams.length ? `${examAvg}%` : "—"} good={examAvg >= 75} />
            <Kpi label="Holdings" value={String(p.holdings.length)} />
            <Kpi label="Cash flow / mo" value={fmtMoney(monthlyCF)} good={monthlyCF >= 0} />
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid gap-3 sm:grid-cols-3">
        <ActionCard
          href="/#scenarios"
          label="Run a scenario"
          sub="Agent sims · graded"
          accent="accent"
        />
        <ActionCard
          href="/market"
          label="Browse the market"
          sub="Paper-trade deals"
          accent="accent2"
        />
        <ActionCard
          href="/exam"
          label="Take an exam set"
          sub="Pre-license prep"
          accent="accent"
        />
      </section>

      {/* Recent sessions */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div className="text-[10px] uppercase tracking-widest text-accent">
            Recent sessions
          </div>
          <Link href="/#scenarios" className="text-xs text-muted hover:text-slate-900">
            + new session
          </Link>
        </div>
        {sessions.length === 0 ? (
          <p className="mt-3 text-sm text-muted">
            No sessions yet. Run your first scenario from the homepage.
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {sessions.slice(0, 10).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-3 text-sm">
                <div className="min-w-0">
                  <div className="truncate text-slate-800">{s.title}</div>
                  <div className="truncate text-xs text-muted">
                    {s.persona} · {new Date(s.at).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center gap-3 pl-3">
                  <span
                    className={`text-sm font-semibold ${
                      s.avg >= 80 ? "text-accent" : s.avg >= 65 ? "text-sky-700" : s.avg >= 50 ? "text-amber-700" : "text-red-600"
                    }`}
                  >
                    {s.avg}
                  </span>
                  <span className={`text-xs font-mono ${s.delta >= 0 ? "text-accent" : "text-red-600"}`}>
                    {s.delta >= 0 ? "+" : ""}{s.delta}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Holdings snapshot */}
      {p.holdings.length > 0 && (
        <section className="card p-5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-accent">
              Portfolio snapshot
            </div>
            <Link href="/portfolio" className="text-xs text-muted hover:text-slate-900">
              Open portfolio →
            </Link>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {p.holdings.slice(0, 6).map((h) => {
              const prop = getProperty(h.propertyId);
              if (!prop) return null;
              return (
                <Link
                  key={h.propertyId}
                  href={`/market/${h.propertyId}`}
                  className="card card-hover p-3"
                >
                  <div className="truncate text-sm font-medium">{prop.address}</div>
                  <div className="text-xs text-muted">{prop.neighborhood}</div>
                  <div className="mt-1 flex items-center justify-between text-xs">
                    <span className="text-slate-500">{fmtMoney(h.purchasePrice)}</span>
                    <span className={h.monthlyCashFlow >= 0 ? "text-accent" : "text-red-600"}>
                      {fmtMoney(h.monthlyCashFlow)}/mo
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function Kpi({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-[#F7F8FA] p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-0.5 text-base font-semibold ${good ? "text-accent" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

function ActionCard({
  href, label, sub, accent,
}: { href: string; label: string; sub: string; accent: "accent" | "accent2" }) {
  const color = accent === "accent" ? "text-accent" : "text-accent2";
  return (
    <Link href={href} className="card card-hover group p-5">
      <div className={`text-[10px] uppercase tracking-widest ${color}`}>{sub}</div>
      <div className="mt-1 flex items-center justify-between">
        <div className="text-base font-semibold">{label}</div>
        <span className={`${color} opacity-70 transition group-hover:translate-x-0.5 group-hover:opacity-100`}>→</span>
      </div>
    </Link>
  );
}

function ratingTier(rating: number) {
  const tiers = [
    { min: 0, max: 900, label: "Rookie", next: 900 },
    { min: 900, max: 1100, label: "Journeyman", next: 1100 },
    { min: 1100, max: 1300, label: "Closer", next: 1300 },
    { min: 1300, max: 1500, label: "Top agent", next: 1500 },
    { min: 1500, max: 9999, label: "Shark", next: 9999 },
  ];
  const t = tiers.find((x) => rating < x.max) ?? tiers[tiers.length - 1];
  const pct = Math.min(100, ((rating - t.min) / Math.max(1, t.next - t.min)) * 100);
  const color =
    t.label === "Shark" ? "text-violet-700" :
    t.label === "Top agent" ? "text-accent" :
    t.label === "Closer" ? "text-sky-700" :
    t.label === "Journeyman" ? "text-amber-700" :
    "text-slate-700";
  return { ...t, pct, color };
}
