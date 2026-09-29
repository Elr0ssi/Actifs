import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "All In",
    short_name: "All In",
    description: "Tâches, routines, courses et finances dans un seul espace.",
    start_url: "/app",
    display: "standalone",
    background_color: "#f7f3ee",
    theme_color: "#f7f3ee",
    lang: "fr",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" }],
  };
}
