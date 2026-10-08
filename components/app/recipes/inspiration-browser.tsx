"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { CATEGORIES, EQUIPMENT, RECIPES, filterRecipes, type MarketingRecipe } from "@/lib/marketing/recipes";
import { setInspirationFavorite } from "@/app/(main)/app/lists/recipes/actions";
import { cx } from "@/lib/utils";

export function InspirationBrowser({ favoriteKeys }: { favoriteKeys: { slugs: string[]; names: string[] } }) {
  const tr = useT();
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
          placeholder={tr("Rechercher une recette ou un ingrédient…")}
          className="input flex-1"
        />
        <button
          onClick={() => setShowEquipment((v) => !v)}
          className={cx(
            "shrink-0 rounded-full border px-3.5 py-2 text-sm font-medium transition",
            equipment.length > 0 ? "border-brand-300 bg-brand-50 text-brand-700" : "border-stone-200 bg-surface text-stone-500 hover:bg-stone-50"
          )}
        >
          {tr("🔧 Équipement")} {equipment.length > 0 && `(${equipment.length})`}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={() => setCategory(null)}
          className={cx("rounded-full px-3 py-1 text-xs font-medium transition", category === null ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}
        >
          {tr("Toutes")}</button>
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
          <p className="mb-3 text-xs text-stone-500">{tr("Coche ce que tu as chez toi : on ne montre que les recettes réalisables avec.")}</p>
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
              {tr("Réinitialiser")}</button>
          )}
        </div>
      )}

      <p className="mt-4 text-xs text-stone-400">
        {tr(results.length > 1 ? "{n} recettes" : "{n} recette", { n: results.length })} {results.length !== RECIPES.length && tr("sur {n}", { n: RECIPES.length })}
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <InspirationCard key={r.slug} recipe={r} initialFav={favoriteKeys.slugs.includes(r.slug) || favoriteKeys.names.includes(r.name.toLowerCase())} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">{tr("Aucune recette ne correspond. Essaie un autre mot-clé ou un autre équipement.")}</p>
      )}
    </div>
  );
}

function InspirationCard({ recipe, initialFav }: { recipe: MarketingRecipe; initialFav: boolean }) {
  const tr = useT();
  const [pending, start] = useTransition();
  const [fav, setFav] = useState(initialFav);
  const [open, setOpen] = useState(false);
  const toggleFav = () => {
    const next = !fav;
    setFav(next);
    start(() => setInspirationFavorite(recipe.slug, next));
  };

  return (
    <div className="card flex flex-col overflow-hidden p-0">
      <div className="relative">
        <div className="aspect-video overflow-hidden bg-stone-100">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={tr(recipe.name)} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-stone-300">{tr("Photo à venir")}</div>
          )}
        </div>
        <span className="absolute -bottom-3 left-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-surface bg-surface text-lg shadow-md">
          {recipe.icon}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-5">
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">{tr(recipe.category)}</span>
          <span className="text-xs text-stone-400">{tr(recipe.tag)}</span>
        </div>
        <h3 className="mt-2 text-sm font-semibold text-stone-900">{tr(recipe.name)}</h3>
        <p className="mt-1 flex-1 text-xs text-stone-500">{tr(recipe.desc)}</p>
        <div className="mt-3 flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="btn-secondary py-1.5 text-xs">
            {tr("Voir la recette")}</button>
          <button
            disabled={pending}
            aria-pressed={fav}
            onClick={toggleFav}
            className={cx("ml-auto rounded-xl px-3 py-1.5 text-xs font-medium transition", fav ? "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25" : "btn-primary")}
          >
            {fav ? tr("★ Dans mes favoris") : tr("☆ Ajouter aux favoris")}
          </button>
        </div>
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            {recipe.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipe.image} alt={tr(recipe.name)} className="aspect-video w-full object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{recipe.icon} {tr(recipe.category)}</span>
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">{tr(recipe.name)}</h2>
                  <p className="mt-1 text-sm text-stone-500">{tr(recipe.desc)}</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label={tr("Fermer")}>✕</button>
              </div>
              <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
                <span className="rounded-full bg-stone-100 px-2.5 py-1">⏱ {tr(recipe.time)}</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-1">🍽 {tr("{n} pers.", { n: recipe.servings })}</span>
                <span className="rounded-full bg-stone-100 px-2.5 py-1">{tr(recipe.difficulty)}</span>
              </div>
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ingrédients")}</h3>
              <ul className="grid gap-x-6 gap-y-1 text-sm text-stone-700 sm:grid-cols-2">
                {recipe.ingredients.map((i) => <li key={i}>• {tr(i)}</li>)}
              </ul>
              {recipe.utensils.length > 0 && (
                <>
                  <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ustensiles")}</h3>
                  <p className="text-sm text-stone-600">{recipe.utensils.map((u) => tr(u)).join(" · ")}</p>
                </>
              )}
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Préparation")}</h3>
              <ol className="space-y-2.5">
                {recipe.steps.map((line, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-stone-800">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                    <span>{tr(line)}</span>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
                <button onClick={toggleFav} disabled={pending} className={fav ? "btn-secondary" : "btn-primary"}>{fav ? tr("★ Dans mes favoris") : tr("☆ Ajouter aux favoris")}</button>
                <button onClick={() => setOpen(false)} className="btn-secondary ml-auto">{tr("Fermer")}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
