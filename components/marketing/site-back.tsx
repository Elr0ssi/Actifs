"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useT } from "@/components/i18n/provider";
import { splitLocalePath } from "@/lib/i18n";

// Nombre de pages vues pendant cette visite : la navigation douce ne met pas `document.referrer` à jour.
let visited = 0;

/**
 * Bouton « Retour » flottant sur les pages du site (sauf l'accueil) : il ramène à la page précédente, au même endroit du défilement.
 * Il n'apparaît que s'il y a une page précédente sur le site.
 */
export function SiteBack() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const tr = useT();
  const [can, setCan] = useState(false);
  const { path } = splitLocalePath(pathname);

  useEffect(() => {
    visited += 1;
    let fromSite = false;
    try { fromSite = !!document.referrer && new URL(document.referrer).origin === window.location.origin; } catch { /* référent illisible */ }
    setCan(visited > 1 || fromSite);
  }, [pathname]);

  // Les pages de recettes ont déjà leur bouton en haut de page.
  if (path === "/" || path.startsWith("/recettes/") || !can) return null;
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="fixed bottom-5 left-5 z-30 hidden items-center gap-1.5 rounded-full border border-line bg-surface/90 px-4 py-2 text-sm font-semibold text-stone-700 shadow-lift backdrop-blur-xl transition hover:-translate-x-0.5 hover:border-brand-300 hover:text-brand-700 sm:inline-flex"
    >
      {tr("← Retour")}
    </button>
  );
}
