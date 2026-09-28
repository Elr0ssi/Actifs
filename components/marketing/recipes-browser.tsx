"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { cx } from "@/lib/utils";

export function RecipesBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      RECIPES.filter((r) => {
        if (category && r.category !== category) return false;
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q))
        );
      }),
    [q, category]
  );

  return (
    <div>
      <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une recette ou un ingrédient (ex. poivron)…"
          className="input w-full py-3 text-center"
        />
        <p className="text-xs text-slate-400">La recherche regarde aussi dans les ingrédients.</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium transition", category === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? null : c)}
            className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium transition", category === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
          >
            {c}
          </button>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-slate-400">
        {results.length} recette{results.length > 1 ? "s" : ""} {results.length !== RECIPES.length && `sur ${RECIPES.length}`}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <RecipeCard key={r.slug} recipe={r} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">Aucune recette ne correspond. Essaie un autre mot-clé.</p>
      )}
    </div>
  );
}
