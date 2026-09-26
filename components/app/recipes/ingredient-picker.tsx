"use client";

import { useMemo, useState } from "react";
import type { PickedIngredient } from "@/lib/data/ingredients";
import { QTY_UNITS, defaultQtyUnit, priceSuffix, unitForQty, type CatalogIngredient, type QtyUnit } from "@/lib/shopping";
import { formatEUR } from "@/lib/utils";

export function IngredientPicker({
  name,
  catalog,
  initial = [],
  suggestions = [],
  suggestionsLabel = "Suggestions",
  prices,
  priceStore,
  placeholder = "Chercher un ingrédient (pâtes, poivron…)",
}: {
  name: string;
  catalog: CatalogIngredient[];
  initial?: PickedIngredient[];
  suggestions?: string[];
  suggestionsLabel?: string;
  /** Effective price per ingredient id at the current store (shown as a hint). */
  prices?: Record<string, number>;
  /** When set, new ingredients can receive a personal price for this store. */
  priceStore?: string | null;
  placeholder?: string;
}) {
  const [picked, setPicked] = useState<PickedIngredient[]>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const byName = useMemo(() => new Map(catalog.map((c) => [c.name.toLowerCase(), c])), [catalog]);

  const has = (n: string) => picked.some((p) => p.name.toLowerCase() === n.trim().toLowerCase());
  const q = query.trim().toLowerCase();
  const matches = catalog.filter((c) => !has(c.name) && (!q || c.name.toLowerCase().includes(q))).slice(0, 10);
  const exact = byName.has(q);

  const add = (n: string) => {
    const clean = n.trim();
    if (!clean || has(clean)) return;
    const found = byName.get(clean.toLowerCase());
    setPicked((p) => [...p, { id: found?.id ?? null, name: found?.name ?? clean, qty: null, qtyUnit: defaultQtyUnit(found?.unit), price: null }]);
    setQuery("");
  };
  const update = (i: number, patch: Partial<PickedIngredient>) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  const freeSuggestions = suggestions.filter((s) => !has(s)).slice(0, 12);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(picked)} />

      {picked.length > 0 && (
        <ul className="space-y-1.5">
          {picked.map((p, i) => {
            const known = p.id ? catalog.find((c) => c.id === p.id) : undefined;
            const isNew = !known;
            return (
              <li key={p.name} className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 px-3 py-1.5 text-sm">
                <span className="min-w-[110px] flex-1 font-medium text-slate-800">
                  {p.name}
                  {isNew && <span className="ml-1.5 rounded bg-amber-100 px-1 text-[10px] font-normal text-amber-700">nouveau</span>}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={p.qty ?? ""}
                  onChange={(e) => update(i, { qty: e.target.value === "" ? null : Number(e.target.value) })}
                  placeholder="Qté"
                  className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-sm"
                />
                <select
                  value={p.qtyUnit ?? "u"}
                  onChange={(e) => update(i, { qtyUnit: e.target.value as QtyUnit })}
                  className="rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-sm"
                >
                  {QTY_UNITS.map((u) => <option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
                {isNew && priceStore && (
                  <label className="flex items-center gap-1 text-xs text-slate-500">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={p.price ?? ""}
                      onChange={(e) => update(i, { price: e.target.value === "" ? null : Number(e.target.value) })}
                      placeholder="Prix"
                      className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-right text-sm"
                    />
                    {priceSuffix(unitForQty(p.qtyUnit))} ({priceStore})
                  </label>
                )}
                <button type="button" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))} className="px-1 text-slate-400 hover:text-rose-600">×</button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(matches[0] && q ? matches[0].name : query);
            }
          }}
          placeholder={placeholder}
          className="input"
        />
        {open && (matches.length > 0 || (q && !exact)) && (
          <ul className="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
            {matches.map((m) => (
              <li key={m.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(m.name)} className="flex w-full justify-between rounded-lg px-3 py-1.5 text-left text-sm hover:bg-slate-50">
                  <span>
                    {m.name}
                    {m.personal && <span className="ml-1.5 text-[10px] text-slate-400">perso</span>}
                  </span>
                  {prices?.[m.id] !== undefined && <span className="text-xs text-slate-400">{formatEUR(prices[m.id])} {priceSuffix(m.unit).slice(1)}</span>}
                </button>
              </li>
            ))}
            {q && !exact && (
              <li>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(query)} className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50">
                  + Créer « {query.trim()} » (ma base perso)
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {freeSuggestions.length > 0 && (
        <div>
          <p className="mb-1 text-[11px] text-slate-400">{suggestionsLabel}</p>
          <div className="flex flex-wrap gap-1">
            {freeSuggestions.map((s) => (
              <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 hover:border-brand-300 hover:text-brand-700">
                + {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
