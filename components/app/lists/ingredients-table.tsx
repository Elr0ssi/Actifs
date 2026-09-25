"use client";

import { useMemo, useState, useTransition } from "react";
import { STORES, priceSuffix, type CatalogIngredient } from "@/lib/shopping";
import { deleteIngredient, setIngredientPrice } from "@/app/app/lists/actions";
import { cx } from "@/lib/utils";

type PriceRow = { ingredient_id: string; store: string; price: number; household_id: string | null };

export function IngredientsTable({ catalog, prices }: { catalog: CatalogIngredient[]; prices: PriceRow[] }) {
  const [query, setQuery] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);
  const [pending, start] = useTransition();

  const { globalPrice, myPrice } = useMemo(() => {
    const g = new Map<string, number>();
    const m = new Map<string, number>();
    for (const p of prices) (p.household_id === null ? g : m).set(`${p.ingredient_id}|${p.store}`, Number(p.price));
    return { globalPrice: g, myPrice: m };
  }, [prices]);

  const q = query.trim().toLowerCase();
  const rows = catalog.filter((c) => (!q || c.name.toLowerCase().includes(q)) && (!onlyMine || c.personal || STORES.some((s) => myPrice.has(`${c.id}|${s}`))));

  return (
    <div className={cx("card overflow-hidden p-0", pending && "opacity-70")}>
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un ingrédient…" className="input max-w-xs" />
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} className="h-4 w-4 rounded border-slate-300" />
          Seulement mes ajouts
        </label>
        <p className="ml-auto text-xs text-slate-400">Gris = prix de référence · saisis ton prix pour le remplacer (vide = revenir à la référence)</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-2.5 font-medium">Ingrédient ({rows.length})</th>
              {STORES.map((s) => <th key={s} className="px-2 py-2.5 text-right font-medium">{s}</th>)}
              <th className="w-8" />
            </tr>
          </thead>
          <tbody>
            {rows.map((ing) => (
              <tr key={ing.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                <td className="px-4 py-1.5">
                  <span className="font-medium text-slate-800">{ing.name}</span>
                  <span className="ml-1.5 text-[11px] text-slate-400">{priceSuffix(ing.unit)}</span>
                  {ing.personal && <span className="ml-1.5 rounded bg-brand-50 px-1 text-[10px] text-brand-700">perso</span>}
                </td>
                {STORES.map((s) => {
                  const key = `${ing.id}|${s}`;
                  const mine = myPrice.get(key);
                  const ref = globalPrice.get(key);
                  return (
                    <td key={s} className="px-2 py-1 text-right">
                      <input
                        inputMode="decimal"
                        defaultValue={mine !== undefined ? String(mine).replace(".", ",") : ""}
                        placeholder={ref !== undefined ? ref.toFixed(2).replace(".", ",") : "—"}
                        onBlur={(e) => {
                          const v = e.target.value.trim();
                          const before = mine !== undefined ? String(mine).replace(".", ",") : "";
                          if (v !== before) start(() => setIngredientPrice(ing.id, s, v));
                        }}
                        className={cx(
                          "w-16 rounded-md border border-transparent px-1.5 py-1 text-right text-sm placeholder:text-slate-400 hover:border-slate-200 focus:border-brand-400 focus:outline-none",
                          mine !== undefined && "font-semibold text-brand-700"
                        )}
                      />
                    </td>
                  );
                })}
                <td className="px-2 text-right">
                  {ing.personal && (
                    <button onClick={() => confirm(`Supprimer "${ing.name}" ?`) && start(() => deleteIngredient(ing.id))} className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
