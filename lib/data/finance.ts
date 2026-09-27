import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";

export const ACCOUNTS = ["Courant", "Épargne", "Investissement"] as const;
export type AccountName = (typeof ACCOUNTS)[number];

export async function loadFinanceData() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: snapshots }, { data: entries }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).order("next_date"),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date"),
    supabase.from("forecast_snapshots").select("month, balances").eq("household_id", householdId),
    supabase.from("balance_entries").select("entry_date, balance, account").eq("household_id", householdId).order("entry_date"),
  ]);

  const h = household as (typeof household & { budget_income?: number; budget_fixed?: number; budget_variable?: number; savings_goal?: number; investment_goal?: number }) | null;
  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp)];
  const allEntries = (entries ?? []) as { entry_date: string; balance: number; account: AccountName }[];
  const entriesByAccount = (name: AccountName) => allEntries.filter((e) => e.account === name).map((e) => ({ date: e.entry_date, balance: Number(e.balance) }));

  const courantEntries = entriesByAccount("Courant");
  const lastCourant = courantEntries[courantEntries.length - 1];
  // Courant stays the engine's anchor (still cached on households for quick reads / back-compat).
  const anchor: BalanceAnchor = lastCourant
    ? { balance: lastCourant.balance, date: lastCourant.date }
    : { balance: Number(household?.current_balance ?? 0), date: (household as { balance_ref_date?: string } | null)?.balance_ref_date ?? todayISO() };

  const accounts = Object.fromEntries(
    ACCOUNTS.map((name) => {
      const list = entriesByAccount(name);
      return [name, { history: list, last: list[list.length - 1] ?? null }];
    })
  ) as Record<AccountName, { history: { date: string; balance: number }[]; last: { date: string; balance: number } | null }>;

  return {
    supabase,
    householdId,
    ops,
    anchor,
    accounts,
    goals: { savings: Number(h?.savings_goal ?? 0), investment: Number(h?.investment_goal ?? 0) },
    plan: {
      income: Number(h?.budget_income ?? 0),
      fixed: Number(h?.budget_fixed ?? 0),
      variable: Number(h?.budget_variable ?? 0),
      savingsMode: (h?.savings_mode ?? "fixed") as "fixed" | "percent",
      savingsValue: Number(h?.savings_value ?? 0),
    },
    realBalances: courantEntries,
    snapshots: Object.fromEntries((snapshots ?? []).map((s) => [s.month as string, s.balances as number[]])),
  };
}
