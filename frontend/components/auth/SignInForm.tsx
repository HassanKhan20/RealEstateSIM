"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { signInWithCode, isAuthed } from "@/frontend/lib/auth";
import { logEvent } from "@/frontend/lib/analytics";

export default function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const from = params.get("from") || "/onboarding";

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed()) router.replace(from);
  }, [from, router]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const r = signInWithCode(email, name, code);
    if (!r.ok) {
      setError(r.error ?? "Sign-in failed.");
      return;
    }
    logEvent("signed_in", { from });
    router.replace(from.startsWith("/login") ? "/onboarding" : from);
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
        <Link href="/" className="font-display text-xl font-medium text-slate-900">
          Estatify
        </Link>

        <div className="mt-12 max-w-sm">
          <div className="text-[11px] uppercase tracking-[0.28em] text-[#2563EB]">
            Early access
          </div>
          <h1 className="mt-3 font-display text-4xl font-medium leading-tight text-slate-900">
            Enter your invite code.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Estatify is in private beta. Use the access code from your invite to
            get in.
          </p>

          <form onSubmit={submit} className="mt-8 space-y-4">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              />
            </Field>
            <Field label="Name (optional)">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              />
            </Field>
            <Field label="Access code">
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="ESTATIFY"
                required
                className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-slate-900 outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
              />
            </Field>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button type="submit" className="btn-primary w-full">
              Enter Estatify →
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-500">
            Don&apos;t have a code?{" "}
            <Link href="/" className="font-medium text-[#2563EB] hover:underline">
              Join the waitlist
            </Link>
          </p>
        </div>
      </div>

      {/* Right — cinematic panel */}
      <div className="relative hidden overflow-hidden bg-[#0B1620] lg:block">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_60%_25%,rgba(234,178,108,0.30),transparent_70%)]" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <div className="font-display text-6xl font-medium leading-[0.95] text-white/85">
            The deal
            <br />
            before
            <br />
            <span className="italic text-white/55">the deal.</span>
          </div>
          <p className="mt-6 max-w-sm text-sm text-white/60">
            Agent simulations · paper trading · exam prep. Practice everything
            that costs real money to learn — without spending it.
          </p>
        </div>
      </div>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] uppercase tracking-widest text-slate-500">{label}</span>
      {children}
    </label>
  );
}
