"use client";

import { usePathname } from "next/navigation";
import { useLocale, useT } from "@/components/i18n/provider";
import { Flag } from "@/components/ui/flag";
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

/** Menu de langue de l'en-tête : le drapeau de la langue courante, et les autres drapeaux en dessous (liens classiques pour recharger la page dans la bonne langue). */
export function LanguageMenu() {
  const tr = useT();
  const locale = useLocale();
  const href = useSwitchHref();
  return (
    <details className="group relative">
      <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-line bg-surface transition hover:border-stone-300" aria-label={tr("Langue")}>
        <Flag code={locale} className="h-6 w-6" />
      </summary>
      <ul className="absolute right-0 top-full z-50 mt-2 rounded-2xl border border-line bg-surface p-1.5 shadow-lift">
        {LOCALES.map((l) => (
          <li key={l.code}>
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href={href(l.code)}
              hrefLang={l.code}
              lang={l.code}
              title={l.label}
              aria-label={l.label}
              onClick={() => remember(l.code)}
              className={cx("flex h-10 w-10 items-center justify-center rounded-xl transition hover:bg-stone-100", l.code === locale && "bg-brand-50 ring-1 ring-brand-300")}
            >
              <Flag code={l.code} className="h-6 w-6" />
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

/** Drapeaux en pied de page. */
export function LanguageLinks({ className }: { className?: string }) {
  const locale = useLocale();
  const href = useSwitchHref();
  return (
    <ul className={cx("flex items-center gap-2", className)}>
      {LOCALES.map((l) => (
        <li key={l.code}>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href={href(l.code)} hrefLang={l.code} lang={l.code} title={l.label} aria-label={l.label} onClick={() => remember(l.code)} className={cx("block rounded-full p-0.5 transition hover:scale-110", l.code === locale ? "ring-2 ring-brand-400" : "opacity-70 hover:opacity-100")}>
            <Flag code={l.code} className="h-6 w-6" />
          </a>
        </li>
      ))}
    </ul>
  );
}
