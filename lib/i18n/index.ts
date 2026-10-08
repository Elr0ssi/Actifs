export type Locale = "fr" | "en" | "es" | "de";

export const LOCALES: { code: Locale; label: string; flag: string; intl: string }[] = [
  { code: "fr", label: "Français", flag: "🇫🇷", intl: "fr-FR" },
  { code: "en", label: "English", flag: "🇬🇧", intl: "en-GB" },
  { code: "es", label: "Español", flag: "🇪🇸", intl: "es-ES" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", intl: "de-DE" },
];

export const LANG_COOKIE = "flozea-lang";
export const DEFAULT_LOCALE: Locale = "fr";

export const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.code === v);

/** Choisit la langue d'après l'en-tête Accept-Language d'un navigateur (première langue prise en charge). */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  for (const part of (header ?? "").split(",")) {
    const code = part.trim().slice(0, 2).toLowerCase();
    if (isLocale(code)) return code;
  }
  return DEFAULT_LOCALE;
}

export type Vars = Record<string, string | number>;

/** Traduit une clé (le texte français d'origine) ; sans traduction, la clé elle-même s'affiche. `{nom}` est remplacé par vars.nom. */
export function translate(dict: Record<string, string> | null | undefined, key: string, vars?: Vars): string {
  if (typeof key !== "string") return key;
  let raw = dict?.[key];
  if (raw === undefined && dict) {
    // Textes à structure fixe (durées, « catégorie · prêt en N min. ») : un seul modèle de traduction pour tous.
    for (const [re, template, names] of PATTERNS) {
      const m = key.match(re);
      if (m && dict[template]) {
        const found: Vars = {};
        names.forEach((n, i) => { found[n] = n === "cat" ? translate(dict, m[i + 1]) : m[i + 1]; });
        return translate(dict, template, found);
      }
    }
    (globalThis as { __i18nMiss?: (k: string) => void }).__i18nMiss?.(key);
  }
  raw ??= key;
  return vars ? raw.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : raw;
}

const PATTERNS: [RegExp, string, string[]][] = [
  [/^(\d+) min$/, "{n} min", ["n"]],
  [/^(.+) · prêt en (\d+) min\.$/, "{cat} · prêt en {n} min.", ["cat", "n"]],
];

// --- Langue courante côté interface : utilisée par les fonctions de date et de format ---
let current: Locale = DEFAULT_LOCALE;
export const getUiLocale = () => current;
export const intlLocale = () => LOCALES.find((l) => l.code === current)?.intl ?? "fr-FR";

/** Tableaux de noms de jours et de mois, modifiés sur place quand la langue change (ils sont importés partout). */
export const DAYS_SHORT_SUN: string[] = [];
export const DAYS_SHORT_MON: string[] = [];
export const MONTHS_LONG: string[] = [];
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

export function setUiLocale(code: Locale) {
  current = code;
  const intl = intlLocale();
  DAYS_SHORT_SUN.length = 0;
  DAYS_SHORT_MON.length = 0;
  MONTHS_LONG.length = 0;
  // 4 janvier 1970 = dimanche
  for (let i = 0; i < 7; i++) DAYS_SHORT_SUN.push(cap(new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(1970, 0, 4 + i))).replace(".", "")));
  for (let i = 0; i < 7; i++) DAYS_SHORT_MON.push(cap(new Intl.DateTimeFormat(intl, { weekday: "short", timeZone: "UTC" }).format(new Date(Date.UTC(1970, 0, 5 + i))).replace(".", "")));
  for (let m = 0; m < 12; m++) MONTHS_LONG.push(cap(new Intl.DateTimeFormat(intl, { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(2020, m, 1)))));
}
setUiLocale(DEFAULT_LOCALE);

// --- Adresses du site public : le français n'a pas de préfixe, les autres langues ont /en, /es, /de ---
/** Pages qui ne dépendent pas de la langue de l'URL (la langue vient alors du cookie). */
const UNPREFIXED = /^\/(app|login|signup|api|auth|_next)(\/|$|\?|#)/;

/** Adresse d'une page publique dans la langue donnée (`/tarifs` → `/en/tarifs`). Les liens externes, ancres et pages de l'appli restent inchangés. */
export function localizePath(href: string, locale: Locale): string {
  if (!href.startsWith("/") || href.startsWith("//") || UNPREFIXED.test(href)) return href;
  if (locale === DEFAULT_LOCALE) return href;
  if (href === "/") return `/${locale}`;
  return `/${locale}${href}`;
}

/** Retire le préfixe de langue d'une adresse (`/en/tarifs` → `/tarifs`) et renvoie la langue trouvée, le cas échéant. */
export function splitLocalePath(pathname: string): { locale: Locale | null; path: string } {
  const m = pathname.match(/^\/(fr|en|es|de)(\/.*)?$/);
  if (!m) return { locale: null, path: pathname || "/" };
  return { locale: m[1] as Locale, path: m[2] || "/" };
}

export const OG_LOCALES: Record<Locale, string> = { fr: "fr_FR", en: "en_GB", es: "es_ES", de: "de_DE" };

/** Code de langue complet (fr-FR, en-GB…) pour les données structurées et les formats. */
export const intlOf = (locale: Locale) => LOCALES.find((l) => l.code === locale)?.intl ?? "fr-FR";

/** Met en minuscules un mot au milieu d'une phrase, sauf en allemand où les noms gardent leur majuscule. */
export const lowerFor = (locale: Locale, s: string) => (locale === "de" ? s : s.toLowerCase());
