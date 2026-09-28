import { cache } from "react";
import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";

export const ACCOUNTS = ["Courant", "Épargne", "Investissement"] as const;
export type AccountName = (typeof ACCOUNTS)[number];

/** Cached per request: the Finance layout (soldes) and the page share one set of queries. */
export const loadFinanceData = cache(async () => {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: entries }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).order("next_date"),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date"),
    supabase.from("balance_entries").select("entry_date, balance, account").eq("household_id", householdId).order("entry_date"),
  ]);

  const h = household as (typeof household & { savings_goal?: number; investment_goal?: number }) | null;
  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp)];
  const allEntries = (entries ?? []) as { entry_date: string; balance: number; account: AccountName }[];
  const entriesByAccount = (name: AccountName) => allEntries.filter((e) => e.account === name).map((e) => ({ date: e.entry_date, balance: Number(e.balance) }));

  const today = todayISO();
  // A balance entered for a future date is a prediction, not a known fact yet — never use it as
  // "today's" anchor, or every past/current calculation would be thrown off by it.
  const lastKnown = (list: { date: string; balance: number }[]) => [...list].filter((e) => e.date <= today).pop() ?? null;

  const courantEntries = entriesByAccount("Courant");
  const lastCourant = lastKnown(courantEntries);
  // Courant stays the engine's anchor (still cached on households for quick reads / back-compat).
  const anchor: BalanceAnchor = lastCourant
    ? { balance: lastCourant.balance, date: lastCourant.date }
    : { balance: Number(household?.current_balance ?? 0), date: (household as { balance_ref_date?: string } | null)?.balance_ref_date ?? today };

  const accounts = Object.fromEntries(
    ACCOUNTS.map((name) => {
      const list = entriesByAccount(name);
      return [name, { history: list, last: lastKnown(list) }];
    })
  ) as Record<AccountName, { history: { date: string; balance: number }[]; last: { date: string; balance: number } | null }>;

  return {
    supabase,
    householdId,
    ops,
    anchor,
    accounts,
    goals: { savings: Number(h?.savings_goal ?? 0), investment: Number(h?.investment_goal ?? 0) },
  };
});
