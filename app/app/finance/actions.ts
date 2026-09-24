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
  if (!name || !amount || !nextDate) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("recurring_charges").insert({ household_id: householdId, name, amount, frequency, next_date: nextDate, created_by: userId });
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
