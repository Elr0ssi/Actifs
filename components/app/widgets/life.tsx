"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { addDays, expand, monthBounds, type Occurrence } from "@/lib/finance-engine";
import { cx, formatEUR, MONTHS_FR } from "@/lib/utils";
import { toggleTaskStatus, toggleRoutineLog } from "@/app/(main)/app/actions";
import { toggleListItem } from "@/app/(main)/app/lists/actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { CountUp } from "@/components/app/count-up";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { DOW, eur0, fmtLong, fmtShort, routineStreak, scheduledOn, weekday } from "@/components/app/widgets/helpers";
import { useAgendaToggles } from "@/components/app/widgets/agenda-state";
import { CheckRow, CalendarGrid, CalendarNav, calRange, calShift, type CalItem, type CalView } from "@/components/app/widgets/calendar-grid";
import { TaskRow } from "@/components/app/widgets/tasks";
import type { WidgetProps } from "@/components/app/widgets/types";
import type { Task } from "@/lib/types";

function useLogIndex(data: WidgetProps["data"]) {
  return useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);
}

/* ---------- Tâches ---------- */

export function TasksStat({ data }: WidgetProps) {
  const tr = useT();
  const open = data.tasks.filter((t) => t.status !== "done");
  const late = open.filter((t) => t.due_date && t.due_date < data.today).length;
  const todayCount = open.filter((t) => t.due_date === data.today).length;
  return (
    <WidgetShell icon="tasks" title={tr("Tâches en cours")} href="/app/tasks/list" hrefLabel={tr("Gérer")}>
      <p className="tabular text-3xl font-bold text-stone-900"><CountUp value={open.length} kind="int" /></p>
      <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-brand-50 px-2 py-0.5 font-medium text-brand-700">{tr("{n} aujourd'hui", { n: todayCount })}</span>
        <span className={cx("rounded-full px-2 py-0.5 font-medium", late ? "bg-rose-50 text-rose-600" : "bg-stone-100 text-stone-500")}>{tr("{n} en retard", { n: late })}</span>
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
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgb(var(--stone-200))" strokeWidth="4" />
      <circle cx="18" cy="18" r={r} fill="none" stroke="rgb(var(--brand-600))" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${pct * c} ${c}`} className="transition-[stroke-dasharray] duration-700" />
    </svg>
  );
}

export function RoutinesToday({ data }: WidgetProps) {
  const tr = useT();
  const done = useLogIndex(data);
  const today = data.routines.filter((r) => scheduledOn(r, data.today));
  const count = today.filter((r) => done.has(`${r.id}_${data.today}`)).length;
  const streak = routineStreak(data.routines, data.logs, data.today);
  return (
    <WidgetShell
      icon="repeat"
      title={tr("Routines du jour")}
      href="/app/tasks/routines"
      hrefLabel={tr("Gérer")}
      right={
        streak > 1 ? (
          <span title={tr("{n} jours d'affilée avec toutes tes routines faites", { n: streak })} className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
            <Icon name="bolt" className="h-3 w-3" />
            {streak} j
          </span>
        ) : undefined
      }
    >
      {today.length === 0 ? (
        <Empty>{tr("Aucune routine prévue aujourd'hui.")}</Empty>
      ) : (
        <>
          <div className="mb-1 flex items-center gap-3">
            <Ring value={count} total={today.length} />
            <p className="text-[12px] text-stone-500"><b className="tabular text-base text-stone-900">{count}/{today.length}</b> {tr("faites")}</p>
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
  const tr = useT();
  const fin = (opts.fin as FinFilter) ?? "all";
  const showTasks = opts.tasks !== false;
  const showRoutines = opts.routines !== false;
  const [view, setView] = useState<CalView>((opts.view as CalView) ?? "month");
  const ag = useAgendaToggles(data);
  const [selected, setSelected] = useState(data.today);
  const [anchor, setAnchor] = useState(data.today);
  const projectOf = useMemo(() => new Map(data.projects.map((p) => [p.id, p])), [data.projects]);
  const { from, to } = calRange(view, anchor);
  const { tasksBy, finBy } = useDayIndex(data, from, to, fin);
  const wide = size !== "m";
  const chip = (on: boolean) => cx("rounded-full border px-2.5 py-1 text-[11px] font-medium transition", on ? "border-brand-300 bg-brand-50 text-brand-700" : "border-line bg-surface text-stone-400 hover:text-stone-700");
  const changeView = (v: CalView) => {
    setView(v);
    setOpts({ view: v });
  };

  const itemsFor = (d: string): CalItem[] => {
    const items: CalItem[] = [];
    if (showTasks) {
      for (const t of tasksBy.get(d) ?? []) items.push({ key: `t${t.id}`, label: t.title, tone: "task", done: ag.taskDone(t), color: (t.project_id && projectOf.get(t.project_id)?.color) || undefined, time: t.due_time?.slice(0, 5), onToggle: () => ag.toggleTask(t) });
    }
    if (showRoutines) {
      for (const r of ag.routinesOn(d)) items.push({ key: `r${r.id}`, label: r.title, tone: "routine", done: ag.routineDone(r.id, d), onToggle: d <= data.today ? () => ag.toggleRoutine(r.id, d) : undefined });
    }
    const occ = finBy.get(d) ?? [];
    if (view === "week") {
      for (const [i, o] of occ.entries()) items.push({ key: `f${o.op.id}${i}`, label: o.op.name, tone: o.signed > 0 ? "in" : "out", amount: `${o.signed > 0 ? "+" : "-"}${eur0(Math.abs(o.signed))}` });
    } else if (occ.length > 0) {
      const net = occ.reduce((s, o) => s + o.signed, 0);
      items.push({ key: `f${d}`, label: occ.length > 1 ? tr("{n} flux", { n: occ.length }) : occ[0].op.name, tone: net >= 0 ? "in" : "out", amount: `${net >= 0 ? "+" : "-"}${eur0(Math.abs(net))}` });
    }
    return items;
  };

  const selTasks = showTasks ? tasksBy.get(selected) ?? [] : [];
  const selRoutines = showRoutines ? ag.routinesOn(selected) : [];
  const selFin = finBy.get(selected) ?? [];

  return (
    <WidgetShell icon="calendar" title={tr("Agenda")} subtitle={wide ? tr("Tâches, routines et argent au même endroit") : undefined} href="/app/tasks/calendar" hrefLabel={tr("Ouvrir")}>
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button onClick={() => setOpts({ tasks: !showTasks })} className={chip(showTasks)}>{tr("Tâches")}</button>
        <button onClick={() => setOpts({ routines: !showRoutines })} className={chip(showRoutines)}>{tr("Routines")}</button>
        <Segmented<FinFilter> value={fin} onChange={(v) => setOpts({ fin: v })} options={[{ v: "all", l: tr("Tous flux") }, { v: "in", l: tr("Entrées") }, { v: "out", l: tr("Sorties") }, { v: "off", l: tr("Sans argent") }]} />
      </div>
      <div className={cx("grid gap-4", wide && "lg:grid-cols-[minmax(0,1fr)_260px]")}>
        <div className="flex min-w-0 flex-col">
          <CalendarNav view={view} anchor={anchor} onView={changeView} onAnchor={setAnchor} onToday={() => { setAnchor(data.today); setSelected(data.today); }} />
          <CalendarGrid
            view={view}
            anchor={anchor}
            today={data.today}
            selected={selected}
            wide={wide}
            itemsFor={itemsFor}
            onSelect={(d) => { setSelected(d); if (view === "month" && d.slice(0, 7) !== anchor.slice(0, 7)) setAnchor(d); }}
            onShift={(delta) => setAnchor((a) => calShift(view, a, delta))}
          />
        </div>
        <div className="min-w-0 rounded-xl border border-line bg-stone-50/50 p-3">
          <p className="text-[12px] font-semibold capitalize text-stone-800">{fmtLong(selected)}</p>
          {selTasks.length + selRoutines.length + selFin.length === 0 && <p className="mt-2 text-[11px] text-stone-400">{tr("Journée libre.")}</p>}
          {selTasks.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Tâches")}</p>
              {selTasks.map((t) => <CheckRow key={t.id} checked={ag.taskDone(t)} onChange={() => ag.toggleTask(t)} label={t.title} sub={t.due_time?.slice(0, 5)} dot={(t.project_id && projectOf.get(t.project_id)?.color) || undefined} />)}
            </div>
          )}
          {selRoutines.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Routines")}</p>
              {selRoutines.map((r) => (
                <CheckRow key={r.id} checked={ag.routineDone(r.id, selected)} onChange={() => ag.toggleRoutine(r.id, selected)} label={r.title} disabled={selected > data.today} sub={selected > data.today ? tr("À venir") : undefined} />
              ))}
            </div>
          )}
          {selFin.length > 0 && (
            <div className="mt-2">
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Argent")}</p>
              <ul className="space-y-1">
                {selFin.map((o, i) => (
                  <li key={i} className="flex justify-between gap-2 px-2 text-[12px]">
                    <span className="truncate text-stone-700">{tr(o.op.name)}</span>
                    <span className={cx("tabular shrink-0 font-semibold", o.signed > 0 ? "text-emerald-600" : "text-rose-600")}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.amount)}</span>
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
  const tr = useT();
  const days = Array.from({ length: 7 }, (_, i) => addDays(data.today, i));
  const [picked, setPicked] = useState<string | null>(null);
  const { tasksBy, finBy } = useDayIndex(data, days[0], days[6], "all");
  const events = days
    .filter((d) => !picked || d === picked)
    .flatMap((d) => [
      ...(tasksBy.get(d) ?? []).filter((t) => t.status !== "done").map((t) => ({ d, key: `t${t.id}`, dot: "bg-sky-500", label: t.title, meta: t.due_time?.slice(0, 5) ?? tr("Tâche"), amount: null as number | null })),
      ...(finBy.get(d) ?? []).map((o, i) => ({ d, key: `f${o.op.id}${i}`, dot: o.signed > 0 ? "bg-emerald-500" : "bg-rose-400", label: o.op.name, meta: o.signed > 0 ? tr("Entrée") : tr("Sortie"), amount: o.signed })),
    ]);
  const routinesOn = (d: string) => data.routines.filter((r) => scheduledOn(r, d)).length;
  const focus = picked ?? data.today;
  return (
    <WidgetShell icon="list" title={tr("Cette semaine")} subtitle={picked ? tr("{date} · touche à nouveau pour tout voir", { date: fmtLong(picked) }) : tr("Touche un jour pour le détail")} href="/app/tasks/calendar">
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
              <span className={cx("mt-0.5 h-1 w-1 rounded-full", n ? (d === data.today ? "bg-surface" : "bg-brand-500") : "bg-transparent")} />
            </button>
          );
        })}
      </div>
      {events.length === 0 ? (
        <p className="mt-3 text-center text-[11px] text-stone-400">{picked ? tr("Rien de prévu ce jour-là.") : tr("Semaine calme : aucune tâche ni opération prévue.")}</p>
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
      {routinesOn(focus) > 0 && <p className="mt-2 text-[10px] text-stone-400">{tr("+ {n} routine(s) {when}", { n: routinesOn(focus), when: picked ? tr("ce jour-là") : tr("aujourd'hui") })}</p>}
    </WidgetShell>
  );
}

/* ---------- Courses ---------- */

export function ListsShopping({ data, size, opts, setOpts }: WidgetProps) {
  const tr = useT();
  const open = data.lists.filter((l) => !l.archived);
  const list = open.find((l) => l.id === opts.listId) ?? open.find((l) => l.type === "shopping") ?? open[0];
  const [pending, start] = useTransition();
  const [override, setOverride] = useState<Record<string, boolean>>({});
  if (!list) {
    return (
      <WidgetShell icon="cart" title={tr("Liste de courses")} href="/app/lists/mes-listes">
        <Empty>{tr("Aucune liste en cours.")}</Empty>
      </WidgetShell>
    );
  }
  const isChecked = (i: { id: string; checked: boolean }) => override[i.id] ?? i.checked;
  const items = [...list.items.filter((i) => !isChecked(i)), ...list.items.filter(isChecked)];
  const remaining = list.items.filter((i) => !isChecked(i)).length;
  return (
    <WidgetShell
      icon="cart"
      title={tr("Liste de courses")}
      subtitle={size === "s" ? tr("{name} · {n} à acheter", { name: list.name, n: remaining }) : tr("{name} · {n} article(s) à acheter", { name: list.name, n: remaining })}
      href={`/app/lists/${list.id}`}
      hrefLabel={tr("Ouvrir")}
      right={
        open.length > 1 && size !== "s" ? (
          <select value={list.id} onChange={(e) => setOpts({ listId: e.target.value })} className="max-w-[110px] rounded-md border border-line bg-surface px-1.5 py-1 text-[11px] text-stone-600">
            {open.map((l) => <option key={l.id} value={l.id}>{tr(l.name)}</option>)}
          </select>
        ) : undefined
      }
    >
      {items.length === 0 ? (
        <Empty>{tr("Cette liste est vide.")}</Empty>
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
  const tr = useT();
  const count = size === "m" ? 2 : size === "l" ? 3 : 5;
  const seed = Math.floor(new Date(`${data.today}T00:00:00Z`).getTime() / 86_400_000);
  const picks = Array.from({ length: count }, (_, i) => RECIPES[(seed * 7 + i * 17) % RECIPES.length]);
  return (
    <WidgetShell icon="chef" title={tr("Idées de recettes")} subtitle={tr("Sélection du jour")} href="/app/lists/recipes" hrefLabel={tr("Toutes")}>
      <div className={cx("grid gap-3", size === "m" ? "grid-cols-2" : size === "l" ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-3 xl:grid-cols-5")}>
        {picks.map((r) => (
          <Link key={r.slug} href={`/recettes/${r.slug}`} className="group min-w-0">
            <div className="relative">
              <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-stone-100 text-[10px] text-stone-300">
                {r.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image} alt={tr(r.name)} className="h-full w-full object-cover" />
                ) : (
                  tr("Photo à venir")
                )}
              </div>
              <span className="absolute -bottom-2.5 left-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-surface text-sm shadow">{r.icon}</span>
            </div>
            <p className="mt-3.5 truncate text-[12px] font-semibold text-stone-800 group-hover:text-brand-700">{tr(r.name)}</p>
            <p className="text-[10px] text-stone-400">{tr(r.time)} · {tr(r.category)}</p>
          </Link>
        ))}
      </div>
    </WidgetShell>
  );
}

/* ---------- Notes ---------- */

export function NotesRecent({ data, size }: WidgetProps) {
  const tr = useT();
  return (
    <WidgetShell icon="notes" title={tr("Pages récentes")} href="/app/notes/pages" hrefLabel={tr("Ouvrir")}>
      {data.notes.length === 0 ? (
        <Empty>{tr("Aucune page pour l'instant. Crée ta première note !")}</Empty>
      ) : (
        <ul className={cx("grid gap-x-4 divide-y divide-line/70", size !== "s" && "sm:grid-cols-2 sm:divide-y-0")}>
          {data.notes.slice(0, size === "s" ? 4 : 8).map((n) => (
            <li key={n.id}>
              <Link href={`/app/notes/pages/${n.id}`} className="flex items-start gap-2 rounded-lg py-1.5 hover:bg-stone-50">
                <span className="mt-px">{n.icon || "📄"}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium text-stone-800">{n.title || tr("Sans titre")}</span>
                  {size !== "s" && n.search && <span className="block truncate text-[11px] text-stone-400">{n.search}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/app/notes/pages" className="mt-2 inline-block text-[12px] font-medium text-brand-600 hover:underline">{tr("+ Nouvelle page")}</Link>
    </WidgetShell>
  );
}

export function NotesVocab({ data, size }: WidgetProps) {
  const tr = useT();
  return (
    <WidgetShell icon="book" title={tr("Vocabulaire récent")} href="/app/notes/vocabulaire">
      {data.words.length === 0 ? (
        <Empty>{tr("Aucun mot enregistré pour l'instant.")}</Empty>
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
