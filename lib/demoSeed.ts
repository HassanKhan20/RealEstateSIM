// One-time demo data seeder. Populates localStorage on first visit so the
// Portfolio, Dashboard, Exam, and Scenario history all show a fully lived-in
// state instead of empty placeholders.
//
// Runs client-side only. Marked with a flag so reloads don't wipe real progress.

import { PROPERTIES } from "./properties";
import {
  computeDeal,
  DEFAULT_FINANCING,
  DEFAULT_OPERATING,
  type FinancingInputs,
  type FinancingType,
} from "./finance";
import type {
  Holding,
  SessionRecord,
  ExamAttempt,
  StreakState,
  PortfolioState,
  BeginnerHolding,
  BeginnerPortfolio,
  BeginnerPurchaseType,
} from "./store";
import { BEGINNER_STARTING_CASH } from "./store";

const SEED_FLAG = "demo-seed-v1";
const BEGINNER_SEED_FLAG = "demo-seed-beginner-v2";
const STARTING_CASH = 250_000;

type PickSpec = {
  index: number; // index into PROPERTIES (clamped safely)
  strategy: Holding["strategy"];
  financingType: FinancingType;
  downPct?: number; // override percent (e.g. 20 for conventional)
  ratePct?: number;
  rehab?: number;
};

const HOLDING_SPECS: PickSpec[] = [
  { index: 2, strategy: "buy-hold", financingType: "conventional", downPct: 20, ratePct: 6.85, rehab: 4_000 },
  { index: 7, strategy: "house-hack", financingType: "fha", downPct: 3.5, ratePct: 6.55, rehab: 6_500 },
  { index: 14, strategy: "flip", financingType: "hard-money", downPct: 10, ratePct: 11.5, rehab: 38_000 },
  { index: 21, strategy: "brrrr", financingType: "hard-money", downPct: 10, ratePct: 11.2, rehab: 52_000 },
];

function daysAgo(n: number) {
  return Date.now() - n * 24 * 60 * 60 * 1000;
}

function buildHoldings(): { holdings: Holding[]; cashSpent: number } {
  const holdings: Holding[] = [];
  let cashSpent = 0;
  for (const spec of HOLDING_SPECS) {
    const prop = PROPERTIES[spec.index] ?? PROPERTIES[0];
    if (!prop) continue;
    const def = DEFAULT_FINANCING[spec.financingType];
    const fin: FinancingInputs = {
      ...def,
      downPaymentPct: (spec.downPct ?? def.downPaymentPct * 100) / 100,
      ratePct: spec.ratePct ?? def.ratePct,
      rehab: spec.rehab ?? 0,
    };
    const deal = computeDeal(prop, fin, DEFAULT_OPERATING);
    holdings.push({
      propertyId: prop.id,
      purchasedAt: daysAgo(60 - HOLDING_SPECS.indexOf(spec) * 12),
      purchasePrice: prop.price,
      financing: fin,
      rehabSpent: spec.rehab ?? 0,
      strategy: spec.strategy,
      monthlyCashFlow: deal.monthlyCashFlow,
      monthlyRent: prop.estimatedRent,
      cashIn: deal.totalCashIn,
    });
    cashSpent += deal.totalCashIn;
  }
  return { holdings, cashSpent };
}

const FAKE_SESSIONS: Omit<SessionRecord, "id" | "at" | "newRating">[] = [
  {
    slug: "motivated-seller",
    title: "The Pre-Foreclosure Call",
    persona: "Motivated Seller — Pre-Foreclosure",
    difficulty: "average",
    avg: 74,
    delta: 16,
    opponentRating: 1200,
    biggestWin: "Let Marcus talk first for 90 seconds before pitching — built real rapport.",
    biggestMiss: "Asked about price three turns too early. Lost ground you had built.",
    ethicsFlags: [],
  },
  {
    slug: "cash-buyer-pitch",
    title: "Pitch a Deal to a Cash Buyer",
    persona: "Cash Buyer — Skeptical Investor",
    difficulty: "tough",
    avg: 62,
    delta: 6,
    opponentRating: 1350,
    biggestWin: "Knew the ARV comps cold and held your assignment fee when pressed.",
    biggestMiss: "Couldn't defend the repair estimate when Linda pushed. Fumbled line items.",
    ethicsFlags: [],
  },
  {
    slug: "fsbo-conversion",
    title: "Convert a For-Sale-By-Owner",
    persona: "FSBO Seller — Anti-Agent",
    difficulty: "tough",
    avg: 48,
    delta: -12,
    opponentRating: 1300,
    biggestWin: "Acknowledged Dave's 2009 bad-agent experience instead of brushing it off.",
    biggestMiss: "Got baited into defending commission in the first 30 seconds. Call never recovered.",
    ethicsFlags: [],
  },
  {
    slug: "lowball-counter",
    title: "Defend Your Listing Against a Lowball Offer",
    persona: "Investor Buyer — Aggressive Lowballer",
    difficulty: "average",
    avg: 81,
    delta: 18,
    opponentRating: 1250,
    biggestWin: "Countered at $472k backed by three specific comps. Held the price band.",
    biggestMiss: "Revealed seller's urgency too soon — Marcus pounced on it.",
    ethicsFlags: [],
  },
  {
    slug: "buyer-cold-feet",
    title: "First-Time Buyer Wants to Back Out",
    persona: "First-Time Buyer — Inspection Panic",
    difficulty: "average",
    avg: 88,
    delta: 22,
    opponentRating: 1200,
    biggestWin: "Walked Priya through each item and suggested an HVAC credit — saved the deal cleanly.",
    biggestMiss: "Could have been more explicit that walking away is a valid choice.",
    ethicsFlags: [],
  },
  {
    slug: "motivated-seller",
    title: "The Pre-Foreclosure Call",
    persona: "Motivated Seller — Pre-Foreclosure",
    difficulty: "average",
    avg: 55,
    delta: -4,
    opponentRating: 1200,
    biggestWin: "Didn't hang up when Marcus got defensive — stayed with him.",
    biggestMiss: "Sounded scripted starting around turn four. Lost the human thread.",
    ethicsFlags: [],
  },
  {
    slug: "cash-buyer-pitch",
    title: "Pitch a Deal to a Cash Buyer",
    persona: "Cash Buyer — Skeptical Investor",
    difficulty: "tough",
    avg: 77,
    delta: 14,
    opponentRating: 1350,
    biggestWin: "Led with address, ARV, and assignment fee in the first 15 seconds. Linda respected it.",
    biggestMiss: "Didn't probe her exit strategy preferences before quoting terms.",
    ethicsFlags: [],
  },
  {
    slug: "fsbo-conversion",
    title: "Convert a For-Sale-By-Owner",
    persona: "FSBO Seller — Anti-Agent",
    difficulty: "tough",
    avg: 69,
    delta: 4,
    opponentRating: 1300,
    biggestWin: "Reframed to net-to-seller instead of commission. Dave leaned in.",
    biggestMiss: "Pushed for an appointment 30 seconds before he was ready. Had to pull back.",
    ethicsFlags: [],
  },
];

const FAKE_EXAMS: Omit<ExamAttempt, "id" | "at">[] = [
  { topic: "Agency and fiduciary duties", correct: 4, total: 5 },
  { topic: "Real estate math (commissions, prorations, LTV, taxes)", correct: 3, total: 5 },
  { topic: "Fair Housing and federal regulations", correct: 5, total: 5 },
  { topic: "Contracts and contract law", correct: 6, total: 7 },
  { topic: "Real estate finance and mortgages", correct: 4, total: 5 },
  { topic: "Escrow, title, and closing procedures", correct: 7, total: 10 },
];

function monthlyPI(principal: number, ratePct: number, termYears: number): number {
  if (principal <= 0) return 0;
  if (ratePct <= 0 || termYears <= 0) return Math.round(principal / Math.max(1, termYears * 12));
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  return Math.round((principal * r) / (1 - Math.pow(1 + r, -n)));
}

function seedBeginner() {
  type Spec = {
    index: number;
    type: BeginnerPurchaseType;
    daysAgo: number;
    downPct?: number;
    rate?: number;
    term?: number;
  };
  const SPECS: Spec[] = [
    { index: 3, type: "finance", daysAgo: 58, downPct: 20, rate: 6.85, term: 30 },
    { index: 9, type: "finance", daysAgo: 31, downPct: 25, rate: 7.1, term: 30 },
    { index: 15, type: "cash", daysAgo: 9 },
  ];
  const beginnerHoldings: BeginnerHolding[] = [];
  let spent = 0;
  for (const spec of SPECS) {
    const prop = PROPERTIES[spec.index];
    if (!prop) continue;
    const closingEst = Math.round(prop.price * 0.025);
    if (spec.type === "finance") {
      const down = Math.round((prop.price * (spec.downPct ?? 20)) / 100);
      const loan = prop.price - down;
      const payment = monthlyPI(loan, spec.rate ?? 6.95, spec.term ?? 30);
      const cashIn = down + closingEst;
      beginnerHoldings.push({
        propertyId: prop.id,
        purchasedAt: daysAgo(spec.daysAgo),
        purchasePrice: prop.price,
        purchaseType: "finance",
        downPayment: down,
        loanBalance: loan,
        interestRate: spec.rate ?? 6.95,
        termYears: (spec.term ?? 30) as 30,
        monthlyPayment: payment,
        cashIn,
        monthlyRent: prop.estimatedRent,
      });
      spent += cashIn;
    } else {
      const cashIn = prop.price + closingEst;
      beginnerHoldings.push({
        propertyId: prop.id,
        purchasedAt: daysAgo(spec.daysAgo),
        purchasePrice: prop.price,
        purchaseType: "cash",
        cashIn,
        monthlyRent: prop.estimatedRent,
      });
      spent += cashIn;
    }
  }
  const beginnerPortfolio: BeginnerPortfolio = {
    cash: Math.max(0, BEGINNER_STARTING_CASH - spent),
    holdings: beginnerHoldings,
  };
  localStorage.setItem("beginner-portfolio-v1", JSON.stringify(beginnerPortfolio));
  localStorage.setItem(BEGINNER_SEED_FLAG, "1");
}

export function seedIfEmpty() {
  if (typeof window === "undefined") return;
  try {
    // Beginner can be backfilled separately so prior demo users still see it.
    if (!localStorage.getItem(BEGINNER_SEED_FLAG)) {
      seedBeginner();
    }
    if (localStorage.getItem(SEED_FLAG)) return;

    // SimScore — mid "Closer" tier
    localStorage.setItem("simscore", "1285");

    // Streak
    const streak: StreakState = {
      current: 12,
      best: 18,
      lastDay: new Date().toISOString().slice(0, 10),
    };
    localStorage.setItem("streak-v1", JSON.stringify(streak));

    // Portfolio
    const { holdings, cashSpent } = buildHoldings();
    const portfolio: PortfolioState = {
      cash: Math.max(0, STARTING_CASH - cashSpent),
      holdings,
    };
    localStorage.setItem("portfolio-v1", JSON.stringify(portfolio));

    // Session history — newest first, spaced every 1-3 days
    const sessions: SessionRecord[] = FAKE_SESSIONS.map((s, i) => {
      const at = daysAgo(i * 2 + 1);
      const newRating = 1285 - FAKE_SESSIONS.slice(0, i + 1).reduce((a, x) => a + x.delta, 0) + s.delta;
      return {
        ...s,
        id: `seed-s-${i}`,
        at,
        newRating,
      };
    });
    localStorage.setItem("sessions-v1", JSON.stringify(sessions));

    // Exam attempts
    const exams: ExamAttempt[] = FAKE_EXAMS.map((e, i) => ({
      ...e,
      id: `seed-e-${i}`,
      at: daysAgo(i * 3 + 2),
    }));
    localStorage.setItem("exam-attempts-v1", JSON.stringify(exams));

    localStorage.setItem(SEED_FLAG, "1");
    // Nudge any mounted listeners
    window.dispatchEvent(new StorageEvent("storage", { key: "simscore" }));
  } catch {
    // swallow — seeding is best-effort
  }
}
