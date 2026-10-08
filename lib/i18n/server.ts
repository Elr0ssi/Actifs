import { cookies, headers } from "next/headers";
import { DEFAULT_LOCALE, LANG_COOKIE, isLocale, localeFromAcceptLanguage, translate, type Locale, type Vars } from "@/lib/i18n";
import { en } from "@/lib/i18n/dict/en";
import { es } from "@/lib/i18n/dict/es";
import { de } from "@/lib/i18n/dict/de";

const DICTS: Record<Locale, Record<string, string> | null> = { fr: null, en, es, de };

export const dictFor = (locale: Locale) => DICTS[locale];

/** Langue choisie dans les réglages (cookie) ; à défaut, celle du navigateur ; sinon le français. */
export function getLocale(): Locale {
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
  const dict = DICTS[locale];
  return (key: string, vars?: Vars) => translate(dict, key, vars);
}
