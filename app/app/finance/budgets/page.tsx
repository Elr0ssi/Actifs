import type { Metadata } from "next";
import Link from "next/link";
import { loadBudgetsPage } from "@/lib/data/finance-budgets";
import { getMonthlyBudget } from "@/lib/finance-engine";
import { loadFinanceData } from "@/lib/data/finance";
import { todayISO } from "@/lib/utils";
import { BudgetEditor } from "@/components/app/finance/budget-editor";
import { EnvelopesList } from "@/components/app/finance/envelopes-list";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";

export const metadata: Metadata = { title: "Finance — Budgets" };
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const now = new Date(`${todayISO()}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();

  const [page, finance] = await Promise.all([loadBudgetsPage(year, month), loadFinanceData()]);
  if (!page || !finance) return null;
  const budget = getMonthlyBudget(finance.ops, finance.anchor, year, month);

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/app/finance/budgets?year=${prevMonth.y}&month=${prevMonth.m}`} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
        <p className="text-lg font-bold text-slate-900">{MONTHS_FR[month]} {year}</p>
        <Link href={`/app/finance/budgets?year=${nextMonth.y}&month=${nextMonth.m}`} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
      </div>
      {!page.plan.explicit && (
        <p className="text-xs text-slate-400">Aucun budget saisi pour {MONTHS_FR[month]} : les cases ci-dessous reprennent ton budget par défaut, à ajuster puis enregistrer.</p>
      )}

      <BudgetEditor key={`${year}-${month}`} year={year} month={month} plan={page.plan} />

      {page.plan.showCategories && <EnvelopesList envelopes={page.envelopes} />}

      <div id="comparer">
        <BudgetBreakdown budget={budget} />
      </div>
    </div>
  );
}
