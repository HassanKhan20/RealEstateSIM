"use client";

import { useState } from "react";
import type { PricePoint } from "@/lib/marketHistory";

type Props = {
  history: PricePoint[];
  projection?: PricePoint[];
  height?: number;
};

export default function PriceChart({ history, projection = [], height = 240 }: Props) {
  const all = [...history, ...projection];
  const [hover, setHover] = useState<PricePoint | null>(null);
  if (!all.length) return null;

  const W = 800;
  const H = height;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 28;

  const xs = all.map((p) => p.t);
  const ys = all.map((p) => p.price);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys) * 0.98;
  const maxY = Math.max(...ys) * 1.02;
  const sx = (x: number) => padL + ((x - minX) / (maxX - minX || 1)) * (W - padL - padR);
  const sy = (y: number) => H - padB - ((y - minY) / (maxY - minY || 1)) * (H - padT - padB);

  const histD = history.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.t).toFixed(2)} ${sy(p.price).toFixed(2)}`).join(" ");
  const areaD = `${histD} L ${sx(history[history.length - 1].t).toFixed(2)} ${H - padB} L ${sx(history[0].t).toFixed(2)} ${H - padB} Z`;
  const projD = projection.length
    ? projection.map((p, i) => `${i === 0 ? "M" : "L"} ${sx(p.t).toFixed(2)} ${sy(p.price).toFixed(2)}`).join(" ")
    : "";

  const isUp = history[history.length - 1].price >= history[0].price;
  const stroke = isUp ? "#10B981" : "#DC2626";
  const areaFill = isUp ? "url(#area-up)" : "url(#area-dn)";

  // Y-axis ticks
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => minY + ((maxY - minY) * i) / yTicks);

  // X-axis labels
  const today = history[history.length - 1].t;
  const xLabels = [
    { t: history[0].t, label: fmtRelDays(today, history[0].t) },
    { t: today, label: "today" },
    ...(projection.length ? [{ t: projection[projection.length - 1].t, label: fmtFwd(projection[projection.length - 1].t, today) }] : []),
  ];

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = (e.currentTarget as any).getBoundingClientRect();
    const localX = ((e.clientX - rect.left) / rect.width) * W;
    const t = minX + ((localX - padL) / (W - padL - padR)) * (maxX - minX);
    let nearest = all[0];
    let best = Infinity;
    for (const p of all) {
      const d = Math.abs(p.t - t);
      if (d < best) { best = d; nearest = p; }
    }
    setHover(nearest);
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: H }}
        onMouseMove={onMove}
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id="area-up" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="area-dn" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#DC2626" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#DC2626" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Y grid lines + labels */}
        {tickValues.map((v, i) => (
          <g key={i}>
            <line
              x1={padL}
              x2={W - padR}
              y1={sy(v)}
              y2={sy(v)}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="3 4"
            />
            <text
              x={padL - 8}
              y={sy(v) + 3}
              textAnchor="end"
              fontSize="10"
              fill="#94A3B8"
              fontFamily="ui-monospace"
            >
              ${shortMoney(v)}
            </text>
          </g>
        ))}

        {/* Area under historical line */}
        <path d={areaD} fill={areaFill} />

        {/* Historical line */}
        <path d={histD} fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Projection (dashed) */}
        {projD && (
          <path d={projD} fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 4" opacity="0.55" />
        )}

        {/* "Today" divider */}
        {projection.length > 0 && (
          <line x1={sx(today)} x2={sx(today)} y1={padT} y2={H - padB} stroke="#CBD5E1" strokeWidth="1" strokeDasharray="2 3" />
        )}

        {/* X labels */}
        {xLabels.map((l, i) => (
          <text
            key={i}
            x={sx(l.t)}
            y={H - 10}
            textAnchor={i === 0 ? "start" : i === xLabels.length - 1 ? "end" : "middle"}
            fontSize="10"
            fill="#94A3B8"
            fontFamily="ui-monospace"
          >
            {l.label}
          </text>
        ))}

        {/* Hover marker */}
        {hover && (
          <g>
            <line x1={sx(hover.t)} x2={sx(hover.t)} y1={padT} y2={H - padB} stroke="#0F172A" strokeWidth="0.5" opacity="0.4" />
            <circle cx={sx(hover.t)} cy={sy(hover.price)} r="4" fill="white" stroke={stroke} strokeWidth="2" />
          </g>
        )}
      </svg>

      {hover && (
        <div className="pointer-events-none absolute top-2 right-3 rounded-lg bg-white px-3 py-1.5 text-xs shadow-md ring-1 ring-slate-200">
          <div className="font-mono text-[11px] text-slate-500">
            {new Date(hover.t).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })}
          </div>
          <div className="font-mono text-sm font-semibold text-slate-900">
            ${hover.price.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}

function shortMoney(v: number) {
  if (v >= 1000) return (v / 1000).toFixed(1) + "k";
  return Math.round(v).toString();
}

function fmtRelDays(today: number, t: number) {
  const days = Math.round((today - t) / (24 * 60 * 60 * 1000));
  if (days >= 30) return `${Math.round(days / 30)}mo ago`;
  return `${days}d ago`;
}

function fmtFwd(t: number, today: number) {
  const days = Math.round((t - today) / (24 * 60 * 60 * 1000));
  if (days >= 30) return `+${Math.round(days / 30)}mo`;
  return `+${days}d`;
}
