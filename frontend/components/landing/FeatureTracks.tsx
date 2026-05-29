import Link from "next/link";

const TRACKS = [
  {
    href: "/#scenarios",
    kicker: "Track 01 · Agent Simulations",
    title: "Live-fire AI conversations.",
    body: "Five agent simulations (more weekly). Claude stays in character with hidden backstory. Sonnet grades rapport, discovery, objections, and close.",
    bullets: ["Real objections", "Fair Housing guardrails", "ELO-style SimScore"],
    accent: "accent",
    cta: "Pick a scenario",
  },
  {
    href: "/market",
    kicker: "Track 02 · Paper Trading",
    title: "Twenty-eight synthetic deals.",
    body: "Tampa-area listings with realistic prices, rents, taxes, insurance, and flood risk. Run 1% rule, 70% rule, cap rate, DSCR, cash-on-cash live as you tune the deal.",
    bullets: ["Strategies: Buy/Hold, House Hack, Flip, BRRRR", "Time-travel portfolio", "$250k starting cash"],
    accent: "accent2",
    cta: "Open the market",
  },
  {
    href: "/exam",
    kicker: "Track 03 · Exam Prep",
    title: "Pass it the first time.",
    body: "Scenario-first practice questions generated on demand. Covers agency, contracts, finance, math, fair housing, valuation. Explanations, not just right/wrong.",
    bullets: ["Mixed difficulty", "1.5M pre-license students/yr", "National pass rate ~61%"],
    accent: "accent",
    cta: "Start a set",
  },
];

export default function FeatureTracks() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-accent">Three tracks</div>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          One sim, the whole career.
        </h2>
        <p className="mt-3 text-slate-600">
          Most tools teach one verb. RealEstateSIM covers the conversation, the
          deal, and the exam — so your first real day isn&apos;t actually your first.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {TRACKS.map((t) => {
          const color = t.accent === "accent" ? "text-accent" : "text-accent2";
          return (
            <Link
              key={t.kicker}
              href={t.href}
              className="card card-hover group relative flex h-full flex-col overflow-hidden p-6"
            >
              <div className={`text-[11px] uppercase tracking-widest ${color}`}>
                {t.kicker}
              </div>
              <h3 className="mt-3 text-xl font-semibold leading-snug group-hover:text-slate-900">
                {t.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{t.body}</p>

              <ul className="mt-4 space-y-1.5 text-xs text-slate-700">
                {t.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full ${
                      t.accent === "accent" ? "bg-accent" : "bg-accent2"
                    }`} />
                    {b}
                  </li>
                ))}
              </ul>

              <div className={`mt-auto pt-6 text-sm font-medium ${color}`}>
                {t.cta} →
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
