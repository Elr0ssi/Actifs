"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, COLLECTIONS, EQUIPMENT, RECIPES, filterRecipes } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { DragScroller } from "@/components/marketing/drag-scroller";
import { cx } from "@/lib/utils";

const chip = (on: boolean) =>
  cx("rounded-full px-3 py-1 text-xs font-semibold transition", on ? "bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-soft" : "border border-line bg-surface text-stone-600 hover:border-amber-300 hover:text-stone-900");

export function RecipesBrowser() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [collection, setCollection] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const toggleEquipment = (key: string) => setEquipment((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));
  const results = useMemo(() => filterRecipes(RECIPES, { query, category, equipment, collection }), [query, category, equipment, collection]);
  const active = (category ? 1 : 0) + equipment.length;
  const reset = () => { setCategory(null); setEquipment([]); setCollection(null); setQuery(""); };

  return (
    <div>
      {/* Recherche + bouton Filtres, sur une seule ligne */}
      <div className="relative mx-auto flex max-w-xl items-center gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Recette ou ingrédient (ex. poivron)…"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface/90 px-5 py-3 text-sm shadow-soft outline-none backdrop-blur transition focus:border-brand-400 focus:shadow-lift"
        />
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className={cx("flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-3 text-sm font-semibold shadow-soft transition", active > 0 || open ? "border-amber-300 bg-amber-50 text-amber-800" : "border-line bg-surface text-stone-600 hover:border-amber-300")}
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h14M6 10h8M9 15h2" /></svg>
          Filtres{active > 0 && <span className="flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-amber-500 px-1 text-[11px] text-white">{active}</span>}
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-3xl border border-line bg-surface p-5 shadow-lift">
            <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">Type de plat</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>{c}</button>)}
            </div>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-stone-400">Ce que j'ai chez moi</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {EQUIPMENT.map((e) => <button key={e.key} onClick={() => toggleEquipment(e.key)} className={chip(equipment.includes(e.key))}>{e.icon} {e.label}</button>)}
            </div>
            <div className="mt-5 flex items-center justify-between border-t border-line pt-3">
              <button onClick={() => { setCategory(null); setEquipment([]); }} className="text-xs font-medium text-stone-400 hover:text-stone-700">Réinitialiser</button>
              <button onClick={() => setOpen(false)} className="rounded-full bg-ink px-4 py-1.5 text-xs font-semibold text-onink">Voir {results.length} recette{results.length > 1 ? "s" : ""}</button>
            </div>
          </div>
        )}
      </div>

      {/* Collections thématiques */}
      <DragScroller className="mt-6 justify-start sm:justify-center">
        {COLLECTIONS.map((c) => {
          const on = collection === c.key;
          return (
            <button
              key={c.key}
              onClick={() => setCollection(on ? null : c.key)}
              title={c.hint}
              className={cx("flex shrink-0 items-center gap-2 rounded-2xl border px-3.5 py-2 text-left transition", on ? cx("border-transparent bg-gradient-to-br text-white shadow-lift", c.gradient) : "border-line bg-surface hover:-translate-y-0.5 hover:shadow-soft")}
            >
              <span className="text-xl">{c.icon}</span>
              <span>
                <span className={cx("block text-[13px] font-semibold leading-tight", on ? "text-white" : "text-stone-900")}>{c.label}</span>
                <span className={cx("block text-[10.5px]", on ? "text-white/80" : "text-stone-400")}>{RECIPES.filter(c.test).length} recettes</span>
              </span>
            </button>
          );
        })}
      </DragScroller>

      {/* Filtres actifs */}
      {(category || equipment.length > 0 || collection) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5">
          {collection && <button onClick={() => setCollection(null)} className={chip(true)}>{COLLECTIONS.find((c) => c.key === collection)?.label} ✕</button>}
          {category && <button onClick={() => setCategory(null)} className={chip(true)}>{category} ✕</button>}
          {equipment.map((k) => <button key={k} onClick={() => toggleEquipment(k)} className={chip(true)}>{EQUIPMENT.find((e) => e.key === k)?.label} ✕</button>)}
          <button onClick={reset} className="ml-1 text-xs text-stone-400 hover:text-stone-700">Tout effacer</button>
        </div>
      )}

      <p className="mt-5 text-center text-xs text-stone-400">
        {results.length} recette{results.length > 1 ? "s" : ""} {results.length !== RECIPES.length && `sur ${RECIPES.length}`}
      </p>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((r) => (
          <RecipeCard key={r.slug} recipe={r} />
        ))}
      </div>

      {results.length === 0 && (
        <p className="mt-10 text-center text-sm text-stone-400">Aucune recette ne correspond. Essaie un autre mot-clé ou retire un filtre.</p>
      )}
    </div>
  );
}
