"use client";

import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addDays } from "@/lib/finance-engine";
import { addMenuItems, removeMenuItem, setMenuServings } from "@/app/app/menu-actions";
import { setDefaultServings } from "@/app/app/lists/actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { cx } from "@/lib/utils";
import { DOW } from "@/components/app/widgets/helpers";
import type { WidgetData } from "@/lib/data/widgets";

const fold = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const timeOf = (name: string) => RECIPES.find((r) => r.name.toLowerCase() === name.toLowerCase())?.time ?? null;
const iconFor = (name: string) => RECIPES.find((r) => r.name.toLowerCase() === name.toLowerCase())?.icon ?? null;

export function MenuEditor({ data, weekStart, initialDay, onClose }: { data: WidgetData; weekStart: string; initialDay: string; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [day, setDay] = useState(initialDay);
  const [q, setQ] = useState("");
  const [optimistic, setOptimistic] = useState<{ name: string; icon: string | null; day: string }[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [people, setPeople] = useState(data.defaultServings);
  const [sv, setSv] = useState<Record<string, number>>({});
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  const dayItems = data.menu.filter((m) => m.day === day && !removed.includes(m.id));
  // Une ligne « en attente » disparaît dès que le serveur a renvoyé le repas (sinon il apparaîtrait en double).
  const saved = new Set(data.menu.map((m) => `${m.day}|${m.name.toLowerCase()}`));
  const dayOpt = optimistic.filter((o) => o.day === day && !saved.has(`${o.day}|${o.name.toLowerCase()}`));
  const inDay = new Set([...dayItems.map((m) => m.name.toLowerCase()), ...dayOpt.map((o) => o.name.toLowerCase())]);
  const countOn = (d: string) => data.menu.filter((m) => m.day === d && !removed.includes(m.id)).length + optimistic.filter((o) => o.day === d && !saved.has(`${o.day}|${o.name.toLowerCase()}`)).length;

  const lastCourse = useMemo(
    () => data.lists.filter((l) => l.type === "shopping" && l.recipes.length > 0).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [data.lists]
  );

  const add = (meals: { name: string; icon: string | null }[]) => {
    const fresh = meals.filter((m) => !inDay.has(m.name.toLowerCase()));
    if (!fresh.length) return;
    setOptimistic((o) => [...o, ...fresh.map((m) => ({ ...m, day }))]);
    start(() => addMenuItems(day, fresh.map((m) => ({ ...m, servings: people }))));
  };
  const changePeople = (n: number) => {
    const v = Math.min(20, Math.max(1, n));
    setPeople(v);
    void setDefaultServings(v);
  };
  const changeMeal = (id: string, current: number, n: number) => {
    const v = Math.min(100, Math.max(1, n));
    setSv((m) => ({ ...m, [id]: v }));
    start(() => setMenuServings(id, v));
    void current;
  };

  const query = fold(q.trim());
  const mine = data.myRecipes.filter((r) => !inDay.has(r.name.toLowerCase()) && (!query || fold(r.name).includes(query))).slice(0, 8);
  const ideas = RECIPES.filter((r) => !inDay.has(r.name.toLowerCase()) && (!query || fold(`${r.name} ${r.category}`).includes(query))).slice(0, query ? 10 : 6);
  const label = (d: string) => `${DOW[(new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7]} ${Number(d.slice(8))}`;
  const chip = "flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-stone-700 transition hover:border-brand-300 hover:bg-brand-50";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <div className={cx("max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl", pending && "opacity-90")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-stone-900">Planifier les repas</h2>
            <p className="text-xs text-stone-500">Choisis un jour, puis ajoute des repas. Rien n'est ajouté à tes listes de courses.</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label="Fermer">✕</button>
        </div>

        <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {days.map((d) => (
            <button key={d} onClick={() => setDay(d)} className={cx("relative shrink-0 rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition", d === day ? "border-brand-500 bg-brand-600 text-white" : "border-line text-stone-600 hover:bg-stone-100")}>
              {label(d)}
              {countOn(d) > 0 && <span className={cx("absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px]", d === day ? "bg-white text-brand-700" : "bg-brand-600 text-white")}>{countOn(d)}</span>}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-brand-50/60 px-3.5 py-2.5">
          <div>
            <p className="text-[13px] font-semibold text-stone-800">Pour combien de personnes ?</p>
            <p className="text-[11px] text-stone-500">Les recettes ajoutées s'ajustent à ce nombre.</p>
          </div>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => changePeople(people - 1)} className="h-8 w-8 rounded-lg border border-line bg-surface text-stone-600" aria-label="Moins de personnes">−</button>
            <span className="min-w-[3rem] text-center text-base font-bold text-stone-900">{people}<span className="ml-0.5 text-[10px] font-medium text-stone-400">pers.</span></span>
            <button type="button" onClick={() => changePeople(people + 1)} className="h-8 w-8 rounded-lg border border-line bg-surface text-stone-600" aria-label="Plus de personnes">+</button>
          </div>
        </div>

        <Section title={`Au menu · ${label(day)}`}>
          {dayItems.length + dayOpt.length === 0 ? (
            <p className="text-xs text-stone-400">Rien de prévu ce jour-là.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {dayItems.map((m) => (
                <span key={m.id} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-800">
                  {m.icon ?? "🍽️"} {m.name}
                  <span className="flex items-center gap-0.5 rounded-full bg-surface/80 px-1 text-[11px] text-brand-700">
                    <button type="button" aria-label="Moins de personnes" onClick={() => changeMeal(m.id, sv[m.id] ?? m.servings ?? data.defaultServings, (sv[m.id] ?? m.servings ?? data.defaultServings) - 1)} className="px-0.5">−</button>
                    {sv[m.id] ?? m.servings ?? data.defaultServings} pers.
                    <button type="button" aria-label="Plus de personnes" onClick={() => changeMeal(m.id, sv[m.id] ?? m.servings ?? data.defaultServings, (sv[m.id] ?? m.servings ?? data.defaultServings) + 1)} className="px-0.5">+</button>
                  </span>
                  <button aria-label={`Retirer ${m.name}`} onClick={() => { setRemoved((r) => [...r, m.id]); start(() => removeMenuItem(m.id)); }} className="text-brand-500 hover:text-rose-600">✕</button>
                </span>
              ))}
              {dayOpt.map((o) => <span key={`o${o.name}`} className="rounded-full bg-brand-50 px-3 py-1.5 text-[12px] font-medium text-brand-800">{o.icon ?? "🍽️"} {o.name}</span>)}
            </div>
          )}
        </Section>

        <Section
          title={lastCourse ? `Menus de ma dernière course · ${lastCourse.name}` : "Menus de ma dernière course"}
          action={lastCourse ? <button className="text-xs font-medium text-brand-600 hover:underline" onClick={() => add(lastCourse.recipes.map((r) => ({ name: r.name, icon: r.icon })))}>Tout ajouter</button> : undefined}
        >
          {lastCourse ? (
            <div className="flex flex-wrap gap-1.5">
              {lastCourse.recipes.map((r) => {
                const on = inDay.has(r.name.toLowerCase());
                const t = timeOf(r.name);
                return (
                  <button key={r.name} disabled={on} onClick={() => add([{ name: r.name, icon: r.icon }])} className={cx(chip, on && "cursor-default border-transparent bg-stone-100 text-stone-400 hover:bg-stone-100")}>
                    {r.icon ?? "🍽️"} {r.name}{t && <span className="text-stone-400"> · {t}</span>} {on ? "✓" : "+"}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-stone-400">Les recettes que tu choisis en créant une liste de courses apparaîtront ici.</p>
          )}
        </Section>

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
                {ideas.map((r) => <button key={r.slug} onClick={() => add([{ name: r.name, icon: r.icon }])} className={chip}>{r.icon} {r.name} <span className="text-stone-400">· {r.time}</span> +</button>)}
              </div>
            </>
          )}
          {mine.length === 0 && ideas.length === 0 && <p className="text-xs text-stone-400">Aucune recette trouvée.</p>}
          <a href="/app/lists/recipes" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">+ Créer une nouvelle recette</a>
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
