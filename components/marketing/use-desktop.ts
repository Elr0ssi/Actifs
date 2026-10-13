"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 1024px)";
const subscribe = (cb: () => void) => {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/**
 * Vrai à partir de 1024 px, une fois la page hydratée (toujours faux côté serveur).
 * Sert à ne PAS construire dans le DOM la version « grand écran » d'une section sur téléphone (avant : les deux versions
 * étaient envoyées, hydratées et mises en page, la moitié restant cachée en CSS).
 */
export function useDesktop() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(QUERY).matches, () => false);
}
