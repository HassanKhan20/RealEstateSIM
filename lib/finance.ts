// Mortgage + cash flow + ROI math.
// All amounts in USD. Rates as decimals (0.07 = 7%).

import type { Property, Strategy } from "./properties";

export type FinancingType = "cash" | "conventional" | "fha" | "hard-money";

export type FinancingInputs = {
  type: FinancingType;
  downPaymentPct: number; // 0-1
  ratePct: number; // annual, percent (7 = 7%)
  termYears: number;
  closingCostPct: number; // % of price
  rehab: number;
};

export const DEFAULT_FINANCING: Record<FinancingType, FinancingInputs> = {
  "cash": {
    type: "cash",
    downPaymentPct: 1.0,
    ratePct: 0,
    termYears: 0,
    closingCostPct: 0.02,
    rehab: 0,
  },
  "conventional": {
    type: "conventional",
    downPaymentPct: 0.20,
    ratePct: 6.95,
    termYears: 30,
    closingCostPct: 0.03,
    rehab: 0,
  },
  "fha": {
    type: "fha",
    downPaymentPct: 0.035,
    ratePct: 6.65,
    termYears: 30,
    closingCostPct: 0.035,
    rehab: 0,
  },
  "hard-money": {
    type: "hard-money",
    downPaymentPct: 0.10,
    ratePct: 11.5,
    termYears: 1,
    closingCostPct: 0.04,
    rehab: 0,
  },
};

export type OperatingAssumptions = {
  vacancyPct: number; // 0.06 = 6% of gross
  maintenancePct: number; // % of rent
  capExPct: number; // % of rent reserved for capex
  managementPct: number; // 0 if self-managed
};

export const DEFAULT_OPERATING: OperatingAssumptions = {
  vacancyPct: 0.07,
  maintenancePct: 0.08,
  capExPct: 0.07,
  managementPct: 0.0, // self-managed by default
};

export function monthlyMortgage(principal: number, ratePct: number, termYears: number): number {
  if (principal <= 0) return 0;
  if (termYears <= 0 || ratePct <= 0) return Math.round(principal / Math.max(1, termYears * 12));
  const r = ratePct / 100 / 12;
  const n = termYears * 12;
  const pmt = (principal * r) / (1 - Math.pow(1 + r, -n));
  return Math.round(pmt);
}

export type DealMath = {
  downPayment: number;
  loanAmount: number;
  closingCosts: number;
  rehabCost: number;
  totalCashIn: number;

  monthlyPI: number;
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  monthlyPiti: number; // PI + taxes + insurance + HOA

  grossMonthlyRent: number;
  vacancyAllowance: number;
  effectiveRent: number;
  monthlyMaintenance: number;
  monthlyCapEx: number;
  monthlyManagement: number;

  monthlyExpenses: number; // PITI + ops
  monthlyCashFlow: number;
  annualCashFlow: number;

  capRate: number; // NOI / price
  noi: number; // annual
  cashOnCash: number; // annualCF / cashIn
  grm: number; // price / annual rent
  dscr: number; // NOI / annual debt service
  oneRule: number; // rent / price (>1% rule)
};

export function computeDeal(
  p: Property,
  fin: FinancingInputs,
  ops: OperatingAssumptions = DEFAULT_OPERATING,
  rentOverride?: number
): DealMath {
  const downPayment = Math.round(p.price * fin.downPaymentPct);
  const loanAmount = p.price - downPayment;
  const closingCosts = Math.round(p.price * fin.closingCostPct);
  const rehabCost = Math.max(0, fin.rehab || 0);
  const totalCashIn = downPayment + closingCosts + rehabCost;

  const monthlyPI = monthlyMortgage(loanAmount, fin.ratePct, fin.termYears);
  const monthlyPiti =
    monthlyPI + p.monthlyTaxes + p.monthlyInsurance + p.monthlyHoa;

  const grossMonthlyRent = rentOverride ?? p.estimatedRent;
  const vacancyAllowance = Math.round(grossMonthlyRent * ops.vacancyPct);
  const effectiveRent = grossMonthlyRent - vacancyAllowance;
  const monthlyMaintenance = Math.round(grossMonthlyRent * ops.maintenancePct);
  const monthlyCapEx = Math.round(grossMonthlyRent * ops.capExPct);
  const monthlyManagement = Math.round(grossMonthlyRent * ops.managementPct);

  const monthlyExpenses =
    monthlyPiti +
    monthlyMaintenance +
    monthlyCapEx +
    monthlyManagement +
    vacancyAllowance;

  const monthlyCashFlow = grossMonthlyRent - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // NOI = effective rent - operating expenses (excluding mortgage)
  const annualOpEx =
    (p.monthlyTaxes +
      p.monthlyInsurance +
      p.monthlyHoa +
      monthlyMaintenance +
      monthlyCapEx +
      monthlyManagement +
      vacancyAllowance) *
    12;
  const noi = effectiveRent * 12 - (annualOpEx - vacancyAllowance * 12);

  const capRate = p.price > 0 ? noi / p.price : 0;
  const cashOnCash = totalCashIn > 0 ? annualCashFlow / totalCashIn : 0;
  const grm = grossMonthlyRent > 0 ? p.price / (grossMonthlyRent * 12) : 0;
  const annualDebtService = monthlyPI * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : Infinity;
  const oneRule = p.price > 0 ? grossMonthlyRent / p.price : 0;

  return {
    downPayment,
    loanAmount,
    closingCosts,
    rehabCost,
    totalCashIn,
    monthlyPI,
    monthlyTaxes: p.monthlyTaxes,
    monthlyInsurance: p.monthlyInsurance,
    monthlyHoa: p.monthlyHoa,
    monthlyPiti,
    grossMonthlyRent,
    vacancyAllowance,
    effectiveRent,
    monthlyMaintenance,
    monthlyCapEx,
    monthlyManagement,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    noi,
    cashOnCash,
    grm,
    dscr,
    oneRule,
  };
}

export type FlipMath = {
  totalProjectCost: number;
  arv: number;
  grossProfit: number;
  carryingCosts: number;
  netProfit: number;
  roi: number;
};

export function computeFlip(
  p: Property,
  fin: FinancingInputs,
  monthsToHold = 6
): FlipMath {
  const downPayment = Math.round(p.price * fin.downPaymentPct);
  const loanAmount = p.price - downPayment;
  const closingCosts = Math.round(p.price * fin.closingCostPct);
  const rehab = fin.rehab || p.estimatedRehab;
  const monthlyDebt = monthlyMortgage(loanAmount, fin.ratePct, fin.termYears);
  const carrying =
    (monthlyDebt + p.monthlyTaxes + p.monthlyInsurance + p.monthlyHoa) *
    monthsToHold;
  const sellingCosts = Math.round(p.estimatedArv * 0.07); // commissions + fees
  const totalProjectCost = p.price + closingCosts + rehab + carrying + sellingCosts;
  const grossProfit = p.estimatedArv - totalProjectCost;
  const cashIn = downPayment + closingCosts + rehab + carrying;
  const roi = cashIn > 0 ? grossProfit / cashIn : 0;
  return {
    totalProjectCost,
    arv: p.estimatedArv,
    grossProfit,
    carryingCosts: Math.round(carrying),
    netProfit: grossProfit,
    roi,
  };
}

export const fmtMoney = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

export const fmtPct = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;
export const fmtPlain = (n: number) => n.toLocaleString("en-US");
