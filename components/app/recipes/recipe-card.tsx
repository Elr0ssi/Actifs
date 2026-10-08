"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { RecipeForm } from "@/components/app/recipes/recipe-form";
import { deleteRecipe, toggleRecipeFavorite } from "@/app/app/lists/recipes/actions";
import type { Recipe, RecipeItem } from "@/lib/types";
import { cx } from "@/lib/utils";
import { Inline } from "@/components/app/notes/inline";
import type { CatalogIngredient } from "@/lib/shopping";

/** Une ligne par étape ; les puces saisies à la main (-, •, *) sont retirées pour un rendu propre. */
export function stepsOf(notes: string | null) {
  return (notes ?? "").split("\n").map((l) => l.replace(/^\s*(?:[-•*]|\d+[.)])\s+/, "").trim()).filter(Boolean);
}

export function RecipeCard({ recipe, householdId, categories, catalog }: { recipe: Recipe & { recipe_items: RecipeItem[] }; householdId: string; categories: string[]; catalog: CatalogIngredient[] }) {
  const tr = useT();
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  if (editing) {
    return (
      <div className="card p-5 sm:col-span-2 lg:col-span-3">
        <RecipeForm recipe={recipe} householdId={householdId} categories={categories} catalog={catalog} onDone={() => setEditing(false)} />
      </div>
    );
  }

  return (
    <div className={cx("card flex flex-col overflow-hidden", pending && "opacity-60")}>
      <div className="relative aspect-video cursor-pointer bg-stone-100" onClick={() => setOpen(true)}>
        {recipe.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={recipe.image_url} alt={recipe.name} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🍽️</div>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); start(() => toggleRecipeFavorite(recipe.id, !recipe.is_favorite)); }}
          title={recipe.is_favorite ? "Retirer des favoris" : "Ajouter aux favoris"}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-surface/90 text-lg shadow"
        >
          {recipe.is_favorite ? "★" : "☆"}
        </button>
        {recipe.category && (
          <span className="absolute bottom-2 left-2 rounded-full bg-surface/90 px-2.5 py-0.5 text-xs font-medium text-stone-700 shadow">{recipe.category}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="cursor-pointer text-lg font-bold leading-tight text-stone-900 hover:text-brand-700" onClick={() => setOpen(true)}>{recipe.name}</h3>
        <ul className="mt-2 flex-1 space-y-0.5 text-sm text-stone-600">
          {recipe.recipe_items.slice(0, 5).map((it) => <li key={it.id}>• {it.label}{it.quantity && <span className="text-stone-400"> — {it.quantity}</span>}</li>)}
          {recipe.recipe_items.length > 5 && <li className="text-stone-400">+ {recipe.recipe_items.length - 5} autres</li>}
        </ul>
        <div className="mt-4 flex items-center gap-2">
          <button onClick={() => setOpen(true)} className="btn-primary py-2 text-xs">{tr("Consulter")}</button>
          <button onClick={() => setEditing(true)} className="btn-secondary py-2 text-xs">{tr("Modifier")}</button>
          <button
            onClick={() => confirm(`Supprimer "${recipe.name}" ?`) && start(() => deleteRecipe(recipe.id))}
            className="ml-auto text-xs text-stone-300 hover:text-rose-600"
          >
            {tr("Supprimer")}</button>
        </div>
      </div>
      {open && createPortal(
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={() => setOpen(false)}>
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
            {recipe.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={recipe.image_url} alt={recipe.name} className="aspect-video w-full object-cover" />
            )}
            <div className="p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  {recipe.category && <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">{recipe.category}</span>}
                  <h2 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">{recipe.name}</h2>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label={tr("Fermer")}>✕</button>
              </div>
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">Ingrédients ({recipe.recipe_items.length})</h3>
              {recipe.recipe_items.length === 0 ? (
                <p className="text-sm text-stone-400">{tr("Aucun ingrédient renseigné.")}</p>
              ) : (
                <ul className="grid gap-x-6 gap-y-1 text-sm text-stone-700 sm:grid-cols-2">
                  {recipe.recipe_items.map((it) => <li key={it.id}>• {it.label}{it.quantity && <span className="text-stone-400"> — {it.quantity}</span>}</li>)}
                </ul>
              )}
              <h3 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Préparation")}</h3>
              {stepsOf(recipe.notes).length === 0 ? (
                <p className="text-sm text-stone-400">{tr("Pas encore d'étapes. Clique sur « Modifier » pour les ajouter.")}</p>
              ) : (
                <ol className="space-y-2.5">
                  {stepsOf(recipe.notes).map((line, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-stone-800">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                      <span><Inline text={line} /></span>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
                <button onClick={() => { setOpen(false); setEditing(true); }} className="btn-primary">{tr("Modifier")}</button>
                <button onClick={() => start(() => toggleRecipeFavorite(recipe.id, !recipe.is_favorite))} className="btn-secondary">{recipe.is_favorite ? "★ Favori" : "☆ Favori"}</button>
                <button onClick={() => confirm(`Supprimer "${recipe.name}" ?`) && start(() => deleteRecipe(recipe.id))} className="ml-auto text-xs text-stone-400 hover:text-rose-600">{tr("Supprimer")}</button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
