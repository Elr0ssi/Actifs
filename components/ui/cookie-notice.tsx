"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useT } from "@/components/i18n/provider";
import Link from "@/components/marketing/link";

const KEY = "flozea-cookie-notice";

/** Information sur les cookies : Flozea n'utilise que des cookies nécessaires (connexion, thème), sans pistage. */
export function CookieNotice() {
  const tr = useT();
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem(KEY)); } catch { setShow(false); }
  }, []);
  if (!show || pathname.startsWith("/app")) return null;
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* navigation privée */ }
    setShow(false);
  };
  return (
    <div role="region" aria-label={tr("Cookies")} className="fixed inset-x-3 bottom-3 z-[60] mx-auto flex max-w-xl items-center gap-3 rounded-2xl border border-line bg-surface/95 p-3 pl-4 text-xs text-stone-600 shadow-lift backdrop-blur-xl sm:bottom-4 sm:text-[13px]">
      <p className="flex-1 leading-snug">
        {tr("Flozea n'utilise que des cookies nécessaires (connexion, thème) et des statistiques de visite sans cookie. Aucun pistage.")}{" "}
        <Link href="/confidentialite" className="font-semibold text-brand-700 underline underline-offset-2">{tr("En savoir plus")}</Link>
      </p>
      <button onClick={close} className="shrink-0 rounded-xl bg-ink px-4 py-2 text-xs font-semibold text-onink">{tr("OK")}</button>
    </div>
  );
}
