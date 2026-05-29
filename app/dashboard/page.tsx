import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import DashboardView from "@/frontend/components/feature/DashboardView";

export const metadata = { title: "Dashboard — RealEstateSIM" };

export default function DashboardPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <DashboardView />
      </main>
      <Footer />
    </>
  );
}
