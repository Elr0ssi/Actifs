"use client";

import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addMenuItems, removeMenuItem } from "@/app/app/menu-actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { cx } from "@/lib/utils";
import type { WidgetData } from "@/lib/data/widgets";

export interface MenuEntry {
  key: string;
  name: string;
  icon: string | null;
  /** Présent pour les repas ajoutés à la main : ceux qui viennent d'une liste de courses ne se retirent pas ici. */
  id?: string;
}

const fold = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const iconFor = (name: string) => RECIPES.find((r) => r.name.toLowerCase() === name.toLowerCase())?.icon ?? null;

export function MenuEditor({ data, weekStart, entries, onClose }: { data: WidgetData; weekStart: string; entries: MenuEntry[]; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [q, setQ] = useState("");
  const [optimistic, setOptimistic] = useState<{ name: string; icon: string | null }[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);

  const inMenu = new Set([...entries.map((e) => e.name.toLowerCase()), ...optimistic.map((o) => o.name.toLowerCase())]);
  const visible = entries.filter((e) => !(e.id && removed.includes(e.id)));

  const lastCourse = useMemo(
    () => data.lists.filter((l) => l.type === "shopping" && l.recipes.length > 0).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [data.lists]
  );

  const add = (meals: { name: string; icon: string | null }[]) => {
    const fresh = meals.filter((m) => !inMenu.has(m.name.toLowerCase()));
    if (!fresh.length) return;
    setOptimistic((o) => [...o, ...fresh]);
    start(() => addMenuItems(weekStart, fresh));
  };

  const query = fold(q.trim());
  const mine = data.myRecipes.filter((r) => !inMenu.has(r.name.toLowerCase()) && (!query || fold(r.name).includes(query))).slice(0, 8);
  const ideas = RECIPES.filter((r) => !inMenu.has(r.name.toLowerCase()) && (!query || fold(`${r.name} ${r.category}`).includes(query))).slice(0, query ? 10 : 6);

  const chip = "flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-stone-700 transition hover:border-brand-300 hover:bg-brand-50";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <div className={cx("max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl", pending && "opacity-90")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-stone-900">Menu de la semaine</h2>
            <p className="text-xs text-stone-500">Ajoute des repas sans les mettre dans une liste de courses : utile quand tu as déjà les ingrédients.</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label="Fermer">✕</button>
        </div>

        <Section title={`Au menu (${visible.length + optimistic.length})`}>
          {visible.length + optimistic.length === 0 ? (
            <p className="text-xs text-stone-400">Rien pour l'instant.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {visible.map((e) => (
                <span key={e.key} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-800">
                  {e.icon ?? "🍽️"} {e.name}
                  {e.id ? (
                    <button aria-label={`Retirer ${e.name}`} onClick={() => { setRemoved((r) => [...r, e.id as string]); start(() => removeMenuItem(e.id as string)); }} className="text-brand-500 hover:text-rose-600">✕</button>
                  ) : (
                    <span title="Vient d'une liste de courses" className="text-[10px] text-brand-500">🛒</span>
                  )}
                </span>
              ))}
              {optimistic.map((o) => (
                <span key={`o${o.name}`} className="rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-800">{o.icon ?? "🍽️"} {o.name}</span>
              ))}
            </div>
          )}
        </Section>

        {lastCourse && (
          <Section
            title={`Menus de ma dernière course · ${lastCourse.name}`}
            action={<button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => add(lastCourse.recipes.map((r) => ({ name: r.name, icon: r.icon })))}>Tout ajouter</button>}
          >
            <div className="flex flex-wrap gap-1.5">
              {lastCourse.recipes.map((r) => {
                const on = inMenu.has(r.name.toLowerCase());
                return (
                  <button key={r.name} disabled={on} onClick={() => add([{ name: r.name, icon: r.icon }])} className={cx(chip, on && "cursor-default border-transparent bg-stone-100 text-stone-400 hover:bg-stone-100")}>
                    {r.icon ?? "🍽️"} {r.name} {on ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        <Section title="Ajouter d'autres menus">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher une recette…" className="input mb-3" />
          {mine.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-medium text-stone-400">Mes recettes</p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {mine.map((r) => <button key={r.name} onClick={() => add([{ name: r.name, icon: iconFor(r.name) }])} className={chip}>{iconFor(r.name) ?? "🍽️"} {r.name} +</button>)}
              </div>
            </>
          )}
          {ideas.length > 0 && (
            <>
              <p className="mb-1.5 text-[11px] font-medium text-stone-400">Idées</p>
              <div className="flex flex-wrap gap-1.5">
                {ideas.map((r) => <button key={r.slug} onClick={() => add([{ name: r.name, icon: r.icon }])} className={chip}>{r.icon} {r.name} +</button>)}
              </div>
            </>
          )}
          {mine.length === 0 && ideas.length === 0 && <p className="text-xs text-stone-400">Aucune recette trouvée.</p>}
        </Section>

        <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">Terminé</button>
      </div>
    </div>,
    document.body
  );
}

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{title}</p>
        {action}
      </div>
      {children}
    </div>
  );
}
