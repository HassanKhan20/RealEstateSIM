import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ARCHETYPES, type ArchetypeKey } from "@/shared/onboarding";
import { fmtMoney } from "@/shared/finance";

export const dynamicParams = false;

export function generateStaticParams() {
  return (Object.keys(ARCHETYPES) as ArchetypeKey[]).map((archetype) => ({ archetype }));
}

export async function generateMetadata(
  { params }: { params: { archetype: string } }
): Promise<Metadata> {
  const key = params.archetype as ArchetypeKey;
  const a = ARCHETYPES[key];
  if (!a) return { title: "Result" };
  const title = `I'm ${a.name} on Estatify`;
  const description = `${a.short} Take the 90-second test and find out your real estate investor archetype.`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: `/api/og/${key}`, width: 1200, height: 630 }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`/api/og/${key}`],
    },
  };
}

export default function ResultSharePage({ params }: { params: { archetype: string } }) {
  const key = params.archetype as ArchetypeKey;
  const a = ARCHETYPES[key];
  if (!a) notFound();

  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-[#F7F8FA]">
      <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <div className="mb-10">
          <Link href="/" className="font-display text-xl font-medium text-slate-900">
            Estatify
          </Link>
        </div>

        <div className="text-[11px] uppercase tracking-[0.28em] text-[#2563EB]">
          Investor archetype
        </div>
        <h1
          className="mt-3 font-display text-6xl font-medium leading-[0.95] md:text-8xl"
          style={{ color: a.color }}
        >
          {a.name}
        </h1>
        <p className="mt-4 font-display text-2xl italic text-slate-600">
          {a.short}
        </p>

        <p className="mt-8 text-[15px] leading-relaxed text-slate-700 md:text-base">
          {a.description}
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          <div className="rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-200">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-emerald-700">Strengths</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {a.strengths.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-amber-50 p-5 ring-1 ring-amber-200">
            <div className="text-[11px] font-semibold uppercase tracking-widest text-amber-700">Watch out for</div>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {a.watchouts.map((s) => (
                <li key={s} className="flex items-start gap-2">
                  <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 rounded-2xl bg-slate-900 p-6 text-center text-white">
          <div className="text-[10px] uppercase tracking-[0.24em] text-white/55">
            Take the test
          </div>
          <h2 className="mt-2 font-display text-3xl font-medium">
            Are you built for this?
          </h2>
          <p className="mt-2 text-sm text-white/70">
            7 questions. 90 seconds. Find out what kind of investor you are.
          </p>
          <Link
            href="/onboarding"
            className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-200"
          >
            Take the quiz →
          </Link>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          <Link href="/" className="hover:text-slate-900">
            Practice the deal before it&apos;s real
          </Link>{" "}
          ·{" "}
          <span>Starting cash for {a.name}: {fmtMoney(a.startingCash)}</span>
        </div>
      </div>
    </main>
  );
}
