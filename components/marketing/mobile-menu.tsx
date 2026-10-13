"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import Link from "@/components/marketing/link";
import { LogoWordmark } from "@/components/logo";
import { Flag } from "@/components/ui/flag";
import { LANG_COOKIE, LOCALES, localizePath, splitLocalePath, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/i18n/provider";
import { cx } from "@/lib/utils";

export interface MenuItem { href: string; name: string; icon: string; soon?: string }
export interface MenuGroup { key: string; href: string; name: string; icon: string; items: MenuItem[] }
export interface MenuData {
  labels: Record<"open" | "close" | "menu" | "back" | "main" | "features" | "featuresHint" | "allFeatures" | "resources" | "resourcesHint" | "pricing" | "login" | "loginHint" | "signup" | "language", string>;
  groups: MenuGroup[];
  resources: MenuItem[];
}

type View = "root" | "features" | "resources";

/**
 * Menu mobile (écrans < md). Un seul panneau plein écran, un seul sous-menu visible à la fois :
 * le menu principal est remplacé par le sous-menu (bouton « Menu » pour revenir), jamais empilé.
 * Il se ferme tout seul à la navigation, au changement de taille d'écran, avec Échap ou le bouton ✕,
 * bloque le défilement de la page tant qu'il est ouvert et le rend ensuite.
 */
export function MobileMenu({ data }: { data: MenuData }) {
  const { labels: L } = data;
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("root");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const locale = useLocale();
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const first = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);

  const close = useCallback((restoreFocus = true) => {
    setOpen(false);
    setView("root");
    if (restoreFocus) button.current?.focus({ preventScroll: true });
  }, []);

  // La page change (lien du menu, bouton retour du navigateur…) : le menu se referme, il ne se rouvre jamais tout seul.
  useEffect(() => { setOpen(false); setView("root"); }, [pathname]);

  // Passage à un grand écran : le menu mobile n'a plus lieu d'être.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => { if (mq.matches) close(false); };
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [close]);

  // Tant qu'il est ouvert : pas de défilement de la page derrière, Échap ferme, Tab reste dans le panneau.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prevOverflow = root.style.overflow;
    root.style.overflow = "hidden";
    first.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); return; }
      if (e.key !== "Tab" || !panel.current) return;
      const items = Array.from(panel.current.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")).filter((el) => el.offsetParent !== null);
      if (!items.length) return;
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      if (e.shiftKey && document.activeElement === firstEl) { e.preventDefault(); lastEl.focus(); }
      else if (!e.shiftKey && document.activeElement === lastEl) { e.preventDefault(); firstEl.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { root.style.overflow = prevOverflow; document.removeEventListener("keydown", onKey); };
  }, [open, close]);

  const go = () => close(false);
  const row = "flex min-h-[3.5rem] w-full items-center gap-3 rounded-2xl px-3 text-left text-[17px] font-semibold text-stone-900 active:bg-stone-100";
  const sub = "flex min-h-[3rem] items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-stone-800 active:bg-stone-100";
  const { path } = splitLocalePath(pathname || "/");
  const switchHref = (code: Locale) => localizePath(path, code);
  const remember = (code: Locale) => { try { document.cookie = `${LANG_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`; } catch { /* cookies bloqués */ } };

  const overlay = open && (
    <div
      ref={panel}
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label={L.main}
      className="fixed inset-0 z-[70] flex flex-col bg-surface md:hidden"
      style={{ paddingTop: "env(safe-area-inset-top)" }}
    >
      <div className="flex items-center justify-between px-4 py-2.5">
        {view === "root" ? (
          <Link href="/" onClick={go} className="rounded-xl py-1.5 pr-3"><LogoWordmark className="text-xl" /></Link>
        ) : (
          <button ref={first} type="button" onClick={() => setView("root")} className="-ml-1 flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-[15px] font-semibold text-brand-700">
            <span aria-hidden>‹</span>{L.back}
          </button>
        )}
        <button type="button" onClick={() => close()} aria-label={L.close} className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-lg text-stone-700">
          <span aria-hidden>✕</span>
        </button>
      </div>

      <div key={view} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pb-4 menu-in">
        {view === "root" && (
          <nav aria-label={L.main} className="flex flex-col gap-1">
            <button type="button" ref={first} onClick={() => setView("features")} className={row} aria-haspopup="true">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-lg" aria-hidden>✨</span>
              <span className="flex-1"><span className="block">{L.features}</span><span className="block text-[12.5px] font-normal text-stone-500">{L.featuresHint}</span></span>
              <span className="text-xl text-stone-400" aria-hidden>›</span>
            </button>
            <button type="button" onClick={() => setView("resources")} className={row} aria-haspopup="true">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-lg" aria-hidden>🍲</span>
              <span className="flex-1"><span className="block">{L.resources}</span><span className="block text-[12.5px] font-normal text-stone-500">{L.resourcesHint}</span></span>
              <span className="text-xl text-stone-400" aria-hidden>›</span>
            </button>
            <Link href="/tarifs" onClick={go} className={row}>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg" aria-hidden>💶</span>
              <span className="flex-1">{L.pricing}</span>
            </Link>
          </nav>
        )}

        {view === "features" && (
          <nav aria-label={L.features} className="flex flex-col gap-0.5">
            <Link href="/fonctionnalites" onClick={go} className={cx(sub, "font-semibold text-brand-700")}>{L.allFeatures} <span aria-hidden>→</span></Link>
            {data.groups.map((g) => (
              <div key={g.key} className="mt-3">
                <Link href={g.href} onClick={go} className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-xs font-bold uppercase tracking-wide text-stone-500 active:bg-stone-100"><span aria-hidden>{g.icon}</span>{g.name}</Link>
                {g.items.map((f) => (
                  <Link key={f.href} href={f.href} onClick={go} className={sub}>
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-base" aria-hidden>{f.icon}</span>
                    <span className="flex-1">{f.name}</span>
                    {f.soon && <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">{f.soon}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        )}

        {view === "resources" && (
          <nav aria-label={L.resources} className="flex flex-col gap-0.5">
            {data.resources.map((r) => (
              <Link key={r.href} href={r.href} onClick={go} className={cx(sub, "min-h-[3.5rem] text-[16px]")}>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-lg" aria-hidden>{r.icon}</span>
                <span className="flex-1">{r.name}</span>
              </Link>
            ))}
          </nav>
        )}
      </div>

      <div className="border-t border-line px-4 pt-3" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <div className="grid grid-cols-2 gap-2.5">
          <Link href="/login" onClick={go} className="flex min-h-12 flex-col items-center justify-center rounded-2xl border border-line bg-surface px-2 text-center leading-tight">
            <span className="text-[15px] font-semibold text-stone-900">{L.login}</span>
            <span className="text-[11px] text-stone-500">{L.loginHint}</span>
          </Link>
          <Link href="/signup" onClick={go} className="btn-primary min-h-12 justify-center text-[15px]">{L.signup}</Link>
        </div>
        <ul className="mt-3 flex items-center justify-center gap-2" aria-label={L.language}>
          {LOCALES.map((l) => (
            <li key={l.code}>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href={switchHref(l.code)} hrefLang={l.code} lang={l.code} title={l.label} aria-label={l.label} aria-current={l.code === locale} onClick={() => remember(l.code)} className={cx("flex h-11 w-11 items-center justify-center rounded-full", l.code === locale ? "ring-2 ring-brand-400" : "opacity-70")}>
                <Flag code={l.code} className="h-7 w-7" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <button
        ref={button}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-haspopup="dialog"
        aria-label={open ? L.close : L.open}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-line bg-surface text-stone-700 md:hidden"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {mounted && overlay ? createPortal(overlay, document.body) : null}
    </>
  );
}
