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

/** Ajoute des repas à un jour du menu (sans toucher aux listes de courses). Un même repas n'est pas ajouté deux fois le même jour. */
export async function addMenuItems(day: string, meals: { name: string; icon: string | null; servings?: number }[]) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || meals.length === 0) return;
  const monday = new Date(Date.parse(`${day}T00:00:00Z`) - ((new Date(`${day}T00:00:00Z`).getUTCDay() + 6) % 7) * 86_400_000).toISOString().slice(0, 10);
  const { data: existing } = await supabase.from("menu_items").select("name").eq("household_id", householdId).eq("day", day);
  const have = new Set((existing ?? []).map((e) => e.name.toLowerCase()));
  const rows = meals
    .filter((m) => m.name.trim() && !have.has(m.name.trim().toLowerCase()))
    .slice(0, 50)
    .map((m) => ({ household_id: householdId, week_start: monday, day, name: m.name.trim().slice(0, 120), icon: m.icon?.slice(0, 8) ?? null, servings: m.servings ? Math.min(100, Math.max(1, Math.round(m.servings))) : null, created_by: userId }));
  if (rows.length) await supabase.from("menu_items").insert(rows);
  refresh();
}

export async function removeMenuItem(id: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("menu_items").delete().eq("id", id).eq("household_id", householdId);
  refresh();
}

/** Change le nombre de personnes d'un repas planifié. */
export async function setMenuServings(id: string, servings: number) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("menu_items").update({ servings: Math.min(100, Math.max(1, Math.round(servings))) }).eq("id", id).eq("household_id", householdId);
  refresh();
}
