"use client";

import { createContext, useContext, useMemo } from "react";
import { setUiLocale, translate, type Locale, type Vars } from "@/lib/i18n";

interface Ctx {
  locale: Locale;
  dict: Record<string, string> | null;
}
const I18nContext = createContext<Ctx>({ locale: "fr", dict: null });

export function I18nProvider({ locale, dict, children }: { locale: Locale; dict: Record<string, string> | null; children: React.ReactNode }) {
  // Les noms de jours/mois et formats de date suivent la langue dès le premier rendu.
  setUiLocale(locale);
  const value = useMemo(() => ({ locale, dict }), [locale, dict]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useLocale = () => useContext(I18nContext).locale;

/** Traduction côté navigateur : t("Texte français", { n: 3 }). */
export function useT() {
  const { dict } = useContext(I18nContext);
  return (key: string, vars?: Vars) => translate(dict, key, vars);
}
