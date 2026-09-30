"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { LogoWordmark } from "@/components/logo";
import { logout } from "@/app/(auth)/actions";
import { Icon, type IconName } from "@/components/app/icons";
import type { ThemeMode } from "@/lib/theme";

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

export function Sidebar({ displayName, inviteCode }: { displayName: string; inviteCode?: string; mode: ThemeMode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

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
        <LogoWordmark className="text-[15px]" />
        <div className="flex items-center gap-2">
          <button type="button" onClick={openPalette} aria-label="Rechercher" className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-500 hover:bg-stone-100">
            <Icon name="search" className="h-[18px] w-[18px]" />
          </button>
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-xs font-bold text-white shadow-glow">{initial}</span>
        </div>
      </header>

      <nav
        aria-label="Navigation principale"
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
              {item.short}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[10px] font-medium text-stone-400">
          <Icon name="menu" className="h-5 w-5" />
          Plus
        </button>
      </nav>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 animate-fade bg-black/40 backdrop-blur-sm lg:hidden" aria-hidden />}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-64 shrink-0 flex-col bg-surface transition-transform duration-300 ease-out",
          "lg:relative lg:z-10 lg:m-3 lg:mr-0 lg:h-[calc(100vh-1.5rem)] lg:w-[15rem] lg:translate-x-0 lg:rounded-3xl lg:border lg:border-line/70 lg:bg-surface/70 lg:shadow-soft lg:backdrop-blur-xl",
          "lg:sticky lg:top-3 lg:self-start",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 pb-3 pt-5">
          <LogoWordmark className="text-lg" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 lg:hidden">
            <Icon name="close" />
          </button>
        </div>

        <button
          type="button"
          onClick={openPalette}
          className="mx-3 mb-3 flex items-center gap-2 rounded-xl border border-line bg-surface/80 px-3 py-2 text-left text-[13px] text-stone-400 transition hover:border-stone-300 hover:text-stone-600"
        >
          <Icon name="search" className="h-4 w-4" />
          <span className="flex-1">Rechercher…</span>
          <kbd className="rounded-md border border-line bg-stone-50 px-1.5 py-0.5 font-sans text-[10px] font-medium text-stone-400">{isMac ? "⌘" : "Ctrl"} K</kbd>
        </button>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all duration-200",
                  active ? "bg-brand-500/12 text-brand-700 shadow-sm ring-1 ring-brand-500/15" : "text-stone-600 hover:bg-stone-100/80 hover:text-stone-900"
                )}
              >
                {active && <span className="absolute -left-3 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-brand-500" />}
                <Icon name={item.icon} className={cx("h-[18px] w-[18px] transition-transform duration-200 group-hover:scale-110", active ? "text-brand-600" : "text-stone-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="m-3 rounded-2xl border border-line/70 bg-surface/80 p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-brand-600 text-sm font-bold text-white shadow-glow">{initial}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-stone-800">{displayName}</p>
              {inviteCode && <p className="truncate text-[11px] text-stone-400">Foyer · {inviteCode}</p>}
            </div>
            <form action={logout}>
              <button type="submit" title="Déconnexion" className="rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-700">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
