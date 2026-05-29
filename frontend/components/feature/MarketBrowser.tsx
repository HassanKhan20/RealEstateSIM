"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Property, PropertyType } from "@/shared/properties";
import { TYPE_LABELS, CITY_NAMES } from "@/shared/properties";
import { fmtMoney } from "@/shared/finance";
import NeighborhoodMap from "../shared/NeighborhoodMap";
import HouseIllustration from "../shared/HouseIllustration";

type SortKey = "price-asc" | "price-desc" | "rent-desc" | "rent-ratio" | "dom-desc" | "motivation";

const SORT_LABEL: Record<SortKey, string> = {
  "price-asc": "Price: Low to High",
  "price-desc": "Price: High to Low",
  "rent-desc": "Rent: High to Low",
  "rent-ratio": "Rent/Price ratio",
  "dom-desc": "Days on market",
  "motivation": "Seller motivation",
};

export default function MarketBrowser({ properties }: { properties: Property[] }) {
  const [sort, setSort] = useState<SortKey>("motivation");
  const [type, setType] = useState<PropertyType | "all">("all");
  const [city, setCity] = useState<string | "all">("all");
  const [hood, setHood] = useState<string | "all">("all");
  const [minBeds, setMinBeds] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1_500_000);
  const [showMap, setShowMap] = useState(true);

  const hoods = useMemo(() => {
    const scope = city === "all" ? properties : properties.filter((p) => p.city === city);
    const s = new Set(scope.map((p) => p.neighborhood));
    return Array.from(s).sort();
  }, [properties, city]);

  const filtered = useMemo(() => {
    let list = properties.filter(
      (p) =>
        (type === "all" || p.type === type) &&
        (city === "all" || p.city === city) &&
        (hood === "all" || p.neighborhood === hood) &&
        p.beds >= minBeds &&
        p.price <= maxPrice
    );
    const score = (p: Property) =>
      p.motivation === "high" ? 3 : p.motivation === "average" ? 2 : 1;
    switch (sort) {
      case "price-asc": list = list.sort((a, b) => a.price - b.price); break;
      case "price-desc": list = list.sort((a, b) => b.price - a.price); break;
      case "rent-desc": list = list.sort((a, b) => b.estimatedRent - a.estimatedRent); break;
      case "rent-ratio":
        list = list.sort(
          (a, b) => b.estimatedRent / b.price - a.estimatedRent / a.price
        );
        break;
      case "dom-desc": list = list.sort((a, b) => b.daysOnMarket - a.daysOnMarket); break;
      case "motivation": list = list.sort((a, b) => score(b) - score(a)); break;
    }
    return list;
  }, [properties, type, city, hood, minBeds, maxPrice, sort]);

  return (
    <div className="space-y-6">
      {/* Filters bar — sticky Zillow-style */}
      <div className="card sticky top-[3.75rem] z-10 flex flex-wrap items-center gap-2 p-3">
        <Field>
          <select
            value={city}
            onChange={(e) => { setCity(e.target.value); setHood("all"); }}
            className="select"
          >
            <option value="all">All cities</option>
            {CITY_NAMES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>
        <Field>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType | "all")}
            className="select"
          >
            <option value="all">All home types</option>
            {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>
        </Field>
        <Field>
          <select value={hood} onChange={(e) => setHood(e.target.value)} className="select">
            <option value="all">Any neighborhood</option>
            {hoods.map((h) => <option key={h} value={h}>{h}</option>)}
          </select>
        </Field>
        <Field>
          <select
            value={minBeds}
            onChange={(e) => setMinBeds(Number(e.target.value))}
            className="select"
          >
            <option value={0}>Any beds</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>{n}+ beds</option>
            ))}
          </select>
        </Field>
        <Field>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="select"
          >
            {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
              <option key={k} value={k}>{SORT_LABEL[k]}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-center gap-2 px-2 text-xs text-muted">
          <span>Max</span>
          <input
            type="range"
            min={150_000}
            max={1_200_000}
            step={25_000}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="w-40"
            style={{ accentColor: "#2563EB" } as any}
          />
          <span className="font-mono text-[12px] text-slate-700">
            {fmtMoney(maxPrice)}
          </span>
        </div>
        <button
          onClick={() => setShowMap((v) => !v)}
          className="btn-secondary ml-auto text-xs"
        >
          {showMap ? "Hide map" : "Show map"}
        </button>
        <span className="text-xs text-muted">
          {filtered.length} / {properties.length}
        </span>
      </div>

      {/* Map */}
      {showMap && (
        <div className="card overflow-hidden p-2">
          <NeighborhoodMap properties={filtered} height={360} />
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ListingCard key={p.id} p={p} />
        ))}
      </div>

      <style jsx>{`
        .select {
          background: #FFFFFF;
          border: 1px solid #E5E7EB;
          border-radius: 8px;
          color: #0F172A;
          padding: 0.5rem 0.75rem;
          font-size: 13px;
          font-weight: 500;
          min-width: 120px;
        }
        .select:hover { border-color: #CBD5E1; }
        .select:focus { outline: none; border-color: #2563EB; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
      `}</style>
    </div>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div>{children}</div>;
}

function ListingCard({ p }: { p: Property }) {
  const priceDrop = p.daysOnMarket > 45;
  const isNew = p.daysOnMarket < 7;
  const pricePerSqft = Math.round(p.price / Math.max(1, p.sqft));

  return (
    <Link
      href={`/market/${p.id}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#BFD3F7] hover:shadow-[0_10px_28px_-12px_rgba(15,23,42,0.18)]"
    >
      {/* Photo area */}
      <div className="relative">
        <HouseIllustration property={p} height={200} />

        {/* Top-left tags */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {isNew && <Tag tone="blue">New</Tag>}
          {priceDrop && <Tag tone="red">Price drop</Tag>}
          {p.motivation === "high" && <Tag tone="amber">Motivated</Tag>}
        </div>

        {/* Save button top-right */}
        <button
          onClick={(e) => { e.preventDefault(); }}
          className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:text-[#E4002B]"
          aria-label="Save"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>

        {/* Bottom gradient price ribbon (subtle) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/15 to-transparent" />
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[22px] font-semibold leading-none tracking-tight text-slate-900">
            {fmtMoney(p.price)}
          </div>
          <div className="text-right text-[11px] leading-tight text-slate-500">
            <div>${pricePerSqft}/sqft</div>
            <div className="text-[10px]">ARV {fmtMoney(p.estimatedArv)}</div>
          </div>
        </div>

        <div className="mt-2 flex items-center gap-1 text-[13px] text-slate-700">
          <strong className="text-slate-900">{p.beds}</strong> bd
          <Sep />
          <strong className="text-slate-900">{p.baths}</strong> ba
          <Sep />
          <strong className="text-slate-900">{p.sqft.toLocaleString()}</strong> sqft
        </div>

        <div className="mt-1 text-[13px] font-medium text-slate-900">
          {p.address}
        </div>
        <div className="text-[12px] text-slate-500">
          {p.neighborhood} · {p.city}, {p.state} {p.zip}
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
          <span className="pill pill-slate">{TYPE_LABELS[p.type]}</span>
          <span className="pill pill-slate">Built {p.yearBuilt}</span>
          <span className="pill pill-slate">{p.daysOnMarket}d on market</span>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-slate-500">
          <span>Rent est. {fmtMoney(p.estimatedRent)}/mo</span>
          <span className="font-medium text-[#2563EB] group-hover:underline">
            Analyze deal →
          </span>
        </div>
      </div>
    </Link>
  );
}

function Tag({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "blue" | "red" | "amber" | "green";
}) {
  const map = {
    blue: "bg-[#2563EB] text-white",
    red: "bg-[#DC2626] text-white",
    amber: "bg-[#B45309] text-white",
    green: "bg-[#059669] text-white",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${map[tone]}`}>
      {children}
    </span>
  );
}

function Sep() {
  return <span className="text-slate-300">·</span>;
}
