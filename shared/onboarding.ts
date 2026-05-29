// Onboarding quiz — 7 scenario questions that classify a new user into one
// of 4 real estate investor archetypes.
//
// Scoring model: each answer awards points across 4 dimensions:
//   - patience    (long-term hold vs quick exit)
//   - risk        (leverage tolerance, willingness to lose)
//   - people      (sales/relationship orientation)
//   - analytical  (numbers-first vs gut-first)
//
// At the end we pick the archetype whose dimension profile is closest.

export type ArchetypeKey = "closer" | "analyst" | "builder" | "hustler";

export type Archetype = {
  key: ArchetypeKey;
  name: string;
  short: string;        // 1-line headline
  description: string;  // 2-3 sentences
  strengths: string[];  // what they're naturally good at
  watchouts: string[];  // their typical failure modes
  startingCash: number; // dollars at level 1
  firstStep: string;    // what to do first in the app
  color: string;        // hex for badges/cards
};

export const ARCHETYPES: Record<ArchetypeKey, Archetype> = {
  closer: {
    key: "closer",
    name: "The Closer",
    short: "Conversations over calculations.",
    description:
      "You read people fast and you're not afraid of a hard call. You'd rather negotiate a deal than spreadsheet one. Real estate's a people business — yours is the easy half.",
    strengths: [
      "Cold calls don't scare you",
      "Reading seller motivation",
      "Negotiating in real time",
    ],
    watchouts: [
      "Falling in love with a deal that doesn't pencil",
      "Skipping the math because the seller is nice",
      "Trusting your gut when the numbers say no",
    ],
    startingCash: 50_000,
    firstStep: "Start with an agent simulation — it's your strongest muscle.",
    color: "#DC2626",
  },
  analyst: {
    key: "analyst",
    name: "The Analyst",
    short: "Spreadsheet-first, always.",
    description:
      "You don't move until the numbers prove it. Cap rate, DSCR, cash-on-cash — you'd rather lose a deal than overpay. Disciplined, patient, hard to fool.",
    strengths: [
      "Catching bad deals others miss",
      "Stress-testing assumptions",
      "Patience to wait for the right one",
    ],
    watchouts: [
      "Analysis paralysis — never buying",
      "Underestimating relationships",
      "Optimizing for paper, missing real life",
    ],
    startingCash: 75_000,
    firstStep: "Open the Deal Analyzer — try to find a deal that survives a soft market.",
    color: "#2563EB",
  },
  builder: {
    key: "builder",
    name: "The Builder",
    short: "Slow money, decades of it.",
    description:
      "You don't want flips. You want a portfolio that pays your rent in 20 years. Patient, conservative, allergic to debt you can't service. The least flashy archetype — and statistically the wealthiest.",
    strengths: [
      "Long-term horizon thinking",
      "Defensive cash management",
      "Compounding rent + appreciation",
    ],
    watchouts: [
      "Missing the windows when prices crash",
      "Being too conservative early when leverage works",
      "Not optimizing for taxes",
    ],
    startingCash: 60_000,
    firstStep: "Buy your first cash-flowing rental. Hold it. Let the time machine show you why.",
    color: "#059669",
  },
  hustler: {
    key: "hustler",
    name: "The Hustler",
    short: "Speed, leverage, exits.",
    description:
      "You're not here to retire in 30 years. You want this year's wins. Flips, BRRRR, hard money — high risk, high reward. The archetype with the biggest tail outcomes both ways.",
    strengths: [
      "Spotting under-priced flips",
      "Moving fast when the deal is real",
      "Comfort with leverage",
    ],
    watchouts: [
      "Overpaying because you're impatient",
      "Underestimating rehab costs",
      "Getting wiped out by one bad flip",
    ],
    startingCash: 40_000,
    firstStep: "Run a flip in the Deal Analyzer — and stress-test it under the 'Soft market' scenario.",
    color: "#B45309",
  },
};

// ----------------------------------------------------------------------------

type Dim = { patience: number; risk: number; people: number; analytical: number };
const ZERO: Dim = { patience: 0, risk: 0, people: 0, analytical: 0 };

export type Question = {
  id: string;
  prompt: string;
  context?: string;
  answers: { label: string; dim: Partial<Dim> }[];
};

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    prompt: "You inherit $50,000. What do you do with it?",
    context: "Be honest. There's no wrong answer — just yours.",
    answers: [
      { label: "Stocks / index funds. Safe, ~7% return.", dim: { analytical: 2, patience: 1, risk: -1 } },
      { label: "Down payment on a rental property.", dim: { analytical: 1, patience: 1 } },
      { label: "Fund a flip. Aim to double it in 8 months.", dim: { risk: 2, patience: -1 } },
      { label: "Keep it in savings until I'm sure.", dim: { patience: 2, risk: -2 } },
    ],
  },
  {
    id: "q2",
    prompt: "A seller hangs up on your first cold call. What's your move?",
    answers: [
      { label: "Move on. Next call.", dim: { people: 1, patience: -1 } },
      { label: "Note what I'd say differently, call back next week.", dim: { people: 2, analytical: 1 } },
      { label: "Send a handwritten letter to soften them.", dim: { people: 2, patience: 1 } },
      { label: "Honestly? I'd dread the next call.", dim: { people: -2 } },
    ],
  },
  {
    id: "q3",
    prompt: "You close on a rental. Three weeks later, the AC dies — $6,000 repair.",
    answers: [
      { label: "Pay it. Factored into long-term math.", dim: { patience: 2, analytical: 1 } },
      { label: "Frustrating, but I'd handle it.", dim: { patience: 1 } },
      { label: "I'd be furious — this wasn't disclosed.", dim: { risk: -1, people: -1 } },
      { label: "I'd consider selling. Bad omen.", dim: { patience: -2, risk: -1 } },
    ],
  },
  {
    id: "q4",
    prompt: "Building real estate wealth, you'd rather…",
    answers: [
      { label: "Own 1 great property and hold it 30 years.", dim: { patience: 3, analytical: 1 } },
      { label: "Build a portfolio of 5–10 rentals slowly.", dim: { patience: 2, analytical: 1 } },
      { label: "Flip 2–3 properties a year for cash.", dim: { risk: 2, patience: -1 } },
      { label: "House hack until my living costs are zero.", dim: { analytical: 2, patience: 1 } },
    ],
  },
  {
    id: "q5",
    prompt: "Which one of these would you trust most when picking a deal?",
    answers: [
      { label: "Cap rate, DSCR, and a 10-year cash flow projection.", dim: { analytical: 3 } },
      { label: "What the seller's motivation actually is.", dim: { people: 3 } },
      { label: "My gut feel walking through it.", dim: { risk: 1, analytical: -1 } },
      { label: "What my mentor or partner thinks.", dim: { people: 1, patience: 1 } },
    ],
  },
  {
    id: "q6",
    prompt: "Rates just jumped from 6% to 9% overnight. Your move?",
    answers: [
      { label: "Buy more. Sellers are about to panic.", dim: { risk: 3, analytical: 1 } },
      { label: "Hold what I have. Wait it out.", dim: { patience: 2 } },
      { label: "Sell my weakest property. Raise cash.", dim: { analytical: 2, patience: -1 } },
      { label: "Pause everything. This is the start of a crash.", dim: { risk: -2, patience: 1 } },
    ],
  },
  {
    id: "q7",
    prompt: "How much debt feels right for you to carry?",
    answers: [
      { label: "Zero. All-cash buys, slow and steady.", dim: { risk: -2, patience: 2 } },
      { label: "Conventional 20% down for life.", dim: { analytical: 1, patience: 1 } },
      { label: "Max leverage on owner-occupied (FHA 3.5%).", dim: { risk: 1, analytical: 2 } },
      { label: "Hard money + creative financing — max IRR.", dim: { risk: 3, patience: -1 } },
    ],
  },
];

// ----------------------------------------------------------------------------

export function scoreAnswers(answers: number[]): { dims: Dim; archetype: ArchetypeKey } {
  const dims: Dim = { ...ZERO };
  QUESTIONS.forEach((q, qi) => {
    const idx = answers[qi];
    const a = q.answers[idx];
    if (!a) return;
    for (const key of Object.keys(a.dim) as (keyof Dim)[]) {
      dims[key] += a.dim[key] ?? 0;
    }
  });

  // Archetype profiles — what an ideal version of each scores on the dims.
  // (signs matter, magnitudes are relative)
  const PROFILES: Record<ArchetypeKey, Dim> = {
    closer:   { patience: 0, risk: 1, people: 3, analytical: 0 },
    analyst:  { patience: 1, risk: -1, people: 0, analytical: 3 },
    builder:  { patience: 3, risk: 0, people: 1, analytical: 1 },
    hustler:  { patience: -1, risk: 3, people: 0, analytical: 0 },
  };

  // Pick the archetype with smallest squared distance to user dims.
  let best: ArchetypeKey = "builder";
  let bestDist = Infinity;
  for (const key of Object.keys(PROFILES) as ArchetypeKey[]) {
    const p = PROFILES[key];
    const d =
      (p.patience - dims.patience) ** 2 +
      (p.risk - dims.risk) ** 2 +
      (p.people - dims.people) ** 2 +
      (p.analytical - dims.analytical) ** 2;
    if (d < bestDist) {
      bestDist = d;
      best = key;
    }
  }
  return { dims, archetype: best };
}
