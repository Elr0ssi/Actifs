import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";

export async function loadFinanceData() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: budgets }, { data: snapshots }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).order("next_date"),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date"),
    supabase.from("variable_budgets").select("*").eq("household_id", householdId).order("created_at"),
    supabase.from("forecast_snapshots").select("month, balances").eq("household_id", householdId),
  ]);

  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp)];
  const anchor: BalanceAnchor = {
    balance: Number(household?.current_balance ?? 0),
    date: (household as { balance_ref_date?: string } | null)?.balance_ref_date ?? todayISO(),
  };

  return {
    supabase,
    householdId,
    ops,
    anchor,
    budgets: (budgets ?? []).map((b) => ({ id: b.id as string, name: b.name as string, amount: Number(b.planned_amount) })),
    savingsRule: { mode: (household?.savings_mode ?? "fixed") as "fixed" | "percent", value: Number(household?.savings_value ?? 0) },
    snapshots: Object.fromEntries((snapshots ?? []).map((s) => [s.month as string, s.balances as number[]])),
  };
}
