"use client";

import { useEffect } from "react";
import { seedIfEmpty } from "@/lib/demoSeed";

export default function DemoSeed() {
  useEffect(() => {
    seedIfEmpty();
  }, []);
  return null;
}
