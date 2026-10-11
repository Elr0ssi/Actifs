import { cache } from "react";
import { getAppContext } from "@/lib/data/context";
import { ACCOUNTS, buildFinanceState, type AccountName, type BalanceEntryRow, type HouseholdFinanceRow, type TxnRow } from "@/lib/finance-load";
import { todayISO } from "@/lib/utils";
import { addDays as addDaysISO } from "@/lib/finance-engine";

export { ACCOUNTS, type AccountName };

/** Cached per request: the Finance layout (soldes) and the page share one set of queries. */
export const loadFinanceData = cache(async () => {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const today0 = todayISO();
  const [{ data: charges }, { data: incomes }, { data: entries }, { data: txns }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).order("next_date"),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date"),
    supabase.from("balance_entries").select("entry_date, balance, account").eq("household_id", householdId).order("entry_date"),
    supabase.from("transactions").select("id, label, merchant, amount, kind, txn_date, txn_time, card, category, source").eq("household_id", householdId).gte("txn_date", addDaysISO(today0, -120)).order("txn_date"),
  ]);

  const state = buildFinanceState(
    { charges: charges ?? [], incomes: incomes ?? [], entries: (entries ?? []) as BalanceEntryRow[], txns: (txns ?? []) as TxnRow[], household: household as HouseholdFinanceRow | null },
    todayISO()
  );

  return { supabase, householdId, ...state };
});
