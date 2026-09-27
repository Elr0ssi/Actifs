"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/app/finance-v2", label: "Vue d'ensemble" },
  { href: "/app/finance-v2/calendar", label: "Calendrier" },
  { href: "/app/finance-v2/budgets", label: "Budgets" },
  { href: "/app/finance-v2/accounts", label: "Comptes" },
  { href: "/app/finance-v2/taxes", label: "Impôts" },
];

export function FinanceV2Subnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections Finance" className="flex flex-wrap gap-1.5 border-b border-slate-200 pb-2">
      {TABS.map((t) => {
        const active = t.href === "/app/finance-v2" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cx("rounded-lg px-3 py-1.5 text-sm font-medium", active ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
