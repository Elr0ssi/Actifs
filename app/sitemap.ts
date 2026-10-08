import type { MetadataRoute } from "next";
import { RECIPES } from "@/lib/marketing/recipes";
import { GUIDES } from "@/lib/marketing/guides";
import { CATEGORIES, FEATURES } from "@/lib/marketing/features";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL, localeUrl } from "@/lib/marketing/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  // Chaque page est listée dans les quatre langues, avec ses versions équivalentes (hreflang).
  const page = (path: string, priority: number, changeFrequency: "weekly" | "monthly" = "monthly") =>
    LOCALES.map((l) => ({
      url: localeUrl(path, l.code),
      lastModified: now,
      changeFrequency,
      priority,
      alternates: { languages: { ...Object.fromEntries(LOCALES.map((o) => [o.code, localeUrl(path, o.code)])), "x-default": localeUrl(path, "fr") } },
    }));
  const single = (path: string, priority: number) => ({ url: `${SITE_URL}${path}`, lastModified: now, changeFrequency: "monthly" as const, priority });
  return [
    ...page("/", 1, "weekly"),
    ...page("/fonctionnalites", 0.9),
    ...CATEGORIES.flatMap((c) => page(c.href, 0.9)),
    ...FEATURES.flatMap((f) => page(`/fonctionnalites/${f.slug}`, 0.85)),
    ...GUIDES.flatMap((g) => page(`/guides/${g.slug}`, 0.8)),
    ...page("/recettes", 0.8, "weekly"),
    ...RECIPES.flatMap((r) => page(`/recettes/${r.slug}`, 0.6)),
    ...page("/tarifs", 0.6),
    ...page("/confidentialite", 0.3),
    ...page("/cgu", 0.3),
    ...page("/mentions-legales", 0.3),
    single("/login", 0.2),
    single("/signup", 0.5),
  ];
}
