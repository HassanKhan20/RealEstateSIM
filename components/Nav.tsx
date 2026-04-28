"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import { getSimScore } from "@/lib/store";

const LINKS = [
  { href: "/beginner", label: "Beginner" },
  { href: "/market", label: "Market" },
  { href: "/#scenarios", label: "Agent Sims" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/exam", label: "Exam" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const [rating, setRating] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const onDarkHero = isHome && !scrolled;

  useEffect(() => {
    setRating(getSimScore());
    const onStorage = () => setRating(getSimScore());
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("storage", onStorage);
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        onDarkHero
          ? "bg-transparent"
          : scrolled
            ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-md"
            : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo light={onDarkHero} />
        <nav
          className={`hidden items-center gap-8 text-[13px] md:flex ${
            onDarkHero ? "text-white/75" : "text-slate-600"
          }`}
        >
          {LINKS.map((l) => {
            const active =
              l.href === "/#scenarios"
                ? pathname === "/"
                : pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition ${
                  onDarkHero ? "hover:text-white" : "hover:text-slate-900"
                } ${active && !onDarkHero ? "text-slate-900" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          {rating !== null && !onDarkHero && (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs transition hover:bg-white sm:flex"
            >
              <span className="text-slate-500">SimScore</span>
              <span className="font-semibold text-[#2563EB]">{rating}</span>
            </Link>
          )}
          <Link
            href="/#scenarios"
            className={`rounded-full px-4 py-2 text-[12px] font-semibold transition ${
              onDarkHero
                ? "bg-white text-slate-900 hover:bg-slate-200"
                : "bg-slate-900 text-white hover:bg-slate-800"
            }`}
          >
            {onDarkHero ? "Contact" : "Get started"}
          </Link>
        </div>
      </div>
    </header>
  );
}
