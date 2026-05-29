// Daily Challenge — one global property per day, deterministic by date.
// Everyone running /today on the same day sees the same listing + same
// "experts said" verdict. That's the social hook.

import { PROPERTIES } from "./properties";
import { computeDeal, DEFAULT_FINANCING, DEFAULT_OPERATING } from "./finance";

export type DailyVerdict = "BUY" | "SKIP" | "WALK";

export type DailyChallenge = {
  dateKey: string;       // "2026-05-13"
  property: typeof PROPERTIES[number];
  // The community / expert "answer"
  verdict: DailyVerdict;
  reason: string;
  // Headline math for the property under conventional financing
  capRate: number;
  cashOnCash: number;
  monthlyCashFlow: number;
};

export function dateKey(d: Date = new Date()): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function hashString(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

// "Expert" verdict heuristic — applies common-sense investor rules to a deal.
function expertVerdict(p: typeof PROPERTIES[number]): { verdict: DailyVerdict; reason: string; capRate: number; cashOnCash: number; cashFlow: number } {
  const deal = computeDeal(p, DEFAULT_FINANCING.conventional, DEFAULT_OPERATING);

  // BUY: positive cash flow + cap rate above 5% + DSCR above 1.25
  if (deal.monthlyCashFlow > 0 && deal.capRate >= 0.05 && deal.dscr >= 1.25) {
    return {
      verdict: "BUY",
      reason: `Cap rate ${(deal.capRate * 100).toFixed(1)}%, monthly cash flow ${Math.round(deal.monthlyCashFlow)}, DSCR ${deal.dscr.toFixed(2)} — penciled buy.`,
      capRate: deal.capRate,
      cashOnCash: deal.cashOnCash,
      cashFlow: deal.monthlyCashFlow,
    };
  }
  // WALK: deeply negative cash flow or DSCR < 1.0
  if (deal.monthlyCashFlow < -200 || deal.dscr < 1.0) {
    return {
      verdict: "WALK",
      reason: `Negative cash flow of ${Math.round(deal.monthlyCashFlow)}/mo and DSCR ${deal.dscr.toFixed(2)} — you're feeding this deal.`,
      capRate: deal.capRate,
      cashOnCash: deal.cashOnCash,
      cashFlow: deal.monthlyCashFlow,
    };
  }
  // SKIP: ambiguous — neither great nor disaster
  return {
    verdict: "SKIP",
    reason: `Marginal cash flow ${Math.round(deal.monthlyCashFlow)}/mo, cap ${(deal.capRate * 100).toFixed(1)}%. Not bad enough to walk, not good enough to buy at full price. Negotiate or skip.`,
    capRate: deal.capRate,
    cashOnCash: deal.cashOnCash,
    cashFlow: deal.monthlyCashFlow,
  };
}

export function getDailyChallenge(date: Date = new Date()): DailyChallenge {
  const key = dateKey(date);
  const seed = hashString(key);
  const p = PROPERTIES[seed % PROPERTIES.length];
  const e = expertVerdict(p);
  return {
    dateKey: key,
    property: p,
    verdict: e.verdict,
    reason: e.reason,
    capRate: e.capRate,
    cashOnCash: e.cashOnCash,
    monthlyCashFlow: e.cashFlow,
  };
}
