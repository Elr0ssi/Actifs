import type { Metadata } from "next";
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
  twitter: {
    card: "summary_large_image",
    title: "All In — Le hub qui organise ta vie",
    description: "Tâches, routines, listes partagées et finances dans un seul espace, gratuit.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
