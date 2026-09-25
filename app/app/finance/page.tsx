import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { todayISO, MONTHS_FR } from "@/lib/utils";
import type { RecurringCharge, Income, Investment, VariableBudget, Transaction } from "@/lib/types";
import {
  monthlyEquivalent,
  getSavingsAmount,
  daysInMonthCount,
  getWeeksOfMonth,
  getWeekendsOfMonth,
  computePeriodAvailable,
  getNextIncomeAfter,
  sumOccurrencesInRange,
  type RangeChargeLike,
} from "@/lib/finance";
import { FinanceSummaryCards } from "@/components/app/finance/summary-cards";
import { ForecastBalanceChart } from "@/components/app/finance/forecast-chart";
import { AvailableByPeriod } from "@/components/app/finance/available-by-period";
import { VariableBudgetsSection } from "@/components/app/finance/variable-budgets";
import { RecurringCharges } from "@/components/app/finance/recurring-charges";
import { RecurringIncomes } from "@/components/app/finance/recurring-incomes";
import { SavingsSection } from "@/components/app/finance/savings-section";
import { UpcomingMovements } from "@/components/app/finance/upcoming-movements";
import { AddOperationModal } from "@/components/app/finance/add-operation-modal";
import { updateBalance } from "@/app/app/actions";

export const metadata: Metadata = { title: "Finances" };

function shiftMonth(iso: string, delta: number) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function FinancePage({ searchParams }: { searchParams: { month?: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";
  const currentBalance = Number(household?.current_balance ?? 0);
  const savingsMode = household?.savings_mode ?? "fixed";
  const savingsValue = Number(household?.savings_value ?? 0);

  const now = new Date();
  const monthISO = searchParams.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const [year, monthNum] = monthISO.split("-").map(Number);
  const month = monthNum - 1;
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  const monthStartISO = monthStart.toISOString().slice(0, 10);
  const monthEndISO = monthEnd.toISOString().slice(0, 10);
  const today = todayISO();
  const days = daysInMonthCount(year, month);

  const [{ data: charges }, { data: incomes }, { data: investments }, { data: budgets }, { data: transactions }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).eq("active", true).order("next_date").returns<RecurringCharge[]>(),
    supabase.from("incomes").select("*").eq("household_id", householdId).eq("active", true).order("expected_date").returns<Income[]>(),
    supabase.from("investments").select("*").eq("household_id", householdId).order("invested_date", { ascending: false }).returns<Investment[]>(),
    supabase.from("variable_budgets").select("*").eq("household_id", householdId).order("position").returns<VariableBudget[]>(),
    supabase
      .from("transactions")
      .select("*")
      .eq("household_id", householdId)
      .gte("txn_date", monthStartISO)
      .lte("txn_date", monthEndISO)
      .returns<Transaction[]>(),
  ]);

  const chargesList = charges ?? [];
  const incomesList = incomes ?? [];
  const incomesRangeLike: RangeChargeLike[] = incomesList.map((i) => ({
    id: i.id,
    name: i.name,
    amount: Number(i.amount),
    next_date: i.expected_date,
    frequency: i.recurring ? i.frequency : "once",
  }));

  const monthlyIncome = incomesList.filter((i) => i.recurring).reduce((s, i) => s + monthlyEquivalent(Number(i.amount), i.frequency), 0);
  const monthlyFixedCharges = chargesList.reduce((s, c) => s + monthlyEquivalent(Number(c.amount), c.frequency), 0);
  const variableBudgetTotal = (budgets ?? []).reduce((s, b) => s + Number(b.planned_amount), 0);
  const savingsAmount = getSavingsAmount(savingsMode, savingsValue, monthlyIncome);
  const resteAVivre = monthlyIncome - monthlyFixedCharges - variableBudgetTotal - savingsAmount;

  const dailyVariableRate = variableBudgetTotal / days;
  const dailySavingsRate = savingsAmount / days;

  // Forecast: day-by-day balance across the selected month, anchored at the household's current balance.
  const points: { date: string; balance: number }[] = [];
  let running = currentBalance;
  for (let d = 1; d <= days; d++) {
    const dateISO = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const dayExpense = sumOccurrencesInRange(chargesList, dateISO, dateISO).total;
    const dayIncome = sumOccurrencesInRange(incomesRangeLike, dateISO, dateISO).total;
    running += dayIncome - dayExpense;
    points.push({ date: dateISO, balance: running });
  }
  const chargeEvents = sumOccurrencesInRange(chargesList, monthStartISO, monthEndISO).breakdown.map((b) => ({ date: b.date, label: b.name, amount: -b.amount }));
  const incomeEvents = sumOccurrencesInRange(incomesRangeLike, monthStartISO, monthEndISO).breakdown.map((b) => ({ date: b.date, label: b.name, amount: b.amount }));
  const events = [...chargeEvents, ...incomeEvents];

  const weeks = getWeeksOfMonth(year, month).map((w) => ({
    ...computePeriodAvailable(w, chargesList, incomesRangeLike, dailyVariableRate, dailySavingsRate),
    label: `${w.label} (${w.days}j)`,
  }));
  const weekends = getWeekendsOfMonth(year, month).map((w) => ({
    ...computePeriodAvailable(w, chargesList, incomesRangeLike, dailyVariableRate, dailySavingsRate),
    label: w.label,
  }));
  const monthCard = {
    ...computePeriodAvailable({ startISO: monthStartISO, endISO: monthEndISO, label: "Mois", days }, chargesList, incomesRangeLike, dailyVariableRate, dailySavingsRate),
    label: `${MONTHS_FR[month]} ${year}`,
  };

  const nextIncomeRaw = getNextIncomeAfter(incomesRangeLike, today);
  let nextIncome = null;
  if (nextIncomeRaw) {
    const untilISO = new Date(new Date(`${nextIncomeRaw.date}T00:00:00`).getTime() - 86_400_000).toISOString().slice(0, 10);
    const daysUntil = Math.max(1, Math.round((new Date(`${nextIncomeRaw.date}T00:00:00`).getTime() - new Date(`${today}T00:00:00`).getTime()) / 86_400_000));
    const chargesUntil = sumOccurrencesInRange(chargesList, today, untilISO).total;
    const available = currentBalance - chargesUntil - dailyVariableRate * daysUntil - dailySavingsRate * daysUntil;
    nextIncome = { ...nextIncomeRaw, days: daysUntil, available, perDay: available / daysUntil };
  }

  const spentByBudget = new Map<string, number>();
  for (const t of transactions ?? []) {
    if (t.variable_budget_id && t.kind === "expense") {
      spentByBudget.set(t.variable_budget_id, (spentByBudget.get(t.variable_budget_id) ?? 0) + Number(t.amount));
    }
  }

  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 30);
  const horizonISO = horizon.toISOString().slice(0, 10);
  const upcoming = [
    ...sumOccurrencesInRange(chargesList, today, horizonISO).breakdown.map((b) => ({ date: b.date, label: b.name, amount: b.amount, kind: "expense" as const })),
    ...sumOccurrencesInRange(incomesRangeLike, today, horizonISO).breakdown.map((b) => ({ date: b.date, label: b.name, amount: b.amount, kind: "income" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
          <p className="mt-1 text-sm text-slate-500">Vue d'ensemble de votre situation et de votre reste à vivre.</p>
        </div>
        <div className="flex items-center gap-2">
          <form action={updateBalance} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2 py-1">
            <span className="text-xs text-slate-400">Solde</span>
            <input name="current_balance" type="number" step="0.01" defaultValue={currentBalance} className="w-20 border-0 p-0 text-sm font-semibold focus:ring-0" />
            <button className="text-xs text-brand-600">✓</button>
          </form>
          <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-1 py-1">
            <Link href={`/app/finance?month=${shiftMonth(monthISO, -1)}`} className="rounded-lg px-2 py-1 text-sm hover:bg-slate-50">‹</Link>
            <span className="px-2 text-sm font-medium text-slate-700">{MONTHS_FR[month]} {year}</span>
            <Link href={`/app/finance?month=${shiftMonth(monthISO, 1)}`} className="rounded-lg px-2 py-1 text-sm hover:bg-slate-50">›</Link>
          </div>
          <AddOperationModal budgets={budgets ?? []} />
        </div>
      </div>

      <FinanceSummaryCards
        income={monthlyIncome}
        fixedCharges={monthlyFixedCharges}
        variableBudget={variableBudgetTotal}
        savings={savingsAmount}
        resteAVivre={resteAVivre}
        daysInMonth={days}
      />

      <section className="card p-6">
        <h2 className="font-semibold text-slate-900">Solde prévisionnel</h2>
        <p className="mb-2 text-sm text-slate-500">Évolution de votre solde en tenant compte de tous les mouvements prévus.</p>
        <ForecastBalanceChart points={points} events={events} monthLabel={`${MONTHS_FR[month]} ${year}`} />
      </section>

      <AvailableByPeriod weeks={weeks} weekends={weekends} month={monthCard} nextIncome={nextIncome} />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <VariableBudgetsSection budgets={budgets ?? []} spentByBudget={spentByBudget} />
        <div className="space-y-6">
          <RecurringCharges charges={chargesList} />
          <RecurringIncomes incomes={incomesList} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <SavingsSection mode={savingsMode} value={savingsValue} computedAmount={savingsAmount} investments={investments ?? []} />
        <UpcomingMovements items={upcoming} />
      </div>

      <section className="card p-6">
        <h2 className="font-semibold text-slate-900">Connexion bancaire</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          La synchronisation automatique avec ta carte bancaire nécessite un partenaire agréé (Open Banking, type
          Powens ou Bridge). En attendant, renseigne tes opérations manuellement ci-dessus.
        </p>
        <button disabled className="btn-secondary mt-4 opacity-50">Connecter ma carte (bientôt)</button>
      </section>
    </div>
  );
}
