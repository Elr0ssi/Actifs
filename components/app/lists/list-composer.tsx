"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { ExtrasPicker } from "@/components/app/lists/extras-picker";
import { RecipePicker } from "@/components/app/lists/recipe-picker";
import { importInspirationRecipe } from "@/app/app/lists/recipes/actions";
import { setDefaultServings } from "@/app/app/lists/actions";
import { RECIPES, type MarketingRecipe } from "@/lib/marketing/recipes";
import { formatEUR, cx } from "@/lib/utils";
import { lineCost, type CatalogIngredient, type IngredientUnit, type QtyUnit } from "@/lib/shopping";
import type { ComposeLine } from "@/lib/data/compose";

export interface ComposerRecipe {
  id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  itemCount: number;
  estimate: number | null;
  is_favorite: boolean;
  /** Nombre de personnes pour lequel la recette est écrite. */
  servings: number;
  icon?: string | null;
}

const norm = (s: string) => s.trim().toLowerCase();
const ICON_BY_NAME = new Map(RECIPES.map((r) => [norm(r.name), r.icon]));

function Submit({ label }: { label: string }) {
  const tr = useT();
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} className="btn-primary">
      {pending ? tr("Ajout en cours…") : label}
    </button>
  );
}

const UNITS_FOR: Record<IngredientUnit, { v: QtyUnit; l: string }[]> = {
  kg: [{ v: "g", l: "g" }, { v: "kg", l: "kg" }],
  l: [{ v: "ml", l: "ml" }, { v: "l", l: "L" }],
  unit: [{ v: "u", l: "pièce(s)" }],
};
const ALL_UNITS: { v: QtyUnit; l: string }[] = [{ v: "u", l: "pièce(s)" }, { v: "g", l: "g" }, { v: "kg", l: "kg" }, { v: "ml", l: "ml" }, { v: "l", l: "L" }];

interface ReviewLine extends ComposeLine {
  origUnit: QtyUnit;
  qtyText: string;
  removed: boolean;
}

export function ListComposer({
  action,
  preview,
  recipes,
  catalog,
  recommendations,
  prices,
  store,
  defaultServings,
}: {
  action: (formData: FormData) => Promise<void>;
  preview: (recipes: { id: string; servings: number }[]) => Promise<{ lines: ComposeLine[] }>;
  recipes: ComposerRecipe[];
  catalog: CatalogIngredient[];
  recommendations: string[];
  prices: Record<string, number>;
  store: string | null;
  defaultServings: number;
}) {
  const tr = useT();
  const [people, setPeople] = useState<Record<string, number>>({});
  const [defaultPeople, setDefaultPeople] = useState(defaultServings);
  const [picker, setPicker] = useState<"discover" | "mine" | null>(null);
  const [imported, setImported] = useState<ComposerRecipe[]>([]);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [review, setReview] = useState<ReviewLine[] | null>(null);
  const [loading, start] = useTransition();

  const all = useMemo(() => {
    const seen = new Set(recipes.map((r) => r.id));
    return [...recipes, ...imported.filter((r) => !seen.has(r.id))].map((r) => ({ ...r, icon: r.icon ?? ICON_BY_NAME.get(norm(r.name)) ?? null }));
  }, [recipes, imported]);

  const set = (id: string, n: number) => {
    setReview(null);
    setPeople((prev) => ({ ...prev, [id]: Math.max(0, n) }));
  };
  const chosen = all.filter((r) => (people[r.id] ?? 0) > 0);
  const estimate = chosen.reduce((s, r) => s + (r.estimate ?? 0) * ((people[r.id] ?? 0) / (r.servings || 4)), 0);
  const idBySlug = (slug: string) => {
    const name = RECIPES.find((r) => r.slug === slug)?.name;
    return name ? all.find((r) => norm(r.name) === norm(name))?.id : undefined;
  };
  const changeDefault = (n: number) => {
    const v = Math.min(20, Math.max(1, n));
    setDefaultPeople(v);
    void setDefaultServings(v);
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
    setImported((prev) => (prev.some((p) => p.id === res.id) ? prev : [...prev, { id: res.id, name: res.name, category: recipe.category, image_url: null, itemCount: res.itemCount, estimate: null, is_favorite: false, servings: recipe.servings, icon: recipe.icon }]));
    setReview(null);
    setPeople((prev) => ({ ...prev, [res.id]: defaultPeople }));
  };

  const openReview = () =>
    start(async () => {
      const { lines } = await preview(chosen.map((r) => ({ id: r.id, servings: people[r.id] })));
      setReview(lines.map((l) => ({ ...l, origUnit: l.unit, qtyText: l.qty === null ? "" : String(l.qty).replace(".", ","), removed: false })));
    });

  const updateLine = (key: string, patch: Partial<ReviewLine>) => setReview((ls) => ls && ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const qtyOf = (l: ReviewLine) => {
    const n = Number(l.qtyText.replace(",", "."));
    return l.qtyText.trim() === "" || !Number.isFinite(n) ? null : n;
  };
  const costOf = (l: ReviewLine) => (l.catalogUnit ? lineCost(qtyOf(l), l.unit, l.catalogUnit, l.unitPrice) : null);
  const kept = review?.filter((l) => !l.removed) ?? [];
  const reviewTotal = kept.reduce((s, l) => s + (costOf(l) ?? 0), 0);
  const unpriced = kept.filter((l) => costOf(l) === null).length;

  const linesPayload = review ? JSON.stringify(kept.map((l) => ({ label: l.label, ingredient_id: l.ingredient_id, qty: qtyOf(l), unit: l.qty === null && qtyOf(l) === null ? null : l.unit, sources: l.sources, need: qtyOf(l) === l.qty && l.unit === l.origUnit ? l.need : null }))) : "";

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="recipes" value={JSON.stringify(chosen.map((r) => ({ id: r.id, servings: people[r.id] })))} />
      {review && <input type="hidden" name="lines" value={linesPayload} />}

      {/* Recettes */}
      <section className="rounded-2xl border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="mr-auto text-sm font-semibold text-stone-900">{tr("Recettes")}</h3>
          <div className="flex items-center gap-1 text-[11px] text-stone-500" title={tr("Nombre de personnes proposé pour chaque nouvelle recette")}>
            Par défaut
            <button type="button" onClick={() => changeDefault(defaultPeople - 1)} className="h-6 w-6 rounded-md border border-line text-stone-500" aria-label={tr("Moins")}>−</button>
            <b className="min-w-[2.2rem] text-center text-xs text-stone-800">{defaultPeople} pers.</b>
            <button type="button" onClick={() => changeDefault(defaultPeople + 1)} className="h-6 w-6 rounded-md border border-line text-stone-500" aria-label={tr("Plus")}>+</button>
          </div>
        </div>

        {chosen.length > 0 && (
          <ul className="mt-3 divide-y divide-line/70 rounded-xl border border-line">
            {chosen.map((r) => {
              const c = people[r.id] ?? 0;
              return (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-100 text-xl">
                    {r.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      r.icon ?? "🍽️"
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-800">{r.name}</span>
                  <div className="flex items-center gap-1" title={tr("Nombre de personnes")}>
                    <button type="button" onClick={() => set(r.id, c - 1)} className="h-7 w-7 rounded-lg border border-line text-stone-500 hover:bg-stone-50" aria-label={tr("Moins de personnes")}>−</button>
                    <span className="min-w-[3rem] text-center text-xs font-semibold text-stone-800">{c} pers.</span>
                    <button type="button" onClick={() => set(r.id, c + 1)} className="h-7 w-7 rounded-lg border border-line text-stone-500 hover:bg-stone-50" aria-label={tr("Plus de personnes")}>+</button>
                  </div>
                  <button type="button" onClick={() => set(r.id, 0)} className="px-1 text-stone-300 hover:text-rose-600" aria-label={`Retirer ${r.name}`}>✕</button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => setPicker("discover")} className="btn-primary px-3.5 py-2 text-xs">{tr("+ Choisir des recettes")}</button>
          {recipes.length > 0 && <button type="button" onClick={() => setPicker("mine")} className="btn-secondary px-3.5 py-2 text-xs">{tr("Mes recettes")}</button>}
        </div>
      </section>

      {/* Vérification des quantités */}
      {review && (
        <section className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-stone-900">{tr("Quantités à acheter")}</h3>
              <p className="text-xs text-stone-500">{tr("Arrondies aux formats vendus en magasin. Modifie ce que tu veux.")}</p>
            </div>
            <button type="button" onClick={() => setReview(null)} className="text-xs font-medium text-brand-600 hover:underline">{tr("← Modifier les recettes")}</button>
          </div>
          {kept.length === 0 ? (
            <p className="rounded-xl bg-surface px-3 py-4 text-center text-xs text-stone-400">{tr("Aucune ligne.")}</p>
          ) : (
            <ul className="divide-y divide-line/70 rounded-xl border border-line bg-surface">
              {review.map((l) => {
                const cost = costOf(l);
                const opts = l.catalogUnit ? UNITS_FOR[l.catalogUnit] : ALL_UNITS;
                const unitOpts = opts.some((o) => o.v === l.unit) ? opts : [{ v: l.unit, l: l.unit === "u" ? tr("pièce(s)") : l.unit }, ...opts];
                const edited = qtyOf(l) !== l.qty;
                return (
                  <li key={l.key} className={cx("flex flex-wrap items-center gap-2 px-3 py-2", l.removed && "opacity-40")}>
                    <div className="min-w-[8rem] flex-1">
                      <p className={cx("truncate text-[13px] font-medium text-stone-800 first-letter:uppercase", l.removed && "line-through")}>{l.label}</p>
                      <p className="truncate text-[11px] text-stone-400">
                        {l.pack && !edited ? `${l.pack}` : l.sources.join(", ")}
                        {l.pack && !edited && l.need !== null && l.need !== l.qty && <> · besoin {formatNeed(l.need, l.unit)}</>}
                      </p>
                    </div>
                    <input
                      value={l.qtyText}
                      onChange={(e) => updateLine(l.key, { qtyText: e.target.value })}
                      inputMode="decimal"
                      placeholder="—"
                      disabled={l.removed}
                      aria-label={`Quantité : ${l.label}`}
                      className="input w-20 py-1 text-right text-xs"
                    />
                    <select value={l.unit} onChange={(e) => updateLine(l.key, { unit: e.target.value as QtyUnit })} disabled={l.removed} className="input w-24 py-1 text-xs" aria-label={tr("Unité")}>
                      {unitOpts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                    <span className={cx("tabular w-16 text-right text-xs", cost === null ? "text-stone-300" : "font-semibold text-stone-700")}>{cost === null ? (store ? "sans prix" : "") : formatEUR(cost)}</span>
                    <button type="button" onClick={() => updateLine(l.key, { removed: !l.removed })} title={l.removed ? tr("Remettre") : tr("Retirer")} className="rounded-md px-1.5 py-1 text-xs text-stone-300 hover:bg-stone-100 hover:text-rose-600">{l.removed ? "↺" : "✕"}</button>
                  </li>
                );
              })}
            </ul>
          )}
          {store && (
            <p className="mt-2 text-xs text-stone-500">
              {kept.length} article(s) · ≈ <b className="text-stone-800">{formatEUR(reviewTotal)}</b> chez {store}
              {unpriced > 0 && ` · ${unpriced} sans prix`}
            </p>
          )}
        </section>
      )}

      {/* Autres produits */}
      <section className="rounded-2xl border border-line bg-surface p-4">
        <h3 className="mb-3 text-sm font-semibold text-stone-900">{tr("Autres produits")}</h3>
        <ExtrasPicker name="extras" catalog={catalog} suggestions={recommendations} prices={prices} store={store} />
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-stone-500">
          {chosen.length > 0 ? `${chosen.length} recette${chosen.length > 1 ? "s" : ""}` : tr("Aucune recette")}
          {!review && store && estimate > 0 && <> · ≈ <b className="text-stone-800">{formatEUR(estimate)}</b> chez {store}</>}
        </p>
        {chosen.length > 0 && !review ? (
          <button type="button" onClick={openReview} disabled={loading} className="btn-primary">{loading ? tr("Calcul…") : tr("Voir les quantités →")}</button>
        ) : (
          <Submit label={review ? tr("Ajouter à la liste") : tr("Ajouter à la liste")} />
        )}
      </div>

      {picker && (
        <RecipePicker
          initialTab={picker}
          mine={all}
          counts={people}
          idBySlug={idBySlug}
          busy={busy}
          store={store}
          defaultPeople={defaultPeople}
          onCount={set}
          onPickInspiration={pickInspiration}
          onClose={() => setPicker(null)}
        />
      )}
    </form>
  );
}

function formatNeed(n: number, unit: QtyUnit) {
  if (unit === "g") return n >= 1000 ? `${+(n / 1000).toFixed(2)} kg` : `${Math.round(n)} g`;
  if (unit === "ml") return n >= 1000 ? `${+(n / 1000).toFixed(2)} L` : `${Math.round(n)} ml`;
  return `${+n.toFixed(1)}`;
}
