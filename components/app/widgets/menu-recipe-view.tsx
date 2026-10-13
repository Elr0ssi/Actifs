"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { setMenuServings } from "@/app/(main)/app/menu-actions";
import { scaleQuantityLabel, scaleTranslatedIngredient } from "@/lib/ingredient-parse";
import { RECIPES } from "@/lib/marketing/recipes";
import { Inline } from "@/components/app/notes/inline";
import { stepsOf } from "@/components/app/recipes/recipe-card";
import { SpaceBadge } from "@/components/app/space-badge";
import type { WidgetData } from "@/lib/data/widgets";

export interface MealRef {
  id: string;
  name: string;
  icon: string | null;
  servings: number | null;
  slot?: "midi" | "soir" | null;
  /** À qui est ce repas et s'il est partagé avec le foyer (sinon perso). */
  owner_id?: string;
  shared?: boolean;
}

/** Fiche d'un repas planifié, en consultation : ingrédients et étapes, comme dans « Mes recettes ». */
export function MenuRecipeView({
  data,
  meals,
  activeId,
  dayLabel,
  onSelect,
  onClose,
  onPlan,
  onRemove,
}: {
  data: WidgetData;
  meals: MealRef[];
  activeId: string;
  dayLabel: string;
  onSelect: (id: string) => void;
  onClose: () => void;
  onPlan: () => void;
  onRemove: (id: string) => void;
}) {
  const tr = useT();
  const meal = meals.find((m) => m.id === activeId) ?? meals[0];
  const [sv, setSv] = useState<Record<string, number>>({});
  const [, start] = useTransition();
  if (!meal) return null;
  // Un repas partagé par quelqu'un d'autre se consulte, mais ne se modifie ni ne se retire.
  const own = !meal.owner_id || meal.owner_id === data.meId;
  const ownerName = meal.owner_id ? data.people[meal.owner_id] : undefined;
  const idea = RECIPES.find((r) => r.name.toLowerCase() === meal.name.toLowerCase());
  const mine = data.myRecipes.find((r) => r.name.toLowerCase() === meal.name.toLowerCase());

  const image = idea?.image ?? mine?.image_url ?? null;
  const category = idea?.category ?? mine?.category ?? null;
  const base = idea?.servings ?? mine?.servings ?? 4;
  const people = sv[meal.id] ?? meal.servings ?? data.defaultServings;
  const factor = people / base;
  const ingredients: { label: string; quantity?: string | null }[] =
    mine && mine.items.length
      ? mine.items.map((i) => ({ label: i.label, quantity: scaleQuantityLabel(i.qty, i.unit, factor, i.quantity) }))
      : idea
        ? idea.ingredients.map((label) => ({ label: scaleTranslatedIngredient(label, factor, tr) }))
        : [];
  const changePeople = (n: number) => {
    const v = Math.min(100, Math.max(1, n));
    setSv((m) => ({ ...m, [meal.id]: v }));
    start(() => setMenuServings(meal.id, v));
  };
  const steps = (mine && stepsOf(mine.notes).length ? stepsOf(mine.notes) : idea ? idea.steps : []).map((s) => tr(s));
  const found = !!(idea || mine);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={tr(meal.name)} className="aspect-video w-full object-cover" />
        )}
        <div className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold capitalize text-brand-700">{dayLabel}</p>
              <h2 className="mt-1 text-2xl font-bold tracking-tight text-stone-900">{meal.icon ?? idea?.icon ?? "🍽️"} {tr(meal.name)}</h2>
              {data.multi && <div className="mt-1.5"><SpaceBadge shared={!!meal.shared} mine={own} ownerName={ownerName} /></div>}
              {idea?.desc && <p className="mt-1 text-sm text-stone-500">{tr(idea.desc)}</p>}
            </div>
            <button onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label={tr("Fermer")}>✕</button>
          </div>

          {meals.length > 1 && (
            <div className="mt-4 flex flex-wrap gap-1.5">
              {meals.map((m) => (
                <button key={m.id} onClick={() => onSelect(m.id)} className={m.id === meal.id ? "rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white" : "rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600 hover:bg-stone-200"}>
                  {m.slot === "midi" ? "☀️ " : m.slot === "soir" ? "🌙 " : ""}{m.icon ?? "🍽️"} {tr(m.name)}
                  {data.multi && m.owner_id && m.owner_id !== data.meId && <span className="ml-1 opacity-70">· 👥 {data.people[m.owner_id] ?? "—"}</span>}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-stone-600">
            {category && <span className="rounded-full bg-brand-50 px-2.5 py-1 font-medium text-brand-700">{category}</span>}
            {idea && <span className="rounded-full bg-stone-100 px-2.5 py-1">⏱ {tr(idea.time)}</span>}

            {idea && <span className="rounded-full bg-stone-100 px-2.5 py-1">{tr(idea.difficulty)}</span>}
          </div>

          {!found ? (
            <p className="mt-5 rounded-xl bg-stone-50 px-4 py-6 text-center text-sm text-stone-500">
              {tr("Ce repas n'est lié à aucune recette enregistrée. Crée-la dans")} <a href="/app/lists/recipes" className="font-medium text-brand-600 hover:underline">{tr("Mes recettes")}</a> {tr("avec le même nom pour retrouver ici ses ingrédients et ses étapes.")}
            </p>
          ) : (
            <>
              <div className="mb-2 mt-5 flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ingrédients ({n})", { n: ingredients.length })}</h3>
                <div className="flex items-center gap-1 text-xs text-stone-500">
                  {tr("Pour")}
                  {own && <button type="button" onClick={() => changePeople(people - 1)} className="h-6 w-6 rounded-md border border-line text-stone-600" aria-label={tr("Moins de personnes")}>−</button>}
                  <b className="min-w-[1.5rem] text-center text-sm text-stone-900">{people}</b>
                  {own && <button type="button" onClick={() => changePeople(people + 1)} className="h-6 w-6 rounded-md border border-line text-stone-600" aria-label={tr("Plus de personnes")}>+</button>}
                  {tr("pers.")}
                </div>
              </div>
              {ingredients.length === 0 ? (
                <p className="text-sm text-stone-400">{tr("Aucun ingrédient renseigné.")}</p>
              ) : (
                <ul className="grid gap-x-6 gap-y-1 text-sm text-stone-700 sm:grid-cols-2">
                  {ingredients.map((i, k) => <li key={k}>• {i.quantity && <b className="font-semibold">{i.quantity} </b>}{i.label}</li>)}
                </ul>
              )}
              {idea && idea.utensils.length > 0 && (
                <>
                  <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ustensiles")}</h3>
                  <p className="text-sm text-stone-600">{idea.utensils.join(" · ")}</p>
                </>
              )}
              <h3 className="mb-2 mt-5 text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Préparation")}</h3>
              {steps.length === 0 ? (
                <p className="text-sm text-stone-400">{tr("Pas encore d'étapes pour cette recette.")}</p>
              ) : (
                <ol className="space-y-2.5">
                  {steps.map((line, i) => (
                    <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-stone-800">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>
                      <span><Inline text={line} /></span>
                    </li>
                  ))}
                </ol>
              )}
            </>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-line pt-4">
            <button onClick={onPlan} className="btn-secondary">{tr("Modifier le menu de ce jour")}</button>
            <button onClick={onClose} className="btn-primary">{tr("Fermer")}</button>
            {own && <button onClick={() => onRemove(meal.id)} className="ml-auto text-xs text-stone-400 hover:text-rose-600">{tr("Retirer du menu")}</button>}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
