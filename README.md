# RealEstateSIM

Practice the deal before it's real. AI-powered real estate roleplay with grading and an ELO-style SimScore.

## What's in this prototype

Three tracks, one sim:

**Track 01 — AI Roleplay** (`/#scenarios`)
- 5 playable scenarios: motivated seller, cash buyer pitch, FSBO conversion, lowball defense, buyer cold feet
- Claude Haiku stays in persona, hidden backstories, Fair Housing guardrails
- Claude Sonnet grades rapport / discovery / objections / close + biggest win & miss
- ELO-style SimScore (1000 baseline)

**Track 02 — Paper Trading** (`/market`)
- 28 synthetic Tampa listings with real neighborhoods, flood zones, schools
- Stylized top-down neighborhood map (pure SVG)
- Live Deal Analyzer: Buy/Hold, House Hack, Flip, BRRRR — cap rate, cash-on-cash, DSCR, 1% rule, 70% rule
- Paper-buy with $250k starting cash, track holdings in the Portfolio with a time machine (fast-forward months/years)
- Sell at projected appreciation

**Track 03 — Exam Prep** (`/exam`)
- AI-generated practice questions across 9 topics (agency, contracts, finance, math, fair housing, valuation, etc.)
- Scenario-first MC questions with explanations, graded inline
- Attempt history

**Dashboard** (`/dashboard`)
- SimScore tier (Rookie → Shark), streak, win rate, exam avg, portfolio cash flow
- Recent sessions + holdings snapshot

All state is client-side (localStorage). No DB required for the MVP.

## Run it

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add your Anthropic key:
   ```bash
   cp .env.example .env.local
   # then edit .env.local and set ANTHROPIC_API_KEY
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open http://localhost:3000

## Project structure

```
app/
  page.tsx                       landing page
  practice/[slug]/page.tsx       scenario player
  market/page.tsx                property browser + map
  market/[id]/page.tsx           property detail + deal analyzer
  portfolio/page.tsx             holdings + time machine
  exam/page.tsx                  AI-generated exam practice
  dashboard/page.tsx             SimScore, streak, history
  api/chat/route.ts              Claude Haiku conversation
  api/grade/route.ts             Claude Sonnet grading
  api/exam/route.ts              Claude Sonnet exam question generator
components/
  ChatInterface.tsx              chat UI + session logger
  ResultsScreen.tsx              graded results UI
  MarketBrowser.tsx              filter/sort/map market view
  DealAnalyzer.tsx               live deal math + buy-in CTA
  PortfolioView.tsx              holdings, KPIs, time machine
  ExamTrainer.tsx                MC question UI
  DashboardView.tsx              tier, KPIs, actions
  FeatureTracks.tsx              landing 3-track section
  NeighborhoodMap.tsx            SVG Tampa map
  HouseIllustration.tsx          procedural facade
lib/
  scenarios.ts                   scenario definitions (FHA guarded)
  properties.ts                  28 synthetic listings
  finance.ts                     mortgage/CF/flip math
  elo.ts                         SimScore math
  store.ts                       localStorage persistence
```

## Adding a new scenario

Add a new entry to `SCENARIOS` in `lib/scenarios.ts`. Each needs:

- `slug` (URL)
- `persona`, `title`, `intro`
- `difficulty` and `baseRating` (used as ELO opponent rating)
- `openingMessage` (what the AI says first)
- `systemPrompt` (the character — keep it tight, specific, with hidden backstory)
- `winConditions` (used by the grader to score)

## Roadmap (next slices)

- More scenarios: cash-buyer pitch, FSBO call, expired listing, buyer objection
- Supabase auth + persistent SimScore + session history
- Streaks, leaderboards, daily challenges
- Paper trading mode (synthetic listings, fast-forward time)
- Voice mode (ElevenLabs)
- Stripe (Free / Pro $39 / Team $25/seat)
- PWA manifest for mobile
