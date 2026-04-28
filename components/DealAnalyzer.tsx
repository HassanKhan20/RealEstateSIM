"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Property, Strategy } from "@/lib/properties";
import {
  computeDeal,
  computeFlip,
  DEFAULT_FINANCING,
  DEFAULT_OPERATING,
  fmtMoney,
  fmtPct,
  type FinancingInputs,
  type FinancingType,
} from "@/lib/finance";
import { buyProperty, getPortfolio } from "@/lib/store";

const STRATEGIES: { key: Strategy; label: string; fin: FinancingType; note: string }[] = [
  { key: "buy-hold", label: "Buy & Hold", fin: "conventional", note: "Long-term rental. 20% down, 30-yr fixed." },
  { key: "house-hack", label: "House Hack", fin: "fha", note: "FHA 3.5% down. Live in one unit, rent the rest." },
  { key: "flip", label: "Flip", fin: "hard-money", note: "Hard money, 6-month hold, sell at ARV." },
  { key: "brrrr", label: "BRRRR", fin: "hard-money", note: "Buy, rehab, rent, refi, repeat." },
];

export default function DealAnalyzer({ property }: { property: Property }) {
  const router = useRouter();
  const [strategy, setStrategy] = useState<Strategy>("buy-hold");
  const [financingType, setFinancingType] = useState<FinancingType>("conventional");
  const [downPct, setDownPct] = useState<number>(20);
  const [rate, setRate] = useState<number>(6.95);
  const [rehab, setRehab] = useState<number>(property.estimatedRehab);
  const [rent, setRent] = useState<number>(property.estimatedRent);
  const [price, setPrice] = useState<number>(property.price);
  const [cash, setCash] = useState<number>(0);
  const [owned, setOwned] = useState<boolean>(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    const p = getPortfolio();
    setCash(p.cash);
    setOwned(p.holdings.some((h) => h.propertyId === property.id));
  }, [property.id]);

  // keep financing defaults in sync when strategy changes
  useEffect(() => {
    const match = STRATEGIES.find((s) => s.key === strategy);
    if (!match) return;
    const def = DEFAULT_FINANCING[match.fin];
    setFinancingType(match.fin);
    setDownPct(def.downPaymentPct * 100);
    setRate(def.ratePct);
  }, [strategy]);

  const financing: FinancingInputs = useMemo(() => {
    const def = DEFAULT_FINANCING[financingType];
    return {
      ...def,
      downPaymentPct: downPct / 100,
      ratePct: rate,
      rehab,
    };
  }, [financingType, downPct, rate, rehab]);

  const pricedProperty: Property = useMemo(() => ({ ...property, price }), [property, price]);

  const deal = useMemo(
    () => computeDeal(pricedProperty, financing, DEFAULT_OPERATING, rent),
    [pricedProperty, financing, rent]
  );

  const flip = useMemo(
    () => computeFlip(pricedProperty, financing, 6),
    [pricedProperty, financing]
  );

  const isFlip = strategy === "flip" || strategy === "brrrr";
  const headlineROI = isFlip ? flip.roi : deal.cashOnCash;
  const healthy =
    !isFlip ? deal.monthlyCashFlow >= 0 && deal.dscr >= 1.2 : flip.netProfit > 20_000;

  function onBuy() {
    const result = buyProperty({
      propertyId: property.id,
      purchasedAt: Date.now(),
      purchasePrice: price,
      financing,
      rehabSpent: rehab,
      strategy,
      monthlyCashFlow: deal.monthlyCashFlow,
      monthlyRent: rent,
      cashIn: deal.totalCashIn,
    });
    if (!result.ok) {
      setToast(result.reason ?? "Could not complete purchase.");
      setTimeout(() => setToast(null), 3500);
      return;
    }
    setOwned(true);
    setToast(`Bought. ${fmtMoney(deal.totalCashIn)} invested. Go to portfolio →`);
    setTimeout(() => {
      setToast(null);
      router.push("/portfolio");
    }, 1400);
  }

  return (
    <div className="space-y-4">
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-accent">
              Deal Analyzer
            </div>
            <h2 className="mt-1 text-lg font-semibold">Run the numbers</h2>
          </div>
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-widest text-muted">Cash</div>
            <div className="text-sm font-mono text-slate-800">{fmtMoney(cash)}</div>
          </div>
        </div>

        {/* Strategy tabs */}
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STRATEGIES.map((s) => (
            <button
              key={s.key}
              onClick={() => setStrategy(s.key)}
              className={`rounded-lg border px-3 py-2 text-[11px] font-medium transition ${
                strategy === s.key
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-border bg-white text-muted hover:text-slate-900"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted">
          {STRATEGIES.find((x) => x.key === strategy)?.note}
        </p>

        {/* Inputs */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumField label="Offer price" value={price} onChange={setPrice} step={5000} min={50_000} />
          <NumField label="Rehab budget" value={rehab} onChange={setRehab} step={500} min={0} />
          <NumField label="Monthly rent" value={rent} onChange={setRent} step={25} min={0} />
          <Select
            label="Financing"
            value={financingType}
            onChange={(v) => setFinancingType(v as FinancingType)}
            options={[
              { v: "cash", l: "Cash" },
              { v: "conventional", l: "Conventional" },
              { v: "fha", l: "FHA" },
              { v: "hard-money", l: "Hard money" },
            ]}
          />
          <SliderField
            label={`Down payment · ${downPct.toFixed(1)}%`}
            value={downPct}
            onChange={setDownPct}
            min={0}
            max={100}
            step={0.5}
          />
          <SliderField
            label={`Interest rate · ${rate.toFixed(2)}%`}
            value={rate}
            onChange={setRate}
            min={0}
            max={15}
            step={0.05}
          />
        </div>

        {/* Headlines */}
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {isFlip ? (
            <>
              <Headline label="Net profit" value={fmtMoney(flip.netProfit)} good={flip.netProfit > 0} />
              <Headline label="ROI" value={fmtPct(flip.roi)} good={flip.roi >= 0.2} />
              <Headline label="Carry (6mo)" value={fmtMoney(flip.carryingCosts)} />
              <Headline label="All-in" value={fmtMoney(flip.totalProjectCost)} />
            </>
          ) : (
            <>
              <Headline label="Cash flow / mo" value={fmtMoney(deal.monthlyCashFlow)} good={deal.monthlyCashFlow >= 0} />
              <Headline label="Cash-on-cash" value={fmtPct(deal.cashOnCash)} good={deal.cashOnCash >= 0.08} />
              <Headline label="Cap rate" value={fmtPct(deal.capRate)} good={deal.capRate >= 0.06} />
              <Headline label="DSCR" value={deal.dscr === Infinity ? "∞" : deal.dscr.toFixed(2)} good={deal.dscr >= 1.25} />
            </>
          )}
        </div>

        {/* Rules flags */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-[11px]">
          <RuleFlag
            ok={deal.oneRule >= 0.01}
            label={`1% rule · ${(deal.oneRule * 100).toFixed(2)}%`}
          />
          <RuleFlag
            ok={flip.netProfit >= 0.7 * property.estimatedArv - (price + rehab)}
            label={`70% rule · ${fmtMoney(0.7 * property.estimatedArv - rehab)} max buy`}
          />
        </div>

        {/* Breakdown */}
        <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-border pt-4 text-xs">
          <Row l="Down payment" r={fmtMoney(deal.downPayment)} />
          <Row l="Loan amount" r={fmtMoney(deal.loanAmount)} />
          <Row l="Closing costs" r={fmtMoney(deal.closingCosts)} />
          <Row l="Rehab" r={fmtMoney(deal.rehabCost)} />
          <Row l="Total cash in" r={fmtMoney(deal.totalCashIn)} bold />
          <Row l="Monthly P&I" r={fmtMoney(deal.monthlyPI)} />
          <Row l="Taxes" r={fmtMoney(deal.monthlyTaxes)} />
          <Row l="Insurance" r={fmtMoney(deal.monthlyInsurance)} />
          <Row l="HOA" r={fmtMoney(deal.monthlyHoa)} />
          <Row l="PITI" r={fmtMoney(deal.monthlyPiti)} bold />
          <Row l="Vacancy allow." r={fmtMoney(deal.vacancyAllowance)} />
          <Row l="Maintenance" r={fmtMoney(deal.monthlyMaintenance)} />
          <Row l="CapEx reserve" r={fmtMoney(deal.monthlyCapEx)} />
          <Row l="Mgmt" r={fmtMoney(deal.monthlyManagement)} />
          <Row l="Total monthly exp" r={fmtMoney(deal.monthlyExpenses)} bold />
        </div>

        {/* CTA */}
        <div className="mt-5 space-y-2">
          <button
            onClick={onBuy}
            disabled={owned || deal.totalCashIn > cash}
            className="btn-primary w-full disabled:opacity-50"
          >
            {owned
              ? "Already in portfolio"
              : deal.totalCashIn > cash
                ? `Need ${fmtMoney(deal.totalCashIn - cash)} more cash`
                : `Buy for ${fmtMoney(deal.totalCashIn)} down`}
          </button>
          {toast && (
            <div className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-accent">
              {toast}
            </div>
          )}
          <div className={`rounded-lg px-3 py-2 text-[11px] ${
            healthy
              ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
              : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
          }`}>
            {healthy
              ? "✓ Pencils out under default assumptions. You'd sleep on this."
              : isFlip
                ? "⚠ Thin margin. Underestimated rehab or missed ARV could wipe this."
                : "⚠ Negative cash flow or weak coverage. Walk, or renegotiate."}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ l, r, bold }: { l: string; r: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted">{l}</span>
      <span className={`font-mono ${bold ? "text-slate-900 font-semibold" : "text-slate-700"}`}>{r}</span>
    </div>
  );
}

function Headline({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="rounded-xl bg-[#F7F8FA] p-3">
      <div className="text-[9px] uppercase tracking-widest text-muted">{label}</div>
      <div className={`mt-0.5 text-lg font-semibold ${good ? "text-accent" : "text-slate-800"}`}>
        {value}
      </div>
    </div>
  );
}

function RuleFlag({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      className={`rounded-lg border px-2.5 py-1.5 ${
        ok
          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-800 ring-1 ring-amber-200"
      }`}
    >
      {ok ? "✓" : "✕"} {label}
    </div>
  );
}

function NumField({
  label, value, onChange, step = 1, min,
}: { label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
      />
    </label>
  );
}

function SliderField({
  label, value, onChange, min, max, step,
}: { label: string; value: number; onChange: (v: number) => void; min: number; max: number; step: number; }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 accent-emerald-400"
      />
    </label>
  );
}

function Select({
  label, value, onChange, options,
}: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[]; }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-accent focus:shadow-[0_0_0_3px_rgba(37,99,235,0.15)]"
      >
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
