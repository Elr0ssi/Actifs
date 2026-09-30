"use client";

import { useState } from "react";
import type { Recipe, RecipeItem } from "@/lib/types";
import type { CatalogIngredient } from "@/lib/shopping";
import { RecipeForm } from "@/components/app/recipes/recipe-form";
import { RecipeCard } from "@/components/app/recipes/recipe-card";
import { InspirationBrowser } from "@/components/app/recipes/inspiration-browser";
import { cx } from "@/lib/utils";

type MyRecipe = Recipe & { recipe_items: RecipeItem[] };

export function RecipesTabs({
  recipes,
  householdId,
  categories,
  catalog,
}: {
  recipes: MyRecipe[];
  householdId: string;
  categories: string[];
  catalog: CatalogIngredient[];
}) {
  const [tab, setTab] = useState<"mine" | "inspiration">("mine");

  return (
    <div>
      <div className="flex gap-1 rounded-full border border-stone-200 bg-stone-100 p-1 sm:inline-flex">
        <button
          onClick={() => setTab("mine")}
          className={cx("flex-1 rounded-full px-4 py-2 text-sm font-medium transition sm:flex-none", tab === "mine" ? "bg-surface text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800")}
        >
          Mes recettes {recipes.length > 0 && `(${recipes.length})`}
        </button>
        <button
          onClick={() => setTab("inspiration")}
          className={cx("flex-1 rounded-full px-4 py-2 text-sm font-medium transition sm:flex-none", tab === "inspiration" ? "bg-surface text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800")}
        >
          🔍 Trouver des recettes
        </button>
      </div>

      {tab === "mine" ? (
        <div className="mt-6 space-y-8">
          <div className="card p-5">
            <h2 className="mb-4 text-sm font-semibold text-stone-700">Nouvelle recette</h2>
            <RecipeForm householdId={householdId} categories={categories} catalog={catalog} />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.length === 0 && <p className="text-sm text-stone-400">Aucune recette pour l'instant. Crée-en une, ou pioche dans "Trouver des recettes".</p>}
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} householdId={householdId} categories={categories} catalog={catalog} />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <InspirationBrowser />
        </div>
      )}
    </div>
  );
}
