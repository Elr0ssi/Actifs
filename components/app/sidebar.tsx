"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { LogoWordmark } from "@/components/logo";
import { logout } from "@/app/(auth)/actions";
import { Icon, type IconName } from "@/components/app/icons";

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

export function Sidebar({ displayName, inviteCode }: { displayName: string; inviteCode?: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const initial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-30 flex h-12 items-center justify-between border-b border-line bg-canvas/90 px-4 backdrop-blur lg:hidden">
        <LogoWordmark className="text-[15px]" />
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{initial}</span>
      </header>

      <nav
        aria-label="Navigation principale"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
      >
        {NAV.filter((n) => TAB_BAR.includes(n.href)).map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link key={item.href} href={item.href} className={cx("flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium", active ? "text-brand-700" : "text-stone-400")}>
              <Icon name={item.icon} className="h-5 w-5" />
              {item.short}
            </Link>
          );
        })}
        <button type="button" onClick={() => setOpen(true)} className="flex flex-col items-center gap-0.5 py-2 text-[10px] font-medium text-stone-400">
          <Icon name="menu" className="h-5 w-5" />
          Plus
        </button>
      </nav>

      {open && <div onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-stone-900/30 lg:hidden" aria-hidden />}

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-50 flex h-screen w-60 shrink-0 flex-col border-r border-line bg-canvas transition-transform duration-200",
          "lg:sticky lg:top-0 lg:z-auto lg:w-56 lg:translate-x-0",
          open ? "translate-x-0 shadow-xl" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between px-5 pb-4 pt-5">
          <LogoWordmark className="text-lg" />
          <button type="button" onClick={() => setOpen(false)} aria-label="Fermer le menu" className="rounded-lg p-1 text-stone-400 hover:bg-stone-100 lg:hidden">
            <Icon name="close" />
          </button>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition",
                  active ? "bg-brand-100/70 text-brand-800" : "text-stone-600 hover:bg-white hover:text-stone-900"
                )}
              >
                <Icon name={item.icon} className={cx("h-[18px] w-[18px]", active ? "text-brand-600" : "text-stone-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 rounded-2xl border border-line bg-white p-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{initial}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold text-stone-800">{displayName}</p>
              {inviteCode && <p className="truncate text-[11px] text-stone-400">Foyer · {inviteCode}</p>}
            </div>
            <form action={logout}>
              <button type="submit" title="Déconnexion" className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
                <Icon name="logout" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
