import Link from "next/link";

export default function Logo({ size = 20, light = false }: { size?: number; light?: boolean }) {
  const stroke = light ? "#FFFFFF" : "#0F172A";
  const text = light ? "text-white" : "text-slate-900";
  const sub = light ? "text-white/55" : "text-slate-500";
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <path
          d="M3 12 L12 3 L21 12 L21 21 L14 21 L14 14 L10 14 L10 21 L3 21 Z"
          stroke={stroke}
          strokeWidth="1.8"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="12" cy="9" r="1.3" fill="#2563EB" />
      </svg>
      <span className={`font-display text-[17px] font-medium tracking-tight ${text}`}>
        Real Estate <span className={`italic ${sub}`}>SIM</span>
      </span>
    </Link>
  );
}
