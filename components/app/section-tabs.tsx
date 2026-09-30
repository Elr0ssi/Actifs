"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

export interface SectionTab {
  href: string;
  label: string;
  /** Onglet actif par défaut pour les sous-pages qui ne correspondent à aucun autre onglet (ex. une liste précise). */
  fallback?: boolean;
}

export function SectionTabs({ tabs, label }: { tabs: SectionTab[]; label: string }) {
  const pathname = usePathname();
  const root = tabs[0].href;
  const matched = tabs.find((t) => (t.href === root ? pathname === root : pathname.startsWith(t.href)));
  const active = matched ?? tabs.find((t) => t.fallback);
  return (
    <nav aria-label={label} className="-mx-4 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      <div className="inline-flex gap-1 rounded-2xl border border-line/70 bg-surface/60 p-1 shadow-soft backdrop-blur">
      {tabs.map((t) => {
        const on = active?.href === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cx(
              "shrink-0 whitespace-nowrap rounded-xl px-3.5 py-1.5 text-[13px] font-medium transition-all duration-200",
              on ? "bg-gradient-to-b from-brand-500 to-brand-600 text-white shadow-glow" : "text-stone-500 hover:bg-stone-100 hover:text-stone-800"
            )}
          >
            {t.label}
          </Link>
        );
      })}
      </div>
    </nav>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[1.7rem] font-bold tracking-tight text-stone-900">{title}</h1>
        <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
