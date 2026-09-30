"use client";

import { useEffect } from "react";
import type { Accent, ThemeMode } from "@/lib/theme";

/** Reporte le thème sur <html> pour que le fond de page (et l'overscroll) suive, puis le retire en quittant l'app. */
export function ThemeSync({ mode, accent }: { mode: ThemeMode; accent: Accent }) {
  useEffect(() => {
    const el = document.documentElement;
    el.dataset.accent = accent;
    el.classList.toggle("dark", mode === "dark");
    el.classList.toggle("theme-auto", mode === "auto");
    return () => {
      delete el.dataset.accent;
      el.classList.remove("dark", "theme-auto");
    };
  }, [mode, accent]);
  return null;
}
