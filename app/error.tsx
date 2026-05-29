"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Hook point for error reporting (Sentry, etc.)
    // eslint-disable-next-line no-console
    console.error("Route error:", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
      <div className="font-mono text-xs uppercase tracking-[0.24em] text-slate-500">
        Something broke
      </div>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight text-slate-900 md:text-5xl">
        That deal fell through.
      </h1>
      <p className="mt-4 max-w-md text-slate-600">
        We hit an unexpected error rendering this page. Your progress is saved.
        Try again, or head back home.
      </p>
      {error?.digest && (
        <code className="mt-4 rounded bg-slate-100 px-3 py-1 font-mono text-xs text-slate-500">
          ref: {error.digest}
        </code>
      )}
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn-primary">
          Try again
        </button>
        <Link href="/" className="btn-secondary">
          Back home
        </Link>
      </div>
    </main>
  );
}
