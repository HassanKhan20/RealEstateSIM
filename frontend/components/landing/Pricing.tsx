import Link from "next/link";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "Try the loop. No card required.",
    cta: "Start practicing",
    href: "/#scenarios",
    primary: false,
    features: [
      "3 agent sim sessions / day",
      "1 paper-trade portfolio (coming soon)",
      "Basic SimScore",
      "Public leaderboard",
    ],
  },
  {
    name: "Pro",
    price: "$39",
    cadence: "/month",
    blurb: "For people closing real deals.",
    cta: "Go Pro",
    href: "/#scenarios",
    primary: true,
    features: [
      "Unlimited agent simulations",
      "10 voice sessions / week (coming soon)",
      "Full career mode + branching",
      "Verified SimScore profile",
      "Weekly new scenarios",
    ],
  },
  {
    name: "Team",
    price: "$25",
    cadence: "/seat · 5 min",
    blurb: "Brokerages onboarding new agents.",
    cta: "Talk to us",
    href: "/#scenarios",
    primary: false,
    features: [
      "Admin dashboard + analytics",
      "Custom scenarios",
      "Group leaderboards",
      "SSO + onboarding flows",
    ],
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-accent">Pricing</div>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          Cheaper than one bad call.
        </h2>
        <p className="mt-3 text-slate-600">
          Tom Ferry coaching is $749/mo. PropStream is $99–$699/mo.
          We&apos;re the practice layer that makes both worth the money.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`relative rounded-2xl border p-6 ${
              t.primary
                ? "border-accent/40 bg-gradient-to-b from-accent/[0.08] to-transparent shadow-glow"
                : "border-border bg-surface"
            }`}
          >
            {t.primary && (
              <div className="absolute -top-3 left-6 rounded-full bg-accent px-3 py-0.5 text-[11px] font-semibold text-white">
                Most popular
              </div>
            )}
            <div className="text-sm font-medium">{t.name}</div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-4xl font-semibold">{t.price}</span>
              <span className="text-sm text-muted">{t.cadence}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">{t.blurb}</p>
            <Link
              href={t.href}
              className={`mt-6 inline-flex w-full items-center justify-center ${
                t.primary ? "btn-primary" : "btn-secondary"
              }`}
            >
              {t.cta}
            </Link>
            <ul className="mt-6 space-y-2 text-sm text-slate-700">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Check />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-accent"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
    >
      <path
        d="M5 12l5 5L20 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
