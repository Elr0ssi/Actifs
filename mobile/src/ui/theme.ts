import { useColorScheme } from "react-native";
import { createContext, useContext } from "react";

/** Mêmes accents que le site (lib/theme.ts) ; `violet` par défaut. */
export const ACCENTS = {
  violet: { 50: "#f5f3ff", 100: "#ede9fe", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9" },
  ocean: { 50: "#eff6ff", 100: "#dbeafe", 400: "#60a5fa", 500: "#3b82f6", 600: "#2563eb", 700: "#1d4ed8" },
  emerald: { 50: "#ecfdf5", 100: "#d1fae5", 400: "#34d399", 500: "#10b981", 600: "#059669", 700: "#047857" },
  rose: { 50: "#fff1f2", 100: "#ffe4e6", 400: "#fb7185", 500: "#f43f5e", 600: "#e11d48", 700: "#be123c" },
  sunset: { 50: "#fff7ed", 100: "#ffedd5", 400: "#fb923c", 500: "#f97316", 600: "#ea580c", 700: "#c2410c" },
  terracotta: { 50: "#fcf5f1", 100: "#f8e7df", 400: "#d4825f", 500: "#c4673f", 600: "#b05538", 700: "#914430" },
} as const;
export type AccentName = keyof typeof ACCENTS;
export const ACCENT_LABEL: Record<AccentName, string> = { violet: "Violet", ocean: "Océan", emerald: "Émeraude", rose: "Rose", sunset: "Soleil", terracotta: "Terracotta" };

export interface Theme {
  dark: boolean;
  canvas: string;
  surface: string;
  line: string;
  ink: string;
  sub: string;
  muted: string;
  brand: string; // boutons / éléments actifs
  brandStrong: string;
  brandSoft: string; // fonds doux
  brandText: string;
  onBrand: string;
  ok: string;
  okSoft: string;
  warn: string;
  warnSoft: string;
  bad: string;
  badSoft: string;
  /** Couleurs par univers, comme sur le site : repas = orange, finances = bleu, agenda = violet. */
  meal: string;
  money: string;
}

export function makeTheme(dark: boolean, accent: AccentName = "violet"): Theme {
  const a = ACCENTS[accent];
  return dark
    ? { dark, canvas: "#0b0d12", surface: "#151820", line: "#282d3a", ink: "#f1f3f8", sub: "#aab1c1", muted: "#6d7589", brand: a[500], brandStrong: a[400], brandSoft: "#1d1a33", brandText: a[400], onBrand: "#ffffff", ok: "#34d399", okSoft: "#0f2a22", warn: "#fbbf24", warnSoft: "#2e2410", bad: "#fb7185", badSoft: "#331519", meal: "#fb923c", money: "#60a5fa" }
    : { dark, canvas: "#f5f5f7", surface: "#ffffff", line: "#e4e4e9", ink: "#18181b", sub: "#52525b", muted: "#a1a1aa", brand: a[600], brandStrong: a[700], brandSoft: a[50], brandText: a[700], onBrand: "#ffffff", ok: "#059669", okSoft: "#ecfdf5", warn: "#d97706", warnSoft: "#fffbeb", bad: "#e11d48", badSoft: "#fff1f2", meal: "#ea580c", money: "#2563eb" };
}

export const ThemeContext = createContext<Theme>(makeTheme(false));
export const useTheme = () => useContext(ThemeContext);
export const useSystemDark = () => useColorScheme() === "dark";

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;
export const radius = { sm: 10, md: 16, lg: 24, pill: 999 } as const;
