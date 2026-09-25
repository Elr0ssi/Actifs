"use client";

import { useMemo, useState } from "react";
import type { PickedIngredient } from "@/lib/data/ingredients";

export function IngredientPicker({
  name,
  catalog,
  initial = [],
  suggestions = [],
  suggestionsLabel = "Suggestions",
  withQuantity = true,
  placeholder = "Chercher ou créer un ingrédient…",
}: {
  name: string;
  catalog: { id: string; name: string }[];
  initial?: PickedIngredient[];
  suggestions?: string[];
  suggestionsLabel?: string;
  withQuantity?: boolean;
  placeholder?: string;
}) {
  const [picked, setPicked] = useState<PickedIngredient[]>(initial);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const has = (n: string) => picked.some((p) => p.name.toLowerCase() === n.trim().toLowerCase());
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    return catalog.filter((c) => !has(c.name) && (!q || c.name.toLowerCase().includes(q))).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [catalog, query, picked]);

  const add = (n: string, id?: string) => {
    const clean = n.trim();
    if (!clean || has(clean)) return;
    const match = id ? { id, name: clean } : catalog.find((c) => c.name.toLowerCase() === clean.toLowerCase());
    setPicked((p) => [...p, { id: match?.id ?? null, name: match?.name ?? clean, quantity: "" }]);
    setQuery("");
  };
  const exact = catalog.some((c) => c.name.toLowerCase() === query.trim().toLowerCase());
  const freeSuggestions = suggestions.filter((s) => !has(s)).slice(0, 12);

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={JSON.stringify(picked)} />
      {picked.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {picked.map((p, i) => (
            <li key={p.name} className="flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-3 pr-1 text-sm text-brand-800">
              {p.name}
              {withQuantity && (
                <input
                  value={p.quantity ?? ""}
                  onChange={(e) => setPicked((all) => all.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)))}
                  placeholder="qté"
                  className="w-16 rounded-full border-0 bg-white/70 px-2 py-0.5 text-xs focus:ring-1 focus:ring-brand-300"
                />
              )}
              <button type="button" onClick={() => setPicked((all) => all.filter((_, j) => j !== i))} className="px-1.5 text-brand-400 hover:text-rose-600">×</button>
            </li>
          ))}
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
              if (matches[0] && query.trim()) add(matches[0].name, matches[0].id);
              else add(query);
            }
          }}
          placeholder={placeholder}
          className="input"
        />
        {open && (matches.length > 0 || (query.trim() && !exact)) && (
          <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-xl border border-slate-100 bg-white p-1 shadow-lg">
            {matches.map((m) => (
              <li key={m.id}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(m.name, m.id)} className="w-full rounded-lg px-3 py-1.5 text-left text-sm hover:bg-slate-50">
                  {m.name}
                </button>
              </li>
            ))}
            {query.trim() && !exact && (
              <li>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => add(query)} className="w-full rounded-lg px-3 py-1.5 text-left text-sm font-medium text-brand-600 hover:bg-brand-50">
                  + Ajouter « {query.trim()} »
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
