import Link from "next/link";
import { notFound } from "next/navigation";
import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";
import BeginnerProperty from "@/frontend/components/feature/BeginnerProperty";
import { getProperty, PROPERTIES } from "@/shared/properties";

export function generateStaticParams() {
  return PROPERTIES.map((p) => ({ id: p.id }));
}

export default function BeginnerPropertyPage({ params }: { params: { id: string } }) {
  const property = getProperty(params.id);
  if (!property) notFound();

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-6 pb-20 pt-8">
        <div className="mb-4 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/beginner" className="hover:text-slate-900">Beginner</Link>
          <span>·</span>
          <span>{property.neighborhood}</span>
        </div>
        <BeginnerProperty property={property} />
      </main>
      <Footer />
    </>
  );
}
