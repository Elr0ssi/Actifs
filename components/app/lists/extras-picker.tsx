"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState } from "react";
import type { PickedIngredient } from "@/lib/data/ingredients";
import { defaultQtyUnit, priceSuffix, type CatalogIngredient, type QtyUnit } from "@/lib/shopping";
import { cx, formatEUR } from "@/lib/utils";

const UNIT_OPTIONS: Record<string, { v: QtyUnit; l: string }[]> = {
  kg: [{ v: "g", l: "g" }, { v: "kg", l: "kg" }],
  l: [{ v: "ml", l: "ml" }, { v: "l", l: "L" }],
  unit: [{ v: "u", l: "pièce(s)" }],
};

/** Produits en plus des recettes : une barre de recherche, puis une liste simple. Rien d'autre à l'écran tant qu'on n'en a pas besoin. */
export function ExtrasPicker({
  name,
  catalog,
  suggestions,
  prices,
  store,
}: {
  name: string;
  catalog: CatalogIngredient[];
  suggestions: string[];
  prices: Record<string, number>;
  store: string | null;
}) {
  const tr = useT();
  const [picked, setPicked] = useState<PickedIngredient[]>([]);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const byName = useMemo(() => new Map(catalog.map((c) => [c.name.toLowerCase(), c])), [catalog]);

  const has = (n: string) => picked.some((p) => p.name.toLowerCase() === n.trim().toLowerCase());
  const q = query.trim().toLowerCase();
  const matches = q ? catalog.filter((c) => !has(c.name) && c.name.toLowerCase().includes(q)).slice(0, 7) : [];
  const exact = byName.has(q);
  const free = suggestions.filter((s) => !has(s)).slice(0, 14);

  const add = (n: string) => {
    const clean = n.trim();
    if (!clean || has(clean)) return;
    const found = byName.get(clean.toLowerCase());
    const unit = defaultQtyUnit(found?.unit);
    setPicked((p) => [...p, { id: found?.id ?? null, name: found?.name ?? clean, qty: unit === "u" ? 1 : null, qtyUnit: unit, price: null }]);
    setQuery("");
    setOpen(false);
  };
  const update = (i: number, patch: Partial<PickedIngredient>) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, ...patch } : x)));

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(picked)} />
      <div className="relative">
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(matches[0] ? matches[0].name : query);
            }
          }}
          placeholder={tr("Chercher un produit : lait, café, lessive…")}
          className="input"
        />
        {open && q && (matches.length > 0 || !exact) && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-lg">
            {matches.map((m) => (
              <li key={m.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(m.name)} className="flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm hover:bg-stone-50">
                  <span className="truncate">{m.name}</span>
                  {prices[m.id] !== undefined && <span className="ml-2 shrink-0 text-xs text-stone-400">{formatEUR(prices[m.id])} {priceSuffix(m.unit).slice(1)}</span>}
                </button>
              </li>
            ))}
            {!exact && (
              <li>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(query)} className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50">
                  + Ajouter « {query.trim()} »
                </button>
              </li>
            )}
          </ul>
        )}
      </div>

      {free.length > 0 && (
        <div className="mt-2">
          <button type="button" onClick={() => setShowSuggestions((v) => !v)} className="text-xs font-medium text-brand-600 hover:underline">
            {showSuggestions ? "Masquer les suggestions" : `Suggestions de tes dernières courses (${free.length})`}
          </button>
          {showSuggestions && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {free.map((s) => (
                <button key={s} type="button" onClick={() => add(s)} className="rounded-full border border-line px-2.5 py-1 text-xs text-stone-600 hover:border-brand-300 hover:text-brand-700">+ {s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {picked.length > 0 && (
        <ul className="mt-3 divide-y divide-line/70 rounded-xl border border-line bg-surface">
          {picked.map((p, i) => {
            const known = p.id ? catalog.find((c) => c.id === p.id) : undefined;
            const units = known ? UNIT_OPTIONS[known.unit] : [{ v: "u" as QtyUnit, l: "pièce(s)" }, { v: "g" as QtyUnit, l: "g" }, { v: "kg" as QtyUnit, l: "kg" }, { v: "ml" as QtyUnit, l: "ml" }, { v: "l" as QtyUnit, l: "L" }];
            return (
              <li key={p.name} className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-stone-800">
                  {p.name}
                  {!known && <span className="ml-1.5 rounded bg-amber-100 px-1 text-[10px] font-normal text-amber-700">{tr("nouveau")}</span>}
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={p.qty ?? ""}
                  onChange={(e) => update(i, { qty: e.target.value === "" ? null : Number(e.target.value) })}
                  placeholder="1"
                  aria-label={`Quantité : ${p.name}`}
                  className="w-16 rounded-lg border border-line bg-surface px-2 py-1 text-right text-sm"
                />
                <select value={p.qtyUnit ?? "u"} onChange={(e) => update(i, { qtyUnit: e.target.value as QtyUnit })} className="w-[5.5rem] rounded-lg border border-line bg-surface px-1.5 py-1 text-xs" aria-label={tr("Unité")}>
                  {units.map((u) => <option key={u.v} value={u.v}>{u.l}</option>)}
                </select>
                {!known && store && (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={p.price ?? ""}
                    onChange={(e) => update(i, { price: e.target.value === "" ? null : Number(e.target.value) })}
                    placeholder={tr("€ (facultatif)")}
                    title={`Prix chez ${store}`}
                    className="hidden w-24 rounded-lg border border-line bg-surface px-2 py-1 text-right text-xs sm:block"
                  />
                )}
                <button type="button" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))} className={cx("px-1 text-stone-300 hover:text-rose-600")} aria-label={`Retirer ${p.name}`}>✕</button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
