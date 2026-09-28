import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/marketing/recipes";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://actifs.app", lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: "https://actifs.app/recettes", lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    ...RECIPES.map((r) => ({ url: `https://actifs.app/recettes/${r.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 })),
    { url: "https://actifs.app/calculateurs", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://actifs.app/tarifs", lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: "https://actifs.app/login", lastModified: new Date() },
    { url: "https://actifs.app/signup", lastModified: new Date() },
  ];
}
