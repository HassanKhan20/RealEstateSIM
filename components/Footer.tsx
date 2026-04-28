import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="text-xs text-muted">
            Practice the deal before it&apos;s real. Built for wholesalers,
            investors, and new agents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted">
          <a href="#scenarios" className="hover:text-slate-900">Scenarios</a>
          <a href="#how" className="hover:text-slate-900">How it works</a>
          <a href="#pricing" className="hover:text-slate-900">Pricing</a>
          <span>·</span>
          <span>Not legal or financial advice.</span>
        </div>
      </div>
    </footer>
  );
}
