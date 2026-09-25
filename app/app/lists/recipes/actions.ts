"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ensureIngredients, parsePicked } from "@/lib/data/ingredients";
import { formatQty } from "@/lib/shopping";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function readRecipe(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim() || "Repas",
    image_url: String(formData.get("image_url") || "") || null,
    picked: parsePicked(formData.get("ingredients")),
  };
}

async function saveItems(supabase: ReturnType<typeof createClient>, householdId: string, recipeId: string, picked: ReturnType<typeof parsePicked>) {
  await supabase.from("recipe_items").delete().eq("recipe_id", recipeId);
  if (!picked.length) return;
  const ids = await ensureIngredients(supabase, householdId, picked);
  await supabase.from("recipe_items").insert(
    picked.map((p, i) => ({
      recipe_id: recipeId,
      ingredient_id: ids.get(p.name.trim().toLowerCase())?.id ?? null,
      label: p.name.trim(),
      qty: p.qty || null,
      qty_unit: p.qtyUnit ?? null,
      quantity: formatQty(p.qty, p.qtyUnit),
      position: i,
    }))
  );
}

export async function createRecipe(formData: FormData) {
  const { picked, ...recipe } = readRecipe(formData);
  if (!recipe.name) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase.from("recipes").insert({ ...recipe, household_id: householdId, created_by: userId }).select("id").single();
  if (data?.id) await saveItems(supabase, householdId, data.id, picked);
  revalidatePath("/app/lists/recipes");
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const { picked, ...recipe } = readRecipe(formData);
  if (!recipe.name) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("recipes").update(recipe).eq("id", recipeId);
  await saveItems(supabase, householdId, recipeId, picked);
  revalidatePath("/app/lists/recipes");
}

export async function toggleRecipeFavorite(recipeId: string, favorite: boolean) {
  const { supabase } = await ctx();
  await supabase.from("recipes").update({ is_favorite: favorite }).eq("id", recipeId);
  revalidatePath("/app/lists/recipes");
}

export async function deleteRecipe(recipeId: string) {
  const { supabase } = await ctx();
  await supabase.from("recipes").delete().eq("id", recipeId);
  revalidatePath("/app/lists/recipes");
}
