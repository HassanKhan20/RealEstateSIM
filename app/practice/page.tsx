import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import ScenarioGrid from "@/frontend/components/feature/ScenarioGrid";

export const metadata = {
  title: "Agent Simulations — Estatify",
  description: "Voice roleplay against AI sellers, buyers, and investors. Graded.",
};

export default function PracticeIndexPage() {
  return (
    <>
      <Nav />
      <main className="pt-4">
        <ScenarioGrid />
      </main>
      <Footer />
    </>
  );
}
