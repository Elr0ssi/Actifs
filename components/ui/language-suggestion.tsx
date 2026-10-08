"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const KEY = "flozea-lang-suggestion";

/** Propose la version anglaise aux visiteurs dont le navigateur n'est pas en français (sans rediriger). */
export function LanguageSuggestion() {
  const pathname = usePathname();
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      const lang = (navigator.language || "fr").toLowerCase();
      setShow(!lang.startsWith("fr") && !localStorage.getItem(KEY));
    } catch { setShow(false); }
  }, []);
  if (!show || pathname.startsWith("/app") || pathname === "/en" || pathname.startsWith("/en/")) return null;
  const close = () => {
    try { localStorage.setItem(KEY, "1"); } catch { /* navigation privée */ }
    setShow(false);
  };
  return (
    <div className="fixed right-3 top-[4.5rem] z-[60] flex items-center gap-2 rounded-2xl border border-line bg-surface/95 py-2 pl-3 pr-2 text-sm shadow-lift backdrop-blur-xl" lang="en">
      <span aria-hidden>🌍</span>
      <Link href="/en" hrefLang="en" className="font-semibold text-brand-700 hover:underline">Read this site in English</Link>
      <button onClick={close} aria-label="Close" className="rounded-lg px-2 py-1 text-stone-500 hover:bg-stone-100">✕</button>
    </div>
  );
}
