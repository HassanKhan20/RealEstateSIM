// Forward simulation + backtest for beginner-mode portfolios.
// Models each held home month-by-month:
//   - Property value compounds at its appreciation rate
//   - Rent grows at the property's rent growth rate
//   - If financed, we pay the fixed monthly payment; loan amortizes naturally
//   - Monthly cash flow = rent - mortgage (cash buys have no mortgage)
//   - At sale (optional, end of horizon) we deduct 6% costs and pay off loan
//
// Pure functions; no DOM dependency. Safe to import anywhere.

import type { Property } from "./properties";
import type { BeginnerHolding, BeginnerPortfolio } from "./store";

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

export type SimMonthPoint = {
  t: number; // unix ms
  totalValue: number; // cash + market value of holdings (not including loans as debt — this is the gross)
  equity: number; // cash + (homeValue - loanBalance)
  cashFlowMonth: number; // that month's net cash flow
};

export type SimResult = {
  points: SimMonthPoint[];
  finalEquity: number;
  totalCashFlow: number;
  startEquity: number;
  totalReturnPct: number;
  scenarioLabel: string;
};

type RuntimeHolding = BeginnerHolding & {
  currentValue: number;
  currentLoanBalance: number;
  currentRent: number;
  effectiveMonthlyPayment: number;
};

function initRuntime(h: BeginnerHolding, scenario: SimScenario): RuntimeHolding {
  // If financed and there's a rate shock, reprice monthly payment to new rate
  let effectiveMonthlyPayment = h.monthlyPayment ?? 0;
  let loanBalance = h.loanBalance ?? 0;
  if (h.purchaseType === "finance" && scenario.rateShock !== 0 && h.termYears && loanBalance > 0) {
    const newRate = (h.interestRate ?? 0) + scenario.rateShock;
    effectiveMonthlyPayment = monthlyPI(loanBalance, newRate, h.termYears);
  }
  return {
    ...h,
    currentValue: h.purchasePrice,
    currentLoanBalance: loanBalance,
    currentRent: h.monthlyRent,
    effectiveMonthlyPayment,
  };
}

function monthlyPI(principal: number, ratePct: number, termYears: number): number {
  if (principal <= 0) return 0;
  if (ratePct <= 0 || termYears <= 0) return Math.round(principal / Math.max(1, termYears * 12));
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(pmt);
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
      return { h: initRuntime(h, scenario), prop };
    })
    .filter((x): x is { h: RuntimeHolding; prop: Property } => x !== null);

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

  let totalCashFlow = 0;

  for (let m = 1; m <= months; m++) {
    let cashFlowMonth = 0;
    for (const { h, prop } of runtime) {
      // Appreciation (monthly compound from annual * multiplier)
      const annualAppr = prop.appreciationRate * scenario.appreciationMult;
      const monthlyAppr = Math.pow(1 + annualAppr / 100, 1 / 12) - 1;
      h.currentValue *= 1 + monthlyAppr;

      // Crash shock
      if (scenario.crashMonth === m && scenario.crashPct) {
        h.currentValue *= 1 - scenario.crashPct;
      }

      // Rent growth
      const annualRent = prop.rentGrowthRate * scenario.rentGrowthMult;
      const monthlyRentGrowth = Math.pow(1 + annualRent / 100, 1 / 12) - 1;
      h.currentRent *= 1 + monthlyRentGrowth;

      // Mortgage amortization (approximate; we use the effective payment)
      if (h.purchaseType === "finance" && h.currentLoanBalance > 0) {
        const rate = ((h.interestRate ?? 0) + scenario.rateShock) / 100 / 12;
        const interestPortion = h.currentLoanBalance * rate;
        const principalPortion = Math.max(0, h.effectiveMonthlyPayment - interestPortion);
        h.currentLoanBalance = Math.max(0, h.currentLoanBalance - principalPortion);
        cashFlowMonth += h.currentRent - h.effectiveMonthlyPayment;
      } else {
        // Cash buy — rent minus token operating costs (10% of rent)
        cashFlowMonth += h.currentRent * 0.9;
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
