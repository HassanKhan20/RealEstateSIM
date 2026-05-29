"use client";

import Link from "next/link";

/**
 * The /system page — visual architecture explainer for new contributors.
 *
 * Sections:
 *   1. Stack          — what we're built on
 *   2. Folder layout  — frontend / backend / shared / app
 *   3. Modules        — features mapped to file paths
 *   4. Data flow      — one user action traced end-to-end
 *   5. How to extend  — the 6 most common contributions
 */

const STACK = [
  { layer: "Framework", value: "Next.js 14 (App Router)", note: "RSC + client components, file-based routing, static + dynamic rendering" },
  { layer: "Language", value: "TypeScript (strict)", note: "End-to-end types from data → UI" },
  { layer: "Styling", value: "Tailwind CSS + custom tokens", note: "Editorial palette in tailwind.config.ts, helper classes in app/globals.css" },
  { layer: "AI", value: "Groq SDK", note: "Llama 3.3 70B for chat/grade/exam; Whisper Large v3 for voice STT" },
  { layer: "Persistence", value: "localStorage (v1)", note: "Portfolios, sessions, streaks, exam history. No backend yet — by design." },
  { layer: "Hosting", value: "Vercel", note: "Edge for static, Node runtime for /api routes" },
];

const FOLDERS = [
  {
    name: "app/",
    color: "#0F172A",
    role: "Next.js routes — must stay at the project root.",
    files: [
      { path: "app/page.tsx", role: "Landing" },
      { path: "app/api/{chat,grade,exam}/route.ts", role: "Thin route handlers (delegate to backend/ai/)" },
      { path: "app/{practice,market,beginner,…}/", role: "One folder per feature route" },
      { path: "app/layout.tsx", role: "Root layout, fonts, demo seeder mount" },
      { path: "app/globals.css", role: "Tailwind base + tokens + utility classes" },
    ],
  },
  {
    name: "frontend/",
    color: "#2563EB",
    role: "All client UI + client-only state. Imports React. Bundled to the browser.",
    files: [
      { path: "frontend/components/landing/", role: "Marketing surface (Hero, FeaturedProperties…)" },
      { path: "frontend/components/feature/", role: "Interactive views (DealAnalyzer, BeginnerView…)" },
      { path: "frontend/components/shared/", role: "Reused (Nav, Logo, charts, illustrations)" },
      { path: "frontend/lib/store.ts", role: "Typed localStorage helpers (CLIENT-ONLY)" },
      { path: "frontend/lib/demoSeed.ts", role: "One-shot demo seeder (CLIENT-ONLY)" },
    ],
  },
  {
    name: "backend/",
    color: "#0F766E",
    role: "Server-only logic. Imports the Groq SDK + secrets. Never reaches the browser.",
    files: [
      { path: "backend/ai/client.ts", role: "Groq SDK init + isConfigured() guard + model IDs" },
      { path: "backend/ai/prompts.ts", role: "All long-form prompts (grading rubric, exam, FHA guard)" },
      { path: "backend/ai/chat.ts", role: "processChat(slug, messages)" },
      { path: "backend/ai/grade.ts", role: "gradeTranscript(slug, messages, rating)" },
      { path: "backend/ai/exam.ts", role: "generateExam(topic, count) + EXAM_TOPICS" },
    ],
  },
  {
    name: "shared/",
    color: "#8B5CF6",
    role: "Pure logic — used by BOTH client and server. Zero React, zero window, zero env vars.",
    files: [
      { path: "shared/properties.ts", role: "28 synthetic Tampa listings (deterministic generator)" },
      { path: "shared/scenarios.ts", role: "AI sim personas + system prompts (FHA guarded)" },
      { path: "shared/finance.ts", role: "Mortgage / cap rate / DSCR / flip ROI math" },
      { path: "shared/elo.ts", role: "SimScore (ELO-style) math" },
      { path: "shared/beginnerSim.ts", role: "Forward portfolio simulation (5 market scenarios)" },
      { path: "shared/marketHistory.ts", role: "Price walks + projections (charts)" },
    ],
  },
];

type Module = {
  name: string;
  blurb: string;
  files: { path: string; role: string }[];
  routes?: string[];
  apis?: string[];
  color: string;
};

const MODULES: Module[] = [
  {
    name: "Landing",
    blurb: "Marketing surface. Cinematic hero, featured listings, editorial sections.",
    files: [
      { path: "frontend/components/landing/Hero.tsx", role: "Cinematic hero + city skyline + 3-photo carousel" },
      { path: "frontend/components/landing/FeaturedProperties.tsx", role: "Map + 6-card grid of headline listings" },
      { path: "frontend/components/landing/SplitStatement.tsx", role: "Editorial photo + statement section" },
      { path: "frontend/components/landing/FeatureTracks.tsx", role: "Three-track product overview" },
      { path: "frontend/components/landing/HowItWorks.tsx", role: "3-step value-prop section" },
      { path: "frontend/components/landing/Pricing.tsx", role: "Free / Pro / Team tiers" },
    ],
    routes: ["/"],
    color: "#2563EB",
  },
  {
    name: "Agent Simulations",
    blurb: "AI-powered roleplay against real estate personas. Graded.",
    files: [
      { path: "shared/scenarios.ts", role: "Persona definitions + system prompts (FHA guarded)" },
      { path: "shared/elo.ts", role: "ELO-style SimScore math" },
      { path: "backend/ai/chat.ts", role: "processChat() — Llama 3.3 70B in-character reply" },
      { path: "backend/ai/grade.ts", role: "gradeTranscript() — Llama 3.3 70B JSON-mode grading" },
      { path: "frontend/components/feature/ChatInterface.tsx", role: "Chat UI + session logger" },
      { path: "frontend/components/feature/ResultsScreen.tsx", role: "Graded results + score animation" },
    ],
    routes: ["/practice/[slug]"],
    apis: ["POST /api/chat", "POST /api/grade"],
    color: "#0EA5E9",
  },
  {
    name: "Market & Deal Analyzer",
    blurb: "Browse 28 synthetic Tampa listings. Run real-estate math live.",
    files: [
      { path: "shared/properties.ts", role: "Synthetic property generator (deterministic, seeded)" },
      { path: "shared/finance.ts", role: "Mortgage, cap rate, cash-on-cash, DSCR, flip ROI" },
      { path: "frontend/components/feature/MarketBrowser.tsx", role: "Filterable Zillow-style grid + map" },
      { path: "frontend/components/feature/DealAnalyzer.tsx", role: "Live financial model with strategy tabs" },
      { path: "frontend/components/shared/NeighborhoodMap.tsx", role: "Top-down stylized SVG map of Tampa" },
      { path: "frontend/components/shared/HouseIllustration.tsx", role: "Procedural front-elevation SVG" },
    ],
    routes: ["/market", "/market/[id]"],
    color: "#10B981",
  },
  {
    name: "Beginner Mode",
    blurb: "Simplified buy-with-cash-or-finance + forward simulation engine.",
    files: [
      { path: "shared/beginnerSim.ts", role: "Month-by-month portfolio sim; 5 scenarios" },
      { path: "frontend/components/feature/BeginnerView.tsx", role: "Listings + portfolio + simulate panel" },
      { path: "frontend/components/feature/BeginnerProperty.tsx", role: "Cash/Finance buy ticket + chart" },
      { path: "frontend/components/shared/PriceChart.tsx", role: "Reusable line chart with hover tooltip" },
    ],
    routes: ["/beginner", "/beginner/[id]"],
    color: "#F59E0B",
  },
  {
    name: "Portfolio (Pro)",
    blurb: "Full deal portfolio with time-machine projections.",
    files: [
      { path: "frontend/components/feature/PortfolioView.tsx", role: "Holdings, KPIs, time machine, coaching notes" },
    ],
    routes: ["/portfolio"],
    color: "#8B5CF6",
  },
  {
    name: "Exam Prep",
    blurb: "Scenario-first AI-generated practice questions, graded inline.",
    files: [
      { path: "backend/ai/exam.ts", role: "generateExam() — Llama 3.3 70B JSON-mode question generator" },
      { path: "backend/ai/prompts.ts", role: "EXAM_SYSTEM + EXAM_TOPICS" },
      { path: "frontend/components/feature/ExamTrainer.tsx", role: "MC question UI + attempt tracking" },
    ],
    routes: ["/exam"],
    apis: ["POST /api/exam"],
    color: "#EF4444",
  },
  {
    name: "Dashboard",
    blurb: "SimScore tier, streak, sessions, holdings snapshot.",
    files: [
      { path: "frontend/components/feature/DashboardView.tsx", role: "Tiered scoreboard + recent activity" },
    ],
    routes: ["/dashboard"],
    color: "#0F766E",
  },
  {
    name: "Persistence & Demo Seed",
    blurb: "Client-side state + a one-time seed that fills the app with realistic data.",
    files: [
      { path: "frontend/lib/store.ts", role: "Typed localStorage helpers" },
      { path: "frontend/lib/demoSeed.ts", role: "One-shot seeder. Populates all stores." },
      { path: "frontend/components/shared/DemoSeed.tsx", role: "Client mount that runs the seed in useEffect" },
    ],
    color: "#64748B",
  },
];

const FLOW_STEPS = [
  { n: "01", title: "User clicks Start in a scenario", file: "/practice/[slug] → ChatInterface" },
  { n: "02", title: "Each turn POSTs transcript to /api/chat", file: "app/api/chat/route.ts → backend/ai/chat.ts → Claude Haiku" },
  { n: "03", title: '"End call & grade" POSTs full transcript to /api/grade', file: "app/api/grade/route.ts → backend/ai/grade.ts → Claude Sonnet" },
  { n: "04", title: "Sonnet returns structured JSON", file: "{ rapport, discovery, objections, close, ethicsFlags, biggestWin, biggestMiss }" },
  { n: "05", title: "ELO math runs on grade vs scenario rating", file: "shared/elo.ts → newRating + delta" },
  { n: "06", title: "SimScore + session record persisted", file: "frontend/lib/store.ts → addSession + setSimScore" },
  { n: "07", title: "Dashboard reflects new tier and streak", file: "Components subscribe via 'storage' event" },
];

export default function SystemView() {
  return (
    <div className="space-y-12">
      <header>
        <div className="text-xs uppercase tracking-[0.24em] text-slate-500">System</div>
        <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
          How Estatify is built.
        </h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          Every folder, every feature, mapped to its files. Read this once
          and you can ship. If you&apos;re here for the demo: this is the picture
          of the architecture.
        </p>
      </header>

      <section>
        <SectionHeading n="01" title="Stack" sub="What we're built on" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {STACK.map((s) => (
            <div key={s.layer} className="card p-5">
              <div className="text-[10px] uppercase tracking-widest text-slate-500">{s.layer}</div>
              <div className="mt-1 font-display text-lg font-medium text-slate-900">{s.value}</div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.note}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading n="02" title="Folder layout" sub="frontend / backend / shared / app — same separation a Node + React monorepo would have, inside one Next.js project." />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {FOLDERS.map((f) => (
            <div key={f.name} className="card overflow-hidden">
              <div className="px-5 py-4" style={{ background: `linear-gradient(180deg, ${f.color}12 0%, transparent 100%)` }}>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: f.color }} />
                  <code className="font-mono text-base font-semibold text-slate-900">{f.name}</code>
                </div>
                <p className="mt-1 text-sm text-slate-600">{f.role}</p>
              </div>
              <ul className="divide-y divide-slate-100 px-5 py-1">
                {f.files.map((file) => (
                  <li key={file.path} className="py-2.5">
                    <code className="font-mono text-[11px] text-[#2563EB]">{file.path}</code>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{file.role}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading n="03" title="Modules" sub="Each feature → its files. Click a path to find it in the repo." />
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          {MODULES.map((m) => (
            <div key={m.name} className="card overflow-hidden">
              <div className="px-5 py-4" style={{ background: `linear-gradient(180deg, ${m.color}12 0%, transparent 100%)` }}>
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: m.color }} />
                  <h3 className="font-display text-xl font-medium text-slate-900">{m.name}</h3>
                </div>
                <p className="mt-1 text-sm text-slate-600">{m.blurb}</p>
                {(m.routes || m.apis) && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.routes?.map((r) => (
                      <span key={r} className="rounded-md bg-white px-2 py-0.5 font-mono text-[11px] text-slate-700 ring-1 ring-slate-200">
                        {r}
                      </span>
                    ))}
                    {m.apis?.map((a) => (
                      <span key={a} className="rounded-md bg-slate-900 px-2 py-0.5 font-mono text-[11px] text-white">
                        {a}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <ul className="divide-y divide-slate-100 px-5 py-1">
                {m.files.map((f) => (
                  <li key={f.path} className="py-2.5">
                    <code className="font-mono text-[12px] text-[#2563EB]">{f.path}</code>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-600">{f.role}</div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading n="04" title="Data flow: a graded scenario" sub="Walking one user action end-to-end through frontend → backend → shared." />
        <div className="mt-6 card p-6">
          <ol className="space-y-4">
            {FLOW_STEPS.map((s, i) => (
              <li key={s.n} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-slate-900 text-[11px] font-mono text-white">
                    {s.n}
                  </div>
                  {i < FLOW_STEPS.length - 1 && <div className="mt-1 h-full w-px bg-slate-200" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="text-sm font-medium text-slate-900">{s.title}</div>
                  <code className="mt-0.5 block font-mono text-[11px] text-slate-500">{s.file}</code>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section>
        <SectionHeading n="05" title="How to extend" sub="The most common contributions, with the file you'd touch first." />
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Howto title="Add a new agent simulation" file="shared/scenarios.ts">
            Append a Scenario object — title, persona, systemPrompt, opening line, win conditions. Persona auto-appears in the library.
          </Howto>
          <Howto title="Add a new exam topic" file="backend/ai/prompts.ts">
            Add the topic string to EXAM_TOPICS. Question generator picks it up; UI dropdown updates automatically.
          </Howto>
          <Howto title="Add a new strategy to Deal Analyzer" file="frontend/components/feature/DealAnalyzer.tsx">
            Extend STRATEGIES with key + financing default. Plug into computeDeal/computeFlip in shared/finance.ts.
          </Howto>
          <Howto title="Tune SimScore tiers" file="frontend/components/feature/DashboardView.tsx">
            Edit ratingTier()&apos;s breakpoints. Tier colors + labels update instantly.
          </Howto>
          <Howto title="Add a market scenario (sim)" file="shared/beginnerSim.ts">
            Append to SCENARIOS — appreciationMult, rentGrowthMult, rateShock. Auto-populates dropdown.
          </Howto>
          <Howto title="Add a new property" file="shared/properties.ts">
            Bump the loop count in PROPERTIES. Generator is deterministic on seed — picks new neighborhood, prices, illustration automatically.
          </Howto>
        </div>
      </section>

      <section className="card p-6 text-center">
        <div className="text-[10px] uppercase tracking-[0.24em] text-slate-500">For interns</div>
        <h3 className="mt-2 font-display text-2xl font-medium text-slate-900">
          Read this once. Then ship.
        </h3>
        <p className="mx-auto mt-2 max-w-xl text-sm text-slate-600">
          Pick any module above, find the file path, open it. Each component
          file has a header comment explaining its role. Ask before refactoring
          across module boundaries.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-secondary">See landing</Link>
          <Link href="/market" className="btn-secondary">Open the market</Link>
          <Link href="/dashboard" className="btn-primary">Open dashboard</Link>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ n, title, sub }: { n: string; title: string; sub: string }) {
  return (
    <div className="flex items-end justify-between gap-4 border-b border-slate-200 pb-4">
      <div>
        <div className="font-mono text-xs text-slate-400">{n}</div>
        <h2 className="mt-1 font-display text-2xl font-medium text-slate-900 md:text-3xl">{title}</h2>
      </div>
      <p className="hidden max-w-md text-right text-sm text-slate-500 md:block">{sub}</p>
    </div>
  );
}

function Howto({ title, file, children }: { title: string; file: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <code className="mt-1 block font-mono text-[11px] text-[#2563EB]">{file}</code>
      <p className="mt-2 text-xs leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}
