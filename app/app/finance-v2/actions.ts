"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function refresh() {
  revalidatePath("/app/finance-v2");
  revalidatePath("/app/finance-v2/calendar");
  revalidatePath("/app/finance-v2/budgets");
  revalidatePath("/app/finance-v2/accounts");
  revalidatePath("/app/finance-v2/taxes");
}

export async function createAccount(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const type = String(formData.get("type") || "checking");
  if (!name) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("accounts").insert({ household_id: householdId, name, type, include_in_treasury: type === "checking" });
  refresh();
}

export async function deleteAccount(id: string) {
  const { supabase } = await ctx();
  await supabase.from("accounts").delete().eq("id", id);
  refresh();
}

/** Records a new dated, sourced balance point. Never overwrites earlier points — full history stays queryable. */
export async function addBalancePoint(accountId: string, formData: FormData) {
  const raw = String(formData.get("amount") ?? "").replace(",", ".");
  const amount = Number(raw);
  if (raw === "" || Number.isNaN(amount)) return;
  const effectiveDate = String(formData.get("effective_date") || "") || new Date().toISOString().slice(0, 10);
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("account_balance_points").insert({
    account_id: accountId,
    household_id: householdId,
    effective_date: effectiveDate,
    amount,
    source: "manual",
    created_by: userId,
  });
  refresh();
}

export async function createTransfer(formData: FormData) {
  const fromAccountId = String(formData.get("from_account_id") || "");
  const toAccountId = String(formData.get("to_account_id") || "");
  const amount = Number(String(formData.get("amount") || "0").replace(",", "."));
  const transferDate = String(formData.get("transfer_date") || "") || new Date().toISOString().slice(0, 10);
  if (!fromAccountId || !toAccountId || fromAccountId === toAccountId || !(amount > 0)) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("account_transfers").insert({
    household_id: householdId,
    from_account_id: fromAccountId,
    to_account_id: toAccountId,
    amount,
    transfer_date: transferDate,
    note: String(formData.get("note") || "").trim() || null,
    created_by: userId,
  });
  refresh();
}

export async function savePrefs(formData: FormData) {
  const includedAccounts = formData.getAll("included_accounts").map(String);
  const defaultMode = String(formData.get("default_mode") || "month");
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("finance_prefs").upsert({ household_id: householdId, included_accounts: includedAccounts, default_mode: defaultMode, updated_at: new Date().toISOString() });
  refresh();
}

/** Saves this month's theoretical budget explicitly — no month ever inherits another's numbers implicitly. */
export async function saveMonthlyBudget(year: number, month: number, formData: FormData) {
  const num = (k: string) => Math.max(0, Number(String(formData.get(k) ?? "0").replace(",", ".")) || 0);
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("monthly_budget_plans").upsert(
    { household_id: householdId, year, month, income: num("income"), fixed: num("fixed"), variable: num("variable"), savings: num("savings"), updated_at: new Date().toISOString() },
    { onConflict: "household_id,year,month" }
  );
  refresh();
}

/** Explicit reconduction: copies a source month's plan onto a target month (still a distinct row/decision). */
export async function reconductMonthlyBudget(sourceYear: number, sourceMonth: number, targetYear: number, targetMonth: number) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const { data: source } = await supabase.from("monthly_budget_plans").select("income, fixed, variable, savings").eq("household_id", householdId).eq("year", sourceYear).eq("month", sourceMonth).maybeSingle();
  if (!source) return;
  await supabase.from("monthly_budget_plans").upsert(
    { household_id: householdId, year: targetYear, month: targetMonth, ...source, updated_at: new Date().toISOString() },
    { onConflict: "household_id,year,month" }
  );
  refresh();
}

export async function saveTaxProfile(year: number, formData: FormData) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const inputs = {
    grossIncome: Number(String(formData.get("gross_income") || "0").replace(",", ".")) || 0,
    alreadyWithheld: Number(String(formData.get("already_withheld") || "0").replace(",", ".")) || 0,
    netAlreadyAfterWithholding: formData.get("net_after_withholding") === "on",
    householdParts: Number(String(formData.get("household_parts") || "1").replace(",", ".")) || 1,
  };
  const provisionRaw = String(formData.get("provision_manual") || "").replace(",", ".");
  const provisionManual = provisionRaw === "" ? null : Number(provisionRaw);
  await supabase.from("tax_profiles").upsert(
    { household_id: householdId, year, inputs, provision_manual: provisionManual, updated_at: new Date().toISOString() },
    { onConflict: "household_id,year" }
  );
  refresh();
}
