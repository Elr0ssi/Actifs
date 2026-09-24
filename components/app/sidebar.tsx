"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";
import { logout } from "@/app/(auth)/actions";

const NAV = [
  { href: "/app", label: "Tableau de bord", icon: "🏠" },
  { href: "/app/tasks", label: "Tâches & projets", icon: "✅" },
  { href: "/app/lists", label: "Listes", icon: "🛒" },
  { href: "/app/calendar", label: "Calendrier", icon: "📅" },
  { href: "/app/finance", label: "Finance", icon: "💶" },
  { href: "/app/settings", label: "Paramètres", icon: "⚙️" },
];

export function Sidebar({ displayName, inviteCode }: { displayName: string; inviteCode?: string }) {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center gap-2 px-6 py-5 text-lg font-bold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">A</span>
        Actifs
      </div>
      <nav className="flex-1 space-y-1 px-3">
        {NAV.map((item) => {
          const active = item.href === "/app" ? pathname === "/app" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cx(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-semibold text-slate-800">{displayName}</p>
        {inviteCode && (
          <p className="mt-0.5 truncate text-xs text-slate-400">Code foyer : {inviteCode}</p>
        )}
        <form action={logout}>
          <button type="submit" className="btn-secondary mt-3 w-full py-2 text-xs">
            Déconnexion
          </button>
        </form>
      </div>
    </aside>
  );
}
