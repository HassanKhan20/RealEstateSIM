# Estatify

> A flight simulator for real estate. Practice the deal before it's real.

Estatify is a Next.js web app that gives aspiring real estate agents and investors something the industry doesn't: realistic, no-stakes practice. AI-powered agent simulations, paper-trading on synthetic listings with real math, and a visual licensing-exam prep mode — all in one product.

## What's in it

| Track | Route | What it does |
|---|---|---|
| **Agent Simulations** | `/practice/[slug]` | Live-fire AI roleplay against motivated sellers, cash buyers, FSBOs, lowballers, and panicked first-time buyers. Sonnet grades you on rapport, discovery, objections, and close. |
| **Market & Deal Analyzer** | `/market` | 28 synthetic Tampa listings with realistic prices, rents, taxes, and flood zones. Run cap rate / DSCR / cash-on-cash live across 4 strategies (Buy & Hold, House Hack, Flip, BRRRR). |
| **Beginner Mode** | `/beginner` | Simplified buy-with-cash-or-finance experience for first-timers. Includes a forward simulation engine with 5 market scenarios (base, soft, hot, 2008-crash, rates-spike). |
| **Portfolio (Pro)** | `/portfolio` | Track your full deal portfolio with a time-machine that fast-forwards months and years. |
| **Exam Prep** | `/exam` | Scenario-first AI-generated practice questions across 9 licensing topics. |
| **Dashboard** | `/dashboard` | Tiered SimScore (Rookie → Shark), streak, win rate, exam avg, holdings snapshot. |
| **System** | `/system` | Visual architecture explainer for new contributors. |

## Quick start

```bash
git clone https://github.com/HassanKhan20/RealEstateSIM.git
cd RealEstateSIM
npm install
cp .env.example .env.local       # add your GROQ_API_KEY (optional)
npm run dev
# → http://localhost:3000
```

The non-AI features (Market, Portfolio, Beginner mode, Dashboard) work with zero API key — they fall back to clean "not configured" messages where the AI would normally run.

## For new contributors / interns

**Read [`ARCHITECTURE.md`](./ARCHITECTURE.md) first** (or open [`/system`](http://localhost:3000/system) in the running app). It maps every feature to its files and shows the data flow end-to-end.

The 30-second tour:
- `app/` — Next.js routes
- `components/landing/` — marketing surface
- `components/feature/` — interactive views (one per route)
- `components/shared/` — reused everywhere
- `lib/` — pure logic, no React, no side effects

When you want to ship something:
- New AI persona → `lib/scenarios.ts`
- New market scenario → `lib/beginnerSim.ts`
- New deal strategy → `components/feature/DealAnalyzer.tsx`
- New exam topic → `app/api/exam/route.ts`

## Tech

Next.js 14 (App Router) · TypeScript (strict) · Tailwind · Anthropic SDK (Haiku + Sonnet) · localStorage · Vercel

## Conventions

- **Pages are server components**; anything with state or effects is `"use client"`.
- **No backend yet.** All state in `localStorage`. `lib/store.ts` is the only file that touches it — swap that implementation when you add a real DB.
- **Pure `lib/`.** No React imports, no side effects. Trivially unit-testable if/when we add tests.
- **Fair Housing.** Every AI persona is wrapped in `FHA_GUARDRAIL`. Grading flags violations explicitly.

## Demo data

On first load the app seeds itself with realistic data (4 Pro holdings, 8 graded sessions, 6 exam attempts, 12-day streak, 3 beginner-mode positions). Wipes if you click "Reset" in `/portfolio` or `/beginner`.

## Help

- Bugs / questions: open an issue or DM Hassan
- Architecture deep-dive: [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- Visual system map: [`/system`](http://localhost:3000/system)
