# Estatify — Architecture & Product Overview

> A flight simulator for real estate. Practice the deal before it's real.

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [The problem and why we built this](#2-the-problem-and-why-we-built-this)
3. [Product features](#3-product-features)
4. [System architecture](#4-system-architecture)
5. [Tech stack and rationale](#5-tech-stack-and-rationale)
6. [Data flow — a graded scenario, end to end](#6-data-flow--a-graded-scenario-end-to-end)
7. [Data model and persistence](#7-data-model-and-persistence)
8. [AI integration — Haiku vs Sonnet](#8-ai-integration--haiku-vs-sonnet)
9. [Codebase tour](#9-codebase-tour)
10. [How to extend](#10-how-to-extend)
11. [Demo script (5 minutes)](#11-demo-script-5-minutes)
12. [Roadmap and honest tradeoffs](#12-roadmap-and-honest-tradeoffs)

---

## 1. Executive summary

Estatify is a Next.js web application that gives aspiring real estate agents and investors something the industry doesn't currently offer: **realistic, no-stakes practice.** The product spans three connected tracks:

- **Agent Simulations** — AI-powered roleplay against real estate personas, graded by Claude Sonnet on rapport, discovery, objection handling, and close.
- **Paper Trading** — 28 synthetic Tampa listings with realistic prices, rents, taxes, and flood zones. Run live financial models across four investment strategies, buy with paper money, watch your portfolio age over simulated years.
- **Exam Prep** — AI-generated, scenario-first practice questions across nine licensing topics with explanations.

Plus a **Beginner Mode** that simplifies the buying experience down to "cash or finance" with a forward-simulation engine modeling five market scenarios (base case, soft market, hot market, 2008-style crash, rates spike).

All of this sits inside a single, well-organized Next.js codebase split into `frontend/`, `backend/`, and `shared/` — the same separation a Node + React monorepo would have, but contained in one project.

---

## 2. The problem and why we built this

The single most-cited statistic in real estate education: **75% of new agents quit within their first year.** Among the 25% who stay, the dropout rate by year five is reported around 87%.

The reasons aren't mysterious. They've been documented across NAR research, Inman articles, Reddit threads in r/realtors, and direct interviews with practicing agents:

1. **Financial unpreparedness for the 90-day commission gap.** New agents close their first deal an average of 90+ days into the career. Most have no runway to survive that.
2. **Brokerage onboarding is "here's a desk, go sell."** Mentorship is widely promised but rarely delivered.
3. **Pre-license courses (PrepAgent, Aceable, Kaplan) are universally described as boring** — read-quiz, read-quiz format, decoupled from the actual job.
4. **Reality TV (Selling Sunset, Million Dollar Listing) skews expectations.** New agents arrive expecting glamor, find rejection.
5. **Unrealistic confidence going into the first cold call.** Most have never practiced a real conversation.

For investors, the parallel failure modes:

1. **Analysis paralysis** — perfect deal, never bought.
2. **Emotional buying** — first deal becomes a money pit.
3. **No exit strategy** before signing.
4. **Underestimating rehab + carrying costs** on flips.

Estatify exists because **practice closes the gap between knowledge and competence**. Pilots train in flight simulators before flying real planes. Surgeons rehearse on cadavers. Sales teams roleplay. Real estate is the only major career where your first day costs $50,000 to find out if you fit.

The product is not training in the boring "course content" sense. It's **reps**. Hundreds of low-stakes reps until the first real call doesn't feel like the first call.

---

## 3. Product features

Each feature includes a "why this exists" so you can defend or modify the design.

### 3.1 Landing page

**What it is:** A cinematic, editorial marketing page with a dark hero (massive metallic "ESTATIFY" wordmark over a procedural city skyline at twilight), real photography in the carousel, a featured-properties section with a stylized neighborhood map, and editorial sections explaining the product.

**Why it looks like this:** First impressions are non-trivial. Real estate is an aspirational category. The dominant aesthetic in the space is either utilitarian (Zillow) or cheesy (realtor headshots). We wanted Estatify to feel premium and serious — closer to Compass / Sotheby's than Aceable's animated memes. The dark hero plus the "Practice the deal before it's real" headline frames the product as professional development, not a game.

### 3.2 Agent Simulations (`/practice/[slug]`)

**What it is:** Five fully voiced AI personas the user can roleplay against:
- **Marcus Whitaker** — pre-foreclosure motivated seller, defensive, exhausted from 6 wholesaler calls today
- **Linda Reyes** — sharp cash-buyer investor, gives the user 60 seconds to pitch the deal
- **Dave Kowalski** — anti-agent FSBO seller, baits the user about commission
- **Marcus Hayes** — aggressive lowball investor offering 85% of list price
- **Priya Chen** — first-time buyer panicking after the inspection report

Each conversation is run by **Claude Haiku** in-character with a hidden backstory that only reveals through good rapport. After 3+ user turns, the user can "End call & grade" — **Claude Sonnet** evaluates the transcript against the scenario's win conditions and returns structured JSON: `rapport`, `discovery`, `objectionHandling`, `close`, `ethicsFlags[]`, plus a "biggest win" and "biggest miss."

The grade feeds an **ELO-style SimScore** (starts at 1000, moves up or down based on grade vs the scenario's difficulty rating). Tiers: Rookie → Journeyman → Closer → Top Agent → Shark.

**Why this exists:** Agent burnout in year one is fundamentally a **rejection-tolerance** problem. The skill of staying calm when a homeowner hangs up on you, when an investor scoffs at your numbers, when a buyer panics — that's the actual job. You can't train it from a textbook. You train it by doing it. Estatify gives you 100+ reps before your first real call.

**Why Fair Housing is wrapped in a guardrail:** Every persona's system prompt includes an explicit `FHA_GUARDRAIL` block. The AI will not roleplay discriminatory behavior, and the grader explicitly flags any user message that crosses the line. This is a legal requirement we take seriously even in a simulation.

### 3.3 Market & Deal Analyzer (`/market`, `/market/[id]`)

**What it is:** A Zillow-style listings grid showing 28 synthetic Tampa-area properties. Filter by neighborhood, type, beds, max price. Sort by price, rent yield, motivation, days on market. Click a listing to open the **Deal Analyzer** — a live financial model with four strategy tabs:

- **Buy & Hold** — conventional 20% down, 30-year fixed
- **House Hack** — FHA 3.5% down, live in one unit, rent the rest
- **Flip** — hard money, 6-month hold, sell at ARV
- **BRRRR** — buy, rehab, rent, refi, repeat

The analyzer recomputes in real time as you tweak: down payment %, interest rate, rehab budget, monthly rent. Shows: monthly cash flow, cash-on-cash, cap rate, DSCR, total cash in, monthly PITI breakdown, plus rule-of-thumb flags (1% rule, 70% rule).

**Why this exists:** Most beginner investors fail at the **acquisition stage** — overpaying because they didn't run the numbers correctly, or buying a deal that pencils on appreciation but is cash-flow negative. Estatify lets you fail at this 50 times in an afternoon. By the time you see a real listing, the math is muscle memory.

**Why the listings are synthetic:** MLS data is gatekept (expensive, regulated, requires a broker license to access). Synthetic data lets us ship without a regulatory wall while keeping every number realistic — Tampa neighborhood prices, Florida insurance/tax burdens, hurricane and flood risk profiles. The generator is deterministic on a seed, so the same property looks identical on every reload.

### 3.4 Beginner Mode (`/beginner`, `/beginner/[id]`)

**What it is:** A simplified, less-overwhelming version of the buying experience for people who've never done a deal. Removes mortgages-vs-hard-money complexity. Two purchase paths:

- **All cash** — pay full price, rent flows almost entirely as cash flow
- **Finance** — pick a down payment (10/15/20/25/30%), pick an interest rate, pick a 15- or 30-year term

Plus a **Simulate** panel that's always visible — runs your portfolio (or a hypothetical purchase) forward 1, 3, 5, or 10 years against five market scenarios:

- **Base case** — uses actual property assumptions
- **Soft market** — 40% appreciation, 50% rent growth
- **Hot market** — 160% appreciation
- **2008-style crash** — -30% appreciation + a one-time -22% hit at month 6
- **Rates spike** — +2.5% interest rate shock on financed mortgages

Output: portfolio value over time (chart), final equity, total return %, cumulative cash flow.

**Why this exists:** The full Pro Market & Deal Analyzer assumes you know what an ARV is, that "BRRRR" stands for something, that you can interpret a DSCR. Most people who are *real-estate-curious* (the largest TAM) don't know any of that yet. Beginner Mode is the on-ramp. It teaches the relationship between price, rent, leverage, and time without throwing acronyms at the user.

**Why the simulation engine matters:** Time is the variable beginners can't intuit. They can compute today's cap rate but they can't viscerally feel what 30 years of compounding rent + appreciation does, or what one bad year does to a leveraged portfolio. The Simulate panel makes time legible. The 2008-style crash scenario in particular is shocking to watch — and that's the point.

### 3.5 Portfolio Pro (`/portfolio`)

**What it is:** Your full deal tracking dashboard for properties bought in Pro Mode (full Deal Analyzer). Shows total equity, monthly cash flow, average cash-on-cash, holdings cards with strategy badges, and a **time machine** — fast-forward your portfolio +1, +5, or any custom number of years to see how appreciation, rent growth, and leverage compound. Sell holdings at projected value with simulated 6% closing costs.

**Why it exists:** Real estate isn't day-trading. You have to feel the slow part. The time machine compresses that into seconds.

### 3.6 Exam Prep (`/exam`)

**What it is:** AI-generated practice questions across nine licensing topics:
- Agency and fiduciary duties
- Contracts and contract law
- Property ownership and types of estates
- Real estate finance and mortgages
- Real estate math (commissions, prorations, LTV, taxes)
- Fair Housing and federal regulations
- Listings, disclosures, and MLS
- Escrow, title, and closing procedures
- Valuation and appraisal

Pick a topic and a count (3, 5, 7, or 10). Claude Sonnet generates scenario-first questions with four choices, the correct index, and a 1-3 sentence explanation. Answer them, get scored, build attempt history.

**Why this exists:** First-time pass rates on the licensing exam are dismal — California averages 45-50%, Florida 40-60%. The killers are the math section and state law nuance. Existing exam-prep providers (PrepAgent, AceableAgent's Question Bank) are huge improvements over textbook study but still mostly multiple-choice flashcards. Scenario-first AI questions with explanations feel like a tutor, not a quiz.

**Why this isn't a state-approved pre-license course:** That's a separate product. State approval requires per-state regulatory compliance (FREC in Florida, TREC in Texas, DRE in California), instructor credentials, ARELLO/IDECC certification, surety bonds. Building it is a 9-15 month project with significant capital. Estatify's exam prep is a study companion to whatever pre-license course the user already bought — Aceable, Colibri, Kaplan — not a replacement.

### 3.7 Dashboard (`/dashboard`)

**What it is:** Your activity hub. Shows current SimScore tier, daily streak, best streak, total sessions logged, win rate (% of sessions ≥70 grade), average grade, exam average, holdings count, monthly portfolio cash flow. Plus quick-action cards and a list of recent sessions with grades and deltas.

**Why it exists:** Daily-loop products live and die on whether the user feels their progress. Streak + tier + leaderboard mechanics are why Duolingo retains 5x better than the average language app. Estatify uses the same psychology — the streak isn't the product; the streak is what gets you to come back tomorrow and run another rep.

### 3.8 System (`/system`)

**What it is:** A visual architecture explainer for new contributors and demo audiences. Maps every feature to its files, shows the four-folder layout (frontend/backend/shared/app), walks through the data flow of a graded scenario step by step, and lists the six most common ways to extend the codebase.

**Why it exists:** New engineers waste hours figuring out where things live. This page replaces that hour with three minutes.

---

## 4. System architecture

### 4.1 The four-folder split

```
RealEstateSIM/
├── app/         # Next.js routes (must stay at root)
├── frontend/    # All client UI + client-only state
├── backend/     # Server-only logic (Anthropic SDK + secrets)
├── shared/      # Pure logic — used by both client and server
└── public/      # Static assets
```

This is the same separation a Node + React monorepo would have. The constraint is that Next.js requires `app/` at the project root — but everything else is reorganized for clarity.

### 4.2 Why this structure

- **`frontend/`** has React + browser APIs (localStorage). It is bundled to the client.
- **`backend/`** has the Anthropic SDK, environment secrets, and prompt construction. It is server-only — never reaches the browser.
- **`shared/`** has zero React, zero `window`, zero `process.env`. Pure functions and data. Importable from anywhere.
- **`app/`** is just routing. Page components are server components by default; they import from `frontend/components/` for client-side UI.

The benefit: when reading the codebase you immediately know whether a file ships to the user's browser. If it's in `backend/` or `app/api/*/route.ts`, no — only the server runs it. If it's in `frontend/` or any client component (`"use client"`), yes — it goes into the bundle. If it's in `shared/`, both.

### 4.3 Why `app/api/*/route.ts` files are 10-25 lines

The API routes are intentionally thin. All logic lives in `backend/ai/`. A typical route handler:

```typescript
// app/api/chat/route.ts — 25 lines total
import { processChat } from "@/backend/ai/chat";
import { isConfigured, NOT_CONFIGURED_RESPONSE } from "@/backend/ai/client";

export async function POST(req: NextRequest) {
  if (!isConfigured()) return Response.json(NOT_CONFIGURED_RESPONSE, { status: 503 });
  try {
    const { slug, messages } = await req.json();
    const result = await processChat(slug, messages);
    if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
    return Response.json(result);
  } catch (err: any) {
    return Response.json({ error: err?.message ?? "Unknown error" }, { status: 500 });
  }
}
```

Why: the actual AI business logic — picking the model, constructing the system prompt, parsing structured JSON, calling ELO math — lives in `backend/ai/chat.ts`. That keeps the route files boring and replaceable. Tomorrow we could swap from Next API routes to a separate Node server, or to Cloudflare Workers, by porting `backend/ai/` and rewriting the thin handlers.

### 4.4 Why `shared/types.ts` exists

Types like `BeginnerHolding` and `BeginnerPortfolio` are used by both `frontend/lib/store.ts` (which writes them to localStorage) and `shared/beginnerSim.ts` (which simulates them forward through time). If the types lived inside `frontend/lib/store.ts`, then `shared/` would have a forbidden dependency on `frontend/`. Putting them in `shared/types.ts` keeps the dependency graph clean: `shared` imports nothing from `frontend` or `backend`, but `frontend` and `backend` can both import from `shared`.

---

## 5. Tech stack and rationale

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 14 (App Router)** | One project = frontend + API routes. RSC for fast static landing pages, client components where state matters. File-based routing means the route file structure is the sitemap. |
| Language | **TypeScript (strict)** | Catches a class of bugs at compile time. End-to-end types from data → UI mean refactors don't break things silently. |
| Styling | **Tailwind CSS + custom tokens** | No CSS files to manage. The design system (color tokens, font stack, shadows) lives in `tailwind.config.ts`. Custom helper classes (`btn-primary`, `card`, `gradient-text`) live in `app/globals.css`. |
| AI | **Anthropic Claude SDK** | The roleplay needs character consistency over multi-turn conversations and structured grading output. Claude is the best at both. We use **Haiku for chat** (fast, cheap, in-character) and **Sonnet for grading + exam generation** (better reasoning, structured JSON). |
| Persistence | **localStorage (v1)** | The MVP needed zero infra. Every piece of user state — portfolios, sessions, streaks, exam history — lives in the browser. Helpers all in `frontend/lib/store.ts`. Migration to a real DB only requires swapping that file. |
| Hosting | **Vercel** | Edge for static pages, Node runtime for `/api` routes, automatic CI/CD via the GitHub repo, free SSL. Default for Next.js. |
| Fonts | **Inter + Playfair Display** (Google Fonts via `next/font`) | Inter for UI, Playfair as the display serif for editorial headlines. Both subsetted and self-hosted by Next at build time. |

**Why no separate state library (Redux, Zustand, etc.):** localStorage + the native `storage` event are sufficient at this size. When two components need to react to the same change (e.g., Nav and Dashboard both need to know the SimScore changed), they listen for the storage event. If we hit the limits of that pattern, we'll add a state library — not before.

**Why no auth / user accounts (yet):** The product works without them. Adding auth means email collection, password reset, session management, and user-management dashboards — all of which delay shipping. localStorage persistence per browser is fine for an MVP. Authentication enters the roadmap when we want cross-device persistence or B2B brokerage cohorts.

---

## 6. Data flow — a graded scenario, end to end

This is the canonical example of how the four folders cooperate. Walking it once explains the whole architecture.

```
USER  ──[1]──▶  ChatInterface (frontend/components/feature)
                state: messages[], scenario
                      │
                      ├──[2]──▶  POST /api/chat
                      │              │
                      │              └─▶ app/api/chat/route.ts (10 lines)
                      │                       │
                      │                       └─▶ backend/ai/chat.ts → processChat()
                      │                                │
                      │                                ├─▶ shared/scenarios.ts → getScenario(slug)
                      │                                │       (system prompt + persona backstory)
                      │                                │
                      │                                └─▶ backend/ai/client.ts → Claude Haiku
                      │
                      │◀─────[3] in-character reply ────────────────────────┘
                      │
                      ├──[turns repeat]
                      │
USER  ──[4]──▶  ChatInterface.endCall()
                      │
                      └──[5]──▶  POST /api/grade
                                     │
                                     └─▶ app/api/grade/route.ts
                                              │
                                              └─▶ backend/ai/grade.ts → gradeTranscript()
                                                       │
                                                       ├─▶ backend/ai/prompts.ts → GRADING_INSTRUCTIONS
                                                       ├─▶ backend/ai/client.ts → Claude Sonnet
                                                       └─▶ Parse JSON
                                                                │
                                                                └─▶ shared/elo.ts → newRating()
                                                                       │
                                                                       └─▶ Returns { grade, avg, newRating, delta }
                                              │
                      [6] Component receives response
                      │
                      └──[7]──▶  frontend/lib/store.ts
                                     ├─▶ setSimScore(newRating)
                                     └─▶ addSession({ ... })
                                            │
                                            └─▶ window.dispatchEvent(new StorageEvent("storage", ...))
                                                       │
                      [8] Other mounted components (Nav, Dashboard) receive the event and re-render with the new SimScore
```

**Key observation:** every layer has a clear job. The route handler doesn't know how to grade. The frontend doesn't know what model is used. The shared math doesn't know it's being called from a server route. Each piece can be replaced independently.

---

## 7. Data model and persistence

### 7.1 Types (`shared/types.ts`)

```typescript
type Holding = {
  propertyId: string;
  purchasedAt: number;
  purchasePrice: number;
  financing: FinancingInputs;
  rehabSpent: number;
  strategy: "buy-hold" | "house-hack" | "flip" | "brrrr";
  monthlyCashFlow: number;
  monthlyRent: number;
  cashIn: number;
};

type BeginnerHolding = {
  propertyId: string;
  purchasedAt: number;
  purchasePrice: number;
  purchaseType: "cash" | "finance";
  // Finance-only:
  downPayment?: number;
  loanBalance?: number;
  interestRate?: number;
  termYears?: number;
  monthlyPayment?: number;
  // Shared:
  cashIn: number;
  monthlyRent: number;
};

type SessionRecord = {
  id: string;
  slug: string;
  title: string;
  persona: string;
  difficulty: string;
  avg: number;
  delta: number;
  newRating: number;
  opponentRating: number;
  biggestWin?: string;
  biggestMiss?: string;
  ethicsFlags?: string[];
  at: number;
};

type StreakState = { current: number; best: number; lastDay: string | null };
type ExamAttempt = { id: string; topic: string; correct: number; total: number; at: number };
```

### 7.2 localStorage schema

| Key | Shape | Owner |
|---|---|---|
| `simscore` | number (1000 default) | Pro mode |
| `portfolio-v1` | `PortfolioState { cash, holdings[] }` | Pro mode |
| `sessions-v1` | `SessionRecord[]` | Sims |
| `streak-v1` | `StreakState` | Daily loop |
| `exam-attempts-v1` | `ExamAttempt[]` | Exam |
| `beginner-portfolio-v1` | `BeginnerPortfolio { cash, holdings[] }` | Beginner mode |
| `demo-seed-v1` | flag | Seeder (main) |
| `demo-seed-beginner-v2` | flag | Seeder (beginner) |

### 7.3 Demo seed

`frontend/lib/demoSeed.ts` runs once on first page load. It populates all of localStorage with a realistic, lived-in state — SimScore 1285, 12-day streak, 8 graded sessions with realistic feedback, 4 Pro holdings spanning all 4 strategies, 3 Beginner holdings (mix of cash and financed), 6 exam attempts. This means a brand-new visitor immediately sees the Dashboard look meaningful instead of empty.

The seed is gated behind two `localStorage` flags so reloads don't wipe real progress, but a v2 flag bump triggers a re-seed when we update the demo data.

### 7.4 Future migration path

Replacing localStorage with a real database (Postgres, Supabase, Convex) only requires swapping the implementations of `getX / saveX` in `frontend/lib/store.ts`. Every consumer of those helpers — every component — keeps working unchanged. The types in `shared/types.ts` map directly to database table shapes.

---

## 8. AI integration — Haiku vs Sonnet

We use two models for two distinct jobs.

### 8.1 Claude Haiku (`backend/ai/chat.ts`)

- **Used for:** in-character roleplay during agent simulations
- **Why:** Haiku is fast, cheap, and excellent at maintaining persona over multi-turn conversations. The user is sending one message at a time; latency matters.
- **System prompt:** the full persona prompt from `shared/scenarios.ts` (backstory, personality, what they reveal vs. hide, what makes them break character, Fair Housing guardrail)
- **Max tokens per reply:** 400 — keeps responses tight and conversational

### 8.2 Claude Sonnet (`backend/ai/grade.ts` and `backend/ai/exam.ts`)

- **Used for:** transcript grading and exam question generation
- **Why:** Both tasks need structured JSON output and careful reasoning. Grading requires understanding the full conversation in context against win conditions; exam-question generation requires legal accuracy and unambiguous distractors. Sonnet does this much better than Haiku.
- **Grading system prompt:** `GRADING_INSTRUCTIONS` from `backend/ai/prompts.ts` — defines the exact JSON shape, scoring guide (90-100 = top 5% of agents, 0-39 = deal-killing behavior), and the requirement to cite specific phrases from the transcript.
- **Exam system prompt:** `EXAM_SYSTEM` from `backend/ai/prompts.ts` — defines the JSON shape, requires scenario-first questions, mixes difficulty (1 easy / 2 medium / 2 hard), bans Fair Housing violations as correct answers.

### 8.3 Graceful degradation when API key is absent

`backend/ai/client.ts` exports an `isConfigured()` check. Every route handler uses it to short-circuit to a `503` response when `GROQ_API_KEY` is missing. The frontend displays a friendly "AI not configured on this deployment" message in the chat or exam UI. Non-AI features (Market, Beginner mode, Portfolio, Dashboard) all work without the key. This means the product can be deployed publicly for browsing without exposing or requiring a key.

---

## 9. Codebase tour

### 9.1 `app/` — routes (Next.js App Router)

```
app/
├── api/
│   ├── chat/route.ts      # POST → in-character roleplay
│   ├── grade/route.ts     # POST → graded scoring JSON
│   └── exam/route.ts      # POST → exam question generation
├── beginner/
│   ├── page.tsx           # /beginner — listings + portfolio + simulate
│   └── [id]/page.tsx      # /beginner/[id] — buy ticket
├── market/
│   ├── page.tsx           # /market — Zillow-style grid + map
│   └── [id]/page.tsx      # /market/[id] — Deal Analyzer
├── practice/[slug]/page.tsx  # /practice/[slug] — agent simulations
├── dashboard/page.tsx
├── exam/page.tsx
├── portfolio/page.tsx
├── system/page.tsx        # /system — architecture explainer
├── layout.tsx             # Root layout, fonts, demo seeder mount
├── page.tsx               # Landing
├── globals.css            # Tailwind base + tokens
├── not-found.tsx          # Custom 404
└── loading.tsx            # Loading state
```

### 9.2 `frontend/components/landing/` — marketing surface

- `Hero.tsx` — cinematic hero with metallic ESTATIFY title, procedural city skyline, 3-photo carousel
- `FeaturedProperties.tsx` — neighborhood map + 6 hand-picked listings
- `SplitStatement.tsx` — editorial photo + manifesto ("Your first real deal shouldn't feel like your first")
- `FeatureTracks.tsx` — 3-track product overview
- `HowItWorks.tsx` — 3-step value prop
- `Pricing.tsx` — Free / Pro / Team tiers
- `Footer.tsx`, `StatsBar.tsx`, `DisplayBanner.tsx`

### 9.3 `frontend/components/feature/` — interactive views

- `ChatInterface.tsx` — agent simulation chat + session logger
- `ResultsScreen.tsx` — graded results visualization
- `ScenarioGrid.tsx` — filterable persona library
- `MarketBrowser.tsx` — Zillow-style filterable listing grid
- `DealAnalyzer.tsx` — live financial model with strategy tabs
- `PortfolioView.tsx` — Pro portfolio with time-machine
- `BeginnerView.tsx` — listings + portfolio + simulate panel
- `BeginnerProperty.tsx` — cash/finance buy ticket
- `ExamTrainer.tsx` — MC exam UI with attempt history
- `DashboardView.tsx` — SimScore tier + streak + recent sessions
- `SystemView.tsx` — visual architecture explainer

### 9.4 `frontend/components/shared/` — reused everywhere

- `Nav.tsx` — sticky adaptive nav (white-on-dark over hero, dark-on-light elsewhere)
- `Logo.tsx` — Estatify wordmark with light/dark variant
- `PersonaAvatar.tsx` — deterministic gradient avatar from a name
- `HouseIllustration.tsx` — procedural front-elevation SVG per property (sunny daytime palette)
- `NeighborhoodMap.tsx` — top-down stylized SVG map of Tampa
- `PriceChart.tsx` — line chart with hover tooltip + axes
- `Sparkline.tsx` — tiny inline chart for cards
- `DemoSeed.tsx` — client-mounted hook that runs `seedIfEmpty()` once

### 9.5 `frontend/lib/` — client-only state

- `store.ts` — typed localStorage helpers + re-exports types from `shared/types.ts`
- `demoSeed.ts` — one-shot seeder for demo mode

### 9.6 `backend/ai/` — server-only AI

- `client.ts` — Anthropic SDK init + `isConfigured()` guard + model IDs (`MODELS.CHAT`, `MODELS.GRADE`, `MODELS.EXAM`)
- `prompts.ts` — `GRADING_INSTRUCTIONS`, `EXAM_SYSTEM`, `EXAM_TOPICS`
- `chat.ts` — `processChat(slug, messages)` returns Haiku reply
- `grade.ts` — `gradeTranscript(slug, messages, userRating)` returns full graded JSON
- `exam.ts` — `generateExam(topic, count)` returns question array

### 9.7 `shared/` — pure logic

- `types.ts` — all data types
- `properties.ts` — 28 deterministic synthetic Tampa listings + facade illustration generators
- `scenarios.ts` — 5 agent simulation personas with full system prompts
- `finance.ts` — `monthlyMortgage`, `computeDeal`, `computeFlip`, `fmtMoney`, `fmtPct`
- `elo.ts` — `expectedScore`, `newRating`, `gradeToOutcome`
- `beginnerSim.ts` — month-by-month forward simulation engine + 5 named scenarios
- `marketHistory.ts` — deterministic price walks + projections for charts

### 9.8 Documentation

- `README.md` — quick-start + intern onboarding pointer
- `ARCHITECTURE.md` — written architecture reference (briefer than this document)
- `docs/ESTATIFY-OVERVIEW.md` — this document

---

## 10. How to extend

The six most common contributions, with the file you'd touch first:

| Task | First file to open |
|---|---|
| Add a new agent simulation persona | `shared/scenarios.ts` |
| Add a new exam topic | `backend/ai/prompts.ts` (`EXAM_TOPICS` array) |
| Add a new strategy to Deal Analyzer | `frontend/components/feature/DealAnalyzer.tsx` |
| Tune SimScore tiers / thresholds | `frontend/components/feature/DashboardView.tsx` (`ratingTier` function) |
| Add a new market simulation scenario | `shared/beginnerSim.ts` (`SCENARIOS` array) |
| Add more synthetic properties | `shared/properties.ts` (loop count) |

For deeper contributions:
- **Add a new feature page** → create `app/[name]/page.tsx`, mount a new feature component from `frontend/components/feature/`, add a Nav link in `frontend/components/shared/Nav.tsx`
- **Swap localStorage for a real DB** → reimplement helpers in `frontend/lib/store.ts`. Every consumer keeps working.
- **Add a new AI capability** → drop a new handler into `backend/ai/`, expose via a new route in `app/api/`.

---

## 11. Demo script (5 minutes)

A walk-through optimized for showing the product to interns, friends, or potential collaborators.

### Minute 0:00 — Landing page
Open `/`. Scroll the cinematic hero. Point out the metallic Estatify wordmark, the procedural skyline that's drawn in SVG (no images needed), the 3-photo carousel.

> "This is the marketing surface. Everything below is the actual product."

### Minute 0:30 — System architecture
Open `/system`. Walk through the 5 sections out loud.

> "Four folders: app, frontend, backend, shared. Same separation a Node + React monorepo would have. Read this once and you can ship."

### Minute 2:00 — Agent simulation
Open `/practice/motivated-seller`. Type 2-3 messages — "Hey Marcus, I noticed you've been getting hammered with calls lately." Show that the AI stays in character, has a hidden backstory, has emotional state. Click "End call & grade."

> "Sonnet just graded the conversation against the win conditions. Look at the biggest miss — that's specific feedback, not a generic score."

### Minute 3:30 — Deal Analyzer
Open `/market`, click a property. Tweak the down payment slider. Watch cap rate, DSCR, monthly cash flow recompute live. Switch the strategy tab to BRRRR.

> "Live financial math, no backend needed. The math is in `shared/finance.ts` — pure functions, totally testable."

### Minute 4:30 — Beginner mode + simulate
Open `/beginner/[any property]`. Show the cash-vs-finance toggle. Hit Simulate, switch to "2008-style crash." Watch the equity chart drop.

> "The simulation engine is in `shared/beginnerSim.ts`. Five named scenarios, all monthly compound, fully deterministic."

### Minute 5:00 — Dashboard
Open `/dashboard`. SimScore tier, streak, sessions, holdings.

> "Everything you just did is persisted in localStorage and feeds this view. Migration to a real DB is a one-file swap."

---

## 12. Roadmap and honest tradeoffs

### 12.1 What's working
- The four-folder architecture is clean and explainable.
- The synthetic data generator is realistic enough that the math feels meaningful.
- AI roleplay + grading is differentiated — no incumbent (PrepAgent, Aceable, Kaplan, MaverickRE, Hyperbound) bundles all three tracks.
- The codebase is small enough that a new contributor can be productive in a day.

### 12.2 What's risky
- **Practice as a standalone consumer SaaS is a hard sell.** Research-validated: people don't pay for "fun reps." They pay for transactional outcomes (deal analysis, retention insurance, exam pass guarantee). The product likely needs to find a B2B or transactional wedge to be a real business.
- **AI roleplay is a crowded category at the B2B layer.** Hyperbound ($18M raised), MaverickRE, SalesGo, Awarathon are all selling roleplay-as-a-service to enterprises. Estatify's moat against them has to be real-estate-specific data and bundling — not just "we do roleplay too."
- **State-approved pre-license course pivot is a regulatory minefield.** Each state is a 9-12 month approval process with bonds, instructor credentials, and zero reciprocity. Solo founder time-to-revenue is 12-18 months minimum. Not recommended without external capital.

### 12.3 Plausible paths forward
- **Path A — TikTok funnel + free product.** Build an audience around "Would you buy or sell?" daily content using the existing 28 properties. Free web tool sharpens deal instinct. Monetize via brokerage cohort licenses in year 2.
- **Path B — B2B brokerage retention.** Sell to brokerage operations directors at $25-50/seat/mo as "agent retention insurance." Direct pitch: 75% of new agents quit, each lost agent = $5-15k recruiting cost wasted. Same product, different buyer.
- **Path C — Free aptitude test as top-of-funnel.** "Are you built for this?" — 90-second test, archetype result (Closer / Analyst / Builder / Spectator), shareable card. Funnels into the deeper product.

### 12.4 What doesn't change regardless of path
The core product loop — agent simulations + paper trading + exam prep — is genuinely differentiated and worth building. The architecture is solid. The codebase is maintainable. Whatever go-to-market path we choose, the engineering foundation supports it.

---

## Appendix: file inventory

```
shared/
├── types.ts             # Data types
├── properties.ts        # 28 listings + generator
├── scenarios.ts         # 5 personas
├── finance.ts           # Math
├── elo.ts               # SimScore math
├── beginnerSim.ts       # Forward simulation
└── marketHistory.ts     # Price walks

backend/ai/
├── client.ts            # SDK init
├── prompts.ts           # Long-form prompts
├── chat.ts              # processChat
├── grade.ts             # gradeTranscript
└── exam.ts              # generateExam

frontend/lib/
├── store.ts             # localStorage helpers
└── demoSeed.ts          # Seeder

frontend/components/landing/   # 9 files
frontend/components/feature/   # 11 files
frontend/components/shared/    # 8 files

app/                            # 16 routes/pages + layout + globals.css
```

End of document.
