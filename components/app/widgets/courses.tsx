"use client";

import { useMemo, useRef, useState } from "react";
import { RECIPES } from "@/lib/marketing/recipes";
import Link from "next/link";
import { addDays, expand, monthBounds } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import { CountUp } from "@/components/app/count-up";
import { WidgetShell, Empty } from "@/components/app/widgets/shell";
import { eur0, fmtShort, mondayOf } from "@/components/app/widgets/helpers";
import type { WidgetProps } from "@/components/app/widgets/types";
import { MenuEditor } from "@/components/app/widgets/menu-editor";
import type { WidgetList } from "@/lib/data/widgets";

const BUDGET_CATEGORY = "Alimentation / Courses";
const shopping = (lists: WidgetList[]) => lists.filter((l) => l.type === "shopping");

/* ---------- Menu de la semaine ---------- */

const DAY_SHORT = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export function MenuWeek({ data }: WidgetProps) {
  const realToday = data.realToday ?? data.today;
  const weekStart = mondayOf(realToday);
  const [editDay, setEditDay] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const byName = useMemo(() => new Map(RECIPES.map((r) => [r.name.toLowerCase(), r])), []);
  const mineByName = useMemo(() => new Map(data.myRecipes.map((r) => [r.name.toLowerCase(), r])), [data.myRecipes]);
  const mealsOn = (d: string) => data.menu.filter((m) => m.day === d);
  const upcoming = data.menu.filter((m) => m.day >= realToday).length;
  const planned = useMemo(() => {
    const names = new Set(data.menu.filter((m) => m.day >= weekStart && m.day <= addDays(weekStart, 6)).map((m) => m.name.toLowerCase()));
    const out = new Map<string, string>();
    for (const l of shopping(data.lists)) {
      if (!l.weekStart || l.weekStart < weekStart || l.weekStart > addDays(weekStart, 6)) continue;
      for (const r of l.recipes) if (!names.has(r.name.toLowerCase())) out.set(r.name, r.name);
    }
    return [...out.values()];
  }, [data.lists, data.menu, weekStart]);
  const scrollBy = (dir: number) => scroller.current?.scrollBy({ left: dir * (scroller.current.clientWidth * 0.8), behavior: "smooth" });
  const nextWord = new Date(`${realToday}T00:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <WidgetShell
      icon="chef"
      title="Repas de la semaine"
      subtitle={`Semaine du ${fmtShort(weekStart)}`}
      right={<button type="button" onClick={() => setEditDay(realToday)} className="btn-secondary px-2.5 py-1 text-[11px]">Planifier</button>}
    >
      <div className="relative">
        <div ref={scroller} className="-mx-1 flex snap-x gap-3 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((d, i) => {
            const meals = mealsOn(d);
            const first = meals[0];
            const rec = first ? byName.get(first.name.toLowerCase()) : undefined;
            const image = rec?.image ?? (first ? mineByName.get(first.name.toLowerCase())?.image_url : null) ?? null;
            const isToday = d === realToday;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setEditDay(d)}
                className={cx("group w-[150px] shrink-0 snap-start rounded-2xl border p-2.5 text-left transition hover:shadow-soft", isToday ? "border-brand-300 bg-brand-50/40" : "border-line bg-surface")}
              >
                <p className={cx("text-[13px] font-bold", isToday ? "text-brand-700" : "text-stone-900")}>{DAY_SHORT[i % 7]} {Number(d.slice(8))}</p>
                {first ? (
                  <>
                    <div className="mt-2 aspect-[4/3] overflow-hidden rounded-xl bg-stone-100">
                      {image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={image} alt={first.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-4xl">{first.icon ?? rec?.icon ?? "🍽️"}</div>
                      )}
                    </div>
                    <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-[13px] font-semibold leading-tight text-stone-900">{first.name}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-stone-500">
                      <span>⏱</span>
                      {rec?.time ?? "—"}
                      {meals.length > 1 && <span className="ml-auto rounded-full bg-stone-100 px-1.5 text-[10px] font-semibold text-stone-500">+{meals.length - 1}</span>}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="mt-2 flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-line text-2xl text-stone-300 transition group-hover:border-brand-300 group-hover:text-brand-500">+</div>
                    <p className="mt-2 min-h-[2.5rem] text-[12px] text-stone-400">Rien de prévu</p>
                    <p className="mt-1 text-[11px] text-transparent">.</p>
                  </>
                )}
              </button>
            );
          })}
        </div>
        <button type="button" onClick={() => scrollBy(-1)} aria-label="Précédent" className="absolute -left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-stone-500 shadow-md hover:text-stone-900 sm:flex">‹</button>
        <button type="button" onClick={() => scrollBy(1)} aria-label="Suivant" className="absolute -right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-stone-500 shadow-md hover:text-stone-900 sm:flex">›</button>
      </div>

      {planned.length > 0 && (
        <p className="mt-2 text-[11px] text-stone-500">
          Dans tes courses de la semaine : <button className="font-medium text-brand-600 hover:underline" onClick={() => setEditDay(realToday)}>{planned.join(", ")}</button> — à placer sur un jour.
        </p>
      )}

      {upcoming === 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50 px-3.5 py-2.5 text-[12px] text-brand-800">
          <span>Aucun repas prévu à partir du {nextWord}.</span>
          <button type="button" onClick={() => setEditDay(realToday)} className="rounded-lg border border-brand-300 bg-surface px-3 py-1.5 font-semibold text-brand-700 hover:bg-brand-50">Planifier des repas</button>
        </div>
      )}
      {editDay && <MenuEditor data={data} weekStart={weekStart} initialDay={editDay} onClose={() => setEditDay(null)} />}
    </WidgetShell>
  );
}

/* ---------- Listes en cours ---------- */

export function ListsOverview({ data, size }: WidgetProps) {
  const open = data.lists.filter((l) => !l.archived);
  return (
    <WidgetShell icon="list" title="Listes en cours" subtitle={open.length ? `${open.length} liste(s)` : undefined}>
      {open.length === 0 ? (
        <Empty>Aucune liste en cours.</Empty>
      ) : (
        <ul className={cx("grid gap-x-5 gap-y-2.5", size === "m" && "sm:grid-cols-2")}>
          {open.slice(0, 6).map((l) => {
            const done = l.items.filter((i) => i.checked).length;
            const pct = l.items.length ? (done / l.items.length) * 100 : 0;
            return (
              <li key={l.id}>
                <Link href={`/app/lists/${l.id}`} className="block rounded-lg px-1 py-0.5 hover:bg-stone-50">
                  <div className="flex items-baseline justify-between gap-2 text-[12px]">
                    <span className="truncate font-medium text-stone-800">{l.name}{l.store && <span className="ml-1.5 text-[10px] font-normal text-stone-400">{l.store}</span>}</span>
                    <span className="tabular shrink-0 text-[11px] text-stone-500">
                      {done}/{l.items.length}
                      {l.amount > 0 && <b className="ml-2 text-stone-800">{eur0(l.amount)}</b>}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                    <div className="fill-grow h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${pct}%` }} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Dépenses vs budget ---------- */

export function CoursesBudget({ data, size }: WidgetProps) {
  const month = data.today.slice(0, 7);
  const budget = useMemo(() => {
    if (!data.finance) return 0;
    const { start, end } = monthBounds(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1);
    return expand(data.finance.ops.filter((o) => o.kind === "variable" && o.category === BUDGET_CATEGORY), start, end).reduce((s, o) => s + o.op.amount, 0);
  }, [data.finance, month]);
  const thisMonth = shopping(data.lists).filter((l) => l.date.slice(0, 7) === month);
  const spent = thisMonth.filter((l) => l.archived).reduce((s, l) => s + l.amount, 0);
  const planned = thisMonth.filter((l) => !l.archived).reduce((s, l) => s + l.amount, 0);
  const total = spent + planned;
  const left = budget - total;
  const scale = Math.max(budget, total, 1);

  return (
    <WidgetShell icon="wallet" title="Budget courses" subtitle="Dépenses vs budget · ce mois-ci">
      <p className="tabular text-2xl font-bold tracking-tight text-stone-900">
        <CountUp value={total} kind="eur0" />
        {budget > 0 && <span className="ml-1.5 text-[12px] font-normal tracking-normal text-stone-400">/ {eur0(budget)}</span>}
      </p>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-stone-100">
        <div className={cx("fill-grow h-full", left < 0 ? "bg-rose-400" : "bg-brand-600")} style={{ width: `${(spent / scale) * 100}%` }} />
        <div className={cx("fill-grow h-full", left < 0 ? "bg-rose-200" : "bg-brand-200")} style={{ width: `${(planned / scale) * 100}%` }} />
      </div>
      {budget > 0 ? (
        <p className={cx("mt-1.5 text-[11px]", left < 0 ? "font-medium text-rose-600" : "text-stone-500")}>
          {left < 0 ? `Dépassé de ${eur0(-left)}` : `Il te reste ${eur0(left)}`}
        </p>
      ) : (
        <p className="mt-1.5 text-[11px] text-stone-400">Aucun budget « {BUDGET_CATEGORY} » défini dans Finance.</p>
      )}
      {size === "m" && (
        <p className="mt-2 text-[11px] text-stone-400">{eur0(spent)} déjà dépensés · {eur0(planned)} en cours</p>
      )}
    </WidgetShell>
  );
}

/* ---------- Dernière course ---------- */

export function CoursesLast({ data }: WidgetProps) {
  const finished = useMemo(
    () => shopping(data.lists).filter((l) => l.archived && l.amount > 0).sort((a, b) => b.date.localeCompare(a.date)),
    [data.lists]
  );
  const last = finished[0];
  const meals = (l: WidgetList) => l.recipes.reduce((s, r) => s + r.count, 0);
  const withMeals = finished.slice(0, 5).filter((l) => meals(l) > 0);
  const avgMeal = withMeals.length ? withMeals.reduce((s, l) => s + l.amount, 0) / withMeals.reduce((s, l) => s + meals(l), 0) : null;

  return (
    <WidgetShell icon="cart" title="Dernière course" subtitle={last ? `${last.name} · ${fmtShort(last.date)}` : undefined}>
      {!last ? (
        <Empty>Termine une liste de courses pour voir ce qu'elle coûte.</Empty>
      ) : (
        <>
          <p className="tabular text-2xl font-bold tracking-tight text-stone-900"><CountUp value={last.amount} kind="eur0" /></p>
          <p className="mt-1.5 text-[11px] text-stone-500">
            {avgMeal !== null ? (
              <>Prix moyen par repas : <b className="tabular text-stone-800">{avgMeal.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 })}</b></>
            ) : (
              "Choisis des recettes dans tes listes pour connaître ton prix par repas."
            )}
          </p>
        </>
      )}
    </WidgetShell>
  );
}
