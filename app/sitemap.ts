import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/marketing/recipes";
import { GUIDES } from "@/lib/marketing/guides";
import { SITE_URL } from "@/lib/marketing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency, priority });
  return [
    page("", 1, "weekly"),
    page("/outils", 0.9),
    page("/outils/budget-mensuel", 0.9),
    page("/outils/liste-de-courses", 0.9),
    page("/outils/suivi-habitudes", 0.9),
    page("/calculateurs", 0.8),
    page("/guides", 0.8, "weekly"),
    ...GUIDES.map((g) => page(`/guides/${g.slug}`, 0.8)),
    page("/recettes", 0.8, "weekly"),
    ...RECIPES.map((r) => page(`/recettes/${r.slug}`, 0.6)),
    page("/tarifs", 0.6),
    page("/login", 0.2),
    page("/signup", 0.5),
  ];
}
