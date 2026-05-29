# Estatify — Architecture

> If you only read one file, read this one. The visual version is at [`/system`](http://localhost:3000/system).

---

## Stack

| Layer       | Tech                              |
|-------------|-----------------------------------|
| Framework   | Next.js 14 (App Router, RSC)      |
| Language    | TypeScript (strict)               |
| Styling     | Tailwind CSS + custom tokens      |
| AI          | Groq SDK (Llama 3.3 70B + Whisper) |
| Persistence | localStorage (v1, no backend yet) |
| Hosting     | Vercel                            |

---

## Top-level layout

```
RealEstateSIM/
├── app/                 # Next.js routes (must stay at root)
│   ├── api/             # Thin route handlers — delegate to backend/
│   │   ├── chat/        #   POST → in-character roleplay
│   │   ├── grade/       #   POST → graded scoring JSON
│   │   └── exam/        #   POST → exam Q gen
│   ├── beginner/, market/, practice/, dashboard/, exam/, portfolio/, system/
│   ├── layout.tsx       # Root layout (fonts + DemoSeed mount)
│   ├── page.tsx         # Landing
│   ├── globals.css      # Tailwind base + tokens + utility classes
│   ├── not-found.tsx    # 404 page
│   └── loading.tsx      # Loading state
│
├── frontend/            # All client UI + client-only state
│   ├── components/
│   │   ├── landing/     # Marketing surface (Hero, FeaturedProperties…)
│   │   ├── feature/     # Interactive views (BeginnerView, DealAnalyzer…)
│   │   └── shared/      # Reused everywhere (Nav, Logo, charts, illustrations)
│   └── lib/
│       ├── store.ts     # Typed localStorage helpers (CLIENT-ONLY)
│       └── demoSeed.ts  # One-shot demo seeder (CLIENT-ONLY)
│
├── backend/             # Server-only logic (runs in /api routes)
│   └── ai/
│       ├── client.ts    # Groq SDK init + isConfigured() guard
│       ├── prompts.ts   # All long-form prompts (grading rubric, exam)
│       ├── chat.ts      # processChat(slug, messages)
│       ├── grade.ts     # gradeTranscript(slug, messages, userRating)
│       └── exam.ts      # generateExam(topic, count) + EXAM_TOPICS
│
├── shared/              # Pure logic — used by BOTH client and server
│   ├── properties.ts    # 28 synthetic Tampa listings (deterministic)
│   ├── scenarios.ts     # AI sim personas + system prompts
│   ├── finance.ts       # Mortgage / cap rate / DSCR / flip ROI math
│   ├── elo.ts           # SimScore (ELO-style) math
│   ├── beginnerSim.ts   # Forward simulation engine (5 scenarios)
│   └── marketHistory.ts # Price walks + projections (charts)
│
└── public/
    └── landing/         # Hero photos used in landing
```

### Why the split

- **`frontend/`** has React + browser APIs (localStorage). Imports React. Never used server-side.
- **`backend/`** has the Anthropic SDK, secrets (env vars), and prompts. Never imported in the browser bundle.
- **`shared/`** has zero React, zero `window`, zero `process.env`. Pure functions and data. Importable from anywhere — that's why files like `scenarios.ts` and `elo.ts` live here (the chat handler and the grading handler both need them, and so do the React components).

This is the same separation a Node/Express backend + React frontend monorepo would have — we're just inside one Next.js project.

---

## Components, by folder

### `frontend/components/landing/` — marketing only
- `Hero.tsx` — cinematic dark hero with metallic ESTATIFY title + procedural city skyline + 3-photo carousel
- `FeaturedProperties.tsx` — neighborhood map + 6 hand-picked listings
- `SplitStatement.tsx` — editorial photo + manifesto
- `FeatureTracks.tsx` — three-track product overview (Sims / Paper Trading / Exam)
- `HowItWorks.tsx` — 3-step value prop
- `Pricing.tsx` — Free / Pro / Team tiers
- `StatsBar.tsx` — small stat strip
- `Footer.tsx` — site footer
- `DisplayBanner.tsx` — full-bleed display banner section

### `frontend/components/feature/` — interactive views (one per route)
- `ChatInterface.tsx` — agent simulation chat + session logger
- `ResultsScreen.tsx` — graded results visualization
- `ScenarioGrid.tsx` — filterable persona library
- `MarketBrowser.tsx` — Zillow-style filterable listing grid
- `DealAnalyzer.tsx` — live financial model with 4 strategy tabs
- `PortfolioView.tsx` — Pro portfolio with time-machine
- `BeginnerView.tsx` — beginner listings + portfolio + simulate panel
- `BeginnerProperty.tsx` — beginner buy ticket (cash or finance)
- `ExamTrainer.tsx` — MC exam UI with attempt history
- `DashboardView.tsx` — SimScore tier + streak + recent sessions
- `SystemView.tsx` — visual sibling of this file (the `/system` page)

### `frontend/components/shared/` — reused everywhere
- `Nav.tsx` — sticky adaptive nav
- `Logo.tsx` — Estatify wordmark
- `PersonaAvatar.tsx` — deterministic gradient avatar
- `HouseIllustration.tsx` — procedural front-elevation SVG per property
- `NeighborhoodMap.tsx` — top-down stylized SVG of Tampa
- `PriceChart.tsx` — line chart with hover tooltip + axes
- `Sparkline.tsx` — tiny inline chart for cards
- `DemoSeed.tsx` — client-mounted hook that runs `seedIfEmpty()` once

---

## API surface

The route handlers in `app/api/` are 10–25 lines each. All real logic is in `backend/ai/`:

```
POST /api/chat                    app/api/chat/route.ts
                                       └─▶ backend/ai/chat.ts → processChat()
                                                └─▶ backend/ai/client.ts (Llama 3.3 70B)
                                                └─▶ shared/scenarios.ts (system prompt)

POST /api/grade                   app/api/grade/route.ts
                                       └─▶ backend/ai/grade.ts → gradeTranscript()
                                                └─▶ backend/ai/client.ts (Llama 3.3 70B (JSON mode))
                                                └─▶ backend/ai/prompts.ts (GRADING_INSTRUCTIONS)
                                                └─▶ shared/elo.ts (newRating)

POST /api/exam                    app/api/exam/route.ts
                                       └─▶ backend/ai/exam.ts → generateExam()
                                                └─▶ backend/ai/client.ts (Llama 3.3 70B (JSON mode))
                                                └─▶ backend/ai/prompts.ts (EXAM_SYSTEM, EXAM_TOPICS)
GET  /api/exam → returns the topic list (no AI call)
```

If `GROQ_API_KEY` is missing, all three POST endpoints short-circuit to `503 + NOT_CONFIGURED_RESPONSE` from `backend/ai/client.ts`. No code changes needed to deploy without the key.

---

## Data flow — a graded scenario, end to end

```
USER  ──[1]──▶  ChatInterface (state: messages[])
                      │
                      ├──[2]──▶  POST /api/chat
                      │              └─▶ backend/ai/chat.ts → Llama 3.3 70B
                      │
                      │◀─────[3] in-character reply ─────────────┘
                      │
                      ├──[turns repeat]
                      │
USER  ──[4]──▶  ChatInterface.endCall()
                      │
                      └──[5]──▶  POST /api/grade
                                     └─▶ backend/ai/grade.ts → Llama 3.3 70B
                                                  │
                                          [6] structured JSON
                                                  │
                                          [7] shared/elo.ts → newRating, delta
                                                  │
                                          [8] frontend/lib/store.ts → addSession + setSimScore
                                                  │
                                          [9] storage event fires
                                                  │
                                          [10] Nav, Dashboard re-render
```

---

## Persistence model

Everything lives in `localStorage`. Helpers all in `frontend/lib/store.ts`.

| Key                       | Shape                                                        |
|---------------------------|--------------------------------------------------------------|
| `simscore`                | number (1000 default)                                        |
| `portfolio-v1`            | `PortfolioState { cash, holdings[] }`                        |
| `sessions-v1`             | `SessionRecord[]`                                            |
| `streak-v1`               | `StreakState { current, best, lastDay }`                     |
| `exam-attempts-v1`        | `ExamAttempt[]`                                              |
| `beginner-portfolio-v1`   | `BeginnerPortfolio { cash, holdings[] }`                     |
| `demo-seed-v1`            | flag — main demo seed already ran                            |
| `demo-seed-beginner-v2`   | flag — beginner-mode seed already ran                        |

A future migration to a real DB would only need to swap the implementations of `getX / saveX` in `frontend/lib/store.ts` — call sites stay identical.

---

## How to extend (the 6 most common contributions)

| You want to...                              | Touch first                                       |
|---------------------------------------------|---------------------------------------------------|
| Add a new agent simulation persona          | `shared/scenarios.ts`                             |
| Add a new exam topic                        | `backend/ai/prompts.ts` (EXAM_TOPICS)             |
| Add a new strategy to Deal Analyzer         | `frontend/components/feature/DealAnalyzer.tsx`    |
| Tune SimScore tiers / thresholds            | `frontend/components/feature/DashboardView.tsx`   |
| Add a new market simulation scenario        | `shared/beginnerSim.ts` (SCENARIOS)               |
| Add more synthetic properties               | `shared/properties.ts` (loop count)               |

---

## Conventions

- **Server vs client.** Pages are server components by default. Anything with state, effects, or event handlers is a client component (`"use client"`) and lives in `frontend/components/`.
- **No backend DB.** All persistence is client-side localStorage. API routes only call Claude.
- **Pure `shared/`.** Files have zero React, zero `window`, zero side effects. Trivially unit-testable.
- **Thin route handlers.** Files in `app/api/*/route.ts` should be 10–25 lines. Real logic goes in `backend/ai/`.
- **Deterministic data.** Properties, illustrations, and price charts are seeded by `facadeSeed`.
- **Fair Housing guardrails.** Every AI persona system prompt includes `FHA_GUARDRAIL`. Grading flags violations.

---

## Running locally

```bash
npm install
cp .env.example .env.local         # add GROQ_API_KEY (optional)
npm run dev                        # → http://localhost:3000
```

If AI features show "not configured," the API key isn't loaded — check `.env.local`.

## Deploying

Push to `main`. Vercel auto-deploys via the connected repo. Add `GROQ_API_KEY` in Project → Settings → Environment Variables to enable AI endpoints.
