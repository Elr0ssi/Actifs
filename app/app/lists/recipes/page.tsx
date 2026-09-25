import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Recipe, RecipeItem } from "@/lib/types";
import { RecipeForm } from "@/components/app/recipes/recipe-form";
import { RecipeCard } from "@/components/app/recipes/recipe-card";
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
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recettes</h1>
        <p className="mt-1 text-sm text-slate-500">Compose tes repas avec tes ingrédients ; ils serviront à remplir tes listes de courses.</p>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 text-sm font-semibold text-slate-700">Nouvelle recette</h2>
        <RecipeForm householdId={householdId} categories={categories} catalog={catalog} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {typed.length === 0 && <p className="text-sm text-slate-400">Aucune recette pour l'instant.</p>}
        {typed.map((r) => (
          <RecipeCard key={r.id} recipe={r} householdId={householdId} categories={categories} catalog={catalog} />
        ))}
      </div>
    </div>
  );
}
