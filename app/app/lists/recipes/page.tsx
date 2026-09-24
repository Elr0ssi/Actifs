import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Recipe, RecipeItem } from "@/lib/types";
import { createRecipe, deleteRecipe } from "@/app/app/lists/recipes/actions";
import { GenerateListButton } from "@/components/app/generate-list-button";

export const metadata: Metadata = { title: "Recettes" };

export default async function RecipesPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const { data: recipes } = await supabase
    .from("recipes")
    .select("*, recipe_items(*)")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  type RecipeWithItems = Recipe & { recipe_items: RecipeItem[] };
  const typed = (recipes ?? []) as unknown as RecipeWithItems[];

  return (
    <div className="space-y-8">
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Recettes</h1>
        <p className="mt-1 text-sm text-slate-500">Prépare un repas une fois, régénère sa liste de courses en un clic.</p>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouvelle recette</h2>
        <form action={createRecipe} className="space-y-2">
          <div className="flex gap-2">
            <input name="name" placeholder="Nom (ex. Poulet basquaise)" className="input flex-1" required />
            <input name="category" placeholder="Catégorie" defaultValue="Repas" className="input w-40" />
          </div>
          <textarea name="items" rows={4} className="input" placeholder={"Ingrédients, un par ligne :\n- Poulet\n- Poivrons\n- Riz"} />
          <button className="btn-primary">Créer la recette</button>
        </form>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {typed.length === 0 && <p className="text-sm text-slate-400">Aucune recette pour l'instant.</p>}
        {typed.map((r) => (
          <div key={r.id} className="card p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-slate-900">{r.name}</p>
                <p className="text-xs text-slate-400">{r.category}</p>
              </div>
              <form action={deleteRecipe.bind(null, r.id)}>
                <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
              </form>
            </div>
            <ul className="mt-3 space-y-0.5 text-sm text-slate-600">
              {r.recipe_items.slice(0, 5).map((it) => (
                <li key={it.id}>• {it.label}</li>
              ))}
              {r.recipe_items.length > 5 && <li className="text-slate-400">+ {r.recipe_items.length - 5} autres</li>}
            </ul>
            <div className="mt-4">
              <GenerateListButton recipeId={r.id} recipeName={r.name} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
