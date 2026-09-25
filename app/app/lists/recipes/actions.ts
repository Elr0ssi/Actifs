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

function parseBulkLines(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.replace(/^[\s]*[-*•▪️✓☐☑]+\s*/, "").trim())
    .filter(Boolean);
}

function readRecipe(formData: FormData) {
  return {
    name: String(formData.get("name") || "").trim(),
    category: String(formData.get("category") || "").trim() || "Repas",
    image_url: String(formData.get("image_url") || "") || null,
    notes: String(formData.get("notes") || "").trim() || null,
    lines: parseBulkLines(String(formData.get("items") || "")),
  };
}

export async function createRecipe(formData: FormData) {
  const { lines, ...recipe } = readRecipe(formData);
  if (!recipe.name) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase.from("recipes").insert({ ...recipe, household_id: householdId, created_by: userId }).select("id").single();
  if (data?.id && lines.length > 0) {
    await supabase.from("recipe_items").insert(lines.map((label, i) => ({ recipe_id: data.id, label, position: i })));
  }
  revalidatePath("/app/lists/recipes");
}

export async function updateRecipe(recipeId: string, formData: FormData) {
  const { lines, ...recipe } = readRecipe(formData);
  if (!recipe.name) return;
  const { supabase } = await ctx();
  await supabase.from("recipes").update(recipe).eq("id", recipeId);
  await supabase.from("recipe_items").delete().eq("recipe_id", recipeId);
  if (lines.length > 0) {
    await supabase.from("recipe_items").insert(lines.map((label, i) => ({ recipe_id: recipeId, label, position: i })));
  }
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

export async function generateListFromRecipe(recipeId: string, recipeName: string) {
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;

  const { data: items } = await supabase.from("recipe_items").select("label, quantity, note").eq("recipe_id", recipeId);

  const { data: list } = await supabase
    .from("lists")
    .insert({
      household_id: householdId,
      name: `Courses — ${recipeName}`,
      category: "Courses",
      type: "shopping",
      created_by: userId,
    })
    .select("id")
    .single();

  if (list?.id && items && items.length > 0) {
    await supabase
      .from("list_items")
      .insert(items.map((it, i) => ({ list_id: list.id, label: it.label, quantity: it.quantity, note: it.note, position: i })));
  }
  revalidatePath("/app/lists");
  return list?.id as string | undefined;
}
