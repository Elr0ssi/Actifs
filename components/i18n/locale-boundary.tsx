import { dictFor, getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/i18n/provider";

/** Fournit la langue aux composants clients d'une page serveur (connexion, inscription, appli). */
export function LocaleBoundary({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return <I18nProvider locale={locale} dict={dictFor(locale)}>{children}</I18nProvider>;
}
