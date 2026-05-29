const STEPS = [
  {
    n: "01",
    title: "Pick a scenario",
    body: "Motivated sellers, cash buyers, FSBOs, lowball investors, panicked first-time buyers. Five live, more every week.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="4" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="10" width="18" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="16" width="12" height="4" rx="1" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    n: "02",
    title: "Run the conversation",
    body: "AI character stays in persona. Hidden backstory. Real objections. Curveballs. Built-in Fair Housing guardrails.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M21 12a8 8 0 1 1-3.5-6.6L21 4v5h-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    n: "03",
    title: "Get graded · climb your SimScore",
    body: "Sonnet grades rapport, discovery, objection handling, close. Specific feedback. ELO-style rating goes up or down.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 17l5-5 4 4 9-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M14 7h7v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-12 max-w-2xl">
        <div className="text-xs uppercase tracking-widest text-accent">How it works</div>
        <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight text-slate-900 md:text-5xl">
          Three steps. Hundreds of reps.
        </h2>
        <p className="mt-3 text-slate-600">
          Less talk, more practice. Every session is 3–7 minutes — short on
          purpose, so you do it daily.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="card card-hover relative overflow-hidden p-6"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-muted">{s.n}</span>
              <span className="text-accent">{s.icon}</span>
            </div>
            <h3 className="mt-6 text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.body}</p>
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
