// Deterministic per-property price history + projection.
// Treats each property like a stock:
//   - Share price = property.price / 100
//   - Past 90 days: random walk anchored to current price, drifted by appreciation
//   - Forward 365 days: smooth projection along appreciation rate, with mild noise
//
// All randomness is seeded so charts are stable across reloads.

import type { Property } from "./properties";

const SHARES_PER_PROPERTY = 100;

export function sharePrice(p: Property, multiplier = 1): number {
  return Math.round((p.price * multiplier) / SHARES_PER_PROPERTY);
}

export type PricePoint = { t: number; price: number };

function mulberry32(seed: number) {
  let s = seed | 0;
  return function () {
    s = (s + 0x6D2B79F5) | 0;
    let t = s ^ (s >>> 15);
    t = Math.imul(t, t | 1);
    t = (t + Math.imul(t ^ (t >>> 7), t | 61)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Build a 90-day backwards walk that ends at exactly the current share price.
export function buildHistory(p: Property, days = 90): PricePoint[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const r = mulberry32(p.facadeSeed + 7);

  // Daily drift derived from annual appreciation (compounded per day).
  const dailyDrift = Math.pow(1 + p.appreciationRate / 100, 1 / 365) - 1;
  // Daily volatility — 0.4% to 1.1% by neighborhood "heat" (motivation proxy)
  const vol = p.motivation === "high" ? 0.011 : p.motivation === "average" ? 0.0075 : 0.005;

  // Start backwards: today known, walk back N days
  const todayPrice = sharePrice(p);
  const points: PricePoint[] = new Array(days + 1);
  points[days] = { t: now, price: todayPrice };

  for (let i = days - 1; i >= 0; i--) {
    const noise = (r() - 0.5) * 2 * vol;
    // Reverse the drift: yesterday = today / (1 + dailyDrift) (1 + noise)
    const next = points[i + 1].price / (1 + dailyDrift) * (1 + noise);
    points[i] = { t: now - (days - i) * dayMs, price: Math.max(1, Math.round(next)) };
  }
  return points;
}

// Smooth forward projection along the appreciation curve, light noise.
export function buildProjection(p: Property, days = 365): PricePoint[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const r = mulberry32(p.facadeSeed + 11);
  const dailyDrift = Math.pow(1 + p.appreciationRate / 100, 1 / 365) - 1;
  const vol = 0.003; // tighter going forward (it's a projection, not actuals)

  const points: PricePoint[] = [{ t: now, price: sharePrice(p) }];
  for (let i = 1; i <= days; i++) {
    const prev = points[i - 1].price;
    const noise = (r() - 0.5) * 2 * vol;
    const next = prev * (1 + dailyDrift + noise);
    points.push({ t: now + i * dayMs, price: Math.round(next) });
  }
  return points;
}

// Today vs 1-day-ago return.
export function dailyChange(p: Property): { pct: number; abs: number } {
  const h = buildHistory(p, 1);
  const yesterday = h[0].price;
  const today = h[h.length - 1].price;
  return { pct: (today - yesterday) / yesterday, abs: today - yesterday };
}

// Today vs 30-day-ago return.
export function monthChange(p: Property): { pct: number; abs: number } {
  const h = buildHistory(p, 30);
  const m = h[0].price;
  const t = h[h.length - 1].price;
  return { pct: (t - m) / m, abs: t - m };
}

export const SHARES = SHARES_PER_PROPERTY;
