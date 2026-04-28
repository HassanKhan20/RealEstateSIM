import Link from "next/link";
import HouseIllustration from "./HouseIllustration";
import NeighborhoodMap from "./NeighborhoodMap";
import { PROPERTIES, TYPE_LABELS } from "@/lib/properties";
import { fmtMoney } from "@/lib/finance";

// Pick 6 interesting properties spread across strategies/price
function pickFeatured() {
  const sorted = [...PROPERTIES].sort((a, b) => {
    const scoreA = (a.motivation === "high" ? 2 : a.motivation === "average" ? 1 : 0);
    const scoreB = (b.motivation === "high" ? 2 : b.motivation === "average" ? 1 : 0);
    return scoreB - scoreA;
  });
  return sorted.slice(0, 6);
}

export default function FeaturedProperties() {
  const featured = pickFeatured();

  return (
    <section className="bg-[#F7F8FA] py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              The board
            </div>
            <h2 className="mt-3 font-display text-4xl font-medium leading-tight text-slate-900 md:text-5xl">
              Discover properties with the best value.
            </h2>
            <p className="mt-4 text-slate-600">
              Hand-picked deals across Tampa. Each one has realistic prices,
              rents, taxes, and insurance modeled from county data — run the
              numbers, then own them with paper money.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <Link href="/market" className="btn-secondary">
              Browse all 28
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_2fr]">
          {/* Left — map feature card */}
          <div className="card overflow-hidden p-2">
            <NeighborhoodMap properties={PROPERTIES} height={540} />
          </div>

          {/* Right — property grid */}
          <div className="grid gap-5 sm:grid-cols-2">
            {featured.map((p) => (
              <Link
                key={p.id}
                href={`/market/${p.id}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-12px_rgba(15,23,42,0.12)] ring-1 ring-slate-100 transition hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(15,23,42,0.06),0_20px_40px_-18px_rgba(15,23,42,0.18)]"
              >
                <div className="relative">
                  <HouseIllustration property={p} height={180} />
                  <div className="absolute left-3 top-3 flex gap-1.5">
                    {p.motivation === "high" && (
                      <span className="rounded bg-[#DC2626] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        Motivated
                      </span>
                    )}
                    {p.daysOnMarket < 7 && (
                      <span className="rounded bg-[#2563EB] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                        New
                      </span>
                    )}
                  </div>
                  <span
                    className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-slate-500 shadow-sm backdrop-blur transition group-hover:text-[#E4002B]"
                    aria-hidden
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </span>
                </div>

                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-start justify-between">
                    <div className="font-display text-xl font-medium text-slate-900">
                      {fmtMoney(p.price)}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      ARV {fmtMoney(p.estimatedArv)}
                    </div>
                  </div>
                  <div className="mt-1.5 text-[13px] text-slate-700">
                    <strong className="text-slate-900">{p.beds}</strong> bd
                    <span className="mx-1 text-slate-300">·</span>
                    <strong className="text-slate-900">{p.baths}</strong> ba
                    <span className="mx-1 text-slate-300">·</span>
                    <strong className="text-slate-900">{p.sqft.toLocaleString()}</strong> sqft
                  </div>
                  <div className="mt-1 text-[13px] font-medium text-slate-900">
                    {p.address}
                  </div>
                  <div className="text-[12px] text-slate-500">
                    {p.neighborhood} · Tampa, FL
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
