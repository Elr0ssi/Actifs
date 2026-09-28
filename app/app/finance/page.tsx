import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { addDays, getMonthlyBudget, monthBounds, type BalanceAnchor } from "@/lib/finance-engine";
import { todayISO, cx } from "@/lib/utils";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";
import { OverviewMonth } from "@/components/app/finance/overview-month";

export const metadata: Metadata = { title: "Finance — Vue d'ensemble" };
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default async function FinanceOverviewPage({ searchParams }: { searchParams: { year?: string; month?: string; mode?: string } }) {
  const finance = await loadFinanceData();
  if (!finance) return null;

  const today = todayISO();
  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const mode: "month" | "carried" = searchParams.mode === "carried" ? "carried" : "month";

  const budget = getMonthlyBudget(finance.ops, finance.anchor, year, month);
  const effectiveAnchor: BalanceAnchor = mode === "carried" ? finance.anchor : { balance: 0, date: addDays(monthBounds(year, month).start, -1) };

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const monthUrl = (y: number, m: number, mo = mode) => `/app/finance?year=${y}&month=${m}&mode=${mo}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={monthUrl(prevMonth.y, prevMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
          <p className="text-lg font-bold capitalize text-slate-900">{MONTHS_FR[month]} {year}</p>
          <Link href={monthUrl(nextMonth.y, nextMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
          <Link href={monthUrl(year, month, "month")} className={cx("rounded-lg px-3 py-1.5", mode === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Mois seul</Link>
          <Link href={monthUrl(year, month, "carried")} className={cx("rounded-lg px-3 py-1.5", mode === "carried" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>Avec solde reporté</Link>
        </div>
      </div>

      <OverviewMonth key={`${year}-${month}-${mode}`} ops={finance.ops} anchor={effectiveAnchor} year={year} month={month} today={today} carried={mode === "carried"} />

      <BudgetBreakdown budget={budget} />
    </div>
  );
}
