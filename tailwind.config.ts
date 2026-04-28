import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Semantic tokens — keep same names so existing class usage keeps working.
        // "ink" now = page background (white), "surface" = white cards, etc.
        ink: "#FFFFFF",
        surface: "#FFFFFF",
        surface2: "#F7F8FA",
        border: "#E5E7EB",
        muted: "#64748B",
        // Brand
        accent: "#2563EB",   // primary blue (CTA, links)
        accent2: "#0F766E",  // teal — used for secondary good-news tones
        heading: "#0F172A",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(37,99,235,0.08), transparent 70%), radial-gradient(ellipse 60% 40% at 80% 30%, rgba(14,165,233,0.06), transparent 60%)",
        "card-grad":
          "linear-gradient(180deg, rgba(15,23,42,0.02) 0%, rgba(15,23,42,0) 100%)",
      },
      boxShadow: {
        ring: "inset 0 0 0 1px rgba(15,23,42,0.05)",
        ringHover: "inset 0 0 0 1px rgba(37,99,235,0.30)",
        glow: "0 0 0 1px rgba(15,23,42,0.05), 0 12px 32px -14px rgba(37,99,235,0.25)",
        lift: "0 1px 3px rgba(15,23,42,0.08), 0 10px 22px -12px rgba(15,23,42,0.18)",
        card: "0 1px 2px rgba(15,23,42,0.04)",
      },
      keyframes: {
        pulseSoft: {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        floatY: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-4px)" },
        },
      },
      animation: {
        pulseSoft: "pulseSoft 1.6s ease-in-out infinite",
        floatY: "floatY 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
