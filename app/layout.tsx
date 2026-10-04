import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://actifs.app"),
  title: {
    default: "All In — Agenda, tâches, courses, recettes, budget et notes",
    template: "%s | All In",
  },
  description:
    "All In regroupe agenda, tâches, routines, listes de courses, recettes, budget et notes dans un seul espace, seul ou à deux. Outils gratuits sans compte.",
  keywords: [
    "agenda en ligne",
    "gestion de tâches",
    "budget mensuel",
    "reste à vivre",
    "planifier ses repas",
    "alternative à Notion",
    "organisation quotidienne",
    "budget personnel",
    "liste de courses partagée",
    "routines",
    "planificateur",
    "gestion financière personnelle",
  ],
  openGraph: {
    title: "All In — Agenda, tâches, courses, recettes, budget et notes",
    description:
      "Remplace Notion, Excel, Jow et Google Agenda par un seul espace, seul ou à deux.",
    type: "website",
    siteName: "All In",
    locale: "fr_FR",
  },
  appleWebApp: { capable: true, title: "All In", statusBarStyle: "default" },
  twitter: {
    card: "summary_large_image",
    title: "All In — Agenda, tâches, courses, recettes, budget et notes",
    description: "Un seul espace pour organiser ton temps, tes repas et ton argent.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f5f7",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
