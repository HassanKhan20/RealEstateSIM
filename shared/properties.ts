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
  pricePerSqft: number; // derived but cached for display
  estimatedArv: number; // after-repair value if rehabbed
  estimatedRent: number; // monthly market rent
  estimatedRehab: number; // estimated needed work
  monthlyTaxes: number;
  monthlyInsurance: number; // already reflects flood-zone multiplier
  monthlyHoa: number;
  appreciationRate: number; // annual %
  rentGrowthRate: number; // annual %
  daysOnMarket: number; // correlates with motivation (high motivation = longer DOM)
  motivation: "low" | "average" | "high"; // seller motivation
  hookLine: string; // marketing-style intro
  risk: RiskProfile;
  // visual seeds (deterministic colors per property)
  facadeSeed: number;
};

// Each city has its own tax/insurance profile + neighborhood list.
// All numbers are realistic for 2026: FL has insurance crisis, TX has high
// property tax + no income tax, AZ has low property tax.

type Hood = { name: string; priceMid: number; rentMid: number; apprMid: number; schoolMid: number; crimeMid: number; walkMid: number };

type CityProfile = {
  name: string;          // "Tampa"
  state: string;         // "FL"
  // Property tax as fraction of market value, annual.
  taxRate: number;
  // Multiplier on baseline insurance (FL = 1.0 baseline; AZ/TX much lower).
  insuranceBaseMult: number;
  // Whether flood-zone multiplier should be applied (only coastal/hurricane states).
  applyFloodMult: boolean;
  zips: string[];
  neighborhoods: Hood[];
};

const CITIES: CityProfile[] = [
  {
    name: "Tampa",
    state: "FL",
    taxRate: 0.0105,
    insuranceBaseMult: 1.0,
    applyFloodMult: true,
    zips: ["33602", "33603", "33604", "33605", "33606", "33607", "33609", "33610", "33612", "33614", "33615", "33617", "33619", "33625"],
    neighborhoods: [
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
    ],
  },
  {
    name: "Phoenix",
    state: "AZ",
    taxRate: 0.006,             // AZ effective property tax ~0.6%
    insuranceBaseMult: 0.45,    // No hurricanes; insurance much cheaper
    applyFloodMult: false,
    zips: ["85003", "85004", "85008", "85013", "85016", "85018", "85020", "85021", "85040", "85042", "85048", "85254", "85281", "85283"],
    neighborhoods: [
      { name: "Arcadia",       priceMid: 850_000, rentMid: 4_200, apprMid: 5.8, schoolMid: 9, crimeMid: 18, walkMid: 56 },
      { name: "Tempe",         priceMid: 510_000, rentMid: 2_800, apprMid: 5.2, schoolMid: 7, crimeMid: 32, walkMid: 64 },
      { name: "Scottsdale",    priceMid: 920_000, rentMid: 4_500, apprMid: 5.6, schoolMid: 9, crimeMid: 14, walkMid: 48 },
      { name: "Glendale",      priceMid: 410_000, rentMid: 2_200, apprMid: 4.4, schoolMid: 6, crimeMid: 40, walkMid: 38 },
      { name: "Mesa",          priceMid: 450_000, rentMid: 2_400, apprMid: 4.6, schoolMid: 6, crimeMid: 34, walkMid: 36 },
      { name: "Chandler",      priceMid: 580_000, rentMid: 2_900, apprMid: 5.0, schoolMid: 8, crimeMid: 20, walkMid: 42 },
      { name: "Downtown PHX",  priceMid: 480_000, rentMid: 2_650, apprMid: 6.0, schoolMid: 5, crimeMid: 48, walkMid: 78 },
      { name: "Gilbert",       priceMid: 540_000, rentMid: 2_700, apprMid: 4.8, schoolMid: 8, crimeMid: 18, walkMid: 32 },
    ],
  },
  {
    name: "Austin",
    state: "TX",
    taxRate: 0.018,             // TX is high property tax (no state income tax)
    insuranceBaseMult: 0.55,    // No hurricanes; tornado risk modest
    applyFloodMult: false,
    zips: ["78701", "78702", "78703", "78704", "78705", "78717", "78721", "78745", "78746", "78751", "78752", "78759", "78617", "78641"],
    neighborhoods: [
      { name: "Downtown Austin", priceMid: 720_000, rentMid: 3_800, apprMid: 5.6, schoolMid: 7, crimeMid: 40, walkMid: 88 },
      { name: "East Austin",     priceMid: 580_000, rentMid: 3_000, apprMid: 6.4, schoolMid: 5, crimeMid: 46, walkMid: 72 },
      { name: "South Lamar",     priceMid: 640_000, rentMid: 3_200, apprMid: 5.8, schoolMid: 7, crimeMid: 28, walkMid: 78 },
      { name: "Round Rock",      priceMid: 480_000, rentMid: 2_600, apprMid: 4.6, schoolMid: 8, crimeMid: 22, walkMid: 36 },
      { name: "Cedar Park",      priceMid: 530_000, rentMid: 2_700, apprMid: 4.8, schoolMid: 9, crimeMid: 18, walkMid: 32 },
      { name: "Pflugerville",    priceMid: 420_000, rentMid: 2_350, apprMid: 4.4, schoolMid: 7, crimeMid: 26, walkMid: 28 },
      { name: "Mueller",         priceMid: 760_000, rentMid: 3_500, apprMid: 5.2, schoolMid: 8, crimeMid: 20, walkMid: 70 },
      { name: "Westlake",        priceMid: 1_250_000, rentMid: 5_200, apprMid: 5.0, schoolMid: 10, crimeMid: 8, walkMid: 28 },
    ],
  },
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

function generate(seed: number, cityProfile: CityProfile): Property {
  const r = mulberry32(seed);
  const hood = cityProfile.neighborhoods[Math.floor(r() * cityProfile.neighborhoods.length)];
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

  // Flood zone first — drives insurance pricing.
  const flood: RiskProfile["floodZone"] = (() => {
    const v = r();
    if (v < 0.7) return "X";
    if (v < 0.92) return "AE";
    return "VE";
  })();

  // Pricing scales with sqft; motivated sellers list slightly cheaper.
  const mot = r();
  const motivation: Property["motivation"] = mot < 0.55 ? "low" : mot < 0.85 ? "average" : "high";

  const sizeMult = 0.7 + (sqft / 2200) * 0.6;
  const motivationDiscount = motivation === "high" ? 0.93 : motivation === "average" ? 1.0 : 1.02;
  const price = Math.round(jitter(r, hood.priceMid * sizeMult * motivationDiscount, 0.14) / 1000) * 1000;
  const pricePerSqft = sqft > 0 ? Math.round(price / sqft) : 0;
  const arvBoost = 1 + (0.05 + r() * 0.15);
  const estimatedArv = Math.round((price * arvBoost) / 1000) * 1000;
  const rentMult = 0.7 + (sqft / 2200) * 0.6;
  const estimatedRent = Math.round(jitter(r, hood.rentMid * rentMult, 0.12) / 25) * 25;

  const ageFactor = Math.max(0, (2026 - yearBuilt - 25) / 100);
  const estimatedRehab = Math.round((10_000 + r() * 60_000 + ageFactor * 25_000) / 500) * 500;

  // City-specific property tax rate (FL 1.05%, AZ 0.6%, TX 1.8%)
  const monthlyTaxes = Math.round((price * cityProfile.taxRate) / 12 / 5) * 5;

  // Insurance: baseline scaled by city, multiplied by flood zone only in coastal/hurricane states.
  const floodMult = cityProfile.applyFloodMult
    ? (flood === "VE" ? 3.2 : flood === "AE" ? 1.8 : 1.0)
    : 1.0;
  const insBase = price * 0.0075 * cityProfile.insuranceBaseMult * floodMult;
  const monthlyInsurance = Math.round((insBase + r() * 400) / 12 / 5) * 5;

  const monthlyHoa =
    type === "condo" ? Math.round(180 + r() * 280)
    : type === "townhouse" ? Math.round(120 + r() * 180)
    : r() < 0.3 ? Math.round(40 + r() * 90) : 0;

  const appreciationRate = +jitter(r, hood.apprMid, 0.25).toFixed(2);
  const rentGrowthRate = +jitter(r, 3.4, 0.35).toFixed(2);

  // Days on market: motivated sellers sat longer (price was too high, dropped).
  const baseDom = Math.floor(r() * 80);
  const daysOnMarket =
    motivation === "high" ? baseDom + 35 + Math.floor(r() * 20)   // ~55-130
    : motivation === "average" ? baseDom + 10                     // ~10-90
    : Math.floor(baseDom * 0.4);                                  // 0-32 (fast)

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
  const zip = pick(r, cityProfile.zips);

  // normalized lat/lng for map drawing
  const lat = +(0.08 + r() * 0.84).toFixed(3);
  const lng = +(0.08 + r() * 0.84).toFixed(3);

  return {
    id: `p-${seed.toString(36)}`,
    address: `${num} ${street} ${suffix}`,
    neighborhood: hood.name,
    city: cityProfile.name,
    state: cityProfile.state,
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
    pricePerSqft,
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

// Stable list of properties across three cities.
// Tampa keeps the same seed range so existing demo data still matches.
//   - Tampa:   28 (seeds 91_000..91_351)
//   - Phoenix: 14 (seeds 92_000..92_182)
//   - Austin:  14 (seeds 93_000..93_182)
function generateBlock(start: number, count: number, city: CityProfile): Property[] {
  return Array.from({ length: count }, (_, i) => generate(start + i * 13, city));
}

export const PROPERTIES: Property[] = [
  ...generateBlock(91_000, 28, CITIES[0]),
  ...generateBlock(92_000, 14, CITIES[1]),
  ...generateBlock(93_000, 14, CITIES[2]),
];

// Surface the city list for filters
export const CITY_NAMES: string[] = CITIES.map((c) => c.name);

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
