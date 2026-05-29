// Level system — pacing how a new investor unlocks tools and capital.
// Beginner mode enforces these. Pro mode is "the safety rails are off."
//
// XP is earned by:
//   - Completing an agent simulation     +100 XP per session (× grade/100)
//   - Buying a property                  +50 XP
//   - Holding a profitable property      +25 XP per simulated year
//   - Passing an exam set (≥75%)         +75 XP
//   - Simulating a portfolio (any scen)  +20 XP per run

import type { ArchetypeKey } from "./onboarding";

export type LevelKey = "rookie" | "apprentice" | "operator" | "strategist" | "master";

export type LevelDef = {
  key: LevelKey;
  num: number;            // 1..5
  name: string;            // display
  xpRequired: number;      // cumulative XP to reach this level
  cashGrant: number;       // total cash available at this level (caps top-up)
  propertyLimit: number;
  unlockedFinancing: Array<"cash" | "finance">;
  unlockedStrategies: Array<"buy-hold" | "house-hack" | "flip" | "brrrr">;
  maxDownPaymentMin: number; // minimum % down allowed (cash-conservation rail)
  unlockGoal: string;        // one-sentence "do this to level up"
  perks: string[];
};

export const LEVELS: LevelDef[] = [
  {
    key: "rookie",
    num: 1,
    name: "Rookie",
    xpRequired: 0,
    cashGrant: 50_000,
    propertyLimit: 1,
    unlockedFinancing: ["cash", "finance"],
    unlockedStrategies: ["buy-hold"],
    maxDownPaymentMin: 0.25,          // must put at least 25% down
    unlockGoal:
      "Buy your first property OR finish 2 agent simulations to unlock Apprentice.",
    perks: ["Buy & Hold strategy", "All-cash or 25%+ down only"],
  },
  {
    key: "apprentice",
    num: 2,
    name: "Apprentice",
    xpRequired: 300,
    cashGrant: 100_000,
    propertyLimit: 2,
    unlockedFinancing: ["cash", "finance"],
    unlockedStrategies: ["buy-hold", "house-hack"],
    maxDownPaymentMin: 0.20,
    unlockGoal:
      "Hold a property cash-flow-positive for 12 simulated months to reach Operator.",
    perks: ["House Hack unlocked", "20% down allowed", "Up to 2 properties"],
  },
  {
    key: "operator",
    num: 3,
    name: "Operator",
    xpRequired: 800,
    cashGrant: 200_000,
    propertyLimit: 4,
    unlockedFinancing: ["cash", "finance"],
    unlockedStrategies: ["buy-hold", "house-hack", "flip"],
    maxDownPaymentMin: 0.10,
    unlockGoal:
      "Maintain $500+/mo portfolio cash flow OR complete a profitable flip to reach Strategist.",
    perks: ["Flip strategy unlocked", "10% down conventional", "Up to 4 properties"],
  },
  {
    key: "strategist",
    num: 4,
    name: "Strategist",
    xpRequired: 1_800,
    cashGrant: 400_000,
    propertyLimit: 7,
    unlockedFinancing: ["cash", "finance"],
    unlockedStrategies: ["buy-hold", "house-hack", "flip", "brrrr"],
    maxDownPaymentMin: 0.05,
    unlockGoal:
      "Survive the 2008-crash scenario with positive equity to reach Master.",
    perks: ["BRRRR + hard money", "5% down allowed", "Up to 7 properties"],
  },
  {
    key: "master",
    num: 5,
    name: "Master",
    xpRequired: 3_500,
    cashGrant: 750_000,
    propertyLimit: 999,
    unlockedFinancing: ["cash", "finance"],
    unlockedStrategies: ["buy-hold", "house-hack", "flip", "brrrr"],
    maxDownPaymentMin: 0.00,
    unlockGoal: "Caps off. You're driving without training wheels now.",
    perks: ["No property cap", "All strategies", "Any down payment %"],
  },
];

export const XP_REWARDS = {
  simulationCompleted: 100,     // multiplied by grade/100
  propertyBought: 50,
  exam_pass: 75,
  portfolioSimulated: 20,
} as const;

export function levelForXp(xp: number): LevelDef {
  let curr = LEVELS[0];
  for (const l of LEVELS) {
    if (xp >= l.xpRequired) curr = l;
  }
  return curr;
}

export function nextLevel(xp: number): LevelDef | null {
  const idx = LEVELS.findIndex((l) => xp < l.xpRequired);
  return idx === -1 ? null : LEVELS[idx];
}

export function progressToNext(xp: number): { pct: number; current: LevelDef; next: LevelDef | null } {
  const current = levelForXp(xp);
  const next = nextLevel(xp);
  if (!next) return { pct: 100, current, next: null };
  const range = next.xpRequired - current.xpRequired;
  const earned = xp - current.xpRequired;
  return { pct: Math.max(0, Math.min(100, (earned / range) * 100)), current, next };
}

