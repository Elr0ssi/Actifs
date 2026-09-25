"use client";

import { useState, useTransition } from "react";
import { RecipeForm } from "@/components/app/recipes/recipe-form";
import { deleteRecipe, toggleRecipeFavorite } from "@/app/app/lists/recipes/actions";
import type { Recipe, RecipeItem } from "@/lib/types";
import { cx } from "@/lib/utils";

export function RecipeCard({ recipe, householdId, categories, catalog }: { recipe: Recipe & { recipe_items: RecipeItem[] }; householdId: string; categories: string[]; catalog: { id: string; name: string }[] }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <div className="card p-5 sm:col-span-2 lg:col-span-3">
        <RecipeForm recipe={recipe} householdId={householdId} categories={categories} catalog={catalog} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={cx("card flex flex-col overflow-hidden", pending && "opacity-60")}>
      <div className="relative aspect-[16/10] bg-slate-100">
        {recipe.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image_url} alt={recipe.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
        )}
        <button
          onClick={() => start(() => toggleRecipeFavorite(recipe.id, !recipe.is_favorite))}
          title={recipe.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-lg shadow"
        >
          {recipe.is_favorite ? "★" : "☆"}
        </button>
        {recipe.category && (
          <span className="absolute bottom-2 left-2 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700 shadow">{recipe.category}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-lg font-bold leading-tight text-slate-900">{recipe.name}</h3>
        <ul className="mt-2 flex-1 space-y-0.5 text-sm text-slate-600">
          {recipe.recipe_items.slice(0, 5).map((it) => <li key={it.id}>• {it.label}</li>)}
          {recipe.recipe_items.length > 5 && <li className="text-slate-400">+ {recipe.recipe_items.length - 5} autres</li>}
        </ul>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setEditing(true)} className="btn-secondary py-2 text-xs">Modifier</button>
          <button
            onClick={() => confirm(`Supprimer "${recipe.name}" ?`) && start(() => deleteRecipe(recipe.id))}
            className="ml-auto text-xs text-slate-300 hover:text-rose-600"
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}
