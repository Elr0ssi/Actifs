"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cx } from "@/lib/utils";

const TABS = [
  { href: "/app/finance", label: "Vue d'ensemble" },
  { href: "/app/finance/calendar", label: "Calendrier" },
  { href: "/app/finance/budgets", label: "Budgets" },
  { href: "/app/finance/operations", label: "Opérations" },
  { href: "/app/finance/accounts", label: "Comptes" },
  { href: "/app/finance/taxes", label: "Impôts" },
];

export function FinanceSubnav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Sections Finance" className="-mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0">
      {TABS.map((t) => {
        const active = t.href === "/app/finance" ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            aria-current={active ? "page" : undefined}
            className={cx(
              "shrink-0 border-b-2 px-3 py-2 text-[13px] font-medium transition",
              active ? "border-brand-600 text-brand-700" : "border-transparent text-stone-500 hover:text-stone-800"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
