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
    <nav aria-label={label} className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
      {tabs.map((t) => {
        const on = active?.href === t.href;
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={on ? "page" : undefined}
            className={cx("shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition", on ? "border-brand-600 text-brand-700" : "border-transparent text-stone-500 hover:text-stone-800")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function SectionHeader({ title, subtitle, action }: { title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{title}</h1>
        <p className="mt-0.5 text-sm text-stone-500">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
