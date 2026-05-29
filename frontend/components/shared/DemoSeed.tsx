"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { seedIfEmpty } from "@/frontend/lib/demoSeed";

// Paths a user can visit without being forced into onboarding first.
const PUBLIC_PATHS = ["/onboarding", "/system", "/"];

export default function DemoSeed() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    seedIfEmpty();
    // After seeding, decide whether to push the user into /onboarding.
    if (typeof window === "undefined") return;
    const hasOnboarding = !!localStorage.getItem("onboarding-v1");
    if (hasOnboarding) return;
    if (PUBLIC_PATHS.includes(pathname ?? "")) return;
    // Allow ?skipOnboarding=1 escape hatch
    if (window.location.search.includes("skipOnboarding")) return;
    router.replace("/onboarding");
  }, [pathname, router]);

  return null;
}
