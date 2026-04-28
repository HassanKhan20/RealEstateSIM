// Deterministic gradient avatar from a string seed.
// Inspired by Vercel/Linear/GitHub identicons.

const GRADIENTS = [
  ["#6EE7B7", "#3B82F6"],
  ["#F472B6", "#7C3AED"],
  ["#FBBF24", "#F97316"],
  ["#22D3EE", "#6366F1"],
  ["#A3E635", "#10B981"],
  ["#F87171", "#7C3AED"],
  ["#7C9CFF", "#34D399"],
  ["#C4B5FD", "#60A5FA"],
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return Math.abs(h);
}

function initials(name: string) {
  const parts = name.split(/[\s—-]+/).filter(Boolean);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

export default function PersonaAvatar({
  name,
  size = 40,
  ring = false,
}: {
  name: string;
  size?: number;
  ring?: boolean;
}) {
  const grad = GRADIENTS[hash(name) % GRADIENTS.length];
  const id = `pa-${hash(name)}`;
  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full ${
        ring ? "ring-2 ring-white/10" : ""
      }`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor={grad[0]} />
            <stop offset="100%" stopColor={grad[1]} />
          </linearGradient>
        </defs>
        <rect width="40" height="40" fill={`url(#${id})`} />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-semibold text-black/80"
        style={{ fontSize: size * 0.38 }}
      >
        {initials(name)}
      </span>
    </div>
  );
}
