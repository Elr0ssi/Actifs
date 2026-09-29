"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, EQUIPMENT, BASIC_UTENSILS, RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { cx } from "@/lib/utils";

export function RecipesBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [showEquipment, setShowEquipment] = useState(false);

  const toggleEquipment = (key: string) => {
    setEquipment((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const q = query.trim().toLowerCase();
  const results = useMemo(
    () =>
      RECIPES.filter((r) => {
        if (category && r.category !== category) return false;
        if (equipment.length > 0) {
          const needsOther = r.utensils.some((u) => !BASIC_UTENSILS.includes(u) && !equipment.includes(u));
          if (needsOther) return false;
        }
        if (!q) return true;
        return (
          r.name.toLowerCase().includes(q) ||
          r.desc.toLowerCase().includes(q) ||
          r.ingredients.some((i) => i.toLowerCase().includes(q))
        );
      }),
    [q, category, equipment]
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
        <p className="text-xs text-stone-400">La recherche regarde aussi dans les ingrédients.</p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium transition", category === null ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? null : c)}
            className={cx("rounded-full px-3.5 py-1.5 text-sm font-medium transition", category === c ? "bg-stone-900 text-white" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowEquipment((v) => !v)}
          className={cx(
            "flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition",
            equipment.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-stone-200 bg-white text-stone-500 hover:bg-stone-50"
          )}
        >
          🔧 Mon équipement {equipment.length > 0 && `(${equipment.length})`}
          <span className="text-xs">{showEquipment ? "▲" : "▼"}</span>
        </button>
      </div>

      {showEquipment && (
        <div className="mx-auto mt-3 max-w-2xl rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-center text-xs text-stone-500">
            Coche ce que tu as chez toi : on ne montre que les recettes réalisables avec.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {EQUIPMENT.map((e) => (
              <button
                key={e.key}
                onClick={() => toggleEquipment(e.key)}
                className={cx(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                  equipment.includes(e.key) ? "border-brand-400 bg-brand-100 text-brand-800" : "border-stone-200 bg-white text-stone-600 hover:bg-stone-100"
                )}
              >
                <span>{e.icon}</span>
                {e.label}
              </button>
            ))}
          </div>
          {equipment.length > 0 && (
            <button onClick={() => setEquipment([])} className="mx-auto mt-3 block text-xs text-stone-400 hover:text-stone-700">
              Réinitialiser
            </button>
          )}
        </div>
      )}

      <p className="mt-6 text-center text-sm text-stone-400">
        {results.length} recette{results.length > 1 ? "s" : ""} {results.length !== RECIPES.length && `sur ${RECIPES.length}`}
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <RecipeCard key={r.slug} recipe={r} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">Aucune recette ne correspond. Essaie un autre mot-clé ou un autre équipement.</p>
      )}
    </div>
  );
}
