"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BASIC_UTENSILS, CATEGORIES, EQUIPMENT, RECIPES, filterRecipes, type MarketingRecipe } from "@/lib/marketing/recipes";
import { Icon } from "@/components/app/icons";
import { cx, formatEUR } from "@/lib/utils";
import type { ComposerRecipe } from "@/components/app/lists/list-composer";

type Tab = "discover" | "mine";

const norm = (s: string) => s.trim().toLowerCase();

export function RecipePicker({
  initialTab,
  mine,
  counts,
  idBySlug,
  busy,
  store,
  defaultPeople,
  onCount,
  onPickInspiration,
  onClose,
}: {
  defaultPeople: number;
  initialTab: Tab;
  mine: ComposerRecipe[];
  counts: Record<string, number>;
  idBySlug: (slug: string) => string | undefined;
  busy: Set<string>;
  store: string | null;
  onCount: (id: string, count: number) => void;
  onPickInspiration: (recipe: MarketingRecipe) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [showEquipment, setShowEquipment] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const discover = useMemo(() => filterRecipes(RECIPES, { query, category, equipment }), [query, category, equipment]);
  const mineFiltered = useMemo(
    () => mine.filter((r) => (!onlyFavorites || r.is_favorite) && (!query.trim() || norm(r.name).includes(norm(query)))),
    [mine, onlyFavorites, query]
  );

  const chosen = Object.entries(counts).filter(([, c]) => c > 0);
  const total = chosen.length;
  const people = chosen.reduce((s, [, c]) => s + c, 0);
  const estimate = chosen.reduce((s, [id, c]) => {
    const r = mine.find((x) => x.id === id);
    return s + (r?.estimate ?? 0) * (c / (r?.servings || 4));
  }, 0);
  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * 296, behavior: "smooth" });
  const dragProps = {
    onPointerDown: (e: React.PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || !scroller.current || (e.target as HTMLElement).closest("button,input,a")) return;
      drag.current = { down: true, x: e.clientX, left: scroller.current.scrollLeft, moved: false };
    },
    onPointerMove: (e: React.PointerEvent) => {
      const g = drag.current;
      if (!g.down || !scroller.current) return;
      const dx = e.clientX - g.x;
      if (Math.abs(dx) > 5) g.moved = true;
      if (g.moved) scroller.current.scrollLeft = g.left - dx;
    },
    onPointerUp: () => { drag.current.down = false; },
    onPointerLeave: () => { drag.current.down = false; },
  };
  const toggleEquipment = (key: string) => setEquipment((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const chip = (on: boolean) => cx("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition", on ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200");

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade items-stretch justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choisir des recettes"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[1180px] animate-modal flex-col overflow-hidden bg-canvas shadow-2xl sm:h-[min(720px,92vh)] sm:rounded-3xl"
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="mr-auto">
            <p className="text-base font-bold text-stone-900">Choisis tes recettes</p>
            <p className="text-[11px] text-stone-500">Choisis le nombre de personnes : les quantités s'ajustent pour chaque recette.</p>
          </div>
          <div className="segmented">
            <button type="button" data-active={tab === "discover"} onClick={() => setTab("discover")}>✨ Découvrir</button>
            <button type="button" data-active={tab === "mine"} onClick={() => setTab("mine")}>Mes recettes ({mine.length})</button>
          </div>
          <button type="button" onClick={onClose} aria-label="Fermer" className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
            <Icon name="close" />
          </button>
        </header>

        <div className="space-y-2.5 border-b border-line bg-surface px-5 py-3">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "discover" ? "Rechercher une recette ou un ingrédient (ex. poivron)…" : "Rechercher dans mes recettes…"}
              className="input"
              autoFocus
            />
            {tab === "discover" && (
              <button
                type="button"
                onClick={() => setShowEquipment((v) => !v)}
                className={cx("shrink-0 rounded-xl border px-3 text-xs font-medium transition", equipment.length ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-stone-500 hover:bg-stone-50")}
              >
                🔧 Équipement{equipment.length > 0 && ` (${equipment.length})`}
              </button>
            )}
          </div>
          {tab === "discover" ? (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>Toutes</button>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>{c}</button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setOnlyFavorites(false)} className={chip(!onlyFavorites)}>Toutes</button>
              <button type="button" onClick={() => setOnlyFavorites(true)} className={chip(onlyFavorites)}>★ Favoris</button>
            </div>
          )}
          {tab === "discover" && showEquipment && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-stone-50 p-2.5">
              <span className="mr-1 text-[11px] text-stone-500">Ce que tu as :</span>
              {EQUIPMENT.map((e) => (
                <button
                  key={e.key}
                  type="button"
                  onClick={() => toggleEquipment(e.key)}
                  className={cx("flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition", equipment.includes(e.key) ? "border-brand-400 bg-brand-100 text-brand-800" : "border-line bg-surface text-stone-600 hover:bg-stone-100")}
                >
                  <span>{e.icon}</span>{e.label}
                </button>
              ))}
              {equipment.length > 0 && <button type="button" onClick={() => setEquipment([])} className="ml-1 text-[11px] text-stone-400 hover:text-stone-700">Réinitialiser</button>}
            </div>
          )}
        </div>

        <div className="relative min-h-0 flex-1">
          {tab === "discover" ? (
            discover.length === 0 ? (
              <p className="p-10 text-center text-sm text-stone-400">Aucune recette ne correspond. Essaie un autre mot-clé.</p>
            ) : (
              <>
                <p className="px-5 pt-3 text-[11px] text-stone-400">{discover.length} recette{discover.length > 1 ? "s" : ""} · fais défiler pour en voir d'autres</p>
                <div ref={scroller} {...dragProps} className="flex h-[calc(100%-1.75rem)] cursor-grab select-none items-start gap-4 overflow-auto px-5 pb-4 pt-2 active:cursor-grabbing [scrollbar-width:thin]">
                  {discover.map((r) => {
                    const id = idBySlug(r.slug);
                    return <DiscoverCard key={r.slug} recipe={r} count={id ? counts[id] ?? 0 : 0} busy={busy.has(r.slug)} onAdd={() => onPickInspiration(r)} onCount={(c) => id && onCount(id, c)} />;
                  })}
                </div>
                <button type="button" onClick={() => scrollBy(-1)} aria-label="Précédent" className="absolute left-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface shadow-lg ring-1 ring-line hover:bg-stone-50 sm:flex"><Icon name="chevronLeft" className="h-5 w-5" /></button>
                <button type="button" onClick={() => scrollBy(1)} aria-label="Suivant" className="absolute right-2 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-surface shadow-lg ring-1 ring-line hover:bg-stone-50 sm:flex"><Icon name="chevronRight" className="h-5 w-5" /></button>
              </>
            )
          ) : (
            <div className="h-full overflow-y-auto p-5">
              {mineFiltered.length === 0 ? (
                <p className="p-8 text-center text-sm text-stone-400">
                  {mine.length === 0 ? "Tu n'as pas encore de recette. Pioche dans « Découvrir » : elles seront enregistrées ici." : "Aucune recette ne correspond."}
                </p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {mineFiltered.map((r) => {
                    const c = counts[r.id] ?? 0;
                    return (
                      <div key={r.id} className={cx("flex items-center gap-3 rounded-2xl border bg-surface p-2.5 transition", c > 0 ? "border-brand-300 bg-brand-50/60" : "border-line")}>
                        <button type="button" onClick={() => onCount(r.id, c ? 0 : defaultPeople)} className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-2xl">
                          {r.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            r.icon ?? "🍽️"
                          )}
                        </button>
                        <button type="button" onClick={() => onCount(r.id, c ? 0 : defaultPeople)} className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-semibold text-stone-800">{r.is_favorite && <span className="text-brand-500">★ </span>}{r.name}</p>
                          <p className="truncate text-xs text-stone-400">{r.itemCount} ingr.{r.estimate !== null && store ? ` · ≈ ${formatEUR(r.estimate)}` : ""}</p>
                        </button>
                        <Stepper count={c} unit="pers." onChange={(n) => onCount(r.id, n)} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line bg-surface px-5 py-3">
          <p className="text-sm text-stone-500">
            <b className="text-stone-900">{total}</b> recette{total > 1 ? "s" : ""}{people > 0 && <> · <b className="text-stone-900">{people}</b> portion{people > 1 ? "s" : ""}</>}
            {store && estimate > 0 && <> · ≈ <b className="text-stone-900">{formatEUR(estimate)}</b> chez {store}</>}
          </p>
          <button type="button" onClick={onClose} className="btn-primary">{total > 0 ? "Terminé" : "Fermer"}</button>
        </footer>
      </div>
    </div>
  );
}

function Stepper({ count, onChange, unit }: { count: number; onChange: (n: number) => void; unit?: string }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, count - 1))} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500 hover:bg-stone-50" aria-label="Moins">−</button>
      <span className={unit ? "min-w-[2.6rem] text-center text-sm font-semibold" : "w-5 text-center text-sm font-semibold"}>{count}{unit && <span className="ml-0.5 text-[10px] font-medium text-stone-400">{unit}</span>}</span>
      <button type="button" onClick={() => onChange(count + 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500 hover:bg-stone-50" aria-label="Plus">+</button>
    </div>
  );
}

function DiscoverCard({ recipe, count, busy, onAdd, onCount }: { recipe: MarketingRecipe; count: number; busy: boolean; onAdd: () => void; onCount: (n: number) => void }) {
  return (
    <article className={cx("flex w-[280px] shrink-0 flex-col overflow-hidden rounded-2xl border bg-surface shadow-sm transition", count > 0 ? "border-brand-400 ring-2 ring-brand-200" : "border-line")}>
      <div className="relative">
        <div className="flex aspect-[16/8] shrink-0 items-center justify-center overflow-hidden bg-stone-100 text-xs text-stone-300">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.name} draggable={false} className="h-full w-full object-cover" />
          ) : (
            <span className="text-4xl">{recipe.icon}</span>
          )}
        </div>
        {count > 0 && <span className="absolute right-2 top-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">✓ Choisie</span>}
      </div>
      <div className="flex flex-col px-3.5 pb-3.5 pt-3">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{recipe.category}</span>
          <span className="text-stone-400">⏱ {recipe.time} · {recipe.difficulty}</span>
        </div>
        <h3 className="mt-1.5 text-[15px] font-bold leading-tight text-stone-900">{recipe.icon} {recipe.name}</h3>
        <ul className="mt-2 space-y-0.5 text-[11.5px] text-stone-600">
          {recipe.ingredients.slice(0, 4).map((i) => (
            <li key={i} className="flex gap-1.5"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" /><span className="truncate">{i}</span></li>
          ))}
          {recipe.ingredients.length > 4 && <li className="text-stone-400">+ {recipe.ingredients.length - 4} autres ingrédients</li>}
        </ul>
        {recipe.utensils.filter((u) => !BASIC_UTENSILS.includes(u)).length > 0 && (
          <p className="mt-1.5 truncate text-[10.5px] text-stone-400">🔧 {recipe.utensils.filter((u) => !BASIC_UTENSILS.includes(u)).join(", ")}</p>
        )}
        <div className="mt-2.5">
          {count > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-2.5 py-1.5">
              <span className="text-[11px] font-semibold text-brand-800">Pour</span>
              <Stepper count={count} unit="pers." onChange={onCount} />
            </div>
          ) : (
            <button type="button" onClick={onAdd} disabled={busy} className="btn-primary w-full py-2 text-xs">{busy ? "Ajout…" : "+ Ajouter"}</button>
          )}
        </div>
      </div>
    </article>
  );
}
