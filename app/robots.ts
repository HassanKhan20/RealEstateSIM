import type { MetadataRoute } from "next";

const BASE = "https://real-estate-sim-lovat.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/dashboard", "/portfolio", "/beginner/p-"],
      },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
