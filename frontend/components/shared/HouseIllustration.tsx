// Procedural front-elevation SVG illustration of a property.
// Deterministic from facadeSeed. Daytime palette suitable for a light UI.

import type { Property } from "@/shared/properties";

const SIDING_PALETTE = [
  ["#F4EBD8", "#D7C6A4"], // cream
  ["#E1EEE8", "#A9C7BD"], // sage
  ["#F0D6B8", "#C5A07B"], // tan
  ["#DDE8F1", "#9CB6CF"], // sky
  ["#F0D1D1", "#C28C8C"], // dusty rose
  ["#E4E4DE", "#A9AAA5"], // stone
  ["#D4E5CB", "#8FAE82"], // moss
  ["#EDDEC6", "#B8987A"], // sand
];

const ROOF_PALETTE = [
  "#5A4035", "#6F4E3E", "#4D3C37", "#7A5B4A",
  "#53483F", "#6A5E53", "#4E4239", "#7A6253",
];

const TRIM_PALETTE = ["#FFFFFF", "#FAF7EE", "#F2EDE0", "#FFFCF3"];

const SKY_PALETTE: [string, string][] = [
  ["#BEE3F8", "#E8F4FA"],
  ["#C7DEF2", "#EAF2FA"],
  ["#D1E7F5", "#F0F7FC"],
];

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}

export default function HouseIllustration({
  property,
  className,
  height = 220,
}: {
  property: Property;
  className?: string;
  height?: number;
}) {
  const r = mulberry32(property.facadeSeed);
  const [siding, sidingShadow] = pick(r, SIDING_PALETTE);
  const roof = pick(r, ROOF_PALETTE);
  const trim = pick(r, TRIM_PALETTE);
  const [skyA, skyB] = pick(r, SKY_PALETTE);
  const isCondo = property.type === "condo";
  const isMulti = property.type === "duplex" || property.type === "triplex";
  const stories = isCondo ? 3 : isMulti ? 2 : r() < 0.25 ? 2 : 1;
  const windowsPerStory = isCondo ? 5 : isMulti ? 4 : r() < 0.5 ? 3 : 2;
  const hasGarage = !isCondo && r() < 0.6;
  const hasChimney = !isCondo && r() < 0.5;
  const treeOnLeft = r() < 0.85;
  const treeOnRight = r() < 0.6;

  const W = 600;
  const H = 360;
  const groundY = 290;
  const id = property.id.replace(/[^a-z0-9]/gi, "");

  const houseW = isCondo ? 380 : isMulti ? 420 : 320;
  const houseX = (W - houseW) / 2 - (hasGarage ? 40 : 0);
  const houseStoryH = 70;
  const houseH = stories * houseStoryH;
  const houseY = groundY - houseH;

  const roofPeak = houseY - 60;
  const roofPath = isCondo
    ? `M ${houseX - 6} ${houseY} L ${houseX + houseW + 6} ${houseY} L ${houseX + houseW + 6} ${houseY - 14} L ${houseX - 6} ${houseY - 14} Z`
    : `M ${houseX - 12} ${houseY} L ${houseX + houseW / 2} ${roofPeak} L ${houseX + houseW + 12} ${houseY} Z`;

  const doorW = 36;
  const doorH = 60;
  const doorX = houseX + houseW / 2 - doorW / 2;
  const doorY = groundY - doorH;
  const doorColor = pick(r, ["#5A8AAE", "#7A5945", "#50506B", "#6A5380", "#3E6653"]);

  const winW = 36;
  const winH = 36;
  const margin = 24;

  function rowWindows(y: number, count: number, includeDoor: boolean) {
    const items: React.ReactNode[] = [];
    const usable = houseW - margin * 2;
    const slots = includeDoor ? count + 1 : count;
    const step = usable / slots;
    let drewDoor = false;
    let idx = 0;
    for (let i = 0; i < slots; i++) {
      const cx = houseX + margin + step * i + step / 2;
      if (includeDoor && !drewDoor && i === Math.floor(slots / 2)) {
        drewDoor = true;
        continue;
      }
      items.push(
        <g key={`w-${y}-${idx}`}>
          <rect x={cx - winW / 2} y={y} width={winW} height={winH} rx="2" fill="#9ED1ED" />
          <rect x={cx - winW / 2} y={y} width={winW} height={winH} rx="2" fill="url(#winShine)" opacity="0.7" />
          <rect x={cx - winW / 2} y={y} width={winW} height={winH} rx="2" fill="none" stroke={trim} strokeWidth="2.5" />
          <line x1={cx} y1={y} x2={cx} y2={y + winH} stroke={trim} strokeWidth="2" />
          <line x1={cx - winW / 2} y1={y + winH / 2} x2={cx + winW / 2} y2={y + winH / 2} stroke={trim} strokeWidth="2" />
        </g>
      );
      idx++;
    }
    return items;
  }

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid slice"
      style={{ width: "100%", height }}
      aria-label={`Illustration of ${property.address}`}
    >
      <defs>
        <linearGradient id={`sky-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyA} />
          <stop offset="100%" stopColor={skyB} />
        </linearGradient>
        <linearGradient id={`siding-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={siding} />
          <stop offset="100%" stopColor={sidingShadow} />
        </linearGradient>
        <linearGradient id="winShine" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`sun-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(255,236,170,1)" />
          <stop offset="100%" stopColor="rgba(255,236,170,0)" />
        </radialGradient>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width={W} height={H} fill={`url(#sky-${id})`} />

      {/* Sun */}
      <circle cx={W * 0.82} cy={H * 0.18} r="50" fill={`url(#sun-${id})`} />
      <circle cx={W * 0.82} cy={H * 0.18} r="18" fill="#FFE8A3" />

      {/* Distant soft clouds */}
      {Array.from({ length: 4 }).map((_, i) => {
        const rr = mulberry32(property.facadeSeed + i + 33);
        const cx = rr() * W;
        const cy = 40 + rr() * 80;
        return (
          <g key={i} opacity="0.7">
            <ellipse cx={cx} cy={cy} rx={22 + rr() * 20} ry="8" fill="#FFFFFF" />
            <ellipse cx={cx + 18} cy={cy + 3} rx={14 + rr() * 10} ry="6" fill="#FFFFFF" />
          </g>
        );
      })}

      {/* Distant tree line silhouette */}
      <path
        d={`M 0 ${groundY} L 60 ${groundY - 26} L 110 ${groundY - 10} L 160 ${groundY - 30} L 220 ${groundY - 16} L 280 ${groundY - 24} L 340 ${groundY - 14} L 410 ${groundY - 28} L 470 ${groundY - 18} L 540 ${groundY - 26} L ${W} ${groundY} Z`}
        fill="#A8C7A0"
        opacity="0.55"
      />

      {/* Lawn */}
      <rect x="0" y={groundY} width={W} height={H - groundY} fill="#9BC58D" />
      <rect x="0" y={groundY} width={W} height="6" fill="rgba(255,255,255,0.12)" />

      {/* Driveway */}
      {hasGarage && (
        <path
          d={`M ${houseX + houseW - 70} ${groundY} L ${houseX + houseW + 70} ${groundY} L ${houseX + houseW + 110} ${H} L ${houseX + houseW - 110} ${H} Z`}
          fill="#B7B0A3"
        />
      )}
      {/* Walkway */}
      <path
        d={`M ${doorX} ${groundY} L ${doorX + doorW} ${groundY} L ${doorX + doorW + 14} ${H} L ${doorX - 14} ${H} Z`}
        fill="#CFC9B5"
      />

      {/* Garage */}
      {hasGarage && (
        <g>
          <rect
            x={houseX + houseW}
            y={groundY - 80}
            width="100"
            height="80"
            fill={`url(#siding-${id})`}
            stroke="rgba(15,23,42,0.12)"
            strokeWidth="1"
          />
          <rect
            x={houseX + houseW + 8}
            y={groundY - 70}
            width="84"
            height="60"
            fill="#D9D2C5"
            stroke={trim}
            strokeWidth="2"
          />
          {[0, 1, 2].map((i) => (
            <line
              key={i}
              x1={houseX + houseW + 8}
              y1={groundY - 70 + 15 * (i + 1)}
              x2={houseX + houseW + 92}
              y2={groundY - 70 + 15 * (i + 1)}
              stroke={trim}
              strokeWidth="1"
              opacity="0.7"
            />
          ))}
        </g>
      )}

      {/* House body */}
      <rect x={houseX} y={houseY} width={houseW} height={houseH} fill={`url(#siding-${id})`} />
      {stories > 1 &&
        Array.from({ length: stories - 1 }).map((_, i) => (
          <line
            key={i}
            x1={houseX}
            y1={houseY + (i + 1) * houseStoryH}
            x2={houseX + houseW}
            y2={houseY + (i + 1) * houseStoryH}
            stroke="rgba(15,23,42,0.12)"
            strokeWidth="2"
          />
        ))}

      {/* Roof */}
      <path d={roofPath} fill={roof} />
      <path d={roofPath} fill="rgba(255,255,255,0.08)" />

      {/* Chimney */}
      {hasChimney && (
        <rect
          x={houseX + houseW * 0.7}
          y={roofPeak + 10}
          width="22"
          height="50"
          fill={roof}
          stroke="rgba(0,0,0,0.25)"
          strokeWidth="1"
        />
      )}

      {/* Windows + door */}
      {Array.from({ length: stories }).map((_, sIdx) => {
        const isBottom = sIdx === stories - 1;
        const y = houseY + sIdx * houseStoryH + 17;
        return <g key={sIdx}>{rowWindows(y, windowsPerStory, isBottom)}</g>;
      })}
      <rect x={doorX} y={doorY} width={doorW} height={doorH} rx="3" fill={doorColor} stroke={trim} strokeWidth="2" />
      <circle cx={doorX + doorW - 8} cy={doorY + doorH / 2} r="1.6" fill={trim} />

      {/* Trees */}
      {treeOnLeft && (
        <g transform={`translate(${houseX - 70}, ${groundY - 10})`}>
          <rect x="-4" y="0" width="8" height="20" fill="#6B4A2B" />
          <circle cx="0" cy="-12" r="34" fill="#5FA063" />
          <circle cx="-12" cy="-22" r="24" fill="#6FB073" />
          <circle cx="14" cy="-26" r="22" fill="#6FB073" />
        </g>
      )}
      {treeOnRight && (
        <g transform={`translate(${houseX + houseW + 110}, ${groundY - 10})`}>
          <rect x="-3" y="0" width="6" height="16" fill="#6B4A2B" />
          <circle cx="0" cy="-10" r="26" fill="#5FA063" />
          <circle cx="-10" cy="-18" r="18" fill="#6FB073" />
          <circle cx="10" cy="-22" r="16" fill="#6FB073" />
        </g>
      )}

      {/* Foreground lawn highlight */}
      <ellipse cx={W / 2} cy={H + 30} rx={W * 0.7} ry="40" fill="rgba(255,255,255,0.10)" />
    </svg>
  );
}
