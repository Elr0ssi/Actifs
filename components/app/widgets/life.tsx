"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addDays, expand, monthBounds, type Occurrence } from "@/lib/finance-engine";
import { cx, formatEUR, MONTHS_FR } from "@/lib/utils";
import { toggleTaskStatus, toggleRoutineLog } from "@/app/app/actions";
import { toggleListItem } from "@/app/app/lists/actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { DOW, eur0, fmtLong, fmtShort, scheduledOn, weekday } from "@/components/app/widgets/helpers";
import type { WidgetProps } from "@/components/app/widgets/types";
import type { Task } from "@/lib/types";

function useLogIndex(data: WidgetProps["data"]) {
  return useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);
}

/* ---------- Tâches ---------- */

export function TasksStat({ data }: WidgetProps) {
  const open = data.tasks.filter((t) => t.status !== "done");
  const late = open.filter((t) => t.due_date && t.due_date < data.today).length;
  const todayCount = open.filter((t) => t.due_date === data.today).length;
  return (
    <WidgetShell icon="tasks" title="Tâches en cours" href="/app/tasks/list" hrefLabel="Gérer">
      <p className="tabular text-3xl font-bold text-stone-900">{open.length}</p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{todayCount} aujourd'hui</span>
        <span className={cx("rounded-full px-2 py-0.5 font-medium", late ? "bg-rose-50 text-rose-600" : "bg-stone-100 text-stone-500")}>{late} en retard</span>
      </div>
    </WidgetShell>
  );
}

/* ---------- Routines ---------- */

function Ring({ value, total }: { value: number; total: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const pct = total ? value / total : 0;
  return (
    <svg viewBox="0 0 36 36" className="h-10 w-10 shrink-0 -rotate-90" aria-hidden>
      <circle cx="18" cy="18" r={r} fill="none" stroke="#f0e7df" strokeWidth="4" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="#b05538" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${pct * c} ${c}`} />
    </svg>
  );
}

export function RoutinesToday({ data }: WidgetProps) {
  const done = useLogIndex(data);
  const today = data.routines.filter((r) => scheduledOn(r, data.today));
  const count = today.filter((r) => done.has(`${r.id}_${data.today}`)).length;
  return (
    <WidgetShell icon="repeat" title="Routines du jour" href="/app/tasks/routines" hrefLabel="Gérer">
      {today.length === 0 ? (
        <Empty>Aucune routine prévue aujourd'hui.</Empty>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-3">
            <Ring value={count} total={today.length} />
            <p className="text-[12px] text-stone-500"><b className="tabular text-base text-stone-900">{count}/{today.length}</b> faites</p>
          </div>
          {today.map((r) => (
            <ToggleCheckbox key={r.id} initialChecked={done.has(`${r.id}_${data.today}`)} onToggle={toggleRoutineLog.bind(null, r.id, data.today)} label={r.title} sublabel={r.category ?? undefined} strikeThrough={false} />
          ))}
        </>
      )}
    </WidgetShell>
  );
}

/* ---------- Calendrier unifié ---------- */

type FinFilter = "all" | "in" | "out" | "off";

function useDayIndex(data: WidgetProps["data"], from: string, to: string, fin: FinFilter) {
  return useMemo(() => {
    const tasksBy = new Map<string, Task[]>();
    for (const t of data.tasks) if (t.due_date && t.due_date >= from && t.due_date <= to) tasksBy.set(t.due_date, [...(tasksBy.get(t.due_date) ?? []), t]);
    const finBy = new Map<string, Occurrence[]>();
    if (data.finance && fin !== "off") {
      for (const o of expand(data.finance.ops, from, to)) {
        if ((fin === "in" && o.signed < 0) || (fin === "out" && o.signed > 0)) continue;
        finBy.set(o.date, [...(finBy.get(o.date) ?? []), o]);
      }
    }
    return { tasksBy, finBy };
  }, [data.tasks, data.finance, from, to, fin]);
}

export function CalAgenda({ data, size, opts, setOpts }: WidgetProps) {
  const fin = (opts.fin as FinFilter) ?? "all";
  const showTasks = opts.tasks !== false;
  const showRoutines = opts.routines !== false;
  const done = useLogIndex(data);
  const [selected, setSelected] = useState(data.today);
  const [cursor, setCursor] = useState({ y: Number(data.today.slice(0, 4)), m: Number(data.today.slice(5, 7)) - 1 });
  const { start, end } = monthBounds(cursor.y, cursor.m);
  const gridStart = addDays(start, -((weekday(start) + 6) % 7));
  const gridEnd = addDays(end, (7 - weekday(end)) % 7);
  const { tasksBy, finBy } = useDayIndex(data, gridStart, gridEnd, fin);
  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
  const nav = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const wide = size !== "m";
  const chip = (on: boolean) => cx("rounded-full border px-2.5 py-1 text-[11px] font-medium transition", on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-white text-stone-400 hover:text-stone-700");

  const selTasks = showTasks ? tasksBy.get(selected) ?? [] : [];
  const selRoutines = showRoutines ? data.routines.filter((r) => scheduledOn(r, selected)) : [];
  const selFin = finBy.get(selected) ?? [];

  return (
    <WidgetShell icon="calendar" title="Calendrier" subtitle={wide ? "Tâches, routines et argent au même endroit" : undefined} href="/app/tasks/calendar" hrefLabel="Ouvrir">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button onClick={() => setOpts({ tasks: !showTasks })} className={chip(showTasks)}>Tâches</button>
        <button onClick={() => setOpts({ routines: !showRoutines })} className={chip(showRoutines)}>Routines</button>
        <Segmented<FinFilter> value={fin} onChange={(v) => setOpts({ fin: v })} options={[{ v: "all", l: "Tous flux" }, { v: "in", l: "Entrées" }, { v: "out", l: "Sorties" }, { v: "off", l: "Sans argent" }]} />
      </div>
      <div className={cx("grid gap-4", wide && "lg:grid-cols-[minmax(0,1fr)_240px]")}>
        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => nav(-1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronLeft" /></button>
            <p className="text-[13px] font-semibold text-stone-800">{MONTHS_FR[cursor.m]} {cursor.y}</p>
            <button onClick={() => nav(1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronRight" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400">
            {DOW.map((d) => <div key={d} className="pb-1.5">{wide ? d : d[0]}</div>)}
          </div>
          <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-line">
            {days.map((d) => {
              const outside = d < start || d > end;
              const tasks = showTasks ? tasksBy.get(d) ?? [] : [];
              const routines = showRoutines ? data.routines.filter((r) => scheduledOn(r, d)) : [];
              const routinesDone = routines.filter((r) => done.has(`${r.id}_${d}`)).length;
              const occ = finBy.get(d) ?? [];
              const net = occ.reduce((s, o) => s + o.signed, 0);
              return (
                <button
                  key={d}
                  onClick={() => { setSelected(d); if (outside) setCursor({ y: Number(d.slice(0, 4)), m: Number(d.slice(5, 7)) - 1 }); }}
                  className={cx(
                    "flex min-w-0 flex-col items-center gap-0.5 border-b border-r border-line/70 px-0.5 py-1.5 transition hover:bg-brand-50/50",
                    wide ? "min-h-[58px]" : "min-h-[40px]",
                    outside && "bg-stone-50/70",
                    d === selected && "bg-brand-50 ring-1 ring-inset ring-brand-300"
                  )}
                >
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium", d === data.today ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-700")}>
                    {Number(d.slice(-2))}
                  </span>
                  <span className="flex gap-0.5">
                    {tasks.length > 0 && <span className="h-1.5 w-1.5 rounded-full bg-sky-500" title={`${tasks.length} tâche(s)`} />}
                    {routines.length > 0 && d <= data.today && <span className={cx("h-1.5 w-1.5 rounded-full", routinesDone === routines.length ? "bg-emerald-500" : "bg-emerald-200")} />}
                  </span>
                  {wide && occ.length > 0 && <span className={cx("tabular hidden max-w-full truncate text-[10px] font-semibold sm:block", net >= 0 ? "text-emerald-600" : "text-rose-600")}>{net >= 0 ? "+" : "-"}{eur0(Math.abs(net))}</span>}
                  {occ.length > 0 && <span className={cx("h-1 w-3 rounded-full", wide && "sm:hidden", net >= 0 ? "bg-emerald-400" : "bg-rose-400")} />}
                </button>
              );
            })}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-stone-400">
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-sky-500" />Tâches</span>
            <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Routines faites</span>
            <span className="flex items-center gap-1"><span className="h-1 w-3 rounded-full bg-rose-400" />Flux d'argent</span>
          </div>
        </div>
        <div className="min-w-0 rounded-xl border border-line bg-stone-50/50 p-3">
          <p className="text-[12px] font-semibold capitalize text-stone-800">{fmtLong(selected)}</p>
          {selTasks.length + selRoutines.length + selFin.length === 0 && <p className="mt-2 text-[11px] text-stone-400">Journée libre.</p>}
          {selTasks.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Tâches</p>
              {selTasks.map((t) => (
                <ToggleCheckbox key={`${t.id}-${t.status}`} initialChecked={t.status === "done"} onToggle={toggleTaskStatus.bind(null, t.id)} label={t.title} sublabel={t.due_time?.slice(0, 5) ?? undefined} />
              ))}
            </div>
          )}
          {selRoutines.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Routines</p>
              {selected <= data.today
                ? selRoutines.map((r) => (
                    <ToggleCheckbox key={`${r.id}-${selected}`} initialChecked={done.has(`${r.id}_${selected}`)} onToggle={toggleRoutineLog.bind(null, r.id, selected)} label={r.title} strikeThrough={false} />
                  ))
                : selRoutines.map((r) => <p key={r.id} className="truncate px-2 py-1 text-[12px] text-stone-600">{r.title}</p>)}
            </div>
          )}
          {selFin.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">Argent</p>
              <ul className="space-y-1">
                {selFin.map((o, i) => (
                  <li key={i} className="flex justify-between gap-2 px-2 text-[12px]">
                    <span className="truncate text-stone-700">{o.op.name}</span>
                    <span className={cx("tabular shrink-0 font-semibold", o.signed > 0 ? "text-emerald-600" : "text-rose-600")}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}

export function CalWeek({ data, size }: WidgetProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(data.today, i));
  const [picked, setPicked] = useState<string | null>(null);
  const { tasksBy, finBy } = useDayIndex(data, days[0], days[6], "all");
  const events = days
    .filter((d) => !picked || d === picked)
    .flatMap((d) => [
      ...(tasksBy.get(d) ?? []).filter((t) => t.status !== "done").map((t) => ({ d, key: `t${t.id}`, dot: "bg-sky-500", label: t.title, meta: t.due_time?.slice(0, 5) ?? "Tâche", amount: null as number | null })),
      ...(finBy.get(d) ?? []).map((o, i) => ({ d, key: `f${o.op.id}${i}`, dot: o.signed > 0 ? "bg-emerald-500" : "bg-rose-400", label: o.op.name, meta: o.signed > 0 ? "Entrée" : "Sortie", amount: o.signed })),
    ]);
  const routinesOn = (d: string) => data.routines.filter((r) => scheduledOn(r, d)).length;
  const focus = picked ?? data.today;
  return (
    <WidgetShell icon="list" title="Cette semaine" subtitle={picked ? `${fmtLong(picked)} · touche à nouveau pour tout voir` : "Touche un jour pour le détail"} href="/app/tasks/calendar">
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const n = (tasksBy.get(d)?.length ?? 0) + (finBy.get(d)?.length ?? 0);
          const on = picked === d;
          return (
            <button
              key={d}
              type="button"
              onClick={() => setPicked(on ? null : d)}
              aria-pressed={on}
              className={cx(
                "flex flex-col items-center rounded-xl py-1.5 transition",
                d === data.today ? "bg-brand-600 text-white" : "bg-stone-50 text-stone-700 hover:bg-brand-50",
                on && "ring-2 ring-brand-300 ring-offset-1"
              )}
            >
              <span className={cx("text-[10px]", d === data.today ? "text-brand-100" : "text-stone-400")}>{DOW[(weekday(d) + 6) % 7]}</span>
              <span className="text-sm font-bold">{Number(d.slice(-2))}</span>
              <span className={cx("mt-0.5 h-1 w-1 rounded-full", n ? (d === data.today ? "bg-white" : "bg-brand-500") : "bg-transparent")} />
            </button>
          );
        })}
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-center text-[11px] text-stone-400">{picked ? "Rien de prévu ce jour-là." : "Semaine calme : aucune tâche ni opération prévue."}</p>
      ) : (
        <ul className={cx("mt-3 grid gap-x-5 gap-y-1", size !== "m" && "sm:grid-cols-2")}>
          {events.slice(0, size === "m" ? 6 : 12).map((e) => (
            <li key={e.key} className="flex items-center gap-2.5 text-[12px]">
              <span className="w-12 shrink-0 whitespace-nowrap text-[10px] text-stone-400">{fmtShort(e.d)}</span>
              <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", e.dot)} />
              <span className="min-w-0 flex-1 truncate text-stone-700">{e.label}</span>
              {e.amount !== null ? (
                <span className={cx("tabular shrink-0 font-semibold", e.amount > 0 ? "text-emerald-600" : "text-rose-600")}>{e.amount > 0 ? "+" : "-"}{eur0(Math.abs(e.amount))}</span>
              ) : (
                <span className="shrink-0 text-[10px] text-stone-400">{e.meta}</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {routinesOn(focus) > 0 && <p className="mt-2 text-[10px] text-stone-400">+ {routinesOn(focus)} routine(s) {picked ? "ce jour-là" : "aujourd'hui"}</p>}
    </WidgetShell>
  );
}

/* ---------- Courses ---------- */

export function ListsShopping({ data, size, opts, setOpts }: WidgetProps) {
  const open = data.lists.filter((l) => !l.archived);
  const list = open.find((l) => l.id === opts.listId) ?? open.find((l) => l.type === "shopping") ?? open[0];
  const [pending, start] = useTransition();
  const [override, setOverride] = useState<Record<string, boolean>>({});
  if (!list) {
    return (
      <WidgetShell icon="cart" title="Liste de courses" href="/app/lists/mes-listes">
        <Empty>Aucune liste en cours.</Empty>
      </WidgetShell>
    );
  }
  const isChecked = (i: { id: string; checked: boolean }) => override[i.id] ?? i.checked;
  const items = [...list.items.filter((i) => !isChecked(i)), ...list.items.filter(isChecked)];
  const remaining = list.items.filter((i) => !isChecked(i)).length;
  return (
    <WidgetShell
      icon="cart"
      title="Liste de courses"
      subtitle={size === "s" ? `${list.name} · ${remaining} à acheter` : `${list.name} · ${remaining} article(s) à acheter`}
      href={`/app/lists/${list.id}`}
      hrefLabel="Ouvrir"
      right={
        open.length > 1 && size !== "s" ? (
          <select value={list.id} onChange={(e) => setOpts({ listId: e.target.value })} className="max-w-[110px] rounded-md border border-line bg-white px-1.5 py-1 text-[11px] text-stone-600">
            {open.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <Empty>Cette liste est vide.</Empty>
      ) : (
        <ul className={cx("grid gap-x-4", size === "m" && "sm:grid-cols-2", pending && "opacity-70")}>
          {items.slice(0, size === "s" ? 7 : 14).map((i) => {
            const on = isChecked(i);
            return (
              <li key={i.id}>
                <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-[12px] hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => {
                      setOverride((o) => ({ ...o, [i.id]: !on }));
                      start(() => toggleListItem(list.id, i.id, !on));
                    }}
                    className="h-3.5 w-3.5 rounded border-stone-300 accent-brand-600"
                  />
                  <span className={cx("min-w-0 flex-1 truncate", on ? "text-stone-300 line-through" : "text-stone-700")}>{i.label}</span>
                  {i.quantity && <span className="shrink-0 text-[10px] text-stone-400">{i.quantity}</span>}
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Recettes ---------- */

export function RecipesIdeas({ data, size }: WidgetProps) {
  const count = size === "m" ? 2 : size === "l" ? 3 : 5;
  const seed = Math.floor(new Date(`${data.today}T00:00:00Z`).getTime() / 86_400_000);
  const picks = Array.from({ length: count }, (_, i) => RECIPES[(seed * 7 + i * 17) % RECIPES.length]);
  return (
    <WidgetShell icon="chef" title="Idées de recettes" subtitle="Sélection du jour" href="/app/lists/recipes" hrefLabel="Toutes">
      <div className={cx("grid gap-3", size === "m" ? "grid-cols-2" : size === "l" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5")}>
        {picks.map((r) => (
          <Link key={r.slug} href={`/recettes/${r.slug}`} className="group min-w-0">
            <div className="relative">
              <div className="flex h-20 items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-[10px] text-stone-300">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt={r.name} className="h-full w-full object-cover" />
                ) : (
                  "Photo à venir"
                )}
              </div>
              <span className="absolute -bottom-2.5 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white text-sm shadow">{r.icon}</span>
            </div>
            <p className="mt-3.5 truncate text-[12px] font-semibold text-stone-800 group-hover:text-brand-700">{r.name}</p>
            <p className="text-[10px] text-stone-400">{r.time} · {r.category}</p>
          </Link>
        ))}
      </div>
    </WidgetShell>
  );
}

/* ---------- Notes ---------- */

export function NotesVocab({ data, size }: WidgetProps) {
  return (
    <WidgetShell icon="book" title="Vocabulaire récent" href="/app/notes/vocabulaire">
      {data.words.length === 0 ? (
        <Empty>Aucun mot enregistré pour l'instant.</Empty>
      ) : (
        <ul className={cx("grid gap-x-4 divide-y divide-line/70", size === "m" && "sm:grid-cols-2 sm:divide-y-0")}>
          {data.words.slice(0, size === "s" ? 5 : 10).map((w) => (
            <li key={w.id} className="flex items-center justify-between gap-2 py-1.5 text-[12px]">
              <span className="truncate font-medium text-stone-800">{w.french}</span>
              <span className="truncate text-stone-500">{w.english}</span>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}
