"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addDays, expand, monthBounds, toMs, type Occurrence } from "@/lib/finance-engine";
import { cx, formatEUR, MONTHS_FR } from "@/lib/utils";
import { toggleTaskStatus, toggleRoutineLog, quickAddTask } from "@/app/app/actions";
import { toggleListItem } from "@/app/app/lists/actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import type { WidgetProps } from "@/components/app/widgets/types";
import type { Routine, Task } from "@/lib/types";

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const weekday = (d: string) => new Date(toMs(d)).getUTCDay();
const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtLong = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const scheduledOn = (r: Routine, d: string) => r.frequency === "daily" || (r.frequency === "weekly" && (r.days_of_week ?? []).includes(weekday(d)));
const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

function useLogIndex(data: WidgetProps["data"]) {
  return useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);
}

/* ---------- Tâches ---------- */

export function TasksList({ data, size }: WidgetProps) {
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const open = useMemo(
    () =>
      data.tasks
        .filter((t) => t.status !== "done")
        .sort((a, b) => {
          const late = (t: Task) => (t.due_date && t.due_date < data.today ? 0 : 1);
          return late(a) - late(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
        }),
    [data.tasks, data.today]
  );
  const limit = size === "s" ? 4 : size === "m" ? 6 : 10;
  return (
    <WidgetShell icon="tasks" title="Tâches prioritaires" subtitle={`${open.length} en cours`} href="/app/tasks/list">
      {open.length === 0 ? (
        <Empty>Rien en attente. Profites-en.</Empty>
      ) : (
        <div className={cx("grid gap-x-4", size === "l" && "sm:grid-cols-2")}>
          {open.slice(0, limit).map((t) => (
            <ToggleCheckbox
              key={t.id}
              initialChecked={false}
              onToggle={toggleTaskStatus.bind(null, t.id)}
              label={t.title}
              sublabel={t.due_date ? (t.due_date < data.today ? `En retard · ${fmtShort(t.due_date)}` : `Échéance ${fmtShort(t.due_date)}`) : t.priority === "high" ? "Priorité haute" : undefined}
            />
          ))}
        </div>
      )}
      <form
        action={(fd) => start(async () => { await quickAddTask(fd); setDraft(""); })}
        className={cx("mt-2 flex gap-1.5", pending && "opacity-60")}
      >
        <input name="title" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ajouter une tâche…" className="input py-1.5 text-xs" />
        <button disabled={!draft.trim()} className="btn-primary shrink-0 px-2.5 py-1.5"><Icon name="plus" /></button>
      </form>
    </WidgetShell>
  );
}

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

export function RoutinesWeek({ data, size }: WidgetProps) {
  const done = useLogIndex(data);
  const days = Array.from({ length: 7 }, (_, i) => addDays(data.today, i - 6));
  const perDay = days.map((d) => {
    const due = data.routines.filter((r) => scheduledOn(r, d));
    const ok = due.filter((r) => done.has(`${r.id}_${d}`)).length;
    return { d, due: due.length, ok, pct: due.length ? ok / due.length : 0 };
  });
  const totalDue = perDay.reduce((s, p) => s + p.due, 0);
  const totalOk = perDay.reduce((s, p) => s + p.ok, 0);
  return (
    <WidgetShell icon="chart" title="Progression des routines" subtitle="7 derniers jours" href="/app/tasks/routines">
      {data.routines.length === 0 ? (
        <Empty>Crée une routine pour suivre ta régularité.</Empty>
      ) : (
        <div className={cx("grid gap-4", size === "l" && "sm:grid-cols-[1fr_1fr]")}>
          <div>
            <p className="tabular text-2xl font-bold text-stone-900">{totalDue ? Math.round((totalOk / totalDue) * 100) : 0} %<span className="ml-1.5 text-[11px] font-normal text-stone-400">{totalOk}/{totalDue} réalisées</span></p>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {perDay.map((p) => (
                <div key={p.d} className="flex flex-1 flex-col items-center gap-1" title={`${fmtShort(p.d)} : ${p.ok}/${p.due}`}>
                  <div className="flex h-20 w-full items-end rounded-md bg-stone-100">
                    <div className={cx("w-full rounded-md", p.d === data.today ? "bg-brand-600" : "bg-brand-300")} style={{ height: `${Math.max(p.pct * 100, p.due ? 4 : 0)}%` }} />
                  </div>
                  <span className="text-[9px] text-stone-400">{DOW[(weekday(p.d) + 6) % 7][0]}</span>
                </div>
              ))}
            </div>
          </div>
          <ul className="space-y-1.5">
            {data.routines.slice(0, 5).map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="truncate text-stone-700">{r.title}</span>
                <span className="flex shrink-0 gap-0.5">
                  {days.map((d) => (
                    <span key={d} className={cx("h-2.5 w-2.5 rounded-sm", !scheduledOn(r, d) ? "bg-transparent" : done.has(`${r.id}_${d}`) ? "bg-brand-500" : "bg-stone-200")} />
                  ))}
                </span>
              </li>
            ))}
          </ul>
        </div>
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
    <WidgetShell icon="calendar" title="Calendrier" subtitle={wide ? "Tâches, routines et argent au même endroit" : undefined} href="/app/calendar" hrefLabel="Ouvrir">
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
  const { tasksBy, finBy } = useDayIndex(data, days[0], days[6], "all");
  const events = days.flatMap((d) => [
    ...(tasksBy.get(d) ?? []).filter((t) => t.status !== "done").map((t) => ({ d, key: `t${t.id}`, dot: "bg-sky-500", label: t.title, meta: t.due_time?.slice(0, 5) ?? "Tâche", amount: null as number | null })),
    ...(finBy.get(d) ?? []).map((o, i) => ({ d, key: `f${o.op.id}${i}`, dot: o.signed > 0 ? "bg-emerald-500" : "bg-rose-400", label: o.op.name, meta: o.signed > 0 ? "Entrée" : "Sortie", amount: o.signed })),
  ]);
  const routinesPerDay = (d: string) => data.routines.filter((r) => scheduledOn(r, d)).length;
  return (
    <WidgetShell icon="list" title="Cette semaine" href="/app/calendar">
      <div className="grid grid-cols-7 gap-1">
        {days.map((d) => {
          const n = (tasksBy.get(d)?.length ?? 0) + (finBy.get(d)?.length ?? 0);
          return (
            <div key={d} className={cx("flex flex-col items-center rounded-xl py-1.5", d === data.today ? "bg-brand-600 text-white" : "bg-stone-50 text-stone-700")}>
              <span className={cx("text-[10px]", d === data.today ? "text-brand-100" : "text-stone-400")}>{DOW[(weekday(d) + 6) % 7]}</span>
              <span className="text-sm font-bold">{Number(d.slice(-2))}</span>
              <span className={cx("mt-0.5 h-1 w-1 rounded-full", n ? (d === data.today ? "bg-white" : "bg-brand-500") : "bg-transparent")} />
            </div>
          );
        })}
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-center text-[11px] text-stone-400">Semaine calme : aucune tâche ni opération prévue.</p>
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
      {routinesPerDay(data.today) > 0 && <p className="mt-2 text-[10px] text-stone-400">+ {routinesPerDay(data.today)} routine(s) aujourd'hui</p>}
    </WidgetShell>
  );
}

/* ---------- Courses ---------- */

export function ListsShopping({ data, size, opts, setOpts }: WidgetProps) {
  const list = data.lists.find((l) => l.id === opts.listId) ?? data.lists[0];
  const [pending, start] = useTransition();
  const [checked, setChecked] = useState<Set<string>>(new Set());
  if (!list) {
    return (
      <WidgetShell icon="cart" title="Liste de courses" href="/app/lists/mes-listes">
        <Empty>Aucune liste en cours.</Empty>
      </WidgetShell>
    );
  }
  const remaining = list.items.filter((i) => !i.checked && !checked.has(i.id));
  return (
    <WidgetShell
      icon="cart"
      title="Liste de courses"
      subtitle={size === "s" ? `${list.name} · ${remaining.length} à acheter` : `${remaining.length} article(s) à acheter`}
      href={`/app/lists/${list.id}`}
      hrefLabel="Ouvrir"
      right={
        data.lists.length > 1 && size !== "s" ? (
          <select value={list.id} onChange={(e) => setOpts({ listId: e.target.value })} className="max-w-[110px] rounded-md border border-line bg-white px-1.5 py-1 text-[11px] text-stone-600">
            {data.lists.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
        ) : undefined
      }
    >
      {remaining.length === 0 ? (
        <Empty>Tout est dans le panier.</Empty>
      ) : (
        <ul className={cx("grid gap-x-4", size === "m" && "sm:grid-cols-2", pending && "opacity-70")}>
          {remaining.slice(0, size === "s" ? 6 : 12).map((i) => (
            <li key={i.id}>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1.5 py-1 text-[12px] hover:bg-stone-50">
                <input
                  type="checkbox"
                  onChange={() => {
                    setChecked((s) => new Set(s).add(i.id));
                    start(() => toggleListItem(list.id, i.id, true));
                  }}
                  className="h-3.5 w-3.5 rounded border-stone-300 accent-brand-600"
                />
                <span className="min-w-0 flex-1 truncate text-stone-700">{i.label}</span>
                {i.quantity && <span className="shrink-0 text-[10px] text-stone-400">{i.quantity}</span>}
              </label>
            </li>
          ))}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Recettes ---------- */

export function RecipesIdeas({ data, size }: WidgetProps) {
  const count = size === "m" ? 2 : size === "l" ? 3 : 5;
  const seed = Math.floor(toMs(data.today) / 86_400_000);
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
