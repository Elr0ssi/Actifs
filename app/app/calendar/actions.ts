"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { RoutineFrequency } from "@/lib/types";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

export async function createRoutine(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const category = String(formData.get("category") || "Général").trim() || "Général";
  const frequency = String(formData.get("frequency") || "daily") as RoutineFrequency;
  const days = formData.getAll("days").map(Number);
  if (!title) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("routines").insert({
    household_id: householdId,
    user_id: userId,
    title,
    category,
    frequency,
    days_of_week: frequency === "weekly" ? days : [0, 1, 2, 3, 4, 5, 6],
  });
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

export async function deleteRoutine(id: string) {
  const { supabase } = await ctx();
  await supabase.from("routines").update({ active: false }).eq("id", id);
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}
