"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { IngredientPicker } from "@/components/app/recipes/ingredient-picker";
import { formatEUR, cx } from "@/lib/utils";

export interface ComposerRecipe {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  itemCount: number;
  estimate: number | null;
}

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
  store,
}: {
  action: (formData: FormData) => Promise<void>;
  recipes: ComposerRecipe[];
  catalog: { id: string; name: string }[];
  recommendations: string[];
  store: string | null;
}) {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const chosen = Object.entries(counts).filter(([, c]) => c > 0);
  const estimate = chosen.reduce((s, [id, c]) => s + (recipes.find((r) => r.id === id)?.estimate ?? 0) * c, 0);
  const set = (id: string, c: number) => setCounts((all) => ({ ...all, [id]: Math.max(0, c) }));

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="recipes" value={JSON.stringify(chosen.map(([id, count]) => ({ id, count })))} />

      <div>
        <div className="mb-3 flex items-baseline justify-between">
          <h3 className="font-semibold text-slate-900">1. Choisis tes recettes</h3>
          <a href="/app/lists/recipes" className="text-xs font-medium text-brand-600">+ Créer une recette</a>
        </div>
        {recipes.length === 0 && <p className="text-sm text-slate-400">Aucune recette pour l'instant.</p>}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => {
            const c = counts[r.id] ?? 0;
            return (
              <div key={r.id} className={cx("flex items-center gap-3 rounded-2xl border p-2 transition", c > 0 ? "border-brand-300 bg-brand-50/60" : "border-slate-100")}>
                <button type="button" onClick={() => set(r.id, c ? 0 : 1)} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-100 text-2xl">
                  {r.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    "🍽️"
                  )}
                </button>
                <button type="button" onClick={() => set(r.id, c ? 0 : 1)} className="min-w-0 flex-1 text-left">
                  <p className="truncate text-sm font-semibold text-slate-800">{r.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {r.itemCount} ingr.{r.estimate !== null && store ? ` · ≈ ${formatEUR(r.estimate)}` : ""}
                  </p>
                </button>
                <div className="flex items-center gap-1">
                  <button type="button" onClick={() => set(r.id, c - 1)} className="h-7 w-7 rounded-lg border border-slate-200 text-slate-500">−</button>
                  <span className="w-5 text-center text-sm font-semibold">{c}</span>
                  <button type="button" onClick={() => set(r.id, c + 1)} className="h-7 w-7 rounded-lg border border-slate-200 text-slate-500">+</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-3 font-semibold text-slate-900">2. Ingrédients additionnels</h3>
        <IngredientPicker
          name="extras"
          catalog={catalog}
          suggestions={recommendations}
          suggestionsLabel="Déjà pris lors de tes dernières courses"
          placeholder="Ajouter un produit (lait, café, lessive…)"
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <p className="text-sm text-slate-500">
          {chosen.length} recette(s) sélectionnée(s)
          {store && estimate > 0 && <> · estimation <b className="text-slate-800">{formatEUR(estimate)}</b> chez {store}</>}
        </p>
        <Submit disabled={false} />
      </div>
    </form>
  );
}
