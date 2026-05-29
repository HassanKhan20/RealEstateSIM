"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Logo from "./Logo";
import { getProgress, getSimScore } from "@/frontend/lib/store";
import { levelForXp } from "@/shared/levels";
import { getUser, signOut } from "@/frontend/lib/auth";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/beginner", label: "Beginner" },
  { href: "/market", label: "Market" },
  { href: "/practice", label: "Agent Sims" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/exam", label: "Exam" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Nav() {
  const [rating, setRating] = useState<number | null>(null);
  const [levelNum, setLevelNum] = useState<number | null>(null);
  const [levelName, setLevelName] = useState<string>("");
  const [userName, setUserName] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const refresh = () => {
      setRating(getSimScore());
      const lvl = levelForXp(getProgress().xp);
      setLevelNum(lvl.num);
      setLevelName(lvl.name);
      setUserName(getUser()?.name ?? null);
    };
    refresh();
    const onStorage = () => refresh();
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
        scrolled ? "border-b border-slate-200/70 bg-white/85 backdrop-blur-md" : "bg-white"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Logo />
        <nav className="hidden items-center gap-7 text-[13px] text-slate-600 md:flex">
          {LINKS.map((l) => {
            const active = pathname?.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`transition hover:text-slate-900 ${active ? "text-slate-900" : ""}`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          {levelNum !== null && (
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-white sm:flex"
              title={`${levelName} · dashboard`}
            >
              L{levelNum} <span className="font-normal opacity-80">{levelName}</span>
            </Link>
          )}
          {rating !== null && (
            <Link
              href="/dashboard"
              className="hidden items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-xs transition hover:bg-white md:flex"
            >
              <span className="text-slate-500">Sim</span>
              <span className="font-semibold text-[#2563EB]">{rating}</span>
            </Link>
          )}
          <button
            onClick={() => {
              signOut();
              router.replace("/");
            }}
            className="rounded-full px-3 py-2 text-[12px] font-medium text-slate-500 transition hover:text-slate-900"
            title={userName ? `Signed in as ${userName}` : "Sign out"}
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
