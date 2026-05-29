import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import DailyChallenge from "@/frontend/components/feature/DailyChallenge";

export const metadata = {
  title: "Today's Deal — Estatify",
  description: "One real-estate deal, every day. Would you buy, skip, or walk?",
};

export default function TodayPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-6 pb-24 pt-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-[0.24em] text-[#2563EB]">
            Today&apos;s Deal
          </div>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
            Would you buy this?
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600">
            One real-estate deal, every day. Same property for everyone.
            Pick BUY, SKIP, or WALK — then see what an experienced investor
            said and why.
          </p>
        </div>
        <DailyChallenge />
      </main>
      <Footer />
    </>
  );
}
