"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { LogoMark, LogoWordmark } from "@/components/logo";
import { logout } from "@/app/(main)/(auth)/actions";
import { Icon, type IconName } from "@/components/app/icons";
import { SIDEBAR_COOKIE, type ThemeMode } from "@/lib/theme";

const NAV: { href: string; label: string; short: string; icon: IconName }[] = [
  { href: "/app", label: "Tableau de bord", short: "Accueil", icon: "home" },
  { href: "/app/tasks", label: "Tâches & projets", short: "Tâches", icon: "tasks" },
  { href: "/app/lists", label: "Courses", short: "Courses", icon: "cart" },
  { href: "/app/finance", label: "Finance", short: "Finance", icon: "wallet" },
  { href: "/app/notes", label: "Notes", short: "Notes", icon: "notes" },
  { href: "/app/settings", label: "Paramètres", short: "Réglages", icon: "settings" },
];
const TAB_BAR = ["/app", "/app/tasks", "/app/lists", "/app/finance"];

const isActive = (pathname: string, href: string) => (href === "/app" ? pathname === "/app" : pathname.startsWith(href));
export const openPalette = () => window.dispatchEvent(new Event("allin:palette"));


export function Sidebar({ displayName, inviteCode, collapsed: initialCollapsed = false }: { displayName: string; inviteCode?: string; mode: ThemeMode; collapsed?: boolean }) {
  const tr = useT();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);
  // Grand écran : le volet peut se replier (icônes seules) pour laisser plus de place au contenu. Mémorisé dans un cookie.
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const toggle = () =>
    setCollapsed((c) => {
      const next = !c;
      try { document.cookie = `${SIDEBAR_COOKIE}=${next ? "collapsed" : "open"}; path=/; max-age=31536000; samesite=lax`; } catch { /* cookies bloqués */ }
      return next;
    });
  const hideLabel = collapsed ? "lg:hidden" : "";

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => setIsMac(/mac|iphone|ipad/i.test(navigator.userAgent)), []);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-line/60 bg-surface/70 px-4 backdrop-blur-xl lg:hidden">
        <LogoWordmark className="text-xl" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={openPalette} aria-label={tr("Rechercher")} className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100">
            <Icon name="search" className="h-[18px] w-[18px]" />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white shadow-glow">{initial}</span>
        </div>
      </header>

      <nav
        aria-label={tr("Navigation principale")}
        className="fixed inset-x-3 bottom-3 z-30 grid grid-cols-5 rounded-3xl border border-line/70 bg-surface/80 p-1.5 shadow-lift backdrop-blur-xl lg:hidden"
        style={{ marginBottom: "env(safe-area-inset-bottom)" }}
      >
        {NAV.filter((n) => TAB_BAR.includes(n.href)).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx("flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium transition", active ? "bg-brand-500/12 text-brand-700" : "text-stone-400")}
            >
              <Icon name={item.icon} className={cx("h-5 w-5 transition-transform", active && "scale-110")} />
              {tr(item.short)}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium text-stone-400">
          <Icon name="menu" className="h-5 w-5" />
          {tr("Plus")}
        </button>
      </nav>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 animate-fade bg-black/40 backdrop-blur-sm lg:hidden" aria-hidden />}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-surface transition-transform duration-300 ease-out",
          "lg:relative lg:z-10 lg:m-3 lg:mr-0 lg:h-[calc(100vh-1.5rem)] lg:translate-x-0 lg:rounded-3xl lg:border lg:border-line/70 lg:bg-surface/70 lg:shadow-soft lg:backdrop-blur-xl lg:transition-[width] lg:duration-200",
          collapsed ? "lg:w-[4.75rem]" : "lg:w-[15rem]",
          "lg:sticky lg:top-3 lg:self-start",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        <div className={cx("flex items-center justify-between px-5 pb-3 pt-5", collapsed && "lg:flex-col lg:gap-3 lg:px-0")}>
          {collapsed ? (
            <>
              <span className="lg:hidden"><LogoWordmark className="text-2xl" /></span>
              <span className="hidden lg:block"><LogoMark /></span>
            </>
          ) : (
            <LogoWordmark className="text-2xl" />
          )}
          <button type="button" onClick={() => setOpen(false)} aria-label={tr("Fermer le menu")} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 lg:hidden">
            <Icon name="close" />
          </button>
          <button
            type="button"
            onClick={toggle}
            aria-label={collapsed ? tr("Ouvrir le volet latéral") : tr("Réduire le volet latéral")}
            aria-expanded={!collapsed}
            title={collapsed ? tr("Ouvrir le volet latéral") : tr("Réduire le volet latéral")}
            className="hidden h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition hover:bg-stone-100 hover:text-stone-700 lg:flex"
          >
            <svg viewBox="0 0 24 24" className={cx("h-[18px] w-[18px] transition-transform", collapsed && "rotate-180")} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9 4v16" /><path d="m15 10-2 2 2 2" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={openPalette}
          title={collapsed ? tr("Rechercher…") : undefined}
          aria-label={tr("Rechercher…")}
          className={cx("mx-3 mb-3 flex items-center gap-2 rounded-xl border border-line bg-surface/80 px-3 py-2 text-left text-[13px] text-stone-400 transition hover:border-stone-300 hover:text-stone-600", collapsed && "lg:justify-center lg:px-0")}
        >
          <Icon name="search" className="h-4 w-4" />
          <span className={cx("flex-1", hideLabel)}>{tr("Rechercher…")}</span>
          <kbd className={cx("rounded-md border border-line bg-stone-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-stone-400", hideLabel)}>{isMac ? "⌘" : "Ctrl"} K</kbd>
        </button>

        <nav className={cx("flex-1 space-y-1 overflow-y-auto px-3", collapsed && "lg:px-2")}>
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? tr(item.label) : undefined}
                aria-label={collapsed ? tr(item.label) : undefined}
                className={cx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                  collapsed && "lg:justify-center lg:px-0 lg:py-2.5",
                  active ? "bg-brand-500/12 text-brand-700 shadow-sm ring-1 ring-brand-500/15" : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                )}
              >
                {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-500" />}
                <Icon name={item.icon} className={cx("h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110", active ? "text-brand-600" : "text-stone-400")} />
                <span className={hideLabel}>{tr(item.label)}</span>
              </Link>
            );
          })}
        </nav>

        <div className={cx("m-3 rounded-2xl border border-line/70 bg-surface/80 p-3", collapsed && "lg:mx-2 lg:px-1")}>
          <div className={cx("flex items-center gap-2.5", collapsed && "lg:flex-col")}>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-glow">{initial}</span>
            <div className={cx("min-w-0 flex-1", hideLabel)}>
              <p className="truncate text-[13px] font-semibold text-stone-800">{displayName}</p>
              {inviteCode && <p className="truncate text-[11px] text-stone-400">{tr("Foyer")} · {inviteCode}</p>}
            </div>
            <form action={logout}>
              <button type="submit" title={tr("Déconnexion")} className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
