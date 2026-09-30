"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { CATEGORIES, EQUIPMENT, RECIPES, filterRecipes, type MarketingRecipe } from "@/lib/marketing/recipes";
import { setInspirationFavorite } from "@/app/app/lists/recipes/actions";
import { cx } from "@/lib/utils";

export function InspirationBrowser({ favoriteKeys }: { favoriteKeys: { slugs: string[]; names: string[] } }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [showEquipment, setShowEquipment] = useState(false);

  const toggleEquipment = (key: string) => {
    setEquipment((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  };

  const results = useMemo(() => filterRecipes(RECIPES, { query, category, equipment }), [query, category, equipment]);

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
            equipment.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-stone-200 bg-surface text-stone-500 hover:bg-stone-50"
          )}
        >
          🔧 Équipement {equipment.length > 0 && `(${equipment.length})`}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cx("rounded-full px-3 py-1 text-xs font-medium transition", category === null ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
        >
          Toutes
        </button>
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === category ? null : c)}
            className={cx("rounded-full px-3 py-1 text-xs font-medium transition", category === c ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
          >
            {c}
          </button>
        ))}
      </div>

      {showEquipment && (
        <div className="mt-3 rounded-2xl border border-stone-200 bg-stone-50 p-4">
          <p className="mb-3 text-xs text-stone-500">Coche ce que tu as chez toi : on ne montre que les recettes réalisables avec.</p>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT.map((e) => (
              <button
                key={e.key}
                onClick={() => toggleEquipment(e.key)}
                className={cx(
                  "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition",
                  equipment.includes(e.key) ? "border-brand-400 bg-brand-100 text-brand-800" : "border-stone-200 bg-surface text-stone-600 hover:bg-stone-100"
                )}
              >
                <span>{e.icon}</span>
                {e.label}
              </button>
            ))}
          </div>
          {equipment.length > 0 && (
            <button onClick={() => setEquipment([])} className="mt-3 text-xs text-stone-400 hover:text-stone-700">
              Réinitialiser
            </button>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-stone-400">
        {results.length} recette{results.length > 1 ? "s" : ""} {results.length !== RECIPES.length && `sur ${RECIPES.length}`}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <InspirationCard key={r.slug} recipe={r} initialFav={favoriteKeys.slugs.includes(r.slug) || favoriteKeys.names.includes(r.name.toLowerCase())} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">Aucune recette ne correspond. Essaie un autre mot-clé ou un autre équipement.</p>
      )}
    </div>
  );
}

function InspirationCard({ recipe, initialFav }: { recipe: MarketingRecipe; initialFav: boolean }) {
  const [pending, start] = useTransition();
  const [fav, setFav] = useState(initialFav);

  return (
    <div className="card flex flex-col overflow-hidden p-0">
      <div className="relative">
        <div className="aspect-video overflow-hidden bg-stone-100">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-300">Photo à venir</div>
          )}
        </div>
        <span className="absolute -bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-surface text-lg shadow-md">
          {recipe.icon}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{recipe.category}</span>
          <span className="text-xs text-stone-400">{recipe.tag}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-stone-900">{recipe.name}</h3>
        <p className="mt-1 flex-1 text-xs text-stone-500">{recipe.desc}</p>
        <div className="mt-3 flex items-center gap-2">
          <Link href={`/recettes/${recipe.slug}`} target="_blank" className="btn-secondary py-1.5 text-xs">
            Voir la recette
          </Link>
          <button
            disabled={pending}
            aria-pressed={fav}
            onClick={() => {
              const next = !fav;
              setFav(next);
              start(() => setInspirationFavorite(recipe.slug, next));
            }}
            className={cx("ml-auto rounded-xl px-3 py-1.5 text-xs font-medium transition", fav ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25" : "btn-primary")}
          >
            {fav ? "★ Dans mes favoris" : "☆ Ajouter aux favoris"}
          </button>
        </div>
      </div>
    </div>
  );
}
