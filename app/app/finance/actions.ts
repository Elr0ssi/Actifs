"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { OpTable } from "@/lib/finance-engine";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function refresh() {
  revalidatePath("/app/finance");
  revalidatePath("/app/finance/operations");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

const tableName = (t: OpTable) => (t === "income" ? "incomes" : "recurring_charges");

function parseOperation(formData: FormData) {
  const kind = String(formData.get("kind") || "fixed");
  const frequency = String(formData.get("frequency") || "once");
  const start = String(formData.get("start") || new Date().toISOString().slice(0, 10));
  const monthDays = String(formData.get("month_days") || "")
    .split(/[,\s]+/)
    .map(Number)
    .filter((n) => n >= 1 && n <= 31);
  const common = {
    name: String(formData.get("name") || "").trim(),
    amount: Math.abs(Number(formData.get("amount") || 0)),
    category: String(formData.get("category") || "").trim() || (kind === "income" ? "Revenu" : "Autre"),
    frequency,
    interval_count: Math.max(1, Number(formData.get("interval") || 1)),
    weekdays: formData.getAll("weekdays").map(Number),
    month_days: monthDays,
    end_date: String(formData.get("end_date") || "") || null,
    note: String(formData.get("note") || "").trim() || null,
    account: String(formData.get("account") || "").trim() || null,
  };
  if (kind === "income") {
    return { table: "income" as const, row: { ...common, expected_date: start, recurring: frequency !== "once" } };
  }
  return { table: "charge" as const, row: { ...common, next_date: start, kind } };
}

export async function createOperation(formData: FormData) {
  const { table, row } = parseOperation(formData);
  if (!row.name || !row.amount) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from(tableName(table)).insert({ ...row, household_id: householdId, created_by: userId });
  refresh();
}

export async function updateOperation(originalTable: OpTable, id: string, formData: FormData) {
  const { table, row } = parseOperation(formData);
  if (!row.name || !row.amount) return;
  const { supabase, householdId, userId } = await ctx();
  if (table === originalTable) {
    await supabase.from(tableName(table)).update(row).eq("id", id);
  } else {
    // Kind switched between income and expense: move the row to the other table.
    await supabase.from(tableName(originalTable)).delete().eq("id", id);
    await supabase.from(tableName(table)).insert({ ...row, household_id: householdId, created_by: userId });
  }
  refresh();
}

export async function toggleOperationActive(table: OpTable, id: string, active: boolean) {
  const { supabase } = await ctx();
  await supabase.from(tableName(table)).update({ active }).eq("id", id);
  refresh();
}

export async function deleteOperation(table: OpTable, id: string) {
  const { supabase } = await ctx();
  await supabase.from(tableName(table)).delete().eq("id", id);
  refresh();
}

async function setSkipped(table: OpTable, id: string, date: string, skip: boolean) {
  const { supabase } = await ctx();
  const { data } = await supabase.from(tableName(table)).select("skipped_dates").eq("id", id).single();
  const current: string[] = data?.skipped_dates ?? [];
  const next = skip ? Array.from(new Set([...current, date])) : current.filter((d) => d !== date);
  await supabase.from(tableName(table)).update({ skipped_dates: next }).eq("id", id);
  refresh();
}

export async function skipOccurrence(table: OpTable, id: string, date: string) {
  await setSkipped(table, id, date, true);
}

export async function restoreOccurrence(table: OpTable, id: string, date: string) {
  await setSkipped(table, id, date, false);
}

/** Records a real bank balance at a date: feeds the "réel" curve and re-anchors the forecast on the latest entry. */
export async function updateBalanceAnchor(formData: FormData) {
  const raw = String(formData.get("current_balance") ?? "").replace(",", ".");
  const balance = Number(raw);
  if (raw === "" || Number.isNaN(balance)) return;
  const date = String(formData.get("entry_date") || "") || new Date().toISOString().slice(0, 10);
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("balance_entries").upsert({ household_id: householdId, entry_date: date, balance }, { onConflict: "household_id,entry_date" });
  const { data: latest } = await supabase
    .from("balance_entries")
    .select("entry_date, balance")
    .eq("household_id", householdId)
    .order("entry_date", { ascending: false })
    .limit(1)
    .single();
  if (latest) {
    await supabase.from("households").update({ current_balance: latest.balance, balance_ref_date: latest.entry_date }).eq("id", householdId);
  }
  refresh();
}

export async function deleteBalanceEntry(date: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("balance_entries").delete().eq("household_id", householdId).eq("entry_date", date);
  refresh();
}

export async function createVariableBudget(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("planned_amount") || 0);
  if (!name || !amount) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("variable_budgets").insert({ household_id: householdId, name, planned_amount: amount });
  refresh();
}

export async function updateVariableBudget(id: string, formData: FormData) {
  const amount = Number(formData.get("planned_amount") || 0);
  const { supabase } = await ctx();
  await supabase.from("variable_budgets").update({ planned_amount: amount }).eq("id", id);
  refresh();
}

export async function deleteVariableBudget(id: string) {
  const { supabase } = await ctx();
  await supabase.from("variable_budgets").delete().eq("id", id);
  refresh();
}

export async function updateSavingsConfig(formData: FormData) {
  const mode = String(formData.get("savings_mode") || "fixed");
  const value = Number(formData.get("savings_value") || 0);
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("households").update({ savings_mode: mode, savings_value: value }).eq("id", householdId);
  refresh();
}
