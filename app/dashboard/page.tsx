import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import DashboardView from "@/components/DashboardView";

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
