import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/next";
import { CookieNotice } from "@/components/ui/cookie-notice";
import { ClickRipple } from "@/components/ui/click-ripple";
import { I18nProvider } from "@/components/i18n/provider";
import { LOCALES, OG_LOCALES, isLocale } from "@/lib/i18n";
import { getT, setRequestLocale, siteDictFor } from "@/lib/i18n/server";
import { languageAlternates, SITE_URL } from "@/lib/marketing/site";
import "../../globals.css";

export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((l) => ({ lang: l.code }));

export const viewport: Viewport = { themeColor: "#f5f5f7", viewportFit: "cover" };

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  if (!isLocale(params.lang)) return {};
  setRequestLocale(params.lang);
  const tr = getT();
  const title = tr("Flozea — Agenda, tâches, courses, recettes, budget et notes");
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: "%s | Flozea" },
    description: tr("Flozea regroupe agenda, tâches, routines, listes de courses, recettes, budget et notes dans un seul espace, seul ou à deux. Gratuit."),
    alternates: { languages: languageAlternates("/") },
    openGraph: {
      title,
      description: tr("Remplace Notion, Excel, Jow et Google Agenda par un seul espace, seul ou à deux."),
      type: "website",
      siteName: "Flozea",
      locale: OG_LOCALES[params.lang],
    },
    appleWebApp: { capable: true, title: "Flozea", statusBarStyle: "default" },
    twitter: { card: "summary_large_image", title, description: tr("Un seul espace pour organiser ton temps, tes repas et ton argent.") },
  };
}

export default function SiteLayout({ children, params }: { children: React.ReactNode; params: { lang: string } }) {
  if (!isLocale(params.lang)) notFound();
  setRequestLocale(params.lang);
  return (
    <html lang={params.lang} className={GeistSans.variable}>
      <body>
        <I18nProvider locale={params.lang} dict={siteDictFor(params.lang)}>
          {children}
          <CookieNotice />
        </I18nProvider>
        <ClickRipple />
        <Analytics />
      </body>
    </html>
  );
}
