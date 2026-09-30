"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { IngredientPicker } from "@/components/app/recipes/ingredient-picker";
import { RecipePicker } from "@/components/app/lists/recipe-picker";
import { importInspirationRecipe } from "@/app/app/lists/recipes/actions";
import { RECIPES, type MarketingRecipe } from "@/lib/marketing/recipes";
import { formatEUR, cx } from "@/lib/utils";
import type { CatalogIngredient } from "@/lib/shopping";

export interface ComposerRecipe {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  itemCount: number;
  estimate: number | null;
  is_favorite: boolean;
  icon?: string | null;
}

const norm = (s: string) => s.trim().toLowerCase();
const ICON_BY_NAME = new Map(RECIPES.map((r) => [norm(r.name), r.icon]));

function Submit({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={disabled || pending} className="btn-primary">
      {pending ? "Ajout en cours…" : "Ajouter à la liste"}
    </button>
  );
}

export function ListComposer({
  action,
  recipes,
  catalog,
  recommendations,
  prices,
  store,
}: {
  action: (formData: FormData) => Promise<void>;
  recipes: ComposerRecipe[];
  catalog: CatalogIngredient[];
  recommendations: string[];
  prices: Record<string, number>;
  store: string | null;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [picker, setPicker] = useState<"discover" | "mine" | null>(null);
  const [imported, setImported] = useState<ComposerRecipe[]>([]);
  const [busy, setBusy] = useState<Set<string>>(new Set());

  const all = useMemo(() => {
    const seen = new Set(recipes.map((r) => r.id));
    return [...recipes, ...imported.filter((r) => !seen.has(r.id))].map((r) => ({ ...r, icon: r.icon ?? ICON_BY_NAME.get(norm(r.name)) ?? null }));
  }, [recipes, imported]);

  const set = (id: string, c: number) => setCounts((prev) => ({ ...prev, [id]: Math.max(0, c) }));
  const chosen = all.filter((r) => (counts[r.id] ?? 0) > 0);
  const estimate = chosen.reduce((s, r) => s + (r.estimate ?? 0) * (counts[r.id] ?? 0), 0);
  const idBySlug = (slug: string) => {
    const name = RECIPES.find((r) => r.slug === slug)?.name;
    return name ? all.find((r) => norm(r.name) === norm(name))?.id : undefined;
  };

  const pickInspiration = async (recipe: MarketingRecipe) => {
    setBusy((b) => new Set(b).add(recipe.slug));
    const res = await importInspirationRecipe(recipe.slug);
    setBusy((b) => {
      const n = new Set(b);
      n.delete(recipe.slug);
      return n;
    });
    if (!res) return;
    setImported((prev) => (prev.some((p) => p.id === res.id) ? prev : [...prev, { id: res.id, name: res.name, category: recipe.category, image_url: null, itemCount: res.itemCount, estimate: null, is_favorite: false, icon: recipe.icon }]));
    setCounts((prev) => ({ ...prev, [res.id]: (prev[res.id] ?? 0) + 1 }));
  };

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="recipes" value={JSON.stringify(chosen.map((r) => ({ id: r.id, count: counts[r.id] })))} />

      <div>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h3 className="mr-auto font-semibold text-stone-900">1. Recettes du menu</h3>
          <button type="button" onClick={() => setPicker("discover")} className="btn-primary">✨ Découvrir des recettes</button>
          <button type="button" onClick={() => setPicker("mine")} className="btn-secondary">Mes recettes ({recipes.length})</button>
        </div>
        {chosen.length === 0 ? (
          <button
            type="button"
            onClick={() => setPicker("discover")}
            className="flex w-full flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-line py-8 text-sm text-stone-400 transition hover:border-brand-300 hover:text-brand-700"
          >
            <span className="text-2xl">🍽️</span>
            Aucune recette choisie : ouvre le sélecteur pour composer ton menu
          </button>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {chosen.map((r) => {
              const c = counts[r.id] ?? 0;
              return (
                <div key={r.id} className="flex items-center gap-3 rounded-2xl border border-brand-300 bg-brand-50/60 p-2">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface text-2xl">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      r.icon ?? "🍽️"
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-stone-800">{r.name}</p>
                    <p className="truncate text-xs text-stone-400">{r.itemCount} ingr.{r.estimate !== null && store ? ` · ≈ ${formatEUR(r.estimate)}` : ""}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button type="button" onClick={() => set(r.id, c - 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500" aria-label="Moins">−</button>
                    <span className="w-5 text-center text-sm font-semibold">{c}</span>
                    <button type="button" onClick={() => set(r.id, c + 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500" aria-label="Plus">+</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <a href="/app/lists/recipes" className="mt-2 inline-block text-xs font-medium text-brand-600">+ Créer ma propre recette</a>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-stone-900">2. Ingrédients additionnels</h3>
        <IngredientPicker
          name="extras"
          catalog={catalog}
          suggestions={recommendations}
          suggestionsLabel="Déjà pris lors de tes dernières courses"
          prices={prices}
          priceStore={store}
          placeholder="Ajouter un produit (lait, café, lessive…)"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <p className="text-sm text-stone-500">
          {chosen.length} recette(s) sélectionnée(s)
          {store && estimate > 0 && <> · estimation <b className="text-stone-800">{formatEUR(estimate)}</b> chez {store}</>}
        </p>
        <Submit disabled={false} />
      </div>

      {picker && (
        <RecipePicker
          initialTab={picker}
          mine={all}
          counts={counts}
          idBySlug={idBySlug}
          busy={busy}
          store={store}
          onCount={set}
          onPickInspiration={pickInspiration}
          onClose={() => setPicker(null)}
        />
      )}
    </form>
  );
}
