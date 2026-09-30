"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { addDays, expand, monthBounds } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import { CountUp } from "@/components/app/count-up";
import { WidgetShell, Empty } from "@/components/app/widgets/shell";
import { eur0, fmtShort, mondayOf } from "@/components/app/widgets/helpers";
import type { WidgetProps } from "@/components/app/widgets/types";
import { MenuEditor, type MenuEntry } from "@/components/app/widgets/menu-editor";
import type { WidgetList } from "@/lib/data/widgets";

const BUDGET_CATEGORY = "Alimentation / Courses";
const shopping = (lists: WidgetList[]) => lists.filter((l) => l.type === "shopping");

/* ---------- Menu de la semaine ---------- */

export function MenuWeek({ data, size }: WidgetProps) {
  const weekStart = mondayOf(data.realToday ?? data.today);
  const [editing, setEditing] = useState(false);
  const menu = useMemo(() => {
    const merged = new Map<string, MenuEntry>();
    for (const m of data.menu.filter((x) => x.weekStart === weekStart)) merged.set(m.name.toLowerCase(), { key: m.id, id: m.id, name: m.name, icon: m.icon });
    for (const l of shopping(data.lists)) {
      if (!l.weekStart || l.weekStart < weekStart || l.weekStart > addDays(weekStart, 6)) continue;
      for (const r of l.recipes) if (!merged.has(r.name.toLowerCase())) merged.set(r.name.toLowerCase(), { key: `l${r.name}`, name: r.name, icon: r.icon });
    }
    return [...merged.values()];
  }, [data.lists, data.menu, weekStart]);

  return (
    <WidgetShell
      icon="chef"
      title="Menu de la semaine"
      subtitle={menu.length ? `${menu.length} repas · semaine du ${fmtShort(weekStart)}` : `Semaine du ${fmtShort(weekStart)}`}
      right={<button type="button" onClick={() => setEditing(true)} className="btn-secondary px-2.5 py-1 text-[11px]">{menu.length ? "Modifier" : "+ Ajouter"}</button>}
    >
      {menu.length === 0 ? (
        <Empty>Aucun repas prévu. Touche « Ajouter » pour composer ton menu, avec ou sans liste de courses.</Empty>
      ) : (
        <ul className={cx("grid gap-2", size === "m" && "sm:grid-cols-2", size === "l" && "sm:grid-cols-3")}>
          {menu.map((r) => (
            <li key={r.key} className="flex min-w-0 items-center gap-2.5 rounded-xl border border-line px-2.5 py-2">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-base">{r.icon ?? "🍽️"}</span>
              <span className="min-w-0 flex-1 truncate text-[12px] font-semibold text-stone-800">{r.name}</span>
            </li>
          ))}
        </ul>
      )}
      {editing && <MenuEditor data={data} weekStart={weekStart} entries={menu} onClose={() => setEditing(false)} />}
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
