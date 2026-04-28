// Synthetic property generator — no MLS data, no scraping.
// Modeled around Tampa, FL metro for v1. Values are realistic ranges
// based on public county-assessor data and Census 2024 ACS medians.

export type Strategy = "buy-hold" | "house-hack" | "flip" | "brrrr";
export type PropertyType = "single-family" | "duplex" | "triplex" | "townhouse" | "condo";

export type RiskProfile = {
  floodZone: "X" | "AE" | "VE";
  hurricaneRisk: 1 | 2 | 3 | 4 | 5;
  crimeIndex: number; // 0-100, lower = better
  schoolScore: number; // 0-10, higher = better
  walkScore: number; // 0-100
};

export type Property = {
  id: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
  lat: number; // 0-1 normalized within map view
  lng: number; // 0-1 normalized within map view
  type: PropertyType;
  beds: number;
  baths: number;
  sqft: number;
  lotSqft: number;
  yearBuilt: number;
  price: number;
  estimatedArv: number; // after-repair value if rehabbed
  estimatedRent: number; // monthly market rent
  estimatedRehab: number; // estimated needed work
  monthlyTaxes: number;
  monthlyInsurance: number;
  monthlyHoa: number;
  appreciationRate: number; // annual %
  rentGrowthRate: number; // annual %
  daysOnMarket: number;
  motivation: "low" | "average" | "high"; // seller motivation
  hookLine: string; // marketing-style intro
  risk: RiskProfile;
  // visual seeds (deterministic colors per property)
  facadeSeed: number;
};

// Tampa-area neighborhoods with realistic price/rent ranges.
const NEIGHBORHOODS = [
  { name: "Seminole Heights", priceMid: 365_000, rentMid: 2_400, apprMid: 4.2, schoolMid: 5, crimeMid: 42, walkMid: 62 },
  { name: "South Tampa",      priceMid: 615_000, rentMid: 3_400, apprMid: 5.0, schoolMid: 8, crimeMid: 24, walkMid: 70 },
  { name: "Brandon",          priceMid: 345_000, rentMid: 2_300, apprMid: 3.6, schoolMid: 6, crimeMid: 38, walkMid: 38 },
  { name: "Town 'N Country",  priceMid: 320_000, rentMid: 2_150, apprMid: 3.8, schoolMid: 5, crimeMid: 46, walkMid: 44 },
  { name: "Carrollwood",      priceMid: 410_000, rentMid: 2_650, apprMid: 4.0, schoolMid: 7, crimeMid: 30, walkMid: 50 },
  { name: "Westchase",        priceMid: 525_000, rentMid: 3_000, apprMid: 4.4, schoolMid: 8, crimeMid: 22, walkMid: 56 },
  { name: "Riverview",        priceMid: 365_000, rentMid: 2_400, apprMid: 4.8, schoolMid: 6, crimeMid: 32, walkMid: 34 },
  { name: "Ybor City",        priceMid: 295_000, rentMid: 2_100, apprMid: 5.2, schoolMid: 4, crimeMid: 58, walkMid: 84 },
  { name: "Tampa Heights",    priceMid: 425_000, rentMid: 2_700, apprMid: 5.5, schoolMid: 5, crimeMid: 44, walkMid: 76 },
  { name: "Plant City",       priceMid: 295_000, rentMid: 2_000, apprMid: 3.4, schoolMid: 5, crimeMid: 36, walkMid: 32 },
];

const STREETS = [
  "Magnolia", "Bayshore", "Hillsborough", "Riverside", "Oak",
  "Palm", "Live Oak", "Henderson", "Florida", "Nebraska",
  "Howard", "Armenia", "MacDill", "Westshore", "Bruce B Downs",
  "Fletcher", "Waters", "Sligh", "Hanna", "Kennedy",
];

const SUFFIXES = ["Ave", "St", "Blvd", "Ln", "Dr", "Pl", "Ter", "Way"];

const HOOKS = [
  "Vacant. Title clean. Owner moving out of state.",
  "Inherited last year. Three siblings want it gone.",
  "Tired landlord — solid tenants, ready to retire.",
  "Cosmetic flip. Roof and AC newer than they look.",
  "House hacker special — ADU permitted, walkable lot.",
  "Pre-foreclosure. Motivated seller, fast close possible.",
  "On market 47 days. First price drop just hit.",
  "Storm damage repaired. Insurance paid out fully.",
  "Original owner, 1972. Bones great, kitchen 1985.",
  "Off-market lead. Wholesaler assigning at his cost.",
];

// Deterministic PRNG so builds are stable
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

function jitter(rand: () => number, mid: number, pct: number): number {
  const lo = mid * (1 - pct);
  const hi = mid * (1 + pct);
  return lo + rand() * (hi - lo);
}

function generate(seed: number): Property {
  const r = mulberry32(seed);
  const hood = NEIGHBORHOODS[Math.floor(r() * NEIGHBORHOODS.length)];
  const type: PropertyType = (() => {
    const v = r();
    if (v < 0.66) return "single-family";
    if (v < 0.78) return "townhouse";
    if (v < 0.88) return "duplex";
    if (v < 0.94) return "triplex";
    return "condo";
  })();

  const beds = type === "condo" ? 1 + Math.floor(r() * 2) : 2 + Math.floor(r() * 4);
  const baths = Math.max(1, Math.round((beds - 0.5) * (0.6 + r() * 0.4)));
  const sqftBase = type === "condo" ? 700 : 1200;
  const sqft = Math.round(sqftBase + r() * 1800 + beds * 180);
  const lotSqft = type === "condo" ? 0 : Math.round(4000 + r() * 9000);
  const yearBuilt = 1955 + Math.floor(r() * 70);

  const sizeMult = 0.7 + (sqft / 2200) * 0.6;
  const price = Math.round(jitter(r, hood.priceMid * sizeMult, 0.18) / 1000) * 1000;
  const arvBoost = 1 + (0.05 + r() * 0.15);
  const estimatedArv = Math.round((price * arvBoost) / 1000) * 1000;
  const rentMult = 0.7 + (sqft / 2200) * 0.6;
  const estimatedRent = Math.round(jitter(r, hood.rentMid * rentMult, 0.12) / 25) * 25;

  const ageFactor = Math.max(0, (2026 - yearBuilt - 25) / 100);
  const estimatedRehab = Math.round((10_000 + r() * 60_000 + ageFactor * 25_000) / 500) * 500;

  // Florida millage approx 1.05% of market value annually
  const monthlyTaxes = Math.round((price * 0.0105) / 12 / 5) * 5;
  // Insurance is high in FL — coastal exposure, hurricane
  const flInsuranceBase = price * 0.0075;
  const monthlyInsurance = Math.round((flInsuranceBase + r() * 600) / 12 / 5) * 5;
  const monthlyHoa =
    type === "condo" ? Math.round(180 + r() * 280)
    : type === "townhouse" ? Math.round(120 + r() * 180)
    : r() < 0.3 ? Math.round(40 + r() * 90) : 0;

  const appreciationRate = +jitter(r, hood.apprMid, 0.25).toFixed(2);
  const rentGrowthRate = +jitter(r, 3.4, 0.35).toFixed(2);
  const daysOnMarket = Math.floor(r() * 110);
  const mot = r();
  const motivation: Property["motivation"] = mot < 0.4 ? "low" : mot < 0.8 ? "average" : "high";

  const flood: RiskProfile["floodZone"] = (() => {
    const v = r();
    if (v < 0.7) return "X";
    if (v < 0.92) return "AE";
    return "VE";
  })();
  const risk: RiskProfile = {
    floodZone: flood,
    hurricaneRisk: (Math.min(5, Math.max(1, Math.round(2 + r() * 3))) as RiskProfile["hurricaneRisk"]),
    crimeIndex: Math.round(jitter(r, hood.crimeMid, 0.25)),
    schoolScore: Math.max(1, Math.min(10, Math.round(jitter(r, hood.schoolMid, 0.25)))),
    walkScore: Math.max(1, Math.min(99, Math.round(jitter(r, hood.walkMid, 0.20)))),
  };

  const num = Math.floor(100 + r() * 9899);
  const street = pick(r, STREETS);
  const suffix = pick(r, SUFFIXES);
  const zip = pick(r, ["33602", "33603", "33604", "33605", "33606", "33607", "33609", "33610", "33612", "33614", "33615", "33617", "33619", "33625"]);

  // normalized lat/lng for map drawing
  const lat = +(0.08 + r() * 0.84).toFixed(3);
  const lng = +(0.08 + r() * 0.84).toFixed(3);

  return {
    id: `p-${seed.toString(36)}`,
    address: `${num} ${street} ${suffix}`,
    neighborhood: hood.name,
    city: "Tampa",
    state: "FL",
    zip,
    lat,
    lng,
    type,
    beds,
    baths,
    sqft,
    lotSqft,
    yearBuilt,
    price,
    estimatedArv,
    estimatedRent,
    estimatedRehab,
    monthlyTaxes,
    monthlyInsurance,
    monthlyHoa,
    appreciationRate,
    rentGrowthRate,
    daysOnMarket,
    motivation,
    hookLine: pick(r, HOOKS),
    risk,
    facadeSeed: seed,
  };
}

// Stable list of 28 properties for the MVP.
export const PROPERTIES: Property[] = Array.from({ length: 28 }, (_, i) =>
  generate(91_000 + i * 13)
);

export function getProperty(id: string): Property | undefined {
  return PROPERTIES.find((p) => p.id === id);
}

export const STRATEGY_LABELS: Record<Strategy, string> = {
  "buy-hold": "Buy & Hold",
  "house-hack": "House Hack",
  "flip": "Flip",
  "brrrr": "BRRRR",
};

export const TYPE_LABELS: Record<PropertyType, string> = {
  "single-family": "Single Family",
  "duplex": "Duplex",
  "triplex": "Triplex",
  "townhouse": "Townhouse",
  "condo": "Condo",
};
