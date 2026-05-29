import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import PortfolioView from "@/frontend/components/feature/PortfolioView";

export const metadata = { title: "Portfolio — RealEstateSIM" };

export default function PortfolioPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <PortfolioView />
      </main>
      <Footer />
    </>
  );
}
