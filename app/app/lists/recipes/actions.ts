"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ensureIngredients, parsePicked } from "@/lib/data/ingredients";
import { formatQty } from "@/lib/shopping";
import { getRecipe } from "@/lib/marketing/recipes";
import { buildMatcher, parseIngredientLine } from "@/lib/ingredient-parse";
import type { CatalogIngredient, IngredientUnit } from "@/lib/shopping";

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
    notes: String(formData.get("notes") || "").trim().slice(0, 10000) || null,
    servings: Math.min(50, Math.max(1, Math.round(Number(formData.get("servings") || 4)) || 4)),
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
  revalidatePath("/app/lists", "layout");
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const { picked, ...recipe } = readRecipe(formData);
  if (!recipe.name) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("recipes").update(recipe).eq("id", recipeId);
  await saveItems(supabase, householdId, recipeId, picked);
  revalidatePath("/app/lists", "layout");
}

export async function toggleRecipeFavorite(recipeId: string, favorite: boolean) {
  const { supabase } = await ctx();
  await supabase.from("recipes").update({ is_favorite: favorite }).eq("id", recipeId);
  revalidatePath("/app/lists", "layout");
}

export async function deleteRecipe(recipeId: string) {
  const { supabase } = await ctx();
  await supabase.from("recipes").delete().eq("id", recipeId);
  revalidatePath("/app/lists", "layout");
}

/**
 * Copie une recette d'inspiration (base fournie) dans "Mes recettes" du foyer.
 * Si elle y est déjà (même nom), on la réutilise au lieu de la dupliquer.
 */
export async function importInspirationRecipe(slug: string, favorite = false): Promise<{ id: string; name: string; itemCount: number } | null> {
  const source = getRecipe(slug);
  if (!source) return null;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return null;

  const { data: existing } = await supabase
    .from("recipes")
    .select("id, name")
    .eq("household_id", householdId)
    .or(`source_slug.eq.${slug},name.ilike.${source.name.replace(/[\\%_,()]/g, "_")}`)
    .limit(1);
  if (existing?.[0]) {
    if (favorite) await supabase.from("recipes").update({ is_favorite: true }).eq("id", existing[0].id);
    revalidatePath("/app/lists", "layout");
    return { id: existing[0].id, name: existing[0].name, itemCount: source.ingredients.length };
  }

  const { data } = await supabase
    .from("recipes")
    .insert({ name: source.name, category: source.category, image_url: null, servings: source.servings, source_slug: slug, is_favorite: favorite, household_id: householdId, created_by: userId })
    .select("id")
    .single();
  if (!data?.id) return null;

  const { data: cat } = await supabase.from("ingredients").select("id, name, unit, household_id");
  const catalog = (cat ?? []).map((i) => ({ id: i.id as string, name: i.name as string, unit: i.unit as IngredientUnit, personal: i.household_id !== null })) as CatalogIngredient[];
  const match = buildMatcher(catalog);
  await supabase.from("recipe_items").insert(
    source.ingredients.map((line, i) => {
      const p = parseIngredientLine(line);
      const c = match(p.name);
      return {
        recipe_id: data.id,
        ingredient_id: c?.id ?? null,
        label: p.name,
        quantity: p.qty === null ? null : line.replace(p.name, "").trim() || null,
        qty: p.qty,
        qty_unit: p.qty === null ? null : p.unit,
        position: i,
      };
    })
  );
  revalidatePath("/app/lists", "layout");
  return { id: data.id, name: source.name, itemCount: source.ingredients.length };
}

/** Cœur des recettes d'inspiration : ajoute ou retire des favoris (les favoris apparaissent dans « Mes recettes »). */
export async function setInspirationFavorite(slug: string, favorite: boolean) {
  if (favorite) {
    await importInspirationRecipe(slug, true);
    return;
  }
  const source = getRecipe(slug);
  const { supabase, householdId } = await ctx();
  if (!source || !householdId) return;
  await supabase
    .from("recipes")
    .update({ is_favorite: false })
    .eq("household_id", householdId)
    .or(`source_slug.eq.${slug},name.ilike.${source.name.replace(/[\\%_,()]/g, "_")}`);
  revalidatePath("/app/lists", "layout");
}
