"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getDailyChallenge, type DailyVerdict } from "@/shared/daily";
import { fmtMoney, fmtPct } from "@/shared/finance";
import { TYPE_LABELS } from "@/shared/properties";
import HouseIllustration from "../shared/HouseIllustration";
import { logEvent } from "@/frontend/lib/analytics";

const KEY = "daily-v1";

type DailyHistory = Record<string, { pick: DailyVerdict; correct: boolean }>;

function readHistory(): DailyHistory {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}");
  } catch {
    return {};
  }
}
function writeHistory(h: DailyHistory) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(h));
}

export default function DailyChallenge() {
  const [challenge] = useState(() => getDailyChallenge());
  const [history, setHistory] = useState<DailyHistory>({});
  const [pick, setPick] = useState<DailyVerdict | null>(null);

  useEffect(() => {
    const h = readHistory();
    setHistory(h);
    if (h[challenge.dateKey]) setPick(h[challenge.dateKey].pick);
  }, [challenge.dateKey]);

  function choose(v: DailyVerdict) {
    if (pick) return;
    setPick(v);
    const correct = v === challenge.verdict;
    const next = { ...history, [challenge.dateKey]: { pick: v, correct } };
    setHistory(next);
    writeHistory(next);
    logEvent("daily_choice", { date: challenge.dateKey, pick: v, correct });
  }

  const revealed = pick !== null;
  const correct = pick === challenge.verdict;

  const wins = Object.values(history).filter((h) => h.correct).length;
  const total = Object.values(history).length;
  const streak = computeStreak(history);

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-mono text-slate-500">{challenge.dateKey}</div>
        <div className="flex gap-3">
          <Pill label="Streak" value={`${streak}d`} />
          <Pill label="Score" value={`${wins}/${total}`} />
        </div>
      </div>

      {/* The listing */}
      <div className="card overflow-hidden">
        <HouseIllustration property={challenge.property} height={220} />
        <div className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-slate-500">
                {challenge.property.neighborhood} · {challenge.property.city}, {challenge.property.state}
              </div>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{challenge.property.address}</h2>
              <div className="mt-1 text-sm text-slate-500">
                {challenge.property.beds}bd / {challenge.property.baths}ba · {challenge.property.sqft.toLocaleString()} sqft · {TYPE_LABELS[challenge.property.type]}
              </div>
            </div>
            <div className="text-right">
              <div className="font-display text-3xl font-medium text-slate-900">
                {fmtMoney(challenge.property.price)}
              </div>
              <div className="text-[11px] text-slate-500">
                Rent {fmtMoney(challenge.property.estimatedRent)}/mo
              </div>
            </div>
          </div>

          <p className="mt-3 text-sm italic text-slate-600">&ldquo;{challenge.property.hookLine}&rdquo;</p>

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <Stat label="Tax/mo" value={fmtMoney(challenge.property.monthlyTaxes)} />
            <Stat label="Insurance/mo" value={fmtMoney(challenge.property.monthlyInsurance)} />
            <Stat label="Appreciation" value={`${challenge.property.appreciationRate}%/yr`} />
            <Stat label="Flood zone" value={challenge.property.risk.floodZone} tone={challenge.property.risk.floodZone === "X" ? "good" : "warn"} />
          </div>
        </div>
      </div>

      {/* The picker or the reveal */}
      {!revealed ? (
        <div className="grid grid-cols-3 gap-3">
          <Choice label="BUY" tone="buy" onClick={() => choose("BUY")} sub="Pencils. Buy at list." />
          <Choice label="SKIP" tone="skip" onClick={() => choose("SKIP")} sub="Negotiate or wait." />
          <Choice label="WALK" tone="walk" onClick={() => choose("WALK")} sub="Hard pass." />
        </div>
      ) : (
        <div className="space-y-5">
          <div
            className={`rounded-2xl p-6 text-white ${
              correct ? "bg-emerald-600" : "bg-slate-900"
            }`}
          >
            <div className="text-[11px] uppercase tracking-[0.24em] opacity-80">
              {correct ? "You called it." : "Not quite."}
            </div>
            <div className="mt-1 font-display text-3xl font-medium">
              Investors said: {challenge.verdict}
            </div>
            <p className="mt-3 text-sm leading-relaxed opacity-90">{challenge.reason}</p>
          </div>

          <div className="card p-5">
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              The numbers (20% down, 30-yr fixed)
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3">
              <Stat label="Cap rate" value={fmtPct(challenge.capRate)} />
              <Stat label="Cash-on-cash" value={fmtPct(challenge.cashOnCash)} />
              <Stat label="Cash flow/mo" value={fmtMoney(challenge.monthlyCashFlow)} tone={challenge.monthlyCashFlow >= 0 ? "good" : "warn"} />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/market/${challenge.property.id}`}
              className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Run the full deal →
            </Link>
            <button
              onClick={() => {
                const text = `Today's Estatify deal in ${challenge.property.city}: investors said ${challenge.verdict}. I picked ${pick}. Try it →`;
                if (navigator.share) {
                  navigator.share({ title: "Estatify Daily Deal", text, url: window.location.href }).catch(() => {});
                } else {
                  navigator.clipboard?.writeText(text + " " + window.location.href);
                }
              }}
              className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
            >
              Share result
            </button>
          </div>

          <div className="text-center text-xs text-slate-500">
            Come back tomorrow for a new deal.
          </div>
        </div>
      )}
    </div>
  );
}

function Choice({
  label, sub, tone, onClick,
}: {
  label: string;
  sub: string;
  tone: "buy" | "skip" | "walk";
  onClick: () => void;
}) {
  const bg = tone === "buy" ? "bg-emerald-600 hover:bg-emerald-700" : tone === "walk" ? "bg-red-600 hover:bg-red-700" : "bg-slate-700 hover:bg-slate-800";
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center justify-center rounded-2xl ${bg} px-4 py-8 text-white shadow-md transition`}
    >
      <div className="font-display text-3xl font-medium">{label}</div>
      <div className="mt-1 text-[11px] uppercase tracking-widest opacity-80">{sub}</div>
    </button>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-slate-200">
      <span className="text-slate-500">{label}</span>{" "}
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "good" | "warn" }) {
  const color = tone === "good" ? "text-emerald-700" : tone === "warn" ? "text-amber-700" : "text-slate-900";
  return (
    <div className="rounded-lg bg-[#F7F8FA] p-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}

function computeStreak(history: DailyHistory): number {
  // Count consecutive days ending today with any entry (not just correct).
  let streak = 0;
  const today = new Date();
  for (let i = 0; ; i++) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    if (!history[key]) break;
    streak++;
    if (streak > 365) break;
  }
  return streak;
}
