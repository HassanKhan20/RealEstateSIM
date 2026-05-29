import { describe, it, expect } from "vitest";
import { expectedScore, newRating, avgGrade } from "@/shared/elo";

describe("expectedScore", () => {
  it("is 0.5 for equal ratings", () => {
    expect(expectedScore(1200, 1200)).toBeCloseTo(0.5, 5);
  });

  it("is > 0.5 when user out-rates opponent", () => {
    expect(expectedScore(1400, 1000)).toBeGreaterThan(0.5);
  });

  it("is symmetric — the two expected scores sum to 1", () => {
    const a = expectedScore(1300, 1100);
    const b = expectedScore(1100, 1300);
    expect(a + b).toBeCloseTo(1, 5);
  });
});

describe("newRating", () => {
  it("rises on a strong grade", () => {
    const { delta } = newRating(1000, 1200, 90);
    expect(delta).toBeGreaterThan(0);
  });

  it("falls on a deal-killing grade", () => {
    const { delta } = newRating(1200, 1000, 30);
    expect(delta).toBeLessThan(0);
  });

  it("rewards beating a tougher opponent more than an easy one", () => {
    const vsTough = newRating(1000, 1500, 85).delta;
    const vsEasy = newRating(1000, 700, 85).delta;
    expect(vsTough).toBeGreaterThan(vsEasy);
  });

  it("newRating = userRating + delta", () => {
    const r = newRating(1000, 1200, 75);
    expect(r.newRating).toBe(1000 + r.delta);
  });
});

describe("avgGrade", () => {
  it("averages the four rubric dimensions", () => {
    const g = { rapport: 80, discovery: 60, objectionHandling: 40, close: 20, ethicsFlags: [] };
    expect(avgGrade(g)).toBe(50);
  });
});
