"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CATEGORIES, EQUIPMENT, BASIC_UTENSILS, RECIPES, type MarketingRecipe } from "@/lib/marketing/recipes";
import { importInspirationRecipe } from "@/app/app/lists/recipes/actions";
import { cx } from "@/lib/utils";

export function InspirationBrowser() {
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une recette ou un ingrédient…"
          className="input flex-1"
        />
        <button
          onClick={() => setShowEquipment((v) => !v)}
          className={cx(
            "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition",
            equipment.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
          )}
        >
          🔧 Équipement {equipment.length > 0 && `(${equipment.length})`}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cx("rounded-full px-3 py-1 text-xs font-medium transition", category === null ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? null : c)}
            className={cx("rounded-full px-3 py-1 text-xs font-medium transition", category === c ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}
          >
            {c}
          </button>
        ))}
      </div>

      {showEquipment && (
        <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-xs text-slate-500">Coche ce que tu as chez toi : on ne montre que les recettes réalisables avec.</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((e) => (
              <button
                key={e.key}
                onClick={() => toggleEquipment(e.key)}
                className={cx(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                  equipment.includes(e.key) ? "border-brand-400 bg-brand-100 text-brand-800" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                )}
              >
                <span>{e.icon}</span>
                {e.label}
              </button>
            ))}
          </div>
          {equipment.length > 0 && (
            <button onClick={() => setEquipment([])} className="mt-3 text-xs text-slate-400 hover:text-slate-700">
              Réinitialiser
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        {results.length} recette{results.length > 1 ? "s" : ""} {results.length !== RECIPES.length && `sur ${RECIPES.length}`}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <InspirationCard key={r.slug} recipe={r} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-slate-400">Aucune recette ne correspond. Essaie un autre mot-clé ou un autre équipement.</p>
      )}
    </div>
  );
}

function InspirationCard({ recipe }: { recipe: MarketingRecipe }) {
  const [pending, start] = useTransition();
  const [added, setAdded] = useState(false);

  return (
    <div className="card flex flex-col overflow-hidden p-0">
      <div className="relative">
        <div className="h-28 overflow-hidden bg-slate-100">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-300">Photo à venir</div>
          )}
        </div>
        <span className="absolute -bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-white text-lg shadow-md">
          {recipe.icon}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{recipe.category}</span>
          <span className="text-xs text-slate-400">{recipe.tag}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-slate-900">{recipe.name}</h3>
        <p className="mt-1 flex-1 text-xs text-slate-500">{recipe.desc}</p>
        <div className="mt-3 flex items-center gap-2">
          <Link href={`/recettes/${recipe.slug}`} target="_blank" className="btn-secondary py-1.5 text-xs">
            Voir la recette
          </Link>
          <button
            disabled={pending || added}
            onClick={() => start(async () => { await importInspirationRecipe(recipe.slug); setAdded(true); })}
            className={cx("ml-auto py-1.5 text-xs", added ? "text-emerald-600" : "btn-primary")}
          >
            {added ? "Ajoutée ✓" : "+ Ajouter à mes recettes"}
          </button>
        </div>
      </div>
    </div>
  );
}
