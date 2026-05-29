"use client";

// Catches errors in the root layout itself (must render its own <html>/<body>).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          fontFamily: "system-ui, sans-serif",
          background: "#fff",
          color: "#0F172A",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: 0,
        }}
      >
        <div style={{ textAlign: "center", padding: "0 24px", maxWidth: 480 }}>
          <div style={{ fontSize: 12, letterSpacing: "0.24em", textTransform: "uppercase", color: "#64748B" }}>
            Critical error
          </div>
          <h1 style={{ fontSize: 36, margin: "12px 0", fontWeight: 600 }}>
            Estatify hit a snag.
          </h1>
          <p style={{ color: "#475569", marginBottom: 24 }}>
            The whole app failed to load. Refresh to try again.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#2563EB",
              color: "white",
              border: "none",
              borderRadius: 10,
              padding: "12px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  );
}
