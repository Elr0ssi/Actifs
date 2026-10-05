import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/marketing/recipes";
import { GUIDES } from "@/lib/marketing/guides";
import { CATEGORIES, FEATURES } from "@/lib/marketing/features";
import { SITE_URL } from "@/lib/marketing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("", 1, "weekly"),
    page("/fonctionnalites", 0.9),
    ...CATEGORIES.map((c) => page(c.href, 0.9)),
    ...FEATURES.map((f) => page(`/fonctionnalites/${f.slug}`, 0.85)),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.8)),
    page("/recettes", 0.8, "weekly"),
    ...RECIPES.map((r) => page(`/recettes/${r.slug}`, 0.6)),
    page("/tarifs", 0.6),
    page("/login", 0.2),
    page("/signup", 0.5),
  ];
}
