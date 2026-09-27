"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/app/finance", label: "Vue d'ensemble" },
  { href: "/app/finance/calendar", label: "Calendrier" },
  { href: "/app/finance/budgets", label: "Budgets" },
  { href: "/app/finance/accounts", label: "Comptes" },
  { href: "/app/finance/taxes", label: "Impôts" },
];

export function FinanceSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections Finance" className="flex flex-wrap gap-1 border-b border-slate-200">
      {TABS.map((t) => {
        const active = t.href === "/app/finance" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "border-b-2 px-3 py-2.5 text-sm font-medium transition",
              active ? "border-brand-600 text-brand-700" : "border-transparent text-slate-500 hover:text-slate-800"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
