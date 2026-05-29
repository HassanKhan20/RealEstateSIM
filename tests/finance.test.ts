import { describe, it, expect } from "vitest";
import {
  monthlyMortgage,
  computeDeal,
  computeFlip,
  DEFAULT_FINANCING,
  DEFAULT_OPERATING,
  fmtMoney,
  fmtPct,
} from "@/shared/finance";
import type { Property } from "@/shared/properties";

// A clean, known test property so numbers are predictable.
const testProperty: Property = {
  id: "test-1",
  address: "123 Test St",
  neighborhood: "Testville",
  city: "Tampa",
  state: "FL",
  zip: "33602",
  lat: 0.5,
  lng: 0.5,
  type: "single-family",
  beds: 3,
  baths: 2,
  sqft: 1600,
  lotSqft: 6000,
  yearBuilt: 2005,
  price: 300_000,
  pricePerSqft: 188,
  estimatedArv: 360_000,
  estimatedRent: 2_400,
  estimatedRehab: 20_000,
  monthlyTaxes: 260,
  monthlyInsurance: 200,
  monthlyHoa: 0,
  appreciationRate: 4.5,
  rentGrowthRate: 3.4,
  daysOnMarket: 20,
  motivation: "average",
  hookLine: "Test.",
  risk: { floodZone: "X", hurricaneRisk: 2, crimeIndex: 30, schoolScore: 7, walkScore: 50 },
  facadeSeed: 123,
};

describe("monthlyMortgage", () => {
  it("matches the standard amortization formula for $240k @ 7% / 30yr", () => {
    // Known good value: ~$1,597/mo
    const pmt = monthlyMortgage(240_000, 7, 30);
    expect(pmt).toBeGreaterThan(1_590);
    expect(pmt).toBeLessThan(1_605);
  });

  it("returns 0 for a zero principal", () => {
    expect(monthlyMortgage(0, 7, 30)).toBe(0);
  });

  it("handles 0% interest as simple division", () => {
    // $120k over 30yr (360 months) interest-free ≈ $333/mo
    expect(monthlyMortgage(120_000, 0, 30)).toBe(333);
  });

  it("higher rate produces a higher payment", () => {
    expect(monthlyMortgage(240_000, 8, 30)).toBeGreaterThan(monthlyMortgage(240_000, 6, 30));
  });
});

describe("computeDeal — conventional", () => {
  const deal = computeDeal(testProperty, DEFAULT_FINANCING.conventional, DEFAULT_OPERATING);

  it("computes 20% down correctly", () => {
    expect(deal.downPayment).toBe(60_000);
    expect(deal.loanAmount).toBe(240_000);
  });

  it("does NOT charge PMI at 20% down", () => {
    expect(deal.monthlyMortgageInsurance).toBe(0);
  });

  it("produces a sensible cap rate (NOI / price) between 0 and 15%", () => {
    expect(deal.capRate).toBeGreaterThan(0);
    expect(deal.capRate).toBeLessThan(0.15);
  });

  it("cash-on-cash is annualCF / totalCashIn", () => {
    const expected = deal.annualCashFlow / deal.totalCashIn;
    expect(deal.cashOnCash).toBeCloseTo(expected, 5);
  });

  it("DSCR = NOI / annual debt service", () => {
    const expected = deal.noi / (deal.monthlyPI * 12);
    expect(deal.dscr).toBeCloseTo(expected, 3);
  });

  it("PITI includes principal, interest, taxes, insurance, HOA", () => {
    expect(deal.monthlyPiti).toBe(
      deal.monthlyPI + deal.monthlyMortgageInsurance + 260 + 200 + 0
    );
  });
});

describe("computeDeal — conventional below 20% down triggers PMI", () => {
  it("applies 0.7% annual PMI when down < 20%", () => {
    const deal = computeDeal(
      testProperty,
      { ...DEFAULT_FINANCING.conventional, downPaymentPct: 0.1 },
      DEFAULT_OPERATING
    );
    expect(deal.monthlyMortgageInsurance).toBeGreaterThan(0);
    // 0.7% of $270k loan / 12 ≈ $157
    expect(deal.monthlyMortgageInsurance).toBeGreaterThan(140);
    expect(deal.monthlyMortgageInsurance).toBeLessThan(175);
  });
});

describe("computeDeal — FHA charges MIP", () => {
  it("applies 0.85% MIP for the life of the loan", () => {
    const deal = computeDeal(testProperty, DEFAULT_FINANCING.fha, DEFAULT_OPERATING);
    expect(deal.monthlyMortgageInsurance).toBeGreaterThan(0);
    // 3.5% down → loan ~$289.5k; 0.85%/12 ≈ $205
    expect(deal.monthlyMortgageInsurance).toBeGreaterThan(190);
    expect(deal.monthlyMortgageInsurance).toBeLessThan(220);
  });
});

describe("computeDeal — cash purchase", () => {
  it("has no mortgage payment or mortgage insurance", () => {
    const deal = computeDeal(testProperty, DEFAULT_FINANCING.cash, DEFAULT_OPERATING);
    expect(deal.monthlyPI).toBe(0);
    expect(deal.monthlyMortgageInsurance).toBe(0);
    expect(deal.dscr).toBe(Infinity);
  });

  it("cash buy cash flow is higher than financed (no mortgage)", () => {
    const cash = computeDeal(testProperty, DEFAULT_FINANCING.cash, DEFAULT_OPERATING);
    const fin = computeDeal(testProperty, DEFAULT_FINANCING.conventional, DEFAULT_OPERATING);
    expect(cash.monthlyCashFlow).toBeGreaterThan(fin.monthlyCashFlow);
  });
});

describe("computeFlip", () => {
  it("net profit = ARV - total project cost, and reacts to rehab", () => {
    const flip = computeFlip(testProperty, { ...DEFAULT_FINANCING["hard-money"], rehab: 30_000 }, 6);
    expect(flip.arv).toBe(360_000);
    expect(flip.netProfit).toBe(flip.arv - flip.totalProjectCost);
  });

  it("more rehab lowers net profit", () => {
    const low = computeFlip(testProperty, { ...DEFAULT_FINANCING["hard-money"], rehab: 10_000 }, 6);
    const high = computeFlip(testProperty, { ...DEFAULT_FINANCING["hard-money"], rehab: 60_000 }, 6);
    expect(high.netProfit).toBeLessThan(low.netProfit);
  });

  it("longer hold increases carrying costs", () => {
    const short = computeFlip(testProperty, DEFAULT_FINANCING["hard-money"], 3);
    const long = computeFlip(testProperty, DEFAULT_FINANCING["hard-money"], 12);
    expect(long.carryingCosts).toBeGreaterThan(short.carryingCosts);
  });
});

describe("formatters", () => {
  it("fmtMoney has no decimals", () => {
    expect(fmtMoney(300000)).toBe("$300,000");
  });
  it("fmtPct multiplies by 100", () => {
    expect(fmtPct(0.085)).toBe("8.5%");
  });
});
