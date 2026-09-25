import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";

export async function loadFinanceData() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: snapshots }, { data: entries }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).order("next_date"),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date"),
    supabase.from("forecast_snapshots").select("month, balances").eq("household_id", householdId),
    supabase.from("balance_entries").select("entry_date, balance").eq("household_id", householdId).order("entry_date"),
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
    savingsRule: { mode: (household?.savings_mode ?? "fixed") as "fixed" | "percent", value: Number(household?.savings_value ?? 0) },
    realBalances: (entries ?? []).map((e) => ({ date: e.entry_date as string, balance: Number(e.balance) })),
    snapshots: Object.fromEntries((snapshots ?? []).map((s) => [s.month as string, s.balances as number[]])),
  };
}
