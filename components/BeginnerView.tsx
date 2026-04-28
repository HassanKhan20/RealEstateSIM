"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PROPERTIES, TYPE_LABELS, type Property, type PropertyType } from "@/lib/properties";
import { fmtMoney, fmtPct } from "@/lib/finance";
import {
  BEGINNER_STARTING_CASH,
  getBeginnerPortfolio,
  resetBeginnerPortfolio,
  sellBeginnerHome,
  type BeginnerPortfolio,
} from "@/lib/store";
import { SCENARIOS, simulatePortfolio, type SimScenario } from "@/lib/beginnerSim";
import HouseIllustration from "./HouseIllustration";
import PriceChart from "./PriceChart";

type SortKey = "newest" | "priceLow" | "priceHigh" | "rent" | "beds";

export default function BeginnerView() {
  const [p, setP] = useState<BeginnerPortfolio>({ cash: BEGINNER_STARTING_CASH, holdings: [] });
  const [sort, setSort] = useState<SortKey>("newest");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [hood, setHood] = useState<string | "all">("all");
  const [maxPrice, setMaxPrice] = useState<number>(1_200_000);
  const [minBeds, setMinBeds] = useState<number>(0);
  const [confirmReset, setConfirmReset] = useState(false);

  // Simulation state
  const [simOpen, setSimOpen] = useState(false);
  const [horizon, setHorizon] = useState<12 | 36 | 60 | 120>(60);
  const [scenarioIdx, setScenarioIdx] = useState(0);

  useEffect(() => {
    const refresh = () => setP(getBeginnerPortfolio());
    refresh();
    const onStorage = () => refresh();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const hoods = useMemo(() => Array.from(new Set(PROPERTIES.map((p) => p.neighborhood))).sort(), []);

  const owned = new Set(p.holdings.map((h) => h.propertyId));
  const ownedHomes = p.holdings
    .map((h) => ({ h, prop: PROPERTIES.find((x) => x.id === h.propertyId)! }))
    .filter((x) => x.prop);

  const portfolioStats = useMemo(() => {
    let homeValue = 0;
    let loanBalance = 0;
    let monthlyCashFlow = 0;
    let cashIn = 0;
    for (const { h } of ownedHomes) {
      homeValue += h.purchasePrice;
      loanBalance += h.loanBalance ?? 0;
      cashIn += h.cashIn;
      const payment = h.purchaseType === "finance" ? h.monthlyPayment ?? 0 : 0;
      monthlyCashFlow += h.monthlyRent - payment;
    }
    const equity = p.cash + homeValue - loanBalance;
    return { homeValue, loanBalance, monthlyCashFlow, equity, cashIn };
  }, [p, ownedHomes]);

  const filtered = useMemo(() => {
    let list = PROPERTIES.filter(
      (x) =>
        !owned.has(x.id) &&
        (type === "all" || x.type === type) &&
        (hood === "all" || x.neighborhood === hood) &&
        x.price <= maxPrice &&
        x.beds >= minBeds
    );
    switch (sort) {
      case "priceLow": list = list.sort((a, b) => a.price - b.price); break;
      case "priceHigh": list = list.sort((a, b) => b.price - a.price); break;
      case "rent": list = list.sort((a, b) => b.estimatedRent - a.estimatedRent); break;
      case "beds": list = list.sort((a, b) => b.beds - a.beds); break;
      default: list = list.sort((a, b) => a.daysOnMarket - b.daysOnMarket);
    }
    return list;
  }, [sort, type, hood, maxPrice, minBeds, owned]);

  // Sim
  const currentScenario: SimScenario = SCENARIOS[scenarioIdx];
  const sim = useMemo(
    () =>
      simulatePortfolio(
        p,
        (id) => PROPERTIES.find((x) => x.id === id),
        horizon,
        currentScenario
      ),
    [p, horizon, currentScenario]
  );

  const simPoints = sim.points.map((pt) => ({ t: pt.t, price: pt.equity }));

  return (
    <div className="space-y-8">
      {/* Portfolio summary */}
      <section className="card overflow-hidden p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
              Beginner mode · Portfolio
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <div className="font-display text-5xl font-medium text-slate-900">
                {fmtMoney(portfolioStats.equity)}
              </div>
              <div className="text-xs text-slate-500">total equity</div>
            </div>
            <div className="mt-1 text-xs text-slate-500">
              Cash {fmtMoney(p.cash)} · Home value {fmtMoney(portfolioStats.homeValue)} · Loan balance {fmtMoney(portfolioStats.loanBalance)}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSimOpen((v) => !v)}
              className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                simOpen
                  ? "bg-slate-900 text-white"
                  : "bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              }`}
            >
              {simOpen ? "Hide simulation" : "▶ Simulate"}
            </button>
            <Link href="/market" className="btn-secondary text-xs">Switch to Pro</Link>
            <button
              onClick={() => {
                if (!confirmReset) { setConfirmReset(true); return; }
                resetBeginnerPortfolio();
                setP(getBeginnerPortfolio());
                setConfirmReset(false);
              }}
              className="btn-secondary text-xs"
            >
              {confirmReset ? "Click again" : "Reset"}
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Kpi label="Homes owned" value={String(ownedHomes.length)} />
          <Kpi label="Monthly cash flow" value={fmtMoney(portfolioStats.monthlyCashFlow)} good={portfolioStats.monthlyCashFlow >= 0} />
          <Kpi label="Cash invested" value={fmtMoney(portfolioStats.cashIn)} />
          <Kpi label="Loan balance" value={fmtMoney(portfolioStats.loanBalance)} />
        </div>

        {/* Simulate panel */}
        {simOpen && (
          <div className="mt-6 rounded-2xl bg-[#F7F8FA] p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">
                  Simulation · {currentScenario.label}
                </div>
                <div className="mt-0.5 text-sm text-slate-600">
                  Roll {ownedHomes.length} {ownedHomes.length === 1 ? "home" : "homes"} forward {horizon} months and see what happens.
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg bg-white p-1 ring-1 ring-slate-200">
                  {([12, 36, 60, 120] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setHorizon(m)}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        horizon === m ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-50"
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

            {ownedHomes.length === 0 ? (
              <div className="mt-4 grid h-[180px] place-items-center rounded-xl bg-white text-sm text-slate-500 ring-1 ring-slate-200">
                Buy a home below first, then simulate what happens.
              </div>
            ) : (
              <>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <Mini label="Starting equity" value={fmtMoney(sim.startEquity)} />
                  <Mini label={`Equity in ${horizon / 12}y`} value={fmtMoney(sim.finalEquity)} good={sim.finalEquity > sim.startEquity} />
                  <Mini label="Total return" value={fmtPct(sim.totalReturnPct)} good={sim.totalReturnPct > 0} bad={sim.totalReturnPct < 0} />
                  <Mini label="Cash flow collected" value={fmtMoney(sim.totalCashFlow)} good={sim.totalCashFlow > 0} />
                </div>
                <div className="mt-5 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                  <PriceChart history={simPoints} height={220} />
                </div>
              </>
            )}
          </div>
        )}
      </section>

      {/* Your homes */}
      {ownedHomes.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-2xl font-medium text-slate-900">Your homes</h2>
            <span className="text-xs text-slate-500">{ownedHomes.length} held</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ownedHomes.map(({ h, prop }) => (
              <OwnedCard
                key={h.propertyId}
                prop={prop}
                h={h}
                onSell={() => {
                  // Use a hypothetical "sell at slightly-appreciated" price
                  const appreciated = Math.round(h.purchasePrice * 1.04);
                  if (!window.confirm(`Sell for ${fmtMoney(appreciated)}? 6% closing costs deducted.`)) return;
                  const result = sellBeginnerHome(h.propertyId, appreciated);
                  if (result.ok) setP(getBeginnerPortfolio());
                }}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-medium text-slate-900">Listings</h2>
          <span className="text-xs text-slate-500">{filtered.length} available</span>
        </div>
        <div className="card mb-5 flex flex-wrap items-center gap-2 p-3">
          <select className="select" value={type} onChange={(e) => setType(e.target.value as PropertyType | "all")}>
            <option value="all">All types</option>
            {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
          <select className="select" value={hood} onChange={(e) => setHood(e.target.value)}>
            <option value="all">Any neighborhood</option>
            {hoods.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
          <select className="select" value={minBeds} onChange={(e) => setMinBeds(Number(e.target.value))}>
            <option value={0}>Any beds</option>
            {[1,2,3,4,5].map((n) => <option key={n} value={n}>{n}+ beds</option>)}
          </select>
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
            <option value="newest">Newest on market</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="rent">Highest rent</option>
            <option value="beds">Most bedrooms</option>
          </select>
          <div className="ml-auto flex items-center gap-2 px-2 text-xs text-slate-500">
            <span>Max</span>
            <input
              type="range"
              min={150_000}
              max={1_200_000}
              step={25_000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-40"
              style={{ accentColor: "#2563EB" } as any}
            />
            <span className="font-mono text-[12px] text-slate-700">{fmtMoney(maxPrice)}</span>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((prop) => (
            <ListingCard key={prop.id} prop={prop} />
          ))}
        </div>
      </section>

      <style jsx>{`
        .select {
          background: #FFFFFF;
          border-radius: 8px;
          color: #0F172A;
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          font-weight: 500;
          min-width: 130px;
          box-shadow: inset 0 0 0 1px #E5E7EB;
        }
        .select:hover { box-shadow: inset 0 0 0 1px #CBD5E1; }
        .select:focus { outline: none; box-shadow: 0 0 0 3px rgba(37,99,235,0.15), inset 0 0 0 1px #2563EB; }
      `}</style>
    </div>
  );
}

function ListingCard({ prop }: { prop: Property }) {
  return (
    <Link
      href={`/beginner/${prop.id}`}
      className="group block overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(15,23,42,0.06),0_16px_36px_-18px_rgba(15,23,42,0.18)]"
    >
      <div className="relative">
        <HouseIllustration property={prop} height={180} />
        {prop.motivation === "high" && (
          <span className="absolute left-3 top-3 rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Motivated
          </span>
        )}
        {prop.daysOnMarket < 7 && (
          <span className="absolute right-3 top-3 rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            New
          </span>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="font-display text-xl font-medium text-slate-900">{fmtMoney(prop.price)}</div>
          <div className="text-right text-[10px] text-slate-500">
            <div>Rent est.</div>
            <div className="font-mono text-slate-700">{fmtMoney(prop.estimatedRent)}/mo</div>
          </div>
        </div>
        <div className="mt-1.5 text-[13px] text-slate-700">
          <strong className="text-slate-900">{prop.beds}</strong> bd
          <span className="mx-1 text-slate-300">·</span>
          <strong className="text-slate-900">{prop.baths}</strong> ba
          <span className="mx-1 text-slate-300">·</span>
          <strong className="text-slate-900">{prop.sqft.toLocaleString()}</strong> sqft
        </div>
        <div className="mt-1 text-[13px] font-medium text-slate-900">{prop.address}</div>
        <div className="text-[12px] text-slate-500">{prop.neighborhood} · {prop.city}, {prop.state}</div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
          <span>{TYPE_LABELS[prop.type]} · {prop.yearBuilt}</span>
          <span className="font-medium text-[#2563EB] group-hover:underline">View & buy →</span>
        </div>
      </div>
    </Link>
  );
}

function OwnedCard({
  prop,
  h,
  onSell,
}: {
  prop: Property;
  h: any;
  onSell: () => void;
}) {
  const payment = h.purchaseType === "finance" ? h.monthlyPayment ?? 0 : 0;
  const cashFlow = h.monthlyRent - payment;
  const equity = h.purchaseType === "finance"
    ? h.purchasePrice - (h.loanBalance ?? 0)
    : h.purchasePrice;
  return (
    <div className="card overflow-hidden">
      <HouseIllustration property={prop} height={140} />
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">{prop.neighborhood}</div>
            <div className="mt-0.5 text-sm font-semibold text-slate-900">{prop.address}</div>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
            h.purchaseType === "cash" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"
          }`}>
            {h.purchaseType === "cash" ? "Paid in cash" : "Financed"}
          </span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
          <Mini label="Bought at" value={fmtMoney(h.purchasePrice)} />
          <Mini label="Equity" value={fmtMoney(equity)} />
          <Mini label="Rent" value={`${fmtMoney(h.monthlyRent)}/mo`} />
          <Mini label="Cash flow" value={`${fmtMoney(cashFlow)}/mo`} good={cashFlow >= 0} bad={cashFlow < 0} />
        </div>
        <div className="mt-3 flex gap-2">
          <Link href={`/beginner/${prop.id}`} className="btn-secondary flex-1 text-center text-xs">
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
    <div className="rounded-xl bg-[#F7F8FA] p-3">
      <div className="text-[9px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-0.5 text-base font-semibold ${good ? "text-emerald-700" : "text-slate-900"}`}>{value}</div>
    </div>
  );
}

function Mini({ label, value, good, bad }: { label: string; value: string; good?: boolean; bad?: boolean }) {
  const color = good ? "text-emerald-700" : bad ? "text-red-700" : "text-slate-900";
  return (
    <div className="rounded-lg bg-white p-2 ring-1 ring-slate-200">
      <div className="text-[9px] uppercase tracking-widest text-slate-500">{label}</div>
      <div className={`mt-0.5 text-[12px] font-semibold ${color}`}>{value}</div>
    </div>
  );
}
