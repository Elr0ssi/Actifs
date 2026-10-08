"use client";

import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/components/i18n/provider";
import { LANG_COOKIE, LOCALES, localizePath, splitLocalePath, type Locale } from "@/lib/i18n";
import { cx } from "@/lib/utils";

/** Mémorise le choix avant de charger la page dans l'autre langue (c'est aussi la langue de l'appli). */
const remember = (code: Locale) => {
  try { document.cookie = `${LANG_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`; } catch { /* cookies bloqués */ }
};

/** Adresse de la même page dans une autre langue. */
function useSwitchHref() {
  const pathname = usePathname() || "/";
  const { path } = splitLocalePath(pathname);
  return (code: Locale) => localizePath(path, code);
}

/** Menu de langue de l'en-tête : la même page, dans la langue choisie (liens classiques pour que la page se recharge dans la bonne langue). */
export function LanguageMenu() {
  const tr = useT();
  const locale = useLocale();
  const href = useSwitchHref();
  const current = LOCALES.find((l) => l.code === locale) ?? LOCALES[0];
  return (
    <details className="group relative">
      <summary className="flex h-10 cursor-pointer list-none items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 text-sm font-semibold text-stone-700 hover:text-stone-900" aria-label={tr("Langue")}>
        <span aria-hidden>{current.flag}</span>
        <span className="hidden uppercase sm:inline">{current.code}</span>
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-2 w-40 rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
        {LOCALES.map((l) => (
          <li key={l.code}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href={href(l.code)}
              hrefLang={l.code}
              lang={l.code}
              onClick={() => remember(l.code)}
              className={cx("flex items-center gap-2 rounded-xl px-2.5 py-2 text-sm hover:bg-stone-50", l.code === locale ? "font-semibold text-brand-700" : "text-stone-700")}
            >
              <span aria-hidden>{l.flag}</span>
              {l.label}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Liste des langues en pied de page. */
export function LanguageLinks({ className }: { className?: string }) {
  const locale = useLocale();
  const href = useSwitchHref();
  return (
    <ul className={cx("flex flex-wrap gap-x-5 gap-y-2", className)}>
      {LOCALES.map((l) => (
        <li key={l.code}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href={href(l.code)} hrefLang={l.code} lang={l.code} onClick={() => remember(l.code)} className={cx("hover:text-stone-900", l.code === locale && "font-semibold text-stone-800")}>
            {l.flag} {l.label}
          </a>
        </li>
      ))}
    </ul>
  );
}
