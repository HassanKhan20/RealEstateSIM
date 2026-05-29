import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import SystemView from "@/frontend/components/feature/SystemView";

export const metadata = {
  title: "System — Estatify",
  description:
    "How Estatify is built. Tech stack, modules, data flow, and how to extend.",
};

export default function SystemPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-10">
        <SystemView />
      </main>
      <Footer />
    </>
  );
}
