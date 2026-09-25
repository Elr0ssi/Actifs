"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ChargeFrequency } from "@/lib/types";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

export async function createCharge(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const frequency = String(formData.get("frequency") || "monthly") as ChargeFrequency;
  const nextDate = String(formData.get("next_date") || "");
  const category = String(formData.get("category") || "Autre").trim() || "Autre";
  if (!name || !amount || !nextDate) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("recurring_charges").insert({ household_id: householdId, name, amount, frequency, next_date: nextDate, category, created_by: userId });
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

export async function deleteCharge(id: string) {
  const { supabase } = await ctx();
  await supabase.from("recurring_charges").delete().eq("id", id);
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
}

export async function toggleChargeActive(id: string, active: boolean) {
  const { supabase } = await ctx();
  await supabase.from("recurring_charges").update({ active }).eq("id", id);
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

export async function createIncome(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const expectedDate = String(formData.get("expected_date") || "");
  const recurring = formData.get("recurring") === "on";
  const frequency = String(formData.get("frequency") || "monthly") as ChargeFrequency;
  if (!name || !amount || !expectedDate) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("incomes").insert({ household_id: householdId, name, amount, expected_date: expectedDate, recurring, frequency, created_by: userId });
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

export async function markIncomeReceived(id: string) {
  const { supabase } = await ctx();
  await supabase.from("incomes").update({ status: "received" }).eq("id", id);
  revalidatePath("/app/finance");
}

export async function deleteIncome(id: string) {
  const { supabase } = await ctx();
  await supabase.from("incomes").delete().eq("id", id);
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
}

export async function toggleIncomeActive(id: string, active: boolean) {
  const { supabase } = await ctx();
  await supabase.from("incomes").update({ active }).eq("id", id);
  revalidatePath("/app/finance");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

export async function createInvestment(formData: FormData) {
  const projectName = String(formData.get("project_name") || "").trim();
  const amountInvested = Number(formData.get("amount_invested") || 0);
  const investedDate = String(formData.get("invested_date") || "");
  const expectedReturn = formData.get("expected_return") ? Number(formData.get("expected_return")) : null;
  const expectedReturnDate = String(formData.get("expected_return_date") || "") || null;
  const notes = String(formData.get("notes") || "") || null;
  if (!projectName || !amountInvested || !investedDate) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("investments").insert({
    household_id: householdId,
    project_name: projectName,
    amount_invested: amountInvested,
    invested_date: investedDate,
    expected_return: expectedReturn,
    expected_return_date: expectedReturnDate,
    notes,
    created_by: userId,
  });
  revalidatePath("/app/finance");
}

export async function deleteInvestment(id: string) {
  const { supabase } = await ctx();
  await supabase.from("investments").delete().eq("id", id);
  revalidatePath("/app/finance");
}

export async function createVariableBudget(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const amount = Number(formData.get("planned_amount") || 0);
  const icon = String(formData.get("icon") || "💳").trim() || "💳";
  if (!name || !amount) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const { count } = await supabase.from("variable_budgets").select("*", { count: "exact", head: true }).eq("household_id", householdId);
  await supabase.from("variable_budgets").insert({ household_id: householdId, name, planned_amount: amount, icon, position: count ?? 0 });
  revalidatePath("/app/finance");
}

export async function updateVariableBudget(id: string, formData: FormData) {
  const amount = Number(formData.get("planned_amount") || 0);
  if (!amount) return;
  const { supabase } = await ctx();
  await supabase.from("variable_budgets").update({ planned_amount: amount }).eq("id", id);
  revalidatePath("/app/finance");
}

export async function deleteVariableBudget(id: string) {
  const { supabase } = await ctx();
  await supabase.from("variable_budgets").delete().eq("id", id);
  revalidatePath("/app/finance");
}

export async function updateSavingsConfig(formData: FormData) {
  const mode = String(formData.get("savings_mode") || "fixed");
  const value = Number(formData.get("savings_value") || 0);
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("households").update({ savings_mode: mode, savings_value: value }).eq("id", householdId);
  revalidatePath("/app/finance");
  revalidatePath("/app");
}

export async function addOperation(formData: FormData) {
  const kind = String(formData.get("op_kind") || "expense");
  const label = String(formData.get("label") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const date = String(formData.get("txn_date") || todayISOLocal());
  const variableBudgetId = String(formData.get("variable_budget_id") || "") || null;
  if (!label || !amount) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;

  if (kind === "investment") {
    await supabase.from("investments").insert({
      household_id: householdId,
      project_name: label,
      amount_invested: amount,
      invested_date: date,
      created_by: userId,
    });
  } else {
    await supabase.from("transactions").insert({
      household_id: householdId,
      label,
      amount,
      kind: kind === "income" ? "income" : "expense",
      txn_date: date,
      variable_budget_id: variableBudgetId,
      source: "manual",
      created_by: userId,
    });
  }
  revalidatePath("/app/finance");
}

function todayISOLocal() {
  return new Date().toISOString().slice(0, 10);
}
