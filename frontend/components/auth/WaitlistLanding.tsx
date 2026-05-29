"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { joinWaitlist, waitlistCount, isAuthed } from "@/frontend/lib/auth";
import { logEvent } from "@/frontend/lib/analytics";

export default function WaitlistLanding() {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(1_240);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setCount(waitlistCount());
    setAuthed(isAuthed());
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = joinWaitlist(email);
    if (!r.ok) {
      setError(r.error ?? "Something went wrong.");
      return;
    }
    setJoined(r.position ?? null);
    setCount(waitlistCount());
    logEvent("waitlist_join", { email });
    // Send to the server sink (Google Sheet etc.) — fire and forget.
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "landing" }),
    }).catch(() => {});
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0B1620] text-white">
      {/* Ambient washes */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_78%_15%,rgba(234,178,108,0.40),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_15%_85%,rgba(45,130,150,0.25),transparent_60%)]" />
      </div>
      <Skyline />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.28em] text-white/55">
          <span className="font-display text-lg normal-case tracking-tight text-white">Estatify</span>
          <Link href="/login" className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] tracking-wider text-white ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/15">
            {authed ? "Enter app" : "Have a code? Sign in"}
          </Link>
        </div>

        {/* Center */}
        <div className="flex flex-1 flex-col justify-center py-16">
          <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/70 ring-1 ring-white/15 backdrop-blur-sm">
            <span className="inline-block h-1.5 w-1.5 animate-pulseSoft rounded-full bg-[#6EE7B7]" />
            Private beta · {count.toLocaleString()} on the waitlist
          </div>

          <h1 className="font-display text-5xl font-medium leading-[1.0] tracking-tight md:text-7xl">
            Practice the deal
            <br />
            <span className="italic text-white/65">before it&apos;s real.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
            A flight simulator for real estate. Run AI agent simulations,
            paper-trade real listings, and pass the licensing exam — before your
            first commission is on the line. 75% of new agents quit year one.
            Be ready.
          </p>

          {/* Waitlist form / confirmation */}
          {joined === null ? (
            <form onSubmit={submit} className="mt-8 max-w-md">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@email.com"
                  className="flex-1 rounded-full bg-white/10 px-5 py-3.5 text-sm text-white outline-none ring-1 ring-white/20 backdrop-blur-sm placeholder:text-white/40 focus:ring-2 focus:ring-white/40"
                  aria-label="Email address"
                  required
                />
                <button
                  type="submit"
                  className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
                >
                  Join the waitlist
                </button>
              </div>
              {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
              <p className="mt-3 text-xs text-white/45">
                No spam. We&apos;ll email your invite code when a spot opens.
              </p>
            </form>
          ) : (
            <div className="mt-8 max-w-md rounded-2xl bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm">
              <div className="text-[11px] uppercase tracking-[0.24em] text-[#6EE7B7]">You&apos;re in line</div>
              <div className="mt-1 font-display text-3xl font-medium">#{joined.toLocaleString()}</div>
              <p className="mt-2 text-sm text-white/70">
                We&apos;ll email your invite code when a spot opens. Want in now?
                If you already have a code, <Link href="/login" className="text-white underline">sign in here</Link>.
              </p>
            </div>
          )}

          {/* Track teaser */}
          <div className="mt-14 grid gap-4 sm:grid-cols-3">
            <Teaser n="01" title="Agent Simulations" body="Voice roleplay against AI sellers and buyers. Graded on rapport, discovery, objections, close." />
            <Teaser n="02" title="Paper Trading" body="56 listings across 3 cities. Real cap-rate, DSCR, cash-flow math. Buy with fake money." />
            <Teaser n="03" title="Exam Prep" body="Scenario-first AI questions across 9 licensing topics. Pass it the first time." />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/40">
          <span>© Estatify {new Date().getFullYear()}</span>
          <span>Not legal or financial advice.</span>
        </div>
      </div>
    </main>
  );
}

function Teaser({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="rounded-2xl bg-white/[0.06] p-5 ring-1 ring-white/10 backdrop-blur-sm">
      <div className="font-mono text-[11px] text-white/40">{n}</div>
      <div className="mt-1 font-display text-lg font-medium">{title}</div>
      <p className="mt-1.5 text-xs leading-relaxed text-white/55">{body}</p>
    </div>
  );
}

function Skyline() {
  const buildings: { x: number; w: number; h: number }[] = [];
  let x = 0;
  let i = 0;
  const rand = (seed: number) => {
    const s = Math.sin(seed * 9301 + 49297) * 233280;
    return s - Math.floor(s);
  };
  while (x < 1600) {
    const w = 30 + Math.floor(rand(i + 1) * 70);
    const h = 50 + Math.floor(rand(i + 17) * 180);
    buildings.push({ x, w, h });
    x += w + 2;
    i += 1;
  }
  const baseY = 720;
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 bottom-0 w-full"
      viewBox="0 0 1600 800"
      preserveAspectRatio="xMidYMax slice"
      style={{ height: "55%" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="wl-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0E1F2E" stopOpacity="0" />
          <stop offset="100%" stopColor="#070E16" stopOpacity="1" />
        </linearGradient>
      </defs>
      <g opacity="0.8">
        {buildings.map((b, idx) => (
          <g key={idx}>
            <rect x={b.x} y={baseY - b.h} width={b.w} height={b.h} fill="url(#wl-sky)" />
            {Array.from({ length: Math.floor(b.h / 24) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor(b.w / 16)) }).map((_, c) => {
                if (Math.sin(idx * 7 + r * 3 + c * 5) > 0.5) {
                  return (
                    <rect key={`${r}-${c}`} x={b.x + 6 + c * 16} y={baseY - b.h + 14 + r * 24} width="3" height="6" fill="#F2C97A" opacity="0.5" />
                  );
                }
                return null;
              })
            )}
          </g>
        ))}
      </g>
      <rect x="0" y={baseY} width="1600" height={800 - baseY} fill="#070E16" />
    </svg>
  );
}
