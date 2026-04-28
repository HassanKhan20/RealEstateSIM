"use client";

import Link from "next/link";
import { useState } from "react";
import type { Property } from "@/lib/properties";
import { fmtMoney } from "@/lib/finance";

// Stylized top-down neighborhood map. Light palette (no hard outlines).

export default function NeighborhoodMap({
  properties,
  height = 360,
  highlight,
  selectable = true,
}: {
  properties: Property[];
  height?: number;
  highlight?: string;
  selectable?: boolean;
}) {
  const [hover, setHover] = useState<Property | null>(null);
  const W = 800;
  const H = 460;

  const blocks: React.ReactNode[] = [];
  const cols = 6;
  const rows = 4;
  const margin = 30;
  const blockW = (W - margin * 2 - (cols - 1) * 24) / cols;
  const blockH = (H - margin * 2 - (rows - 1) * 24) / rows;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      blocks.push(
        <rect
          key={`b-${row}-${col}`}
          x={margin + col * (blockW + 24)}
          y={margin + row * (blockH + 24)}
          width={blockW}
          height={blockH}
          rx="6"
          fill="#EEF2F7"
        />
      );
    }
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ width: "100%", height }}
        className="rounded-2xl"
      >
        <defs>
          <linearGradient id="map-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F6F9FD" />
            <stop offset="100%" stopColor="#EAF1F8" />
          </linearGradient>
          <radialGradient id="map-vignette" cx="50%" cy="50%" r="65%">
            <stop offset="60%" stopColor="rgba(255,255,255,0)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.06)" />
          </radialGradient>
          <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="0.7" fill="rgba(15,23,42,0.06)" />
          </pattern>
          <linearGradient id="river" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#BEDCF0" />
            <stop offset="100%" stopColor="#C9E1F2" />
          </linearGradient>
        </defs>

        <rect width={W} height={H} fill="url(#map-bg)" />
        <rect width={W} height={H} fill="url(#dots)" />

        {/* River */}
        <path
          d={`M 0 ${H * 0.78} C ${W * 0.25} ${H * 0.85}, ${W * 0.55} ${H * 0.6}, ${W * 0.7} ${H * 0.68} S ${W} ${H * 0.5}, ${W} ${H * 0.55} L ${W} ${H} L 0 ${H} Z`}
          fill="url(#river)"
          opacity="0.85"
        />

        {/* Arterial roads */}
        <line x1="0" y1={H * 0.42} x2={W} y2={H * 0.42} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <line x1="0" y1={H * 0.42} x2={W} y2={H * 0.42} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 8" />
        <line x1={W * 0.46} y1="0" x2={W * 0.46} y2={H} stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
        <line x1={W * 0.46} y1="0" x2={W * 0.46} y2={H} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="6 8" />

        {/* Blocks */}
        {blocks}

        {/* Property pins */}
        {properties.map((p) => {
          const cx = p.lng * W;
          const cy = p.lat * H;
          const isHi = highlight === p.id;
          const isHov = hover?.id === p.id;
          const r = isHi || isHov ? 9 : 6;
          const pinFill = isHi
            ? "#2563EB"
            : p.motivation === "high"
              ? "#DC2626"
              : p.motivation === "average"
                ? "#2563EB"
                : "#94A3B8";
          const inner = (
            <g
              transform={`translate(${cx}, ${cy})`}
              style={{ cursor: selectable ? "pointer" : "default" }}
              onMouseEnter={() => selectable && setHover(p)}
              onMouseLeave={() => selectable && setHover(null)}
            >
              <circle r={r + 6} fill={pinFill} opacity="0.15" />
              <circle r={r} fill={pinFill} stroke="#FFFFFF" strokeWidth="2" />
              {(isHi || isHov) && (
                <circle r={r + 12} fill="none" stroke={pinFill} strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" from={r + 6} to={r + 18} dur="1.4s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.6" to="0" dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
          return selectable ? (
            <Link key={p.id} href={`/market/${p.id}`}>
              {inner}
            </Link>
          ) : (
            <g key={p.id}>{inner}</g>
          );
        })}

        {/* Compass */}
        <g transform={`translate(${W - 50}, 40)`}>
          <circle r="18" fill="#FFFFFF" />
          <path d="M 0 -10 L 4 0 L 0 10 L -4 0 Z" fill="#2563EB" />
          <text y="-22" fontSize="9" textAnchor="middle" fill="#64748B" fontFamily="ui-monospace">N</text>
        </g>

        {/* Vignette overlay */}
        <rect width={W} height={H} fill="url(#map-vignette)" />
      </svg>

      {/* Hover tooltip */}
      {hover && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-xl bg-white/95 px-3 py-2 text-xs shadow-lg backdrop-blur"
          style={{
            left: `${hover.lng * 100}%`,
            top: `${hover.lat * 100}%`,
          }}
        >
          <div className="font-medium text-slate-900">{hover.address}</div>
          <div className="text-slate-500">{hover.neighborhood}</div>
          <div className="mt-1 font-mono text-[#2563EB]">{fmtMoney(hover.price)}</div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] text-slate-500">
        <Legend color="#DC2626" label="High motivation" />
        <Legend color="#2563EB" label="Average" />
        <Legend color="#94A3B8" label="Low" />
        <span className="ml-auto font-mono">{properties.length} listings · Tampa metro</span>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
