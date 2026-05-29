// Client-side persistence layer. localStorage-backed so the MVP needs no DB.
// All helpers SSR-safe: return defaults on the server.
//
// Data types live in shared/types.ts so non-React code (shared/beginnerSim.ts,
// shared/finance.ts) can use them without importing this file.

export type {
  Holding,
  PortfolioState,
  SessionRecord,
  StreakState,
  ExamAttempt,
  BeginnerPurchaseType,
  BeginnerHolding,
  BeginnerPortfolio,
  OnboardingResult,
  ProgressState,
} from "@/shared/types";

import type {
  Holding,
  PortfolioState,
  SessionRecord,
  StreakState,
  ExamAttempt,
  BeginnerHolding,
  BeginnerPortfolio,
  OnboardingResult,
  ProgressState,
} from "@/shared/types";
import { levelForXp, LEVELS, XP_REWARDS } from "@/shared/levels";
import { ARCHETYPES } from "@/shared/onboarding";

export const STARTING_CASH = 250_000;
export const BEGINNER_STARTING_CASH = 250_000;

const KEYS = {
  simscore: "simscore",
  portfolio: "portfolio-v1",
  sessions: "sessions-v1",
  streak: "streak-v1",
  examAttempts: "exam-attempts-v1",
  beginner: "beginner-portfolio-v1",
  onboarding: "onboarding-v1",
  progress: "progress-v1",
};

function isBrowser() {
  return typeof window !== "undefined";
}

function read<T>(key: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent("storage", { key }));
  } catch {}
}

// --- SimScore ---

export function getSimScore(): number {
  if (!isBrowser()) return 1000;
  const raw = localStorage.getItem(KEYS.simscore);
  return raw ? Number(raw) : 1000;
}

export function setSimScore(v: number) {
  if (!isBrowser()) return;
  localStorage.setItem(KEYS.simscore, String(v));
  window.dispatchEvent(new StorageEvent("storage", { key: KEYS.simscore }));
}

// --- Portfolio ---

export function getPortfolio(): PortfolioState {
  return read<PortfolioState>(KEYS.portfolio, {
    cash: STARTING_CASH,
    holdings: [],
  });
}

export function savePortfolio(p: PortfolioState) {
  write(KEYS.portfolio, p);
}

export function resetPortfolio() {
  write(KEYS.portfolio, { cash: STARTING_CASH, holdings: [] });
}

export function buyProperty(h: Holding): { ok: boolean; reason?: string } {
  const p = getPortfolio();
  if (p.holdings.some((x) => x.propertyId === h.propertyId)) {
    return { ok: false, reason: "You already own this property." };
  }
  if (h.cashIn > p.cash) {
    return {
      ok: false,
      reason: `Need ${fmtUSD(h.cashIn)} cash. You only have ${fmtUSD(p.cash)}.`,
    };
  }
  savePortfolio({
    cash: p.cash - h.cashIn,
    holdings: [...p.holdings, h],
  });
  return { ok: true };
}

export function sellHolding(propertyId: string, salePrice: number) {
  const p = getPortfolio();
  const h = p.holdings.find((x) => x.propertyId === propertyId);
  if (!h) return;
  // rough: return sale - payoff. no closing cost here; kept simple.
  const loanRemaining = h.purchasePrice - (h.purchasePrice * h.financing.downPaymentPct);
  const proceeds = Math.max(0, salePrice - loanRemaining);
  savePortfolio({
    cash: p.cash + proceeds,
    holdings: p.holdings.filter((x) => x.propertyId !== propertyId),
  });
}

// --- Sessions ---

export function getSessions(): SessionRecord[] {
  return read<SessionRecord[]>(KEYS.sessions, []);
}

export function addSession(s: SessionRecord) {
  const list = getSessions();
  write(KEYS.sessions, [s, ...list].slice(0, 50));
  bumpStreak();
}

// --- Streak ---

export function getStreak(): StreakState {
  return read<StreakState>(KEYS.streak, { current: 0, best: 0, lastDay: null });
}

function dayKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function bumpStreak() {
  const s = getStreak();
  const today = dayKey();
  if (s.lastDay === today) return;
  const y = new Date();
  y.setDate(y.getDate() - 1);
  const yesterday = dayKey(y);
  const next: StreakState =
    s.lastDay === yesterday
      ? { current: s.current + 1, best: Math.max(s.best, s.current + 1), lastDay: today }
      : { current: 1, best: Math.max(s.best, 1), lastDay: today };
  write(KEYS.streak, next);
}

// --- Exam attempts ---

export function getExamAttempts(): ExamAttempt[] {
  return read<ExamAttempt[]>(KEYS.examAttempts, []);
}

export function addExamAttempt(a: ExamAttempt) {
  const list = getExamAttempts();
  write(KEYS.examAttempts, [a, ...list].slice(0, 30));
}

// --- Beginner portfolio ---

export function getBeginnerPortfolio(): BeginnerPortfolio {
  return read<BeginnerPortfolio>(KEYS.beginner, {
    cash: BEGINNER_STARTING_CASH,
    holdings: [],
  });
}

export function saveBeginnerPortfolio(p: BeginnerPortfolio) {
  write(KEYS.beginner, p);
}

export function resetBeginnerPortfolio() {
  write(KEYS.beginner, { cash: BEGINNER_STARTING_CASH, holdings: [] });
}

export function buyBeginnerHome(
  holding: BeginnerHolding
): { ok: boolean; reason?: string } {
  const p = getBeginnerPortfolio();
  if (p.holdings.some((h) => h.propertyId === holding.propertyId)) {
    return { ok: false, reason: "You already own this home." };
  }
  if (holding.cashIn > p.cash) {
    return {
      ok: false,
      reason: `Need ${fmtUSD(holding.cashIn)} cash. You have ${fmtUSD(p.cash)}.`,
    };
  }
  saveBeginnerPortfolio({
    cash: p.cash - holding.cashIn,
    holdings: [...p.holdings, holding],
  });
  return { ok: true };
}

export function sellBeginnerHome(
  propertyId: string,
  salePrice: number
): { ok: boolean; reason?: string; proceeds?: number } {
  const p = getBeginnerPortfolio();
  const h = p.holdings.find((x) => x.propertyId === propertyId);
  if (!h) return { ok: false, reason: "You don't own this home." };
  // Simplified: pay off loan balance (if any), pocket the rest.
  const payoff = h.loanBalance ?? 0;
  const closingCostEst = Math.round(salePrice * 0.06); // realtor + fees (sim)
  const proceeds = Math.max(0, salePrice - payoff - closingCostEst);
  saveBeginnerPortfolio({
    cash: p.cash + proceeds,
    holdings: p.holdings.filter((x) => x.propertyId !== propertyId),
  });
  return { ok: true, proceeds };
}

// --- Onboarding + Progress ---

export function getOnboarding(): OnboardingResult | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(KEYS.onboarding);
    return raw ? (JSON.parse(raw) as OnboardingResult) : null;
  } catch {
    return null;
  }
}

export function saveOnboarding(r: OnboardingResult) {
  write(KEYS.onboarding, r);
  // Initialize beginner cash to the archetype's starting amount.
  const arch = ARCHETYPES[r.archetype];
  const p = getBeginnerPortfolio();
  // Only overwrite if this is a fresh user (no holdings yet, default cash)
  if (p.holdings.length === 0) {
    saveBeginnerPortfolio({ cash: arch.startingCash, holdings: [] });
  }
}

export function hasCompletedOnboarding(): boolean {
  return getOnboarding() !== null;
}

export function getProgress(): ProgressState {
  return read<ProgressState>(KEYS.progress, { xp: 0, highestLevelReached: "rookie" });
}

export function addXp(amount: number, reason?: string): { newXp: number; leveledUp: boolean; newLevel?: string } {
  if (amount <= 0) return { newXp: getProgress().xp, leveledUp: false };
  const before = getProgress();
  const beforeLevel = levelForXp(before.xp);
  const newXp = before.xp + amount;
  const afterLevel = levelForXp(newXp);
  const leveledUp = afterLevel.num > beforeLevel.num;
  const next: ProgressState = {
    xp: newXp,
    highestLevelReached: leveledUp ? afterLevel.key : before.highestLevelReached,
  };
  write(KEYS.progress, next);
  // If the user just leveled up, top up their Beginner cash to the new level's grant.
  if (leveledUp) {
    const p = getBeginnerPortfolio();
    if (p.cash < afterLevel.cashGrant) {
      saveBeginnerPortfolio({ ...p, cash: afterLevel.cashGrant });
    }
  }
  return { newXp, leveledUp, newLevel: afterLevel.key };
}

export function awardSimulationXp(grade: number) {
  return addXp(Math.round(XP_REWARDS.simulationCompleted * (grade / 100)), "simulation");
}
export function awardPropertyBoughtXp() {
  return addXp(XP_REWARDS.propertyBought, "buy");
}
export function awardExamPassXp() {
  return addXp(XP_REWARDS.exam_pass, "exam");
}
export function awardSimRunXp() {
  return addXp(XP_REWARDS.portfolioSimulated, "sim-run");
}

// Check whether the current level lets the user buy this property under these
// constraints. Returns an array of reasons (empty = allowed).
export function levelGateForBuy(opts: {
  purchaseType: "cash" | "finance";
  downPaymentPct?: number;
  currentHoldingsCount: number;
}): string[] {
  const lvl = levelForXp(getProgress().xp);
  const reasons: string[] = [];
  if (opts.currentHoldingsCount >= lvl.propertyLimit) {
    reasons.push(`Level ${lvl.num} (${lvl.name}) only allows ${lvl.propertyLimit} ${lvl.propertyLimit === 1 ? "property" : "properties"}. Earn XP to level up.`);
  }
  if (opts.purchaseType === "finance" && opts.downPaymentPct !== undefined && opts.downPaymentPct < lvl.maxDownPaymentMin) {
    reasons.push(`Level ${lvl.num} requires at least ${Math.round(lvl.maxDownPaymentMin * 100)}% down. Level up to unlock lower down payments.`);
  }
  return reasons;
}

// --- helpers ---

const fmtUSD = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
