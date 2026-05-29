import type { MetadataRoute } from "next";
import { PROPERTIES } from "@/shared/properties";
import { SCENARIOS } from "@/shared/scenarios";
import { ARCHETYPES } from "@/shared/onboarding";

const BASE = "https://real-estate-sim-lovat.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, priority: 1.0 },
    { url: `${BASE}/onboarding`, lastModified: now, priority: 0.9 },
    { url: `${BASE}/today`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/beginner`, lastModified: now, priority: 0.8 },
    { url: `${BASE}/market`, lastModified: now, priority: 0.8 },
    { url: `${BASE}/exam`, lastModified: now, priority: 0.7 },
    { url: `${BASE}/dashboard`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/portfolio`, lastModified: now, priority: 0.5 },
    { url: `${BASE}/system`, lastModified: now, priority: 0.3 },
  ];

  for (const a of Object.keys(ARCHETYPES)) {
    pages.push({ url: `${BASE}/result/${a}`, lastModified: now, priority: 0.7 });
  }
  for (const s of SCENARIOS) {
    pages.push({ url: `${BASE}/practice/${s.slug}`, lastModified: now, priority: 0.6 });
  }
  for (const p of PROPERTIES.slice(0, 30)) {
    pages.push({ url: `${BASE}/market/${p.id}`, lastModified: now, priority: 0.4 });
    pages.push({ url: `${BASE}/beginner/${p.id}`, lastModified: now, priority: 0.4 });
  }
  return pages;
}
