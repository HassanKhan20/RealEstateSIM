"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Property } from "@/shared/properties";
import { PROPERTIES, TYPE_LABELS } from "@/shared/properties";
import { fmtMoney, fmtPct } from "@/shared/finance";
import {
  awardPropertyBoughtXp,
  buyBeginnerHome,
  getBeginnerPortfolio,
  getProgress,
  levelGateForBuy,
  sellBeginnerHome,
  type BeginnerHolding,
  type BeginnerPortfolio,
} from "@/frontend/lib/store";
import { levelForXp } from "@/shared/levels";
import { SCENARIOS, simulatePreview, simulatePortfolio } from "@/shared/beginnerSim";
import HouseIllustration from "../shared/HouseIllustration";
import PriceChart from "../shared/PriceChart";

function monthlyPI(principal: number, ratePct: number, termYears: number): number {
  if (principal <= 0) return 0;
  if (ratePct <= 0 || termYears <= 0) return Math.round(principal / Math.max(1, termYears * 12));
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

type Mode = "finance" | "cash";

export default function BeginnerProperty({ property }: { property: Property }) {
  const [p, setP] = useState<BeginnerPortfolio>({ cash: 0, holdings: [] });
  const [mode, setMode] = useState<Mode>("finance");
  const [downPct, setDownPct] = useState<number>(20);
  const [ratePct, setRatePct] = useState<number>(6.95);
  const [termYears, setTermYears] = useState<15 | 30>(30);
  const [horizon, setHorizon] = useState<12 | 36 | 60 | 120>(60);
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setP(getBeginnerPortfolio());
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const owned = p.holdings.find((h) => h.propertyId === property.id);

  const price = property.price;
  const downPayment = Math.round((price * downPct) / 100);
  const loanAmount = price - downPayment;
  const closingEst = Math.round(price * 0.025);
  const monthlyPayment = mode === "finance" ? monthlyPI(loanAmount, ratePct, termYears) : 0;
  const cashIn = mode === "finance" ? downPayment + closingEst : price + closingEst;
  const canAfford = cashIn <= p.cash;

  const netMonthly = property.estimatedRent - monthlyPayment;

  const hypothetical: BeginnerHolding = {
    propertyId: property.id,
    purchasedAt: Date.now(),
    purchasePrice: price,
    purchaseType: mode,
    downPayment: mode === "finance" ? downPayment : undefined,
    loanBalance: mode === "finance" ? loanAmount : undefined,
    interestRate: mode === "finance" ? ratePct : undefined,
    termYears: mode === "finance" ? termYears : undefined,
    monthlyPayment: mode === "finance" ? monthlyPayment : undefined,
    cashIn,
    monthlyRent: property.estimatedRent,
  };

  const scenario = SCENARIOS[scenarioIdx];

  const sim = useMemo(() => {
    if (owned) {
      return simulatePortfolio(
        p,
        (id) => PROPERTIES.find((x) => x.id === id),
        horizon,
        scenario
      );
    }
    return simulatePreview(
      p,
      hypothetical,
      (id) => PROPERTIES.find((x) => x.id === id),
      horizon,
      scenario
    );
  }, [p, hypothetical, horizon, scenarioIdx, owned]);

  const simPoints = sim.points.map((pt) => ({ t: pt.t, price: pt.equity }));

  // Level gating — check before allowing purchase
  const lvl = levelForXp(getProgress().xp);
  const gateReasons = levelGateForBuy({
    purchaseType: mode,
    downPaymentPct: mode === "finance" ? downPct / 100 : undefined,
    currentHoldingsCount: p.holdings.length,
  });
  const blocked = gateReasons.length > 0;

  function buy() {
    if (blocked) {
      setToast(gateReasons[0]);
      setTimeout(() => setToast(null), 4500);
      return;
    }
    const result = buyBeginnerHome(hypothetical);
    if (!result.ok) {
      setToast(result.reason ?? "Could not buy.");
      setTimeout(() => setToast(null), 3500);
      return;
    }
    awardPropertyBoughtXp();
    setP(getBeginnerPortfolio());
    setToast(`Bought ${property.address}. ${fmtMoney(cashIn)} cash out. +50 XP`);
    setTimeout(() => setToast(null), 2800);
  }

  function sell() {
    const appreciated = Math.round(price * 1.04);
    if (!window.confirm(`Sell for ${fmtMoney(appreciated)}? 6% closing costs deducted.`)) return;
    const result = sellBeginnerHome(property.id, appreciated);
    if (result.ok) {
      setP(getBeginnerPortfolio());
      setToast(`Sold. ${fmtMoney(result.proceeds ?? 0)} added to cash.`);
      setTimeout(() => setToast(null), 2400);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-6">
        <div className="card overflow-hidden">
          <HouseIllustration property={property} height={260} />
          <div className="p-6">
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              {property.neighborhood} · {TYPE_LABELS[property.type]}
            </div>
            <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
              <h1 className="text-2xl font-semibold text-slate-900">{property.address}</h1>
              <div className="text-right">
                <div className="font-display text-3xl font-medium text-slate-900">
                  {fmtMoney(price)}
                </div>
                <div className="text-[11px] text-slate-500">
                  Rent {fmtMoney(property.estimatedRent)}/mo · {property.beds}bd / {property.baths}ba · {property.sqft.toLocaleString()} sqft
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm italic text-slate-600">&ldquo;{property.hookLine}&rdquo;</p>

            <div className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <Fact label="Year built" value={String(property.yearBuilt)} />
              <Fact label="Appreciation" value={`${property.appreciationRate.toFixed(1)}%/yr`} />
              <Fact label="Schools" value={`${property.risk.schoolScore}/10`} />
              <Fact label="Walk score" value={String(property.risk.walkScore)} />
            </div>
          </div>
        </div>

        {/* Simulation panel — always visible */}
        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-[#2563EB]">
                Simulation · {scenario.label}
              </div>
              <div className="mt-1 text-base font-semibold text-slate-900">
                {owned
                  ? `How ${horizon / 12} ${horizon === 12 ? "year" : "years"} play out for your current portfolio`
                  : `If you bought this home today, here's how ${horizon / 12} ${horizon === 12 ? "year" : "years"} play out`}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex rounded-lg bg-[#F7F8FA] p-1">
                {([12, 36, 60, 120] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setHorizon(m)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                      horizon === m ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-white"
                    }`}
                  >
                    {m / 12}y
                  </button>
                ))}
              </div>
              <select
                value={scenarioIdx}
                onChange={(e) => setScenarioIdx(Number(e.target.value))}
                className="rounded-lg bg-white px-3 py-1.5 text-xs text-slate-700 ring-1 ring-slate-200 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              >
                {SCENARIOS.map((s, i) => (
                  <option key={i} value={i}>{s.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Start equity" value={fmtMoney(sim.startEquity)} />
            <Mini label={`End equity (${horizon / 12}y)`} value={fmtMoney(sim.finalEquity)} good={sim.finalEquity > sim.startEquity} />
            <Mini label="Total return" value={fmtPct(sim.totalReturnPct)} good={sim.totalReturnPct > 0} bad={sim.totalReturnPct < 0} />
            <Mini label="Cash flow collected" value={fmtMoney(sim.totalCashFlow)} good={sim.totalCashFlow > 0} />
          </div>

          <div className="mt-5">
            <PriceChart history={simPoints} height={220} />
          </div>
        </div>
      </div>

      {/* Right — buy ticket */}
      <div className="space-y-4">
        <div className="card sticky top-24 p-5">
          {owned ? (
            <>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Your position</div>
              <div className="mt-2 text-sm text-slate-700">
                You own this home — purchased{" "}
                <span className="font-medium text-slate-900">
                  {owned.purchaseType === "cash" ? "with cash" : "with financing"}
                </span>.
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <Mini label="Purchased at" value={fmtMoney(owned.purchasePrice)} />
                <Mini label="Cash in" value={fmtMoney(owned.cashIn)} />
                {owned.purchaseType === "finance" && (
                  <>
                    <Mini label="Monthly payment" value={fmtMoney(owned.monthlyPayment ?? 0)} />
                    <Mini label="Loan balance" value={fmtMoney(owned.loanBalance ?? 0)} />
                  </>
                )}
                <Mini label="Rent" value={`${fmtMoney(owned.monthlyRent)}/mo`} />
                <Mini
                  label="Cash flow"
                  value={`${fmtMoney(owned.monthlyRent - (owned.monthlyPayment ?? 0))}/mo`}
                  good={owned.monthlyRent - (owned.monthlyPayment ?? 0) >= 0}
                />
              </div>
              <button
                onClick={sell}
                className="mt-4 w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Sell at market value
              </button>
            </>
          ) : (
            <>
              <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">Buy</div>
              <div className="mt-2 grid grid-cols-2 rounded-lg bg-[#F7F8FA] p-1">
                <button
                  onClick={() => setMode("finance")}
                  className={`rounded-md py-1.5 text-sm font-semibold transition ${
                    mode === "finance" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  Finance
                </button>
                <button
                  onClick={() => setMode("cash")}
                  className={`rounded-md py-1.5 text-sm font-semibold transition ${
                    mode === "cash" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  All cash
                </button>
              </div>

              {mode === "finance" ? (
                <div className="mt-4 space-y-3">
                  <Field label={`Down payment · ${downPct}% (${fmtMoney(downPayment)})`}>
                    <div className="flex gap-1.5">
                      {[10, 15, 20, 25, 30].map((n) => (
                        <button
                          key={n}
                          onClick={() => setDownPct(n)}
                          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                            downPct === n ? "bg-slate-900 text-white" : "bg-[#F7F8FA] text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {n}%
                        </button>
                      ))}
                    </div>
                  </Field>
                  <Field label={`Interest rate · ${ratePct.toFixed(2)}%`}>
                    <input
                      type="range"
                      min={4}
                      max={9}
                      step={0.05}
                      value={ratePct}
                      onChange={(e) => setRatePct(Number(e.target.value))}
                      className="w-full"
                      style={{ accentColor: "#2563EB" } as any}
                    />
                  </Field>
                  <Field label="Loan term">
                    <div className="flex gap-1.5">
                      {([15, 30] as const).map((y) => (
                        <button
                          key={y}
                          onClick={() => setTermYears(y)}
                          className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition ${
                            termYears === y ? "bg-slate-900 text-white" : "bg-[#F7F8FA] text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {y}-year
                        </button>
                      ))}
                    </div>
                  </Field>
                </div>
              ) : (
                <p className="mt-4 rounded-lg bg-[#F7F8FA] p-3 text-xs text-slate-600">
                  Pay the full price up front. No mortgage, no interest. Rent
                  hits your pocket almost entirely as cash flow.
                </p>
              )}

              <div className="mt-4 rounded-lg bg-[#F7F8FA] p-3 text-xs">
                <Row k="Home price" v={fmtMoney(price)} />
                {mode === "finance" && (
                  <>
                    <Row k="Down payment" v={fmtMoney(downPayment)} />
                    <Row k="Loan amount" v={fmtMoney(loanAmount)} />
                    <Row k="Monthly payment" v={`${fmtMoney(monthlyPayment)}/mo`} />
                  </>
                )}
                <Row k="Est. closing" v={fmtMoney(closingEst)} />
                <Row k="Cash required" v={fmtMoney(cashIn)} bold />
                <Row k="Monthly rent" v={`${fmtMoney(property.estimatedRent)}/mo`} />
                <Row
                  k="Net cash flow"
                  v={`${fmtMoney(mode === "finance" ? netMonthly : Math.round(property.estimatedRent * 0.9))}/mo`}
                  bold
                />
              </div>

              {blocked && (
                <div className="mt-3 rounded-lg bg-amber-50 px-3 py-2.5 text-[12px] text-amber-800 ring-1 ring-amber-200">
                  <div className="font-semibold">🔒 Level {lvl.num} {lvl.name}</div>
                  <div className="mt-0.5">{gateReasons[0]}</div>
                </div>
              )}
              <button
                onClick={buy}
                disabled={!canAfford || blocked}
                className="mt-3 w-full rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#1D4ED8] disabled:opacity-50"
              >
                {blocked
                  ? `Locked at Level ${lvl.num}`
                  : canAfford
                    ? `Buy ${mode === "finance" ? "with financing" : "for cash"} · ${fmtMoney(cashIn)}`
                    : `Need ${fmtMoney(cashIn - p.cash)} more cash`}
              </button>
              <div className="mt-2 text-center text-[11px] text-slate-500">
                Cash: {fmtMoney(p.cash)} · Level {lvl.num} · {p.holdings.length}/{lvl.propertyLimit === 999 ? "∞" : lvl.propertyLimit} properties
              </div>
            </>
          )}

          {toast && (
            <div className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
              {toast}
            </div>
          )}
        </div>

        <Link href="/beginner" className="btn-secondary block text-center text-xs">
          ← All listings & portfolio
        </Link>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] uppercase tracking-widest text-slate-500">{label}</span>
      {children}
    </label>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between py-0.5">
      <span className="text-slate-500">{k}</span>
      <span className={`font-mono ${bold ? "text-slate-900 font-semibold" : "text-slate-700"}`}>{v}</span>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#F7F8FA] p-3">
      <div className="text-[10px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className="mt-0.5 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function Mini({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = good ? "text-emerald-700" : bad ? "text-red-700" : "text-slate-900";
  return (
    <div className="rounded-lg bg-[#F7F8FA] p-3">
      <div className="text-[9px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-0.5 text-sm font-semibold ${color}`}>{value}</div>
    </div>
  );
}
