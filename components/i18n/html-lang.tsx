"use client";

import { useEffect } from "react";

/** Met à jour l'attribut lang de la page (lecteurs d'écran, correcteurs, traduction automatique du navigateur). */
export function HtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => { document.documentElement.lang = "fr"; };
  }, [locale]);
  return null;
}
