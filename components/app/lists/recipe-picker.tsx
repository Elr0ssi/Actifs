"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, EQUIPMENT, RECIPES, filterRecipes, type MarketingRecipe } from "@/lib/marketing/recipes";
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
  initialTab: Tab;
  mine: ComposerRecipe[];
  counts: Record<string, number>;
  idBySlug: (slug: string) => string | undefined;
  busy: Set<string>;
  store: string | null;
  defaultPeople: number;
  onCount: (id: string, count: number) => void;
  onPickInspiration: (recipe: MarketingRecipe) => void;
  onClose: () => void;
}) {
  const tr = useT();
  const [tab, setTab] = useState<Tab>(initialTab);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<string[]>([]);
  const [showEquipment, setShowEquipment] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

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
  const toggleEquipment = (key: string) => setEquipment((p) => (p.includes(key) ? p.filter((k) => k !== key) : [...p, key]));
  const chip = (on: boolean) => cx("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition", on ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200");

  return (
    <div className="fixed inset-0 z-[60] flex animate-fade items-stretch justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-6" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={tr("Choisir des recettes")}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[980px] animate-modal flex-col overflow-hidden bg-canvas shadow-2xl sm:h-[min(680px,90vh)] sm:rounded-3xl"
      >
        <header className="flex flex-wrap items-center gap-3 border-b border-line bg-surface px-5 py-3">
          <p className="mr-auto text-base font-bold text-stone-900">{tr("Choisir des recettes")}</p>
          <div className="segmented">
            <button type="button" data-active={tab === "discover"} onClick={() => setTab("discover")}>{tr("Découvrir")}</button>
            <button type="button" data-active={tab === "mine"} onClick={() => setTab("mine")}>Mes recettes ({mine.length})</button>
          </div>
          <button type="button" onClick={onClose} aria-label={tr("Fermer")} className="rounded-lg p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700">
            <Icon name="close" />
          </button>
        </header>

        <div className="space-y-2 border-b border-line bg-surface px-5 py-2.5">
          <div className="flex gap-2">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tab === "discover" ? "Rechercher une recette ou un ingrédient…" : "Rechercher dans mes recettes…"}
              className="input py-2"
              autoFocus
            />
            {tab === "discover" && (
              <button
                type="button"
                onClick={() => setShowEquipment((v) => !v)}
                className={cx("shrink-0 rounded-xl border px-3 text-xs font-medium transition", equipment.length ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-stone-500 hover:bg-stone-50")}
              >
                Équipement{equipment.length > 0 && ` (${equipment.length})`}
              </button>
            )}
          </div>
          {tab === "discover" ? (
            <div className="flex gap-1.5 overflow-x-auto pb-0.5">
              <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>{tr("Toutes")}</button>
              {CATEGORIES.map((c) => (
                <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>{c}</button>
              ))}
            </div>
          ) : (
            <div className="flex gap-1.5">
              <button type="button" onClick={() => setOnlyFavorites(false)} className={chip(!onlyFavorites)}>{tr("Toutes")}</button>
              <button type="button" onClick={() => setOnlyFavorites(true)} className={chip(onlyFavorites)}>{tr("★ Favoris")}</button>
            </div>
          )}
          {tab === "discover" && showEquipment && (
            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-stone-50 p-2">
              <span className="mr-1 text-[11px] text-stone-500">{tr("Ce que tu as :")}</span>
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
              {equipment.length > 0 && <button type="button" onClick={() => setEquipment([])} className="ml-1 text-[11px] text-stone-400 hover:text-stone-700">{tr("Réinitialiser")}</button>}
            </div>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {tab === "discover" ? (
            discover.length === 0 ? (
              <p className="p-10 text-center text-sm text-stone-400">{tr("Aucune recette ne correspond.")}</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {discover.map((r) => {
                  const id = idBySlug(r.slug);
                  const c = id ? counts[id] ?? 0 : 0;
                  return (
                    <Card
                      key={r.slug}
                      emoji={r.icon}
                      image={r.image}
                      title={r.name}
                      meta={`${r.time} · ${r.difficulty}`}
                      count={c}
                      busy={busy.has(r.slug)}
                      onAdd={() => onPickInspiration(r)}
                      onCount={(n) => id && onCount(id, n)}
                    />
                  );
                })}
              </div>
            )
          ) : mineFiltered.length === 0 ? (
            <p className="p-8 text-center text-sm text-stone-400">
              {mine.length === 0 ? "Tu n'as pas encore de recette. Pioche dans « Découvrir »." : "Aucune recette ne correspond."}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {mineFiltered.map((r) => (
                <Card
                  key={r.id}
                  emoji={r.icon ?? "🍽️"}
                  image={r.image_url}
                  title={`${r.is_favorite ? "★ " : ""}${r.name}`}
                  meta={`${r.itemCount} ingr.${r.estimate !== null && store ? ` · ≈ ${formatEUR(r.estimate)}` : ""}`}
                  count={counts[r.id] ?? 0}
                  busy={false}
                  onAdd={() => onCount(r.id, defaultPeople)}
                  onCount={(n) => onCount(r.id, n)}
                />
              ))}
            </div>
          )}
        </div>

        <footer className="flex items-center justify-between gap-3 border-t border-line bg-surface px-5 py-2.5">
          <p className="text-sm text-stone-500">
            {total > 0 ? <><b className="text-stone-900">{total}</b> recette{total > 1 ? "s" : ""} choisie{total > 1 ? "s" : ""}</> : "Aucune recette choisie"}
          </p>
          <button type="button" onClick={onClose} className="btn-primary">{total > 0 ? "Terminé" : "Fermer"}</button>
        </footer>
      </div>
    </div>
  );
}

/** Carte compacte : tout est toujours visible, sans défilement interne. */
function Card({ emoji, image, title, meta, count, busy, onAdd, onCount }: { emoji: string; image: string | null; title: string; meta: string; count: number; busy: boolean; onAdd: () => void; onCount: (n: number) => void }) {
  const tr = useT();
  const on = count > 0;
  return (
    <article className={cx("flex flex-col overflow-hidden rounded-2xl border bg-surface transition", on ? "border-brand-400 ring-2 ring-brand-200" : "border-line hover:border-stone-300")}>
      <button type="button" onClick={() => (on ? onCount(0) : onAdd())} disabled={busy} className="flex h-20 items-center justify-center overflow-hidden bg-stone-100 text-4xl" aria-label={on ? `Retirer ${title}` : `Ajouter ${title}`}>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt="" draggable={false} className="h-full w-full object-cover" />
        ) : (
          emoji
        )}
      </button>
      <div className="flex flex-1 flex-col gap-1 p-2.5">
        <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-tight text-stone-900">{title}</p>
        <p className="truncate text-[11px] text-stone-400">{meta}</p>
        {on ? (
          <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-50 px-1.5 py-1">
            <button type="button" onClick={() => onCount(count - 1)} className="h-6 w-6 rounded-md bg-surface text-stone-600 shadow-sm" aria-label={tr("Moins de personnes")}>−</button>
            <span className="text-xs font-semibold text-brand-800">{count} pers.</span>
            <button type="button" onClick={() => onCount(count + 1)} className="h-6 w-6 rounded-md bg-surface text-stone-600 shadow-sm" aria-label={tr("Plus de personnes")}>+</button>
          </div>
        ) : (
          <button type="button" onClick={onAdd} disabled={busy} className="mt-1 rounded-lg bg-stone-100 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-brand-50 hover:text-brand-700">{busy ? "…" : "+ Ajouter"}</button>
        )}
      </div>
    </article>
  );
}
