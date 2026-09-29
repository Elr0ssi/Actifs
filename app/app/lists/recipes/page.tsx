import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Recipe, RecipeItem } from "@/lib/types";
import { RecipesTabs } from "@/components/app/recipes/recipes-tabs";
import { loadCatalog } from "@/lib/data/ingredients";

export const metadata: Metadata = { title: "Recettes" };

export default async function RecipesPage() {
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
      <Link href="/app/lists" className="text-sm font-medium text-stone-500 hover:text-stone-800">← Listes</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Recettes</h1>
        <p className="mt-1 text-sm text-stone-500">Compose tes repas avec tes ingrédients ; ils serviront à remplir tes listes de courses.</p>
      </div>

      <RecipesTabs recipes={typed} householdId={householdId} categories={categories} catalog={catalog} />
    </div>
  );
}
