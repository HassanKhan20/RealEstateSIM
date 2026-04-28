"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  getPortfolio,
  resetPortfolio,
  sellHolding,
  STARTING_CASH,
  type Holding,
  type PortfolioState,
} from "@/lib/store";
import { getProperty, STRATEGY_LABELS } from "@/lib/properties";
import { fmtMoney, fmtPct } from "@/lib/finance";
import HouseIllustration from "./HouseIllustration";

export default function PortfolioView() {
  const [p, setP] = useState<PortfolioState>({ cash: STARTING_CASH, holdings: [] });
  const [months, setMonths] = useState(0); // simulated months forward
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const refresh = () => setP(getPortfolio());
    refresh();
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key.startsWith("portfolio")) refresh();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const totals = useMemo(() => computeTotals(p, months), [p, months]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-xs uppercase tracking-widest text-accent">Portfolio</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Your paper empire.
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Every holding is fake money. Lessons are real. Fast-forward to see
            how the deal ages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/market" className="btn-secondary text-xs">Browse market</Link>
          <button
            onClick={() => {
              if (!confirmReset) { setConfirmReset(true); return; }
              resetPortfolio();
              setP(getPortfolio());
              setConfirmReset(false);
            }}
            className="btn-secondary text-xs"
          >
            {confirmReset ? "Click again to wipe" : "Reset portfolio"}
          </button>
        </div>
      </div>

      {/* Top summary */}
      <section className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Cash" value={fmtMoney(p.cash)} />
        <Kpi label="Est. equity" value={fmtMoney(totals.equity)} />
        <Kpi label="Monthly cash flow" value={fmtMoney(totals.monthlyCF)} good={totals.monthlyCF >= 0} />
        <Kpi label="Avg cash-on-cash" value={fmtPct(totals.avgCoC)} good={totals.avgCoC >= 0.06} />
      </section>

      {/* Time machine */}
      <section className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent">Time machine</div>
            <div className="mt-1 text-sm text-slate-700">
              Fast-forward <span className="font-mono text-white">{months}</span> months to see appreciation + rent growth stack up.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMonths(0)} className="btn-secondary text-xs">Reset</button>
            <button onClick={() => setMonths(Math.max(0, months - 12))} className="btn-secondary text-xs">-1 yr</button>
            <button onClick={() => setMonths(months + 12)} className="btn-secondary text-xs">+1 yr</button>
            <button onClick={() => setMonths(months + 60)} className="btn-secondary text-xs">+5 yr</button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Future portfolio value" value={fmtMoney(totals.futureValue)} />
          <Kpi label="Cumulative cash flow" value={fmtMoney(totals.cumulativeCF)} />
          <Kpi label="Total return" value={fmtPct(totals.totalReturn)} good={totals.totalReturn >= 0.05} />
          <Kpi label="Properties" value={String(p.holdings.length)} />
        </div>
      </section>

      {/* Holdings */}
      {p.holdings.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-sm text-muted">No holdings yet.</div>
          <div className="mt-2 text-base text-slate-800">
            Head to the market — buy your first paper deal.
          </div>
          <Link href="/market" className="btn-primary mt-5 inline-flex">
            Browse market
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {p.holdings.map((h) => (
            <HoldingCard key={h.propertyId} h={h} months={months} onSell={() => {
              const prop = getProperty(h.propertyId);
              if (!prop) return;
              const appreciated = projectedValue(prop.price, prop.appreciationRate, months);
              if (!window.confirm(
                `Sell for market value ~ ${fmtMoney(appreciated)}? (Loan payoff is simplified.)`
              )) return;
              sellHolding(h.propertyId, appreciated);
              setP(getPortfolio());
            }} />
          ))}
        </div>
      )}

      <section className="card p-5">
        <div className="text-[10px] uppercase tracking-widest text-accent">Coaching notes</div>
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {totals.monthlyCF < 0 && (
            <li>
              <b className="text-amber-700">Negative cash flow.</b> You&apos;re feeding
              these deals every month. That only works if you bought for
              appreciation and you have reserves.
            </li>
          )}
          {p.holdings.some((h) => h.strategy === "flip") && months >= 7 && (
            <li>
              <b className="text-amber-700">Flip over-aged.</b> A flip past 6 months is
              eating carrying costs. Every month kills your ROI.
            </li>
          )}
          {p.holdings.length > 0 && totals.avgCoC >= 0.08 && (
            <li>
              <b className="text-accent">Strong cash-on-cash.</b> You&apos;re buying right.
              Stack more of these.
            </li>
          )}
          {p.holdings.length === 1 && (
            <li>
              <b>Concentration risk.</b> One property means one bad tenant
              ruins your year. Diversify across neighborhoods.
            </li>
          )}
        </ul>
      </section>
    </div>
  );
}

function HoldingCard({ h, months, onSell }: { h: Holding; months: number; onSell: () => void }) {
  const prop = getProperty(h.propertyId);
  if (!prop) return null;
  const futureValue = projectedValue(prop.price, prop.appreciationRate, months);
  const rentGrown = h.monthlyRent * Math.pow(1 + prop.rentGrowthRate / 100, months / 12);
  const appreciation = futureValue - h.purchasePrice;
  const cumCF = h.monthlyCashFlow * months;
  return (
    <div className="card flex h-full flex-col overflow-hidden">
      <HouseIllustration property={prop} height={140} />
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent">
              {STRATEGY_LABELS[h.strategy]}
            </div>
            <div className="mt-0.5 text-sm font-semibold">{prop.address}</div>
            <div className="text-xs text-muted">{prop.neighborhood}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted">Bought</div>
            <div className="text-sm font-mono text-slate-800">{fmtMoney(h.purchasePrice)}</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <Mini label="Now worth" value={fmtMoney(futureValue)} good={appreciation >= 0} />
          <Mini label="Appreciation" value={fmtMoney(appreciation)} good={appreciation >= 0} />
          <Mini label="Rent/mo" value={fmtMoney(rentGrown)} />
          <Mini label="Cash flow/mo" value={fmtMoney(h.monthlyCashFlow)} good={h.monthlyCashFlow >= 0} />
          <Mini label="Cumulative CF" value={fmtMoney(cumCF)} good={cumCF >= 0} />
          <Mini label="Cash in" value={fmtMoney(h.cashIn)} />
        </div>

        <div className="mt-4 flex gap-2">
          <Link href={`/market/${prop.id}`} className="btn-secondary flex-1 text-xs">
            View
          </Link>
          <button onClick={onSell} className="btn-secondary text-xs">Sell</button>
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="card p-4">
      <div className="text-[10px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-1 text-xl font-semibold ${good ? "text-accent" : "text-slate-900"}`}>
        {value}
      </div>
    </div>
  );
}

function Mini({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-lg bg-[#F7F8FA] p-2">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-0.5 text-[12px] font-medium ${good ? "text-accent" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}

function projectedValue(startPrice: number, apprPct: number, months: number) {
  return Math.round(startPrice * Math.pow(1 + apprPct / 100, months / 12));
}

function computeTotals(p: PortfolioState, months: number) {
  let equity = 0;
  let monthlyCF = 0;
  let totalCashIn = 0;
  let futureValue = 0;
  let cumulativeCF = 0;
  for (const h of p.holdings) {
    const prop = getProperty(h.propertyId);
    if (!prop) continue;
    const current = projectedValue(prop.price, prop.appreciationRate, months);
    const loanBalance = Math.max(0, h.purchasePrice * (1 - h.financing.downPaymentPct));
    equity += Math.max(0, current - loanBalance);
    futureValue += current;
    monthlyCF += h.monthlyCashFlow;
    totalCashIn += h.cashIn;
    cumulativeCF += h.monthlyCashFlow * months;
  }
  const avgCoC = totalCashIn > 0 ? (monthlyCF * 12) / totalCashIn : 0;
  const totalReturn = totalCashIn > 0
    ? (equity - totalCashIn + cumulativeCF) / totalCashIn
    : 0;
  return { equity, monthlyCF, avgCoC, futureValue, cumulativeCF, totalReturn };
}
