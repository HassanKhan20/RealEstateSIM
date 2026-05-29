import { describe, it, expect } from "vitest";
import { PROPERTIES, getProperty, CITY_NAMES } from "@/shared/properties";

describe("PROPERTIES generation", () => {
  it("generates 56 properties across 3 cities", () => {
    expect(PROPERTIES.length).toBe(56);
  });

  it("covers Tampa, Phoenix, and Austin", () => {
    expect(CITY_NAMES).toEqual(["Tampa", "Phoenix", "Austin"]);
    const cities = new Set(PROPERTIES.map((p) => p.city));
    expect(cities.has("Tampa")).toBe(true);
    expect(cities.has("Phoenix")).toBe(true);
    expect(cities.has("Austin")).toBe(true);
  });

  it("is deterministic — same ids on every import", () => {
    expect(PROPERTIES[0].id).toBe("p-1y7s");
  });

  it("every property has positive price, rent, and a price/sqft", () => {
    for (const p of PROPERTIES) {
      expect(p.price).toBeGreaterThan(0);
      expect(p.estimatedRent).toBeGreaterThan(0);
      expect(p.pricePerSqft).toBeGreaterThan(0);
      expect(p.pricePerSqft).toBe(Math.round(p.price / p.sqft));
    }
  });

  it("Texas (Austin) properties carry higher tax rate than Arizona (Phoenix)", () => {
    const austin = PROPERTIES.filter((p) => p.city === "Austin");
    const phoenix = PROPERTIES.filter((p) => p.city === "Phoenix");
    const avgTaxRate = (list: typeof PROPERTIES) =>
      list.reduce((a, p) => a + (p.monthlyTaxes * 12) / p.price, 0) / list.length;
    expect(avgTaxRate(austin)).toBeGreaterThan(avgTaxRate(phoenix));
  });

  it("getProperty returns a known property and undefined for junk", () => {
    expect(getProperty(PROPERTIES[0].id)).toBeDefined();
    expect(getProperty("does-not-exist")).toBeUndefined();
  });

  it("high-motivation sellers sit on market longer on average", () => {
    const high = PROPERTIES.filter((p) => p.motivation === "high");
    const low = PROPERTIES.filter((p) => p.motivation === "low");
    const avgDom = (list: typeof PROPERTIES) =>
      list.reduce((a, p) => a + p.daysOnMarket, 0) / Math.max(1, list.length);
    expect(avgDom(high)).toBeGreaterThan(avgDom(low));
  });
});
