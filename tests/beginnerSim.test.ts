import { describe, it, expect } from "vitest";
import { simulatePortfolio, projectSale, SCENARIOS } from "@/shared/beginnerSim";
import { PROPERTIES, getProperty } from "@/shared/properties";
import type { BeginnerHolding, BeginnerPortfolio } from "@/shared/types";

const lookup = (id: string) => getProperty(id);
const prop = PROPERTIES[0];

function cashHolding(): BeginnerHolding {
  return {
    propertyId: prop.id,
    purchasedAt: Date.now() - 400 * 24 * 60 * 60 * 1000, // > 1yr ago (long-term)
    purchasePrice: prop.price,
    purchaseType: "cash",
    cashIn: prop.price,
    monthlyRent: prop.estimatedRent,
  };
}

function financedHolding(): BeginnerHolding {
  const down = Math.round(prop.price * 0.2);
  return {
    propertyId: prop.id,
    purchasedAt: Date.now(),
    purchasePrice: prop.price,
    purchaseType: "finance",
    downPayment: down,
    loanBalance: prop.price - down,
    interestRate: 6.95,
    termYears: 30,
    monthlyPayment: 1600,
    cashIn: down,
    monthlyRent: prop.estimatedRent,
  };
}

describe("simulatePortfolio — empty", () => {
  it("returns just cash with zero return for an empty portfolio", () => {
    const result = simulatePortfolio({ cash: 50_000, holdings: [] }, lookup, 60, SCENARIOS[0]);
    expect(result.startEquity).toBe(50_000);
    expect(result.points.length).toBe(61); // month 0 + 60 months
  });
});

describe("simulatePortfolio — determinism", () => {
  it("same portfolio + scenario + horizon produces identical results", () => {
    const portfolio: BeginnerPortfolio = { cash: 30_000, holdings: [cashHolding()] };
    const a = simulatePortfolio(portfolio, lookup, 120, SCENARIOS[0]);
    const b = simulatePortfolio(portfolio, lookup, 120, SCENARIOS[0]);
    expect(a.finalEquity).toBe(b.finalEquity);
    expect(a.events.length).toBe(b.events.length);
  });
});

describe("simulatePortfolio — realism", () => {
  it("cash buy cash flow is NOT simply rent * 0.9 (real opex deducted)", () => {
    const portfolio: BeginnerPortfolio = { cash: 0, holdings: [cashHolding()] };
    const result = simulatePortfolio(portfolio, lookup, 12, SCENARIOS[0]);
    // After a year of real opex, cumulative CF must be well below rent*0.9*12
    const naive = prop.estimatedRent * 0.9 * 12;
    expect(result.totalCashFlow).toBeLessThan(naive);
  });

  it("the 2008-style crash leaves less equity than the base case", () => {
    const portfolio: BeginnerPortfolio = { cash: 20_000, holdings: [financedHolding()] };
    const base = simulatePortfolio(portfolio, lookup, 60, SCENARIOS[0]);
    const crash = simulatePortfolio(portfolio, lookup, 60, SCENARIOS.find((s) => s.label.includes("2008"))!);
    expect(crash.finalEquity).toBeLessThan(base.finalEquity);
  });

  it("a financed loan amortizes (equity grows from paydown over time)", () => {
    const portfolio: BeginnerPortfolio = { cash: 0, holdings: [financedHolding()] };
    const short = simulatePortfolio(portfolio, lookup, 12, SCENARIOS[0]);
    const long = simulatePortfolio(portfolio, lookup, 120, SCENARIOS[0]);
    expect(long.finalEquity).toBeGreaterThan(short.finalEquity);
  });

  it("surfaces capex/vacancy events over a long horizon", () => {
    const portfolio: BeginnerPortfolio = { cash: 0, holdings: [cashHolding()] };
    const result = simulatePortfolio(portfolio, lookup, 240, SCENARIOS[0]);
    // Over 20 years, expect at least one event (vacancy or capex)
    expect(result.events.length).toBeGreaterThan(0);
  });
});

describe("projectSale", () => {
  it("long-term hold taxed lower than short-term", () => {
    const longTerm = { ...cashHolding(), purchasedAt: Date.now() - 400 * 86_400_000 };
    const shortTerm = { ...cashHolding(), purchasedAt: Date.now() - 100 * 86_400_000 };
    const appreciated = prop.price * 1.3;
    const lt = projectSale(longTerm, appreciated);
    const st = projectSale(shortTerm, appreciated);
    expect(lt.isLongTerm).toBe(true);
    expect(st.isLongTerm).toBe(false);
    expect(lt.estimatedTax).toBeLessThan(st.estimatedTax);
  });

  it("net proceeds deduct loan payoff, selling costs, and tax", () => {
    const h = financedHolding();
    const sale = projectSale(h, prop.price * 1.2);
    expect(sale.netProceeds).toBe(
      Math.max(0, sale.salePrice - sale.loanPayoff - sale.sellingCosts - sale.estimatedTax)
    );
  });
});
