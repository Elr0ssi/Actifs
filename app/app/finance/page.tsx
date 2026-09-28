import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { getMonthlyBudget, perWeekRemaining, type BalanceAnchor } from "@/lib/finance-engine";
import { todayISO, formatEUR, cx } from "@/lib/utils";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";
import { MiniMonth } from "@/components/app/finance/mini-month";

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
  const theoreticalMargin = budget.income - budget.fixed - budget.variable - budget.savings;
  const headline = mode === "carried" ? budget.resteAVivre : theoreticalMargin;
  const weekInfo = perWeekRemaining(headline, today);
  const effectiveAnchor: BalanceAnchor = mode === "carried" ? finance.anchor : { balance: 0, date: `${year}-${String(month + 1).padStart(2, "0")}-01` };

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

      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {mode === "carried" ? "Trésorerie projetée en fin de mois" : "Solde théorique en fin de mois"}
          </p>
          <p className={cx("mt-1 text-4xl font-bold tabular-nums", headline < 0 ? "text-rose-600" : "text-slate-900")}>{formatEUR(headline)}</p>
          {!weekInfo.isLastDay && <p className="mt-2 text-xs text-slate-400">≈ {formatEUR(weekInfo.perWeek)}/semaine sur ce qu'il reste du mois</p>}
          <p className="mt-1 text-xs text-slate-400">
            {mode === "carried" ? "Part du solde réel du compte courant, reporté d'un mois à l'autre." : "Repart de 0, sans les gains ni les pertes des mois précédents."}
          </p>
        </div>
        <div className="card p-4">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Aperçu du mois</p>
          <MiniMonth ops={finance.ops} anchor={effectiveAnchor} year={year} month={month} today={today} />
        </div>
      </div>

      <BudgetBreakdown budget={budget} />
    </div>
  );
}
