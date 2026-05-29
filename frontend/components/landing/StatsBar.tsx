export default function StatsBar() {
  return (
    <section className="border-y border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-6 py-6 text-sm text-muted">
        <span className="text-xs uppercase tracking-widest">
          Built for the people the industry leaves to drown
        </span>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-xs">
          <Logo>1.5M+ pre-license students/yr</Logo>
          <Logo>300K new agents licensed/yr</Logo>
          <Logo>~75% quit in year one</Logo>
          <Logo>$300–1k/mo spent on tools, no training</Logo>
        </div>
      </div>
    </section>
  );
}

function Logo({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="inline-block h-1 w-1 rounded-full bg-accent" />
      <span>{children}</span>
    </div>
  );
}
