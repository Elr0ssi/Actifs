import { cache } from "react";
import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LANG_COOKIE, isLocale, localeFromAcceptLanguage, translate, type Locale, type Vars } from "@/lib/i18n";
import { en } from "@/lib/i18n/dict/en";
import { es } from "@/lib/i18n/dict/es";
import { de } from "@/lib/i18n/dict/de";
import { siteEn } from "@/lib/i18n/dict/site-en";
import { siteEs } from "@/lib/i18n/dict/site-es";
import { siteDe } from "@/lib/i18n/dict/site-de";
import { recipesEn } from "@/lib/i18n/dict/recipes-en";
import { recipesEs } from "@/lib/i18n/dict/recipes-es";
import { recipesDe } from "@/lib/i18n/dict/recipes-de";
import { contentEn } from "@/lib/i18n/dict/content-en";
import { contentEs } from "@/lib/i18n/dict/content-es";
import { contentDe } from "@/lib/i18n/dict/content-de";

type Dict = Record<string, string> | null;

/** Dictionnaire de l'application (envoyé au navigateur dans /app) : interface + recettes proposées. */
const APP: Record<Locale, Dict> = { fr: null, en: { ...en, ...recipesEn }, es: { ...es, ...recipesEs }, de: { ...de, ...recipesDe } };
/** Dictionnaire du site public : textes d'interface (envoyé au navigateur sur le site). */
const SITE: Record<Locale, Dict> = { fr: null, en: siteEn, es: siteEs, de: siteDe };
/** Tout ensemble, utilisé côté serveur uniquement (les contenus longs — recettes, guides — restent sur le serveur). */
const ALL: Record<Locale, Dict> = {
  fr: null,
  en: { ...en, ...siteEn, ...contentEn },
  es: { ...es, ...siteEs, ...contentEs },
  de: { ...de, ...siteDe, ...contentDe },
};

export const dictFor = (locale: Locale) => APP[locale];
export const siteDictFor = (locale: Locale) => SITE[locale];

/** Langue de la requête en cours pour le site public (venue de l'URL), partagée par tous les composants serveur. */
const requestLocale = cache(() => ({ locale: null as Locale | null }));
export function setRequestLocale(locale: string) {
  if (isLocale(locale)) requestLocale().locale = locale;
}

/** Langue : celle de l'URL sur le site public ; dans l'appli, celle choisie dans les réglages (cookie), sinon celle du navigateur. */
export function getLocale(): Locale {
  const fromUrl = requestLocale().locale;
  if (fromUrl) return fromUrl;
  const v = cookies().get(LANG_COOKIE)?.value;
  if (isLocale(v)) return v;
  try {
    return localeFromAcceptLanguage(headers().get("accept-language"));
  } catch {
    return DEFAULT_LOCALE;
  }
}

/** Fonction de traduction pour les composants serveur et les actions serveur. */
export function getT() {
  const locale = getLocale();
  const dict = ALL[locale];
  return (key: string, vars?: Vars) => translate(dict, key, vars);
}

// Outil de développement : I18N_COLLECT=/chemin/fichier.jsonl note chaque texte sans traduction rencontré pendant le rendu.
if (process.env.I18N_COLLECT) {
  const file = process.env.I18N_COLLECT;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const fs = require("fs") as typeof import("fs");
  (globalThis as { __i18nMiss?: (k: string) => void }).__i18nMiss = (k) => {
    try { fs.appendFileSync(file, JSON.stringify(k) + "\n"); } catch { /* ignore */ }
  };
}
