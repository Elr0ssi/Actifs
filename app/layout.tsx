import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://actifs.app"),
  title: {
    default: "All In — Le hub qui organise ta vie",
    template: "%s — All In",
  },
  description:
    "All In regroupe tes tâches, tes projets, tes routines, tes listes partagées et tes finances dans un seul espace personnel, gratuit et ultra ergonomique.",
  keywords: [
    "gestion de tâches",
    "organisation quotidienne",
    "budget personnel",
    "liste de courses partagée",
    "routines",
    "planificateur",
    "gestion financière personnelle",
  ],
  openGraph: {
    title: "All In — Le hub qui organise ta vie",
    description:
      "Tâches, projets, routines, listes partagées et finances : un seul espace, gratuit et ultra ergonomique.",
    type: "website",
    locale: "fr_FR",
  },
  appleWebApp: { capable: true, title: "All In", statusBarStyle: "default" },
  twitter: {
    card: "summary_large_image",
    title: "All In — Le hub qui organise ta vie",
    description: "Tâches, routines, listes partagées et finances dans un seul espace, gratuit.",
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
