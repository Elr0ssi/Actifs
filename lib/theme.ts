export const THEME_COOKIE = "allin-theme";
export const ACCENT_COOKIE = "allin-accent";

export const THEME_MODES = [
  { v: "light", l: "Clair" },
  { v: "dark", l: "Sombre" },
  { v: "auto", l: "Automatique" },
] as const;

export const ACCENT_CHOICES = [
  { v: "violet", l: "Violet", swatch: "#8b5cf6" },
  { v: "ocean", l: "Océan", swatch: "#3b82f6" },
  { v: "emerald", l: "Émeraude", swatch: "#10b981" },
  { v: "rose", l: "Rose", swatch: "#f43f5e" },
  { v: "sunset", l: "Soleil", swatch: "#f97316" },
  { v: "terracotta", l: "Terracotta", swatch: "#c4673f" },
] as const;

export type ThemeMode = (typeof THEME_MODES)[number]["v"];
export type Accent = (typeof ACCENT_CHOICES)[number]["v"];

export const parseMode = (v: string | undefined): ThemeMode => (THEME_MODES.some((m) => m.v === v) ? (v as ThemeMode) : "light");
export const parseAccent = (v: string | undefined): Accent => (ACCENT_CHOICES.some((a) => a.v === v) ? (v as Accent) : "violet");
