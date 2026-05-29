// Forward simulation + backtest for beginner-mode portfolios.
//
// What this models, month-by-month, for each holding:
//   1. Property value compounds at appreciation rate (× scenario multiplier)
//   2. Rent grows at the property's rent growth rate (× scenario multiplier)
//   3. Property taxes escalate 3.5%/yr (FL non-homestead reality)
//   4. Insurance escalates 8%/yr (FL hurricane-crisis pricing trend)
//   5. Mortgage amortizes correctly month-by-month (financed only)
//   6. Mortgage payment re-prices under a rate shock scenario
//   7. Random vacancy events: ~1 month of zero rent per year on average (seeded)
//   8. Random capex events: roof / HVAC / water heater hit on realistic cadences
//   9. Crash scenarios apply a one-time hit to property values
//
// All randomness is seeded by property.facadeSeed + scenario.label so a given
// (portfolio, scenario, horizon) always produces the same result.
//
// Pure functions; no DOM dependency. Safe to import anywhere.

import type { Property } from "./properties";
import type { BeginnerHolding, BeginnerPortfolio } from "./types";

export type SimScenario = {
  // Multipliers applied to the property's baseline assumptions
  appreciationMult: number; // 0.5 = half the expected appreciation
  rentGrowthMult: number;   // 0.5 = half rent growth
  rateShock: number;        // +/- percent added to interest (financed only)
  crashMonth?: number;      // if set, force a one-time -% drop in that month
  crashPct?: number;        // 0.15 = -15% hit to values that month
  label: string;
};

export const SCENARIOS: SimScenario[] = [
  { label: "Base case", appreciationMult: 1, rentGrowthMult: 1, rateShock: 0 },
  { label: "Soft market", appreciationMult: 0.4, rentGrowthMult: 0.5, rateShock: 0 },
  { label: "Hot market", appreciationMult: 1.6, rentGrowthMult: 1.5, rateShock: 0 },
  { label: "2008-style crash", appreciationMult: -0.3, rentGrowthMult: 0.3, rateShock: 0, crashMonth: 6, crashPct: 0.22 },
  { label: "Rates spike", appreciationMult: 0.6, rentGrowthMult: 0.8, rateShock: 2.5 },
];

export type SimEvent = {
  month: number;
  type: "vacancy" | "roof" | "hvac" | "water-heater" | "crash";
  cost: number;
  note: string;
};

export type SimMonthPoint = {
  t: number;          // unix ms
  totalValue: number; // cash + market value of holdings (not netted of loans — this is gross)
  equity: number;     // cash + (homeValue - loanBalance)
  cashFlowMonth: number;
};

export type SimResult = {
  points: SimMonthPoint[];
  finalEquity: number;
  totalCashFlow: number;
  startEquity: number;
  totalReturnPct: number;
  scenarioLabel: string;
  events: SimEvent[]; // capex, vacancy, crash — surfaced for the UI
};

type RuntimeHolding = BeginnerHolding & {
  currentValue: number;
  currentLoanBalance: number;
  currentRent: number;
  currentMonthlyTaxes: number;
  currentMonthlyInsurance: number;
  currentMonthlyHoa: number;
  effectiveMonthlyPayment: number;
  effectiveRate: number; // annual percent (post-shock)
};

// ---- helpers ----------------------------------------------------------------

function mulberry32(seed: number) {
  let s = seed >>> 0;
  return function () {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = s ^ (s >>> 15);
    t = Math.imul(t, t | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function monthlyPI(principal: number, ratePct: number, termYears: number): number {
  if (principal <= 0) return 0;
  if (ratePct <= 0 || termYears <= 0) return Math.round(principal / Math.max(1, termYears * 12));
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

// FL non-homestead tax + insurance escalation (annual rates).
const TAX_ESCALATION = 0.035;       // 3.5% per year
const INSURANCE_ESCALATION = 0.08;  // 8% per year (current FL trend)

// Variable opex as % of monthly rent.
const MAINTENANCE_PCT = 0.08;
const CAPEX_RESERVE_PCT = 0.07;

// Random event base probabilities — per-month.
const VACANCY_PROB_PER_MONTH = 1 / 12;    // ~1 month/year empty
// Major capex — checked at year boundaries; probability per year.
const ROOF_PROB_YEAR    = 1 / 22;   // ~22-year roof
const HVAC_PROB_YEAR    = 1 / 17;   // ~17-year HVAC
const WATER_PROB_YEAR   = 1 / 11;   // ~11-year water heater
const COST_ROOF = 12_000;
const COST_HVAC = 8_000;
const COST_WATER = 1_500;

// ---- main entry --------------------------------------------------------------

function initRuntime(h: BeginnerHolding, prop: Property, scenario: SimScenario): RuntimeHolding {
  const baseRate = h.interestRate ?? 0;
  const effectiveRate = baseRate + scenario.rateShock;
  let effectiveMonthlyPayment = h.monthlyPayment ?? 0;
  let loanBalance = h.loanBalance ?? 0;
  if (h.purchaseType === "finance" && scenario.rateShock !== 0 && h.termYears && loanBalance > 0) {
    effectiveMonthlyPayment = monthlyPI(loanBalance, effectiveRate, h.termYears);
  }
  return {
    ...h,
    currentValue: h.purchasePrice,
    currentLoanBalance: loanBalance,
    currentRent: h.monthlyRent,
    currentMonthlyTaxes: prop.monthlyTaxes,
    currentMonthlyInsurance: prop.monthlyInsurance,
    currentMonthlyHoa: prop.monthlyHoa,
    effectiveMonthlyPayment,
    effectiveRate,
  };
}

export function simulatePortfolio(
  portfolio: BeginnerPortfolio,
  propertyLookup: (id: string) => Property | undefined,
  months: number,
  scenario: SimScenario = SCENARIOS[0]
): SimResult {
  const now = Date.now();
  const monthMs = 30 * 24 * 60 * 60 * 1000;

  const runtime = portfolio.holdings
    .map((h) => {
      const prop = propertyLookup(h.propertyId);
      if (!prop) return null;
      return { h: initRuntime(h, prop, scenario), prop };
    })
    .filter((x): x is { h: RuntimeHolding; prop: Property } => x !== null);

  // Per-property RNG seeded by (facadeSeed, scenario label) so the same scenario
  // produces identical events across reloads.
  const rngs = new Map<string, () => number>();
  for (const { h, prop } of runtime) {
    rngs.set(h.propertyId, mulberry32(prop.facadeSeed ^ hashString(scenario.label)));
  }

  let cash = portfolio.cash;
  const startEquity = cash + runtime.reduce((a, { h }) => a + (h.currentValue - h.currentLoanBalance), 0);

  const points: SimMonthPoint[] = [
    {
      t: now,
      totalValue: cash + runtime.reduce((a, { h }) => a + h.currentValue, 0),
      equity: startEquity,
      cashFlowMonth: 0,
    },
  ];

  const events: SimEvent[] = [];
  let totalCashFlow = 0;

  const monthlyTaxStep = Math.pow(1 + TAX_ESCALATION, 1 / 12) - 1;
  const monthlyInsStep = Math.pow(1 + INSURANCE_ESCALATION, 1 / 12) - 1;

  for (let m = 1; m <= months; m++) {
    let cashFlowMonth = 0;

    for (const { h, prop } of runtime) {
      const rng = rngs.get(h.propertyId)!;

      // 1. Appreciation (monthly compound from annual × multiplier)
      const annualAppr = prop.appreciationRate * scenario.appreciationMult;
      const monthlyAppr = Math.pow(1 + annualAppr / 100, 1 / 12) - 1;
      h.currentValue *= 1 + monthlyAppr;

      // 2. One-time crash hit
      if (scenario.crashMonth === m && scenario.crashPct) {
        h.currentValue *= 1 - scenario.crashPct;
        events.push({
          month: m,
          type: "crash",
          cost: 0,
          note: `${scenario.label}: market dropped ${(scenario.crashPct * 100).toFixed(0)}%`,
        });
      }

      // 3. Rent grows
      const annualRent = prop.rentGrowthRate * scenario.rentGrowthMult;
      const monthlyRentGrowth = Math.pow(1 + annualRent / 100, 1 / 12) - 1;
      h.currentRent *= 1 + monthlyRentGrowth;

      // 4. Taxes + insurance escalate continuously
      h.currentMonthlyTaxes *= 1 + monthlyTaxStep;
      h.currentMonthlyInsurance *= 1 + monthlyInsStep;

      // 5. Vacancy roll — each month, chance of 0 rent
      const isVacant = rng() < VACANCY_PROB_PER_MONTH;
      const rentReceived = isVacant ? 0 : h.currentRent;
      if (isVacant) {
        events.push({
          month: m,
          type: "vacancy",
          cost: Math.round(h.currentRent),
          note: `Vacancy: lost $${Math.round(h.currentRent)} rent`,
        });
      }

      // 6. Variable opex (maintenance + capex reserve, both % of current rent)
      const variableOpex = h.currentRent * (MAINTENANCE_PCT + CAPEX_RESERVE_PCT);

      // 7. Lumpy capex events — checked at year boundaries (month = 12, 24, ...)
      let lumpyHit = 0;
      if (m % 12 === 0) {
        if (rng() < ROOF_PROB_YEAR) {
          lumpyHit += COST_ROOF;
          events.push({ month: m, type: "roof", cost: COST_ROOF, note: "Roof replacement" });
        }
        if (rng() < HVAC_PROB_YEAR) {
          lumpyHit += COST_HVAC;
          events.push({ month: m, type: "hvac", cost: COST_HVAC, note: "HVAC replacement" });
        }
        if (rng() < WATER_PROB_YEAR) {
          lumpyHit += COST_WATER;
          events.push({ month: m, type: "water-heater", cost: COST_WATER, note: "Water heater replacement" });
        }
      }

      // 8. Mortgage payment (financed) or no mortgage (cash buy)
      if (h.purchaseType === "finance" && h.currentLoanBalance > 0) {
        const monthlyRate = h.effectiveRate / 100 / 12;
        const interestPortion = h.currentLoanBalance * monthlyRate;
        const principalPortion = Math.max(0, h.effectiveMonthlyPayment - interestPortion);
        h.currentLoanBalance = Math.max(0, h.currentLoanBalance - principalPortion);

        cashFlowMonth +=
          rentReceived
          - h.effectiveMonthlyPayment
          - h.currentMonthlyTaxes
          - h.currentMonthlyInsurance
          - h.currentMonthlyHoa
          - variableOpex
          - lumpyHit;
      } else {
        // Cash buy — no mortgage but still owes taxes/insurance/HOA/opex
        cashFlowMonth +=
          rentReceived
          - h.currentMonthlyTaxes
          - h.currentMonthlyInsurance
          - h.currentMonthlyHoa
          - variableOpex
          - lumpyHit;
      }
    }

    cash += cashFlowMonth;
    totalCashFlow += cashFlowMonth;

    const totalValue = cash + runtime.reduce((a, { h }) => a + h.currentValue, 0);
    const equity = cash + runtime.reduce((a, { h }) => a + (h.currentValue - h.currentLoanBalance), 0);
    points.push({
      t: now + m * monthMs,
      totalValue: Math.round(totalValue),
      equity: Math.round(equity),
      cashFlowMonth: Math.round(cashFlowMonth),
    });
  }

  const finalEquity = points[points.length - 1].equity;
  const totalReturnPct = startEquity > 0 ? (finalEquity - startEquity) / startEquity : 0;

  return {
    points,
    finalEquity,
    totalCashFlow: Math.round(totalCashFlow),
    startEquity: Math.round(startEquity),
    totalReturnPct,
    scenarioLabel: scenario.label,
    events,
  };
}

// Convenience — simulate the hypothetical purchase of a single property
// on top of the current portfolio, so users can preview what adding this
// deal would do to their equity curve before actually buying.
export function simulatePreview(
  portfolio: BeginnerPortfolio,
  candidate: BeginnerHolding,
  propertyLookup: (id: string) => Property | undefined,
  months: number,
  scenario: SimScenario = SCENARIOS[0]
): SimResult {
  const hypothetical: BeginnerPortfolio = {
    cash: Math.max(0, portfolio.cash - candidate.cashIn),
    holdings: [...portfolio.holdings, candidate],
  };
  return simulatePortfolio(hypothetical, propertyLookup, months, scenario);
}

// ---- Sell-now preview with taxes ---------------------------------------------

export type SaleResult = {
  salePrice: number;
  loanPayoff: number;
  sellingCosts: number;
  costBasis: number;
  capitalGain: number;
  isLongTerm: boolean;
  estimatedTax: number;
  netProceeds: number;
};

export function projectSale(
  h: BeginnerHolding,
  appreciatedValue: number,
  taxableRate: number = 0.20 // assume long-term 20% (effective fed + most states)
): SaleResult {
  const salePrice = appreciatedValue;
  const sellingCosts = Math.round(salePrice * 0.06); // 6% commission + closing
  const loanPayoff = h.loanBalance ?? 0;
  const costBasis = h.purchasePrice; // ignores depreciation for simplicity
  const grossGain = salePrice - costBasis - sellingCosts;
  const isLongTerm = Date.now() - h.purchasedAt > 365 * 24 * 60 * 60 * 1000;
  const effectiveTaxRate = isLongTerm ? taxableRate : 0.32; // short-term as ordinary income
  const estimatedTax = Math.max(0, Math.round(grossGain * effectiveTaxRate));
  const netProceeds = Math.max(0, salePrice - loanPayoff - sellingCosts - estimatedTax);
  return {
    salePrice,
    loanPayoff,
    sellingCosts,
    costBasis,
    capitalGain: grossGain,
    isLongTerm,
    estimatedTax,
    netProceeds,
  };
}
