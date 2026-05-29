// Shared data types — used by frontend (storage layer) AND shared logic
// (simulation, finance). Keeping these here so shared/ doesn't have to
// depend on frontend/lib/store.ts.

import type { FinancingInputs } from "./finance";

// ---- Pro-mode (Market) holdings ----

export type Holding = {
  propertyId: string;
  purchasedAt: number;
  purchasePrice: number;
  financing: FinancingInputs;
  rehabSpent: number;
  strategy: "buy-hold" | "house-hack" | "flip" | "brrrr";
  monthlyCashFlow: number;
  monthlyRent: number;
  cashIn: number;
};

export type PortfolioState = {
  cash: number;
  holdings: Holding[];
};

// ---- Beginner-mode holdings ----

export type BeginnerPurchaseType = "cash" | "finance";

export type BeginnerHolding = {
  propertyId: string;
  purchasedAt: number;
  purchasePrice: number;
  purchaseType: BeginnerPurchaseType;
  // Finance-only fields (undefined for cash)
  downPayment?: number;
  loanBalance?: number;
  interestRate?: number;
  termYears?: number;
  monthlyPayment?: number;
  // Shared
  cashIn: number;
  monthlyRent: number;
};

export type BeginnerPortfolio = {
  cash: number;
  holdings: BeginnerHolding[];
};

// ---- Sessions / streak / exam ----

export type SessionRecord = {
  id: string;
  slug: string;
  title: string;
  persona: string;
  difficulty: string;
  avg: number;
  delta: number;
  newRating: number;
  opponentRating: number;
  biggestWin?: string;
  biggestMiss?: string;
  ethicsFlags?: string[];
  at: number;
};

export type StreakState = {
  current: number;
  best: number;
  lastDay: string | null;
};

export type ExamAttempt = {
  id: string;
  topic: string;
  correct: number;
  total: number;
  at: number;
};

// ---- Onboarding + Level progression ----

import type { ArchetypeKey } from "./onboarding";

export type OnboardingResult = {
  completedAt: number;
  archetype: ArchetypeKey;
  // Raw dimension scores for transparency
  dims: { patience: number; risk: number; people: number; analytical: number };
  // The literal answer indices, kept so we can show "your answers" later
  answers: number[];
};

export type ProgressState = {
  xp: number;          // total earned, monotonic
  // levelKey is derived from xp via levels.ts, but we cache the highest seen
  // so a UI can flash "Level up!" once.
  highestLevelReached: string;
};
