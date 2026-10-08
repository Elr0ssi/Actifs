import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Recipe, RecipeItem } from "@/lib/types";
import { RecipesTabs } from "@/components/app/recipes/recipes-tabs";
import { loadCatalog } from "@/lib/data/ingredients";

export const metadata: Metadata = { title: "Recettes" };

export default async function RecipesPage() {
  const tr = getT();
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: recipes }, { catalog }] = await Promise.all([
    supabase
      .from("recipes")
      .select("*, recipe_items(*)")
      .eq("household_id", householdId)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false }),
    loadCatalog(supabase),
  ]);

  const typed = ((recipes ?? []) as unknown as (Recipe & { recipe_items: RecipeItem[] })[]).map((r) => ({
    ...r,
    recipe_items: [...r.recipe_items].sort((a, b) => a.position - b.position),
  }));
  const categories = [...new Set(typed.map((r) => r.category).filter(Boolean) as string[])];

  return (
    <div className="space-y-8">
      <p className="text-xs text-stone-500">{tr("Compose tes repas avec tes ingrédients ; ils serviront à remplir tes listes de courses.")}</p>

      <RecipesTabs recipes={typed} householdId={householdId} categories={categories} catalog={catalog} />
    </div>
  );
}
