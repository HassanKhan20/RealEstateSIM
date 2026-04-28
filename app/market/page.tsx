import Link from "next/link";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import MarketBrowser from "@/components/MarketBrowser";
import { PROPERTIES } from "@/lib/properties";

export const metadata = {
  title: "Market — RealEstateSIM",
  description:
    "Browse Tampa-area synthetic listings. Run the numbers before you own them.",
};

export default function MarketPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs uppercase tracking-widest text-accent">
              Market · Tampa, FL
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
              Paper-trade the whole board.
            </h1>
            <p className="mt-3 max-w-2xl text-slate-600">
              Twenty-eight synthetic listings modeled on real neighborhoods.
              Run deal math, buy with fake money, hold or flip, and track your
              returns over simulated years.
            </p>
          </div>
          <Link href="/portfolio" className="btn-secondary">
            View portfolio →
          </Link>
        </div>

        <MarketBrowser properties={PROPERTIES} />
      </main>
      <Footer />
    </>
  );
}
