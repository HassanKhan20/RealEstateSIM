import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import DemoSeed from "@/frontend/components/shared/DemoSeed";
import AuthGate from "@/frontend/components/auth/AuthGate";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const TITLE = "Estatify — Practice the deal before it's real";
const DESC =
  "A flight simulator for real estate. Run AI agent simulations, paper-trade real listings, and pass the exam — without anyone signing anything.";

export const metadata: Metadata = {
  metadataBase: new URL("https://real-estate-sim-lovat.vercel.app"),
  title: {
    default: TITLE,
    template: "%s · Estatify",
  },
  description: DESC,
  applicationName: "Estatify",
  keywords: [
    "real estate practice",
    "real estate simulator",
    "real estate license",
    "agent training",
    "paper trading",
    "real estate AI",
    "real estate exam prep",
  ],
  authors: [{ name: "Hassan Khan" }],
  openGraph: {
    type: "website",
    title: TITLE,
    description: DESC,
    siteName: "Estatify",
    images: [
      { url: "/landing/hero-1.png", width: 1200, height: 630, alt: "Estatify" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
    images: ["/landing/hero-1.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen font-sans antialiased">
        <DemoSeed />
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
