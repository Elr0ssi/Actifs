"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { setListRecipePeople } from "@/app/(main)/app/lists/actions";
import { cx } from "@/lib/utils";

export interface ListRecipeRow {
  id: string;
  name: string;
  icon: string | null;
  people: number;
}

/** Recettes de la liste, avec le nombre de personnes : le changer réajuste automatiquement les quantités des articles. */
export function ListRecipes({ listId, recipes }: { listId: string; recipes: ListRecipeRow[] }) {
  const tr = useT();
  const [pending, start] = useTransition();
  const [people, setPeople] = useState<Record<string, number>>({});
  if (recipes.length === 0) return null;
  const change = (r: ListRecipeRow, n: number) => {
    const v = Math.min(100, Math.max(1, n));
    setPeople((p) => ({ ...p, [r.id]: v }));
    start(() => setListRecipePeople(listId, r.id, v));
  };
  return (
    <section className={cx("card p-5", pending && "opacity-70")}>
      <h2 className="text-sm font-semibold text-stone-700">{tr("Recettes de cette liste")}</h2>
      <p className="mb-3 text-xs text-stone-500">{tr("Change le nombre de personnes : les quantités des articles se recalculent.")}</p>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((r) => {
          const n = people[r.id] ?? r.people;
          return (
            <li key={r.id} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
              <span className="text-xl">{r.icon ?? "🍽️"}</span>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-800">{r.name}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => change(r, n - 1)} className="h-7 w-7 rounded-lg border border-line text-stone-500 hover:bg-stone-50" aria-label={tr("Moins de personnes")}>−</button>
                <span className="min-w-[2.6rem] text-center text-sm font-semibold">{n}<span className="ml-0.5 text-[10px] font-medium text-stone-400">{tr("pers.")}</span></span>
                <button type="button" onClick={() => change(r, n + 1)} className="h-7 w-7 rounded-lg border border-line text-stone-500 hover:bg-stone-50" aria-label={tr("Plus de personnes")}>+</button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
