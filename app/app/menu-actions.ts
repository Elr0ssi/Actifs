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

const refresh = () => {
  revalidatePath("/app", "layout");
};

/** Ajoute des repas au menu de la semaine (sans toucher aux listes de courses). Les doublons du même nom sont ignorés. */
export async function addMenuItems(weekStart: string, meals: { name: string; icon: string | null }[]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart)) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || meals.length === 0) return;
  const { data: existing } = await supabase.from("menu_items").select("name").eq("household_id", householdId).eq("week_start", weekStart);
  const have = new Set((existing ?? []).map((e) => e.name.toLowerCase()));
  const rows = meals
    .filter((m) => m.name.trim() && !have.has(m.name.trim().toLowerCase()))
    .slice(0, 50)
    .map((m) => ({ household_id: householdId, week_start: weekStart, name: m.name.trim().slice(0, 120), icon: m.icon?.slice(0, 8) ?? null, created_by: userId }));
  if (rows.length) await supabase.from("menu_items").insert(rows);
  refresh();
}

export async function removeMenuItem(id: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("menu_items").delete().eq("id", id).eq("household_id", householdId);
  refresh();
}
