import type { PricePoint } from "@/lib/marketHistory";

export default function Sparkline({
  points,
  width = 120,
  height = 36,
  positive,
}: {
  points: PricePoint[];
  width?: number;
  height?: number;
  positive?: boolean;
}) {
  if (!points.length) return null;
  const pad = 2;
  const xs = points.map((p) => p.t);
  const ys = points.map((p) => p.price);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const dx = maxX - minX || 1;
  const dy = maxY - minY || 1;
  const scaleX = (x: number) => pad + ((x - minX) / dx) * (width - pad * 2);
  const scaleY = (y: number) => height - pad - ((y - minY) / dy) * (height - pad * 2);

  const isUp = positive ?? ys[ys.length - 1] >= ys[0];
  const stroke = isUp ? "#10B981" : "#DC2626";
  const fill = isUp ? "rgba(16,185,129,0.10)" : "rgba(220,38,38,0.10)";

  const lineD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${scaleX(p.t).toFixed(2)} ${scaleY(p.price).toFixed(2)}`).join(" ");
  const areaD = `${lineD} L ${scaleX(maxX).toFixed(2)} ${height - pad} L ${scaleX(minX).toFixed(2)} ${height - pad} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="block">
      <path d={areaD} fill={fill} />
      <path d={lineD} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
