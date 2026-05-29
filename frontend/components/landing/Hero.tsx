import Image from "next/image";
import Link from "next/link";
import { PROPERTIES } from "@/shared/properties";
import { fmtMoney } from "@/shared/finance";

const SHOWCASE: { img: string; label: string; address: string; price: number }[] = [
  {
    img: "/landing/hero-1.png",
    label: "South Tampa",
    address: "2418 Bayshore Blvd",
    price: PROPERTIES[2]?.price ?? 825_000,
  },
  {
    img: "/landing/hero-2.png",
    label: "Westchase",
    address: "915 Live Oak Ln",
    price: PROPERTIES[10]?.price ?? 690_000,
  },
  {
    img: "/landing/hero-3.png",
    label: "Seminole Heights",
    address: "1147 Magnolia Ave",
    price: PROPERTIES[18]?.price ?? 410_000,
  },
];

export default function Hero() {
  return (
    <section className="relative -mt-16 min-h-[100vh] overflow-hidden bg-[#2A3A4A] text-white">
      {/* Color washes — warm sun from upper right + cool teal from lower left */}
      <div className="pointer-events-none absolute inset-0">
        {/* Warm sun — stronger core + softer halo */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_35%_at_78%_18%,rgba(234,178,108,0.55),transparent_70%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_240px_at_78%_18%,rgba(255,214,150,0.55),transparent_70%)]" />
        {/* Cool teal below */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_15%_85%,rgba(45,130,150,0.28),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.05),transparent_55%)]" />
      </div>

      {/* Skyline silhouette */}
      <Skyline />

      {/* Soft grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.10] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)",
          backgroundSize: "3px 3px",
        }}
      />

      <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-7xl flex-col px-6 pt-24">
        {/* Massive display word — anchored center */}
        <div className="flex flex-1 items-center justify-center py-8">
          <h1
            className="select-none font-sans text-[22vw] font-black uppercase leading-[0.82] tracking-[-0.04em] sm:text-[18vw] lg:text-[15vw]"
            style={{
              backgroundImage:
                "linear-gradient(180deg, #F7F8FA 0%, #E5E7EB 28%, #9CA3AF 55%, #4B5563 85%, #1F2937 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              filter: "drop-shadow(0 6px 20px rgba(0,0,0,0.35))",
            }}
          >
            Estatify
          </h1>
        </div>

        {/* Bottom: caption left + property carousel right */}
        <div className="grid grid-cols-1 gap-10 pb-14 lg:grid-cols-[1fr_1.15fr] lg:items-end lg:gap-14">
          <div>
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/55">
              The world of
            </div>
            <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] md:text-5xl">
              Real Estate
              <br />
              <span className="italic text-white/65">Reps.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/65 md:text-[15px]">
              Unlock the practice experience most agents never get. Run
              against AI sellers, paper-trade real listings, pass the licensing
              exam — without anyone signing anything.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/#scenarios"
                className="rounded-full bg-white px-6 py-3 text-[13px] font-semibold text-slate-900 transition hover:bg-slate-200"
              >
                Start free
              </Link>
              <Link
                href="/market"
                className="rounded-full bg-white/10 px-6 py-3 text-[13px] font-semibold text-white ring-1 ring-white/25 backdrop-blur-sm transition hover:bg-white/15"
              >
                Tour the market
              </Link>
            </div>

            <div className="mt-9 flex items-center gap-6 text-[11px] uppercase tracking-[0.16em] text-white/45">
              <span>5 scenarios</span>
              <span className="h-3 w-px bg-white/15" />
              <span>28 listings</span>
              <span className="h-3 w-px bg-white/15" />
              <span>9 exam topics</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SHOWCASE.map((p, i) => (
              <Link
                key={p.img}
                href="/market"
                className={`group relative block aspect-[4/5] overflow-hidden rounded-2xl shadow-[0_18px_45px_-12px_rgba(0,0,0,0.55),0_8px_20px_-8px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-14px_rgba(0,0,0,0.65)] ${
                  i === 1 ? "lg:-translate-y-3" : ""
                } ${i === 2 ? "lg:-translate-y-1" : ""}`}
              >
                <Image
                  src={p.img}
                  alt={p.address}
                  fill
                  sizes="(max-width: 1024px) 33vw, 240px"
                  className="object-cover transition group-hover:scale-[1.04]"
                  priority={i === 0}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
                <div className="absolute inset-x-3 bottom-3 text-white">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-white/75">
                    {p.label}
                  </div>
                  <div className="mt-0.5 truncate text-[13px] font-medium">
                    {p.address}
                  </div>
                  <div className="mt-1 font-display text-[15px]">
                    {fmtMoney(p.price)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[#1A2836]" />
    </section>
  );
}

function Skyline() {
  // Procedural city silhouette across the bottom — varying building heights + a few lights
  const buildings: { x: number; w: number; h: number }[] = [];
  let x = 0;
  let i = 0;
  // Deterministic pseudo-random
  const rand = (seed: number) => {
    const s = Math.sin(seed * 9301 + 49297) * 233280;
    return s - Math.floor(s);
  };
  while (x < 1600) {
    const w = 30 + Math.floor(rand(i + 1) * 70);
    const h = 60 + Math.floor(rand(i + 17) * 220);
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
      style={{ height: "70%" }}
      aria-hidden
    >
      <defs>
        <linearGradient id="skyline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#15222E" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0A1420" stopOpacity="1" />
        </linearGradient>
        <linearGradient id="skyline-fill2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E2C3A" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#12202C" stopOpacity="1" />
        </linearGradient>
      </defs>

      {/* Distant skyline (lighter, faded) */}
      <g opacity="0.45">
        {buildings.map((b, idx) => {
          const yh = b.h * 0.55;
          return (
            <rect
              key={`d-${idx}`}
              x={b.x}
              y={baseY - yh - 30}
              width={b.w}
              height={yh}
              fill="url(#skyline-fill2)"
            />
          );
        })}
      </g>

      {/* Mid skyline */}
      <g opacity="0.85">
        {buildings.map((b, idx) => (
          <g key={`m-${idx}`}>
            <rect
              x={b.x}
              y={baseY - b.h}
              width={b.w}
              height={b.h}
              fill="url(#skyline-fill)"
            />
            {/* Window dots */}
            {Array.from({ length: Math.floor(b.h / 22) }).map((_, r) =>
              Array.from({ length: Math.max(1, Math.floor(b.w / 14)) }).map((_, c) => {
                const xx = b.x + 6 + c * 14;
                const yy = baseY - b.h + 14 + r * 22;
                if (Math.sin(idx * 7 + r * 3 + c * 5) > 0.4) {
                  return (
                    <rect
                      key={`w-${idx}-${r}-${c}`}
                      x={xx}
                      y={yy}
                      width="3"
                      height="6"
                      fill="#F2C97A"
                      opacity={0.55 + (Math.sin(c + r) + 1) * 0.15}
                    />
                  );
                }
                return null;
              })
            )}
            {/* Antennas / water tanks for variety */}
            {idx % 5 === 0 && (
              <rect
                x={b.x + b.w / 2 - 1}
                y={baseY - b.h - 20}
                width="2"
                height="20"
                fill="#0A1420"
              />
            )}
          </g>
        ))}
      </g>

      {/* Foreground darken */}
      <rect x="0" y={baseY} width="1600" height={800 - baseY} fill="#0A1420" />
    </svg>
  );
}
