import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type FinOp } from "@/lib/finance-engine";
import type { Account, AccountType, BalancePoint, Transfer } from "@/lib/finance-v2-engine";

export async function loadFinanceV2Data() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: accountRows }, { data: pointRows }, { data: transferRows }, { data: charges }, { data: incomes }, { data: prefs }, { data: plans }, { data: taxRows }] =
    await Promise.all([
      supabase.from("accounts").select("*").eq("household_id", householdId).order("position").order("created_at"),
      supabase.from("account_balance_points").select("*").eq("household_id", householdId).order("effective_date"),
      supabase.from("account_transfers").select("*").eq("household_id", householdId).order("transfer_date"),
      supabase.from("recurring_charges").select("*").eq("household_id", householdId),
      supabase.from("incomes").select("*").eq("household_id", householdId),
      supabase.from("finance_prefs").select("*").eq("household_id", householdId).maybeSingle(),
      supabase.from("monthly_budget_plans").select("*").eq("household_id", householdId),
      supabase.from("tax_profiles").select("*").eq("household_id", householdId).order("year", { ascending: false }),
    ]);

  const accounts: Account[] = (accountRows ?? []).map((a) => ({ id: a.id, name: a.name, type: a.type as AccountType, includeInTreasury: a.include_in_treasury }));
  const points: BalancePoint[] = (pointRows ?? []).map((p) => ({ accountId: p.account_id, effectiveDate: p.effective_date, amount: Number(p.amount), source: p.source }));
  const transfers: Transfer[] = (transferRows ?? []).map((t) => ({ fromAccountId: t.from_account_id, toAccountId: t.to_account_id, amount: Number(t.amount), transferDate: t.transfer_date }));
  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp)];

  const includedAccounts: string[] = prefs?.included_accounts?.length ? prefs.included_accounts : accounts.filter((a) => a.includeInTreasury).map((a) => a.id);

  const plansByMonth = new Map((plans ?? []).map((p) => [`${p.year}-${p.month}`, { income: Number(p.income), fixed: Number(p.fixed), variable: Number(p.variable), savings: Number(p.savings) }]));

  return {
    supabase,
    householdId,
    accounts,
    points,
    transfers,
    ops,
    prefs: {
      includedAccounts,
      hiddenCategories: prefs?.hidden_categories ?? [],
      envelopeOrder: prefs?.envelope_order ?? [],
      defaultMode: (prefs?.default_mode as "month" | "carried") ?? "month",
    },
    plansByMonth,
    taxProfiles: (taxRows ?? []).map((t) => ({ year: t.year, inputs: t.inputs as Record<string, number>, provisionManual: t.provision_manual !== null ? Number(t.provision_manual) : null })),
  };
}
