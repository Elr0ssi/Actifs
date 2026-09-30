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
  onCount,
  onPickInspiration,
  onClose,
}: {
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
  const total = chosen.reduce((s, [, c]) => s + c, 0);
  const estimate = chosen.reduce((s, [id, c]) => s + (mine.find((r) => r.id === id)?.estimate ?? 0) * c, 0);
  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * scroller.current.clientWidth * 0.75, behavior: "smooth" });
  const toggleEquipment = (key: string) => setEquipment((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));

  const chip = (on: boolean) => cx("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition", on ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200");

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade items-stretch justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Choisir des recettes"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[1180px] animate-modal flex-col overflow-hidden bg-canvas shadow-2xl sm:h-[min(820px,94vh)] sm:rounded-3xl"
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-5 py-3.5">
          <div className="mr-auto">
            <p className="text-base font-bold text-stone-900">Choisis tes recettes</p>
            <p className="text-[11px] text-stone-500">Chaque recette choisie est ajoutée au menu et à ta liste.</p>
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
                <div ref={scroller} className="flex h-[calc(100%-1.75rem)] snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 pt-2 [scrollbar-width:thin]">
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
                        <button type="button" onClick={() => onCount(r.id, c ? 0 : 1)} className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-2xl">
                          {r.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            r.icon ?? "🍽️"
                          )}
                        </button>
                        <button type="button" onClick={() => onCount(r.id, c ? 0 : 1)} className="min-w-0 flex-1 text-left">
                          <p className="truncate text-sm font-semibold text-stone-800">{r.is_favorite && <span className="text-brand-500">★ </span>}{r.name}</p>
                          <p className="truncate text-xs text-stone-400">{r.itemCount} ingr.{r.estimate !== null && store ? ` · ≈ ${formatEUR(r.estimate)}` : ""}</p>
                        </button>
                        <Stepper count={c} onChange={(n) => onCount(r.id, n)} />
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
            <b className="text-stone-900">{total}</b> repas au menu
            {store && estimate > 0 && <> · ≈ <b className="text-stone-900">{formatEUR(estimate)}</b> chez {store}</>}
          </p>
          <button type="button" onClick={onClose} className="btn-primary">{total > 0 ? "Terminé" : "Fermer"}</button>
        </footer>
      </div>
    </div>
  );
}

function Stepper({ count, onChange }: { count: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      <button type="button" onClick={() => onChange(Math.max(0, count - 1))} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500 hover:bg-stone-50" aria-label="Moins">−</button>
      <span className="w-5 text-center text-sm font-semibold">{count}</span>
      <button type="button" onClick={() => onChange(count + 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-500 hover:bg-stone-50" aria-label="Plus">+</button>
    </div>
  );
}

function DiscoverCard({ recipe, count, busy, onAdd, onCount }: { recipe: MarketingRecipe; count: number; busy: boolean; onAdd: () => void; onCount: (n: number) => void }) {
  return (
    <article className={cx("flex h-full w-[82vw] max-w-[340px] shrink-0 snap-center flex-col overflow-hidden rounded-3xl border bg-surface shadow-sm transition", count > 0 ? "border-brand-400 ring-2 ring-brand-200" : "border-line")}>
      <div className="relative">
        <div className="flex aspect-video shrink-0 items-center justify-center overflow-hidden bg-stone-100 text-xs text-stone-300">
          {recipe.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
          ) : (
            "Photo à venir"
          )}
        </div>
        <span className="absolute -bottom-5 left-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-surface text-2xl shadow-md">{recipe.icon}</span>
        {count > 0 && <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-1 text-[11px] font-semibold text-white shadow">✓ Au menu</span>}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-4 pb-4 pt-7">
        <div className="flex items-center gap-2 text-[11px]">
          <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{recipe.category}</span>
          <span className="text-stone-400">{recipe.time} · {recipe.difficulty}</span>
        </div>
        <h3 className="mt-2 text-lg font-bold leading-tight text-stone-900">{recipe.name}</h3>
        <p className="mt-1 text-xs text-stone-500">Pour {recipe.servings} pers.</p>
        <ul className="mt-3 min-h-0 flex-1 space-y-1 overflow-hidden text-[12px] text-stone-600">
          {recipe.ingredients.slice(0, 7).map((i) => (
            <li key={i} className="flex gap-2"><span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand-400" /><span className="truncate">{i}</span></li>
          ))}
          {recipe.ingredients.length > 7 && <li className="text-stone-400">+ {recipe.ingredients.length - 7} autres ingrédients</li>}
        </ul>
        {recipe.utensils.length > 0 && (
          <p className="mt-2 truncate text-[11px] text-stone-400">🔧 {recipe.utensils.filter((u) => !BASIC_UTENSILS.includes(u)).join(", ") || "Aucun équipement particulier"}</p>
        )}
        <div className="mt-3">
          {count > 0 ? (
            <div className="flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2">
              <span className="text-xs font-semibold text-brand-800">{count} repas</span>
              <Stepper count={count} onChange={onCount} />
            </div>
          ) : (
            <button type="button" onClick={onAdd} disabled={busy} className="btn-primary w-full">{busy ? "Ajout…" : "+ Ajouter au menu"}</button>
          )}
        </div>
      </div>
    </article>
  );
}
