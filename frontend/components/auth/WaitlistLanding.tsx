"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { joinWaitlist, waitlistCount } from "@/frontend/lib/auth";
import { logEvent } from "@/frontend/lib/analytics";
import { PROPERTIES } from "@/shared/properties";
import { fmtMoney } from "@/shared/finance";
import HouseIllustration from "@/frontend/components/shared/HouseIllustration";

const TEASER = [PROPERTIES[2], PROPERTIES[30], PROPERTIES[44], PROPERTIES[10], PROPERTIES[18], PROPERTIES[38]].filter(Boolean);

export default function WaitlistLanding() {
  const [count, setCount] = useState(1_240);
  useEffect(() => setCount(waitlistCount()), []);
  const bump = () => setCount(waitlistCount());

  return (
    <main className="bg-white text-slate-900">
      {/* ============ HERO — clean split splash ============ */}
      <section className="grid min-h-screen place-items-center bg-[#E9E9E9] p-4 sm:p-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-[0_30px_80px_-30px_rgba(15,23,42,0.25)] ring-1 ring-black/10 lg:grid-cols-2">
          <div className="flex flex-col justify-between bg-[#F4F1EC] p-9 sm:p-12 lg:p-14">
            <div className="flex items-center gap-2.5">
              <Mark />
              <span className="text-[22px] font-extrabold tracking-tight text-[#111]">Estatify</span>
            </div>
            <div className="py-14 lg:py-10">
              <span className="inline-block rounded-md border border-black/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#2563EB]">Private beta · joining in batches</span>
              <h1 className="mt-6 text-[40px] font-extrabold leading-[1.04] tracking-[-0.02em] text-[#111] sm:text-[52px]">Practice the deal<br />before it&apos;s real</h1>
              <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4B5563]">Roleplay AI sellers and buyers, paper-trade real listings, and pass the licensing exam — before your first commission is on the line.</p>
              <WaitlistForm onJoin={bump} source="hero" />
              <SocialProof count={count} />
            </div>
            <div className="text-[12px] leading-relaxed text-[#6B7280]">
              <div>© {new Date().getFullYear()} Estatify · All rights reserved.</div>
              <div className="mt-0.5">Already invited? <Link href="/login" className="font-medium text-[#111] underline underline-offset-2">Sign in with your code</Link></div>
            </div>
          </div>
          <div className="relative hidden items-center justify-center bg-white p-12 lg:flex"><Illustration /></div>
        </div>
      </section>

      {/* ============ THREE TRACKS ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-12 max-w-2xl">
          <div className="text-xs uppercase tracking-[0.24em] text-[#2563EB]">What you&apos;ll get</div>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-slate-900 md:text-5xl">
            One sim, the whole career.
          </h2>
          <p className="mt-3 text-slate-600">
            Most tools teach one thing. Estatify covers the conversation, the
            deal, and the exam — so your first real day isn&apos;t actually your first.
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <TrackCard kicker="Track 01 · Agent Simulations" title="Live-fire AI conversations." color="#0EA5E9"
            body="Voice roleplay against motivated sellers, cash buyers, FSBOs, and panicked first-time buyers. AI stays in character with hidden backstory. Graded on rapport, discovery, objections, and close." />
          <TrackCard kicker="Track 02 · Paper Trading" title="Trade the whole board." color="#10B981"
            body="56 listings across Tampa, Phoenix, and Austin — each with real tax, insurance, and appreciation profiles. Run cap rate, DSCR, cash-on-cash live. Buy with paper money. Watch your portfolio age over years." />
          <TrackCard kicker="Track 03 · Exam Prep" title="Pass it the first time." color="#2563EB"
            body="Scenario-first AI questions across 9 licensing topics, with explanations. National first-time pass rates hover near 50%. We close that gap." />
        </div>
      </section>

      {/* ============ EDITORIAL STATEMENT ============ */}
      <section className="bg-[#F7F8FA] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30)]">
                <Image src="/landing/hero-3.png" alt="A home" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-500">The case for practice</div>
              <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-slate-900 md:text-6xl">
                Your first real deal
                <br />
                <span className="italic text-[#6A7A4C]">shouldn&apos;t feel</span>
                <br />
                like your first.
              </h2>
              <p className="mt-6 max-w-lg text-slate-600">
                Most agents learn by losing real commissions. Most investors learn
                by losing real money. You deserve a place to fumble the cold call,
                miscalculate the cap rate, and miss the close — without anyone
                signing anything.
              </p>
              <a href="#join" className="mt-8 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
                Join the waitlist →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LISTINGS TEASER ============ */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.24em] text-[#2563EB]">A taste of the board</div>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-slate-900 md:text-5xl">
              56 listings waiting inside.
            </h2>
          </div>
          <div className="text-sm text-slate-500">Tampa · Phoenix · Austin</div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEASER.map((p) => (
            <div key={p.id} className="relative overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-14px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
              <div className="relative">
                <HouseIllustration property={p} height={170} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/15 to-transparent" />
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="font-display text-lg font-medium text-slate-900">{fmtMoney(p.price)}</div>
                  <div className="text-[10px] text-slate-500">{p.city}, {p.state}</div>
                </div>
                <div className="mt-1 text-[13px] text-slate-700">{p.beds}bd · {p.baths}ba · {p.sqft.toLocaleString()} sqft</div>
                <div className="text-xs text-slate-500">{p.neighborhood}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <a href="#join" className="inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800">
            Get on the list to run the numbers →
          </a>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="bg-[#F7F8FA] py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 max-w-2xl">
            <div className="text-xs uppercase tracking-[0.24em] text-[#2563EB]">How it works</div>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-slate-900 md:text-5xl">
              Three steps. Hundreds of reps.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Step n="01" title="Take the placement test" body="90 seconds, 7 questions. We find your investor archetype — Closer, Analyst, Builder, or Hustler — and tailor where you start." />
            <Step n="02" title="Run the reps" body="Roleplay a cold call. Underwrite a deal. Answer exam questions. Each session is 3-7 minutes — short on purpose, so you do it daily." />
            <Step n="03" title="Climb your SimScore" body="Every rep is graded and feeds an ELO-style score. Level up from Rookie to Shark, unlocking strategies and capital as you go." />
          </div>
        </div>
      </section>

      {/* ============ CLOSING WAITLIST ============ */}
      <section id="join" className="relative overflow-hidden bg-[#0B1620] py-28 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_30%,rgba(37,99,235,0.25),transparent_70%)]" />
        <div className="relative mx-auto max-w-2xl px-6 text-center">
          <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">Private beta</div>
          <h2 className="mt-3 font-display text-5xl font-medium leading-tight md:text-6xl">
            Be ready before
            <br />
            you&apos;re real.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-white/70">
            We&apos;re onboarding in small batches. Join the waitlist and we&apos;ll
            email your invite code when a spot opens.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <WaitlistForm onJoin={bump} source="footer" dark />
          </div>
          <div className="mt-6 text-xs text-white/45">
            {count.toLocaleString()} people waiting · Already invited?{" "}
            <Link href="/login" className="text-white underline">Sign in</Link>
          </div>
        </div>
      </section>

      <footer className="bg-[#0B1620] px-6 pb-10 text-[11px] text-white/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between border-t border-white/10 pt-6">
          <span>© {new Date().getFullYear()} Estatify</span>
          <span>Not legal or financial advice.</span>
        </div>
      </footer>
    </main>
  );
}

// ---------------------------------------------------------------------------

function WaitlistForm({ onJoin, source, dark }: { onJoin: () => void; source: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = joinWaitlist(email);
    if (!r.ok) {
      setError(r.error ?? "Something went wrong.");
      return;
    }
    setJoined(true);
    onJoin();
    logEvent("waitlist_join", { email, source });
    fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source }),
    }).catch(() => {});
  }

  if (joined) {
    return (
      <div className={`mt-7 max-w-md rounded-xl px-5 py-4 ${dark ? "mx-auto bg-white/10 ring-1 ring-white/20 text-left" : "border border-black/10 bg-white"}`}>
        <div className={`text-sm font-bold ${dark ? "text-white" : "text-[#111]"}`}>You&apos;re on the list ✓</div>
        <div className={`mt-1 text-[13px] ${dark ? "text-white/70" : "text-[#6B7280]"}`}>
          We&apos;ll email your invite code when a spot opens.
        </div>
      </div>
    );
  }

  if (dark) {
    return (
      <form onSubmit={submit} className="mx-auto w-full max-w-md">
        <div className="flex flex-col gap-2 sm:flex-row">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required aria-label="Email address"
            className="flex-1 rounded-full bg-white/10 px-5 py-3.5 text-sm text-white outline-none ring-1 ring-white/20 backdrop-blur-sm placeholder:text-white/40 focus:ring-2 focus:ring-white/40" />
          <button type="submit" className="rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-200">Join the waitlist</button>
        </div>
        {error && <p className="mt-2 text-xs text-red-300">{error}</p>}
      </form>
    );
  }

  return (
    <form onSubmit={submit} className="mt-7 max-w-md">
      <div className="flex items-center gap-3 border-b border-black/20 pb-2">
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@domain.com" required aria-label="Email address"
          className="flex-1 bg-transparent text-[15px] text-[#111] outline-none placeholder:text-[#9CA3AF]" />
        <button type="submit" className="shrink-0 rounded-lg bg-[#111] px-5 py-2.5 text-[13px] font-semibold text-white transition hover:bg-[#333]">Join now</button>
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </form>
  );
}

function SocialProof({ count }: { count: number }) {
  const grads = [["#6EE7B7", "#3B82F6"], ["#F472B6", "#7C3AED"], ["#FBBF24", "#F97316"], ["#22D3EE", "#6366F1"]];
  return (
    <div className="mt-7 flex items-center gap-3">
      <div className="flex -space-x-2">
        {grads.map((g, i) => (
          <span key={i} className="inline-block h-7 w-7 rounded-full ring-2 ring-[#F4F1EC]" style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }} />
        ))}
      </div>
      <span className="text-[13px] text-[#4B5563]">
        <strong className="text-[#111]">{count.toLocaleString()}+</strong> agents &amp; investors have joined
      </span>
    </div>
  );
}

function TrackCard({ kicker, title, body, color }: { kicker: string; title: string; body: string; color: string }) {
  return (
    <div className="card card-hover relative flex h-full flex-col p-6">
      <div className="text-[11px] uppercase tracking-widest" style={{ color }}>{kicker}</div>
      <h3 className="mt-3 font-display text-xl font-medium leading-snug text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card p-6">
      <div className="font-mono text-xs text-slate-400">{n}</div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
    </div>
  );
}

function Mark() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden>
      <circle cx="16" cy="16" r="15" fill="#111" />
      <path d="M9 13 L16 7 L23 13 L23 23 L18 23 L18 17 L14 17 L14 23 L9 23 Z" fill="white" />
    </svg>
  );
}

function Illustration() {
  return (
    <svg viewBox="0 0 420 360" className="h-auto w-full max-w-[440px] text-[#111]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <g>
        <rect x="24" y="40" width="120" height="84" rx="8" />
        <polyline points="40,104 62,86 84,96 106,66 128,78" />
        <circle cx="128" cy="78" r="3" fill="currentColor" />
        <line x1="40" y1="116" x2="128" y2="116" opacity="0.4" />
      </g>
      <g>
        <rect x="270" y="28" width="126" height="70" rx="8" />
        <rect x="282" y="40" width="36" height="28" rx="4" />
        <line x1="328" y1="44" x2="384" y2="44" />
        <line x1="328" y1="54" x2="372" y2="54" opacity="0.6" />
        <line x1="282" y1="80" x2="384" y2="80" opacity="0.4" />
      </g>
      <g transform="translate(120,120)">
        <path d="M-10 70 L90 -6 L190 70" />
        <rect x="6" y="70" width="168" height="120" />
        <rect x="74" y="132" width="32" height="58" />
        <circle cx="99" cy="162" r="2" fill="currentColor" />
        <rect x="26" y="92" width="34" height="30" />
        <line x1="43" y1="92" x2="43" y2="122" />
        <line x1="26" y1="107" x2="60" y2="107" />
        <rect x="120" y="92" width="34" height="30" />
        <line x1="137" y1="92" x2="137" y2="122" />
        <line x1="120" y1="107" x2="154" y2="107" />
        <path d="M140 28 L140 6 L158 6 L158 42" />
        <line x1="200" y1="150" x2="200" y2="190" />
        <rect x="186" y="120" width="44" height="26" rx="3" />
        <line x1="196" y1="130" x2="220" y2="130" opacity="0.6" />
        <line x1="196" y1="138" x2="214" y2="138" opacity="0.6" />
      </g>
      <line x1="20" y1="312" x2="400" y2="312" />
      <g transform="translate(360,270)">
        <path d="M0 42 L8 42 L6 20 L2 20 Z" />
        <path d="M4 20 C4 6 -8 0 -10 -6 C0 -4 6 4 4 20" />
        <path d="M4 22 C4 8 16 2 18 -4 C8 -2 2 6 4 22" />
      </g>
    </svg>
  );
}
