import { ImageResponse } from "next/og";
import { ARCHETYPES, type ArchetypeKey } from "@/shared/onboarding";

export const runtime = "edge";

const SIZE = { width: 1200, height: 630 };

export async function GET(
  _req: Request,
  { params }: { params: { archetype: string } }
) {
  const key = params.archetype as ArchetypeKey;
  const a = ARCHETYPES[key];
  if (!a) {
    return new Response("Not found", { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: `linear-gradient(135deg, #0B1620 0%, #1A2836 100%)`,
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 22,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: 999, background: a.color }} />
          ESTATIFY · INVESTOR ARCHETYPE
        </div>

        {/* The reveal */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 36, color: "rgba(255,255,255,0.55)", marginBottom: 8 }}>I&apos;m a</div>
          <div
            style={{
              fontSize: 200,
              fontWeight: 700,
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              color: a.color,
            }}
          >
            {a.name.replace("The ", "")}
          </div>
          <div style={{ fontSize: 38, fontStyle: "italic", color: "rgba(255,255,255,0.7)", marginTop: 18 }}>
            {a.short}
          </div>
        </div>

        {/* Footer CTA */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "rgba(255,255,255,0.6)",
          }}
        >
          <span>What&apos;s yours? Take the 90-second test →</span>
          <span style={{ color: "white" }}>estatify</span>
        </div>
      </div>
    ),
    SIZE
  );
}
