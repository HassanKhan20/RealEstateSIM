import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import PortfolioView from "@/components/PortfolioView";

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
