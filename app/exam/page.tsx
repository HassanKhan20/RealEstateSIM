import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import ExamTrainer from "@/frontend/components/feature/ExamTrainer";

export const metadata = { title: "Exam Prep — RealEstateSIM" };

const TOPICS = [
  "Agency and fiduciary duties",
  "Contracts and contract law",
  "Property ownership and types of estates",
  "Real estate finance and mortgages",
  "Real estate math (commissions, prorations, LTV, taxes)",
  "Fair Housing and federal regulations",
  "Listings, disclosures, and MLS",
  "Escrow, title, and closing procedures",
  "Valuation and appraisal",
];

export default function ExamPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-6 pb-24 pt-10">
        <div className="mb-8">
          <div className="text-xs uppercase tracking-widest text-accent">Exam Prep</div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
            Pass it the first time.
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            National first-time pass rates hover around 61%. California is closer
            to 45%. Questions below are AI-generated from the real exam outline —
            scenario-first, with explanations.
          </p>
        </div>
        <ExamTrainer topics={TOPICS} />
      </main>
      <Footer />
    </>
  );
}
