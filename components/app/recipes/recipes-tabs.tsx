"use client";

import { useMemo, useState } from "react";
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
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [sort, setSort] = useState<"recent" | "az" | "fav" | "items">("recent");
  const fold = (t: string) => t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const mine = useMemo(() => recipes.filter((r) => !r.source_slug || r.is_favorite), [recipes]);
  const favoriteKeys = useMemo(
    () => ({
      slugs: recipes.filter((r) => r.is_favorite && r.source_slug).map((r) => r.source_slug as string),
      names: recipes.filter((r) => r.is_favorite).map((r) => r.name.toLowerCase()),
    }),
    [recipes]
  );
  const shown = useMemo(() => {
    const query = fold(q.trim());
    const list = mine.filter(
      (r) => (!cat || r.category === cat) && (!query || fold(`${r.name} ${r.recipe_items.map((i) => i.label).join(" ")}`).includes(query))
    );
    const byName = (a: MyRecipe, b: MyRecipe) => a.name.localeCompare(b.name, "fr");
    if (sort === "az") list.sort(byName);
    else if (sort === "fav") list.sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || byName(a, b));
    else if (sort === "items") list.sort((a, b) => a.recipe_items.length - b.recipe_items.length || byName(a, b));
    else list.sort((a, b) => b.created_at.localeCompare(a.created_at));
    return list;
  }, [mine, q, cat, sort]);
  const usedCats = [...new Set(mine.map((r) => r.category).filter(Boolean) as string[])];

  return (
    <div>
      <div className="flex gap-1 rounded-full border border-stone-200 bg-stone-100 p-1 sm:inline-flex">
        <button
          onClick={() => setTab("mine")}
          className={cx("flex-1 rounded-full px-4 py-2 text-sm font-medium transition sm:flex-none", tab === "mine" ? "bg-surface text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800")}
        >
          Mes recettes {mine.length > 0 && `(${mine.length})`}
        </button>
        <button
          onClick={() => setTab("inspiration")}
          className={cx("flex-1 rounded-full px-4 py-2 text-sm font-medium transition sm:flex-none", tab === "inspiration" ? "bg-surface text-stone-900 shadow-sm" : "text-stone-500 hover:text-stone-800")}
        >
          🔍 Trouver des recettes
        </button>
      </div>

      {tab === "mine" ? (
        <div className="mt-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une recette ou un ingrédient…" className="input min-w-[12rem] flex-1" />
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="input w-auto" aria-label="Trier">
              <option value="recent">Plus récentes</option>
              <option value="az">A → Z</option>
              <option value="fav">Favoris d'abord</option>
              <option value="items">Moins d'ingrédients</option>
            </select>
            <button onClick={() => setCreating(!creating)} className="btn-primary">{creating ? "Fermer" : "+ Nouvelle recette"}</button>
          </div>
          {usedCats.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[null, ...usedCats].map((c) => (
                <button key={c ?? "all"} onClick={() => setCat(c === cat ? null : c)} className={cx("rounded-full px-3 py-1 text-xs font-medium transition", cat === c ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}>
                  {c ?? "Toutes"}
                </button>
              ))}
            </div>
          )}

          {creating && (
            <div className="card animate-rise p-5">
              <h2 className="mb-4 text-sm font-semibold text-stone-700">Nouvelle recette</h2>
              <RecipeForm householdId={householdId} categories={categories} catalog={catalog} onDone={() => setCreating(false)} />
            </div>
          )}

          {mine.length === 0 && <p className="text-sm text-stone-400">Aucune recette pour l'instant. Crée-en une avec « + Nouvelle recette », ou mets en favori celles de « Trouver des recettes ».</p>}
          {mine.length > 0 && shown.length === 0 && <p className="text-sm text-stone-400">Aucune recette ne correspond.</p>}
          {[
            { title: "Mes créations", icon: "✍️", list: shown.filter((r) => !r.source_slug) },
            { title: "Mes favorites", icon: "★", list: shown.filter((r) => !!r.source_slug) },
          ].map((sec) =>
            sec.list.length === 0 ? null : (
              <section key={sec.title}>
                <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-stone-700">
                  <span>{sec.icon}</span>
                  {sec.title}
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-stone-500">{sec.list.length}</span>
                </h2>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {sec.list.map((r) => (
                    <RecipeCard key={r.id} recipe={r} householdId={householdId} categories={categories} catalog={catalog} />
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      ) : (
        <div className="mt-6">
          <InspirationBrowser favoriteKeys={favoriteKeys} />
        </div>
      )}
    </div>
  );
}
