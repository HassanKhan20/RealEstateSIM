import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import BeginnerView from "@/frontend/components/feature/BeginnerView";

export const metadata = { title: "Beginner Mode — RealEstateSIM" };

export default function BeginnerPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
            Beginner mode
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
            Real estate, like trading stocks.
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-slate-600">
            Each property is split into 100 shares. No mortgages, no rehab
            spreadsheets — just buy, hold, watch the chart, sell. When you&apos;re
            ready for real financing and strategies, switch to Pro.
          </p>
        </div>
        <BeginnerView />
      </main>
      <Footer />
    </>
  );
}
