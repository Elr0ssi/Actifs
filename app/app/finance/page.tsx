import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { getMonthlyBudget, perWeekRemaining } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";
import { OverviewPanel } from "@/components/app/finance/overview-panel";

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
  const perWeek = weekInfo.isLastDay ? null : weekInfo.perWeek;

  const fmtDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

  return (
    <OverviewPanel
      monthLabel={`${MONTHS_FR[month]} ${year}`}
      year={year}
      month={month}
      mode={mode}
      headline={headline}
      isCarried={mode === "carried"}
      refDateLabel={fmtDate(today)}
      realBalance={finance.anchor.balance}
      realBalanceDateLabel={fmtDate(finance.anchor.date)}
      perWeek={perWeek}
      formulaLine={
        mode === "carried"
          ? `Solde début de mois (Courant) ${budget.startBalance.toFixed(0)} € + revenus ${budget.income.toFixed(0)} € − charges fixes ${budget.fixed.toFixed(0)} € − variables ${budget.variable.toFixed(0)} € − épargne ${budget.savings.toFixed(0)} € = ${budget.resteAVivre.toFixed(0)} €`
          : `${budget.income.toFixed(0)} € − ${budget.fixed.toFixed(0)} € − ${budget.variable.toFixed(0)} € − ${budget.savings.toFixed(0)} € = ${theoreticalMargin.toFixed(0)} € (opérations réelles de ce mois, sans le solde reporté)`
      }
    />
  );
}
