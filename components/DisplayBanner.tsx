import Link from "next/link";
import HouseIllustration from "./HouseIllustration";
import { PROPERTIES } from "@/lib/properties";

const FEATURED = [
  PROPERTIES[2],
  PROPERTIES[7],
  PROPERTIES[14],
  PROPERTIES[21],
].filter(Boolean);

export default function DisplayBanner() {
  return (
    <section className="relative overflow-hidden bg-[#111417]">
      {/* Ambient photography-like backdrop using the illustration palette, darkened */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.22]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.15),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(37,99,235,0.15),transparent_60%)]" />
      </div>

      <div className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col justify-between px-6 py-16 lg:py-24">
        {/* Top nav-ish strip */}
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.24em] text-white/60">
          <span>RealEstateSIM</span>
          <span className="hidden gap-8 sm:flex">
            <span>Agent Sims</span>
            <span>Market</span>
            <span>Portfolio</span>
            <span>Exam</span>
          </span>
          <Link href="/market" className="rounded-full bg-white px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-900 transition hover:bg-slate-200">
            Enter
          </Link>
        </div>

        {/* Massive display type */}
        <div className="mt-16 flex-1 sm:mt-0">
          <div className="mb-6 text-[11px] uppercase tracking-[0.32em] text-white/60">
            Track 02 · Paper Trading
          </div>
          <h2 className="font-display text-[22vw] font-medium leading-[0.85] tracking-tight text-white sm:text-[18vw] lg:text-[15vw]">
            MARKET
          </h2>
          <div className="mt-6 max-w-xl text-sm leading-relaxed text-white/70 md:text-base">
            The World Of Deals — unlock the practice experience most agents
            never get. Twenty-eight listings. Four strategies. Real math.
            <br />Zero risk.
          </div>
        </div>

        {/* Property row */}
        <div className="mt-16 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {FEATURED.map((p, i) => (
            <Link
              key={p.id}
              href={`/market/${p.id}`}
              className={`group relative overflow-hidden rounded-2xl ring-1 ring-white/10 transition hover:ring-white/30 ${
                i === 1 ? "md:-translate-y-4" : ""
              } ${i === 3 ? "md:-translate-y-2" : ""}`}
            >
              <HouseIllustration property={p} height={180} />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute inset-x-3 bottom-3 flex items-end justify-between text-white">
                <div className="min-w-0">
                  <div className="truncate text-[11px] uppercase tracking-widest text-white/70">
                    {p.neighborhood}
                  </div>
                  <div className="truncate text-sm font-medium">{p.address}</div>
                </div>
                <div className="font-display text-sm">
                  ${(p.price / 1000).toFixed(0)}k
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
