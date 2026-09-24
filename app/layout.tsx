import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://actifs.app"),
  title: {
    default: "Actifs — Le hub qui organise ta vie",
    template: "%s — Actifs",
  },
  description:
    "Actifs regroupe tes tâches, tes projets, tes routines, tes listes partagées et tes finances dans un seul espace personnel, gratuit et ultra ergonomique.",
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
    title: "Actifs — Le hub qui organise ta vie",
    description:
      "Tâches, projets, routines, listes partagées et finances : un seul espace, gratuit et ultra ergonomique.",
    type: "website",
    locale: "fr_FR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Actifs — Le hub qui organise ta vie",
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
