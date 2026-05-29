import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Estatify — Practice the deal before it's real",
    short_name: "Estatify",
    description:
      "A flight simulator for real estate. Run AI agent simulations, paper-trade real listings, and pass the exam.",
    start_url: "/",
    display: "standalone",
    background_color: "#0B1620",
    theme_color: "#0B1620",
    icons: [
      { src: "/favicon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
    categories: ["education", "finance", "productivity"],
  };
}
