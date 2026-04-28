import "./globals.css";
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import DemoSeed from "@/components/DemoSeed";

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

export const metadata: Metadata = {
  title: "RealEstateSIM — Practice the deal before it's real",
  description:
    "Flight simulator for real estate. Run agent simulations against AI sellers, buyers, and investors that don't flinch. Get graded. Build your SimScore.",
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
        {children}
      </body>
    </html>
  );
}
