import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { ClickRipple } from "@/components/ui/click-ripple";
import { I18nProvider } from "@/components/i18n/provider";
import { OG_LOCALES } from "@/lib/i18n";
import { getLocale, getT, siteDictFor } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/marketing/site";
import "../globals.css";

export function generateMetadata(): Metadata {
  const tr = getT();
  const title = tr("Flozea — Agenda, tâches, courses, recettes, budget et notes");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | Flozea" },
    description: tr("Flozea regroupe agenda, tâches, routines, listes de courses, recettes, budget et notes dans un seul espace, seul ou à deux. Gratuit."),
    openGraph: { title, type: "website", siteName: "Flozea", locale: OG_LOCALES[getLocale()] },
    appleWebApp: { capable: true, title: "Flozea", statusBarStyle: "default" },
  };
}
export const viewport: Viewport = { themeColor: "#f5f5f7", viewportFit: "cover" };

/** Mise en page racine de l'appli et de la connexion : langue choisie dans les réglages (cookie) ou celle du navigateur. */
export default function MainLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocale();
  return (
    <html lang={locale} className={GeistSans.variable}>
      <body>
        <I18nProvider locale={locale} dict={siteDictFor(locale)}>
          {children}
          <CookieNotice />
        </I18nProvider>
        <ClickRipple />
        <Analytics />
      </body>
    </html>
  );
}
