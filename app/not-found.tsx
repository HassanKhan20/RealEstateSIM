import Link from "next/link";
import Nav from "@/frontend/components/shared/Nav";
import Footer from "@/frontend/components/landing/Footer";

export default function NotFound() {
  return (
    <>
      <Nav />
      <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-6 text-center">
        <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
          404 · not found
        </div>
        <h1 className="mt-3 font-display text-5xl font-medium tracking-tight text-slate-900 md:text-6xl">
          That listing doesn&apos;t exist.
        </h1>
        <p className="mt-4 max-w-lg text-slate-600">
          Either the URL is wrong, or this property was sold to someone with
          better instincts. Run a quick scenario to sharpen yours.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn-primary">Back to home</Link>
          <Link href="/market" className="btn-secondary">Browse market</Link>
          <Link href="/#scenarios" className="btn-secondary">Run a scenario</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
