"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { cx } from "@/lib/utils";
import { toggleTaskStatus, quickAddTask } from "@/app/app/actions";
import { createTask } from "@/app/app/tasks/actions";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { PRIORITY_RANK, fmtLong, fmtShort, isDone } from "@/components/app/widgets/helpers";
import { CalendarGrid, CalendarNav, CheckRow, calShift, type CalItem, type CalView } from "@/components/app/widgets/calendar-grid";
import { useAgendaToggles } from "@/components/app/widgets/agenda-state";
import type { WidgetProps } from "@/components/app/widgets/types";
import type { Task } from "@/lib/types";

type Project = { id: string; name: string; color: string };

export function TaskRow({ task, today, project, onTouch }: { task: Task; today: string; project?: Project; onTouch?: (id: string) => void }) {
  const [done, setDone] = useState(isDone(task));
  const [, start] = useTransition();
  useEffect(() => setDone(isDone(task)), [task]);
  const late = !done && !!task.due_date && task.due_date < today;
  const sub = done
    ? "Terminée"
    : late
      ? `En retard · ${fmtShort(task.due_date!)}`
      : task.due_date === today
        ? "Aujourd'hui"
        : task.due_date
          ? `Échéance ${fmtShort(task.due_date)}`
          : task.priority === "high"
            ? "Priorité haute"
            : "";
  return (
    <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-stone-50">
      <input
        type="checkbox"
        checked={done}
        onChange={(e) => {
          const next = e.target.checked;
          setDone(next);
          onTouch?.(task.id);
          start(() => toggleTaskStatus(task.id, next));
        }}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-stone-300 accent-brand-600"
      />
      <span className="min-w-0 flex-1">
        <span className={cx("block truncate text-[13px] font-medium", done ? "text-stone-400 line-through" : "text-stone-800")}>{task.title}</span>
        {(project || sub) && (
          <span className={cx("flex items-center gap-1.5 truncate text-[11px]", late ? "text-rose-500" : "text-stone-400")}>
            {project && (
              <>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="truncate">{project.name}</span>
                {sub && <span>·</span>}
              </>
            )}
            {sub && <span className="truncate">{sub}</span>}
          </span>
        )}
      </span>
    </label>
  );
}

/* ---------- Liste de tâches : à faire / faites / toutes ---------- */

type Tab = "todo" | "done" | "all";

export function TasksList({ data, size }: WidgetProps) {
  const [tab, setTab] = useState<Tab>("todo");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const projectOf = useMemo(() => new Map(data.projects.map((p) => [p.id, p])), [data.projects]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setTouched(new Set());
  };

  const todo = data.tasks.filter((t) => !isDone(t));
  const finished = data.tasks.filter(isDone);
  const rows = useMemo(() => {
    const late = (t: Task) => (t.due_date && t.due_date < data.today ? 0 : 1);
    const byTodo = (a: Task, b: Task) =>
      late(a) - late(b) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999");
    const byDone = (a: Task, b: Task) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "");
    const visible = (t: Task) => touched.has(t.id) || (tab === "all" ? true : tab === "done" ? isDone(t) : !isDone(t));
    const list = data.tasks.filter(visible);
    return [...list.filter((t) => !isDone(t)).sort(byTodo), ...list.filter(isDone).sort(byDone)];
  }, [data.tasks, data.today, tab, touched]);

  const limit = size === "s" ? 5 : size === "m" ? 7 : 12;
  return (
    <WidgetShell
      icon="tasks"
      title="Tâches"
      subtitle={`${todo.length} à faire · ${finished.length} faites`}
      href="/app/tasks/list"
      right={
        <Segmented<Tab>
          value={tab}
          onChange={switchTab}
          options={[{ v: "todo", l: "À faire" }, { v: "done", l: "Faites" }, { v: "all", l: "Toutes" }]}
        />
      }
    >
      {rows.length === 0 ? (
        <Empty>{tab === "done" ? "Aucune tâche terminée pour l'instant." : "Rien en attente. Profites-en."}</Empty>
      ) : (
        <div className={cx("grid gap-x-4", size === "l" && "sm:grid-cols-2")}>
          {rows.slice(0, limit).map((t) => (
            <TaskRow key={t.id} task={t} today={data.today} project={t.project_id ? projectOf.get(t.project_id) : undefined} onTouch={(id) => setTouched((s) => new Set(s).add(id))} />
          ))}
        </div>
      )}
      {rows.length > limit && <p className="mt-1 px-1.5 text-[11px] text-stone-400">+ {rows.length - limit} autre(s)</p>}
      <form action={(fd) => start(async () => { await quickAddTask(fd); setDraft(""); })} className={cx("mt-2 flex gap-1.5", pending && "opacity-60")}>
        <input name="title" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ajouter une tâche pour aujourd'hui…" className="input py-1.5 text-xs" />
        <button disabled={!draft.trim()} className="btn-primary shrink-0 px-2.5 py-1.5"><Icon name="plus" /></button>
      </form>
    </WidgetShell>
  );
}

/* ---------- Agenda : tâches + routines, façon Google Agenda ---------- */

export function TasksCalendar({ data, size, opts, setOpts }: WidgetProps) {
  const [selected, setSelected] = useState(data.today);
  const [anchor, setAnchor] = useState(data.today);
  const [view, setView] = useState<CalView>((opts.view as CalView) ?? "month");
  const [projectFilter, setProjectFilter] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const showTasks = opts.tasks !== false;
  const showRoutines = opts.routines !== false;
  const toggles = useAgendaToggles(data);
  const projectOf = useMemo(() => new Map(data.projects.map((p) => [p.id, p])), [data.projects]);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of data.tasks) {
      if (!t.due_date || (projectFilter && t.project_id !== projectFilter)) continue;
      map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    }
    for (const list of map.values()) list.sort((a, b) => (a.due_time ?? "99:99").localeCompare(b.due_time ?? "99:99"));
    return map;
  }, [data.tasks, projectFilter]);

  const itemsFor = (d: string): CalItem[] => {
    const items: CalItem[] = [];
    if (showTasks) {
      for (const t of byDate.get(d) ?? [])
        items.push({
          key: t.id,
          label: t.title,
          tone: "task",
          done: toggles.taskDone(t),
          color: (t.project_id && projectOf.get(t.project_id)?.color) || undefined,
          time: t.due_time?.slice(0, 5),
          onToggle: () => toggles.toggleTask(t),
        });
    }
    if (showRoutines) {
      for (const r of toggles.routinesOn(d))
        items.push({ key: `r${r.id}`, label: r.title, tone: "routine", done: toggles.routineDone(r.id, d), onToggle: d <= data.today ? () => toggles.toggleRoutine(r.id, d) : undefined });
    }
    return items;
  };

  const changeView = (v: CalView) => {
    setView(v);
    setOpts({ view: v });
  };
  const chip = (on: boolean) => cx("rounded-full border px-2.5 py-1 text-[11px] font-medium transition", on ? "border-brand-300 bg-brand-500/10 text-brand-700" : "border-line bg-surface text-stone-400 hover:text-stone-700");
  const wide = size !== "m";
  const dayTasks = showTasks ? byDate.get(selected) ?? [] : [];
  const dayRoutines = showRoutines ? toggles.routinesOn(selected) : [];
  const overdue = showTasks && selected === data.today ? data.tasks.filter((t) => !toggles.taskDone(t) && t.due_date && t.due_date < data.today && (!projectFilter || t.project_id === projectFilter)) : [];
  const empty = dayTasks.length + dayRoutines.length + overdue.length === 0;

  return (
    <WidgetShell
      icon="calendar"
      title="Agenda"
      subtitle={wide ? "Tes tâches et tes routines au même endroit : coche directement dans le calendrier" : undefined}
      right={
        data.projects.length > 0 ? (
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="max-w-[130px] rounded-md border border-line bg-surface px-1.5 py-1 text-[11px] text-stone-600">
            <option value="">Tous les projets</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : undefined
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => setOpts({ tasks: !showTasks })} className={chip(showTasks)}>Tâches</button>
        <button type="button" onClick={() => setOpts({ routines: !showRoutines })} className={chip(showRoutines)}>Routines</button>
      </div>
      <div className={cx("grid gap-4", wide && "lg:grid-cols-[minmax(0,1fr)_290px]")}>
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

        <div className={cx("min-w-0 rounded-xl border border-line bg-stone-50/60 p-3", (pending || toggles.pending) && "opacity-70")}>
          <p className="text-[12px] font-semibold capitalize text-stone-800">{fmtLong(selected)}</p>
          {overdue.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">En retard</p>
              {overdue.map((t) => <CheckRow key={t.id} checked={toggles.taskDone(t)} onChange={() => toggles.toggleTask(t)} label={t.title} sub={`En retard · ${fmtShort(t.due_date!)}`} dot={(t.project_id && projectOf.get(t.project_id)?.color) || undefined} />)}
            </div>
          )}
          {dayTasks.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Tâches</p>
              {dayTasks.map((t) => (
                <CheckRow
                  key={t.id}
                  checked={toggles.taskDone(t)}
                  onChange={() => toggles.toggleTask(t)}
                  label={t.title}
                  sub={[t.due_time?.slice(0, 5), t.project_id ? projectOf.get(t.project_id)?.name : null].filter(Boolean).join(" · ") || undefined}
                  dot={(t.project_id && projectOf.get(t.project_id)?.color) || undefined}
                />
              ))}
            </div>
          )}
          {dayRoutines.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">Routines</p>
              {dayRoutines.map((r) => (
                <CheckRow
                  key={r.id}
                  checked={toggles.routineDone(r.id, selected)}
                  onChange={() => toggles.toggleRoutine(r.id, selected)}
                  label={r.title}
                  sub={selected > data.today ? "Prévue" : r.category ?? undefined}
                  disabled={selected > data.today}
                />
              ))}
            </div>
          )}
          {empty && <p className="mt-2 text-[11px] text-stone-400">Journée libre.</p>}

          {!adding ? (
            <button type="button" onClick={() => setAdding(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-[12px] font-medium text-stone-500 transition hover:border-brand-300 hover:text-brand-700">
              <Icon name="plus" className="h-3.5 w-3.5" />Ajouter une tâche ce jour-là
            </button>
          ) : (
            <form key={formKey} action={(fd) => start(async () => { await createTask(fd); setFormKey((k) => k + 1); setAdding(false); })} className="mt-3 space-y-1.5 border-t border-line pt-3">
              <input type="hidden" name="due_date" value={selected} />
              <input name="title" placeholder="Nouvelle tâche ce jour-là…" className="input py-1.5 text-xs" required autoFocus />
              <div className="grid grid-cols-2 gap-1.5">
                <input name="due_time" type="time" className="input min-w-0 py-1 text-xs" aria-label="Heure" />
                <select key={projectFilter} name="project_id" defaultValue={projectFilter} className="input min-w-0 py-1 text-xs" aria-label="Projet">
                  <option value="">Sans projet</option>
                  {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-primary flex-1 py-1.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" />Ajouter</button>
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary px-3 py-1.5 text-xs">Annuler</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </WidgetShell>
  );
}
