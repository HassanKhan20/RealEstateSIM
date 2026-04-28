import Image from "next/image";
import Link from "next/link";

export default function SplitStatement() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          {/* Left — floating image, no frame */}
          <div className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-[24px] shadow-[0_30px_60px_-20px_rgba(15,23,42,0.30),0_12px_24px_-10px_rgba(15,23,42,0.18)]">
              <Image
                src="/landing/hero-3.png"
                alt="Traditional Tampa home"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
            {/* Circular "eye" accent like the reference */}
            <div className="absolute -right-2 top-8 hidden h-20 w-20 items-center justify-center rounded-full bg-white/90 shadow-md ring-1 ring-slate-200 md:flex">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="1.5">
                <circle cx="12" cy="12" r="9" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </div>
          </div>

          {/* Right — statement */}
          <div>
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              The case for practice
            </div>
            <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-slate-900 md:text-6xl">
              Your first real deal
              <br />
              <span className="italic text-[#6A7A4C]">shouldn&apos;t feel</span>
              <br />
              like your first.
            </h2>
            <p className="mt-6 max-w-lg text-slate-600">
              Most agents learn by losing real commissions. Most investors learn
              by losing real money. You deserve a place to fumble the cold call,
              miscalculate the cap rate, and miss the close — without anyone
              signing anything.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/#scenarios" className="btn-primary">
                Run a free scenario
              </Link>
              <Link href="/market" className="btn-secondary">
                Tour the market
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-6 border-t border-slate-200 pt-8 text-sm sm:grid-cols-3">
              <div>
                <div className="font-display text-2xl font-medium text-slate-900">5 scenarios</div>
                <div className="mt-1 text-xs text-slate-500">Seller, buyer, investor, FSBO, panic</div>
              </div>
              <div>
                <div className="font-display text-2xl font-medium text-slate-900">4 strategies</div>
                <div className="mt-1 text-xs text-slate-500">Buy/Hold, Flip, House-Hack, BRRRR</div>
              </div>
              <div>
                <div className="font-display text-2xl font-medium text-slate-900">9 exam topics</div>
                <div className="mt-1 text-xs text-slate-500">AI-generated practice questions</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
