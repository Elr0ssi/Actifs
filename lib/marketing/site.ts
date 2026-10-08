import type { Metadata } from "next";
import { LOCALES, OG_LOCALES, localizePath, type Locale } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

export const SITE_URL = "https://www.flozea.com";
export const SITE_NAME = "Flozea";

export const absolute = (path: string) => `${SITE_URL}${path}`;

/** Adresse d'une page dans une langue (le français n'a pas de préfixe). */
export const localeUrl = (path: string, locale: Locale) => absolute(localizePath(path, locale));

/** Versions d'une même page dans chaque langue, pour les balises hreflang. */
export function languageAlternates(path: string) {
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l.code, localizePath(path, l.code)]));
  languages["x-default"] = localizePath(path, "fr");
  return languages;
}

/** Métadonnées d'une page publique : titre, description, URL canonique, versions par langue et aperçu de partage. */
export function pageMeta({ title, description, path, type = "website", publishedTime, images }: { title: string; description: string; path: string; type?: "website" | "article"; publishedTime?: string; images?: string[] }): Metadata {
  const locale = getLocale();
  const url = localeUrl(path, locale);
  return {
    title,
    description,
    alternates: { canonical: localizePath(path, locale), languages: languageAlternates(path) },
    openGraph: {
      title,
      description,
      url,
      type,
      ...(publishedTime ? { publishedTime } : {}),
      ...(images ? { images } : {}),
      locale: OG_LOCALES[locale],
      alternateLocale: LOCALES.filter((l) => l.code !== locale).map((l) => OG_LOCALES[l.code]),
      siteName: SITE_NAME,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}
