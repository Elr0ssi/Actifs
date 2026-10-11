"use client";

import NextLink from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps } from "react";
import { useLocale } from "@/components/i18n/provider";
import { localizePath } from "@/lib/i18n";

const warmed = new Set<string>();

/**
 * Lien du site public : garde la langue de la page (`/tarifs` devient `/en/tarifs` en anglais).
 *
 * Préchargement : par défaut, une page n'est préchargée qu'au moment où le doigt (ou la souris) touche le lien, ce qui lui laisse
 * ~100 ms d'avance sur le clic. Avant, chaque lien qui entrait à l'écran (25 liens dans le pied de page, les cartes de recettes…)
 * téléchargeait ~40 Ko de données en arrière-plan : lourd en 4G et en concurrence avec le défilement. Les liens principaux
 * (en-tête, boutons de l'accueil) gardent le préchargement dès l'affichage avec `prefetch`.
 */
export default function Link({ href, prefetch, onPointerDown, onTouchStart, onMouseEnter, ...props }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const router = useRouter();
  const target = typeof href === "string" ? localizePath(href, locale) : href;
  const warm = () => {
    if (typeof target !== "string" || prefetch || !target.startsWith("/") || warmed.has(target)) return;
    warmed.add(target);
    router.prefetch(target);
  };
  return (
    <NextLink
      href={target}
      prefetch={prefetch ?? false}
      onPointerDown={(e) => { warm(); onPointerDown?.(e); }}
      onTouchStart={(e) => { warm(); onTouchStart?.(e); }}
      onMouseEnter={(e) => { warm(); onMouseEnter?.(e); }}
      {...props}
    />
  );
}
