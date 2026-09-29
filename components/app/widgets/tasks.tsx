"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { addDays, monthBounds } from "@/lib/finance-engine";
import { cx, MONTHS_FR } from "@/lib/utils";
import { toggleTaskStatus, quickAddTask } from "@/app/app/actions";
import { createTask } from "@/app/app/tasks/actions";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { DOW, PRIORITY_RANK, fmtLong, fmtShort, isDone, mondayOf } from "@/components/app/widgets/helpers";
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

/* ---------- Calendrier des tâches (uniquement tâches et projets) ---------- */

export function TasksCalendar({ data, size }: WidgetProps) {
  const [selected, setSelected] = useState(data.today);
  const [cursor, setCursor] = useState({ y: Number(data.today.slice(0, 4)), m: Number(data.today.slice(5, 7)) - 1 });
  const [projectFilter, setProjectFilter] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [pending, start] = useTransition();
  const projectOf = useMemo(() => new Map(data.projects.map((p) => [p.id, p])), [data.projects]);

  const { start: mStart, end: mEnd } = monthBounds(cursor.y, cursor.m);
  const gridStart = mondayOf(mStart);
  const gridEnd = addDays(mondayOf(mEnd), 6);
  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of data.tasks) {
      if (!t.due_date || (projectFilter && t.project_id !== projectFilter)) continue;
      map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    }
    return map;
  }, [data.tasks, projectFilter]);

  const nav = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const wide = size !== "m";
  const dayTasks = byDate.get(selected) ?? [];
  const overdue = selected === data.today ? data.tasks.filter((t) => !isDone(t) && t.due_date && t.due_date < data.today && (!projectFilter || t.project_id === projectFilter)) : [];

  return (
    <WidgetShell
      icon="calendar"
      title="Calendrier des tâches"
      subtitle={wide ? "Clique sur un jour pour voir et ajouter tes tâches" : undefined}
      right={
        data.projects.length > 0 ? (
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="max-w-[130px] rounded-md border border-line bg-white px-1.5 py-1 text-[11px] text-stone-600">
            <option value="">Tous les projets</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        ) : undefined
      }
    >
      <div className={cx("grid h-full gap-4", wide && "lg:grid-cols-[minmax(0,1fr)_280px]")}>
        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <button onClick={() => nav(-1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Mois précédent"><Icon name="chevronLeft" /></button>
              <p className="min-w-[120px] text-center text-[13px] font-semibold text-stone-800">{MONTHS_FR[cursor.m]} {cursor.y}</p>
              <button onClick={() => nav(1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Mois suivant"><Icon name="chevronRight" /></button>
            </div>
            <button
              onClick={() => { setSelected(data.today); setCursor({ y: Number(data.today.slice(0, 4)), m: Number(data.today.slice(5, 7)) - 1 }); }}
              className="btn-secondary px-2.5 py-1 text-[11px]"
            >
              Aujourd'hui
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400">
            {DOW.map((d) => <div key={d} className="pb-1.5">{wide ? d : d[0]}</div>)}
          </div>
          <div className="grid flex-1 auto-rows-fr grid-cols-7 overflow-hidden rounded-xl border border-line">
            {days.map((d) => {
              const tasks = byDate.get(d) ?? [];
              const outside = d < mStart || d > mEnd;
              const open = tasks.filter((t) => !isDone(t)).length;
              return (
                <button
                  key={d}
                  onClick={() => { setSelected(d); if (outside) setCursor({ y: Number(d.slice(0, 4)), m: Number(d.slice(5, 7)) - 1 }); }}
                  className={cx(
                    "flex min-w-0 flex-col items-stretch gap-0.5 border-b border-r border-line/70 p-1 text-left transition hover:bg-brand-50/50",
                    wide ? "min-h-[76px]" : "min-h-[44px] items-center",
                    outside && "bg-stone-50/70",
                    d === selected && "bg-brand-50 ring-1 ring-inset ring-brand-300"
                  )}
                >
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium", d === data.today ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-700")}>
                    {Number(d.slice(-2))}
                  </span>
                  {wide ? (
                    <>
                      {tasks.slice(0, 2).map((t) => (
                        <span
                          key={t.id}
                          className={cx("truncate rounded-[4px] border-l-2 bg-white/80 px-1 text-[10px] leading-[16px]", isDone(t) ? "text-stone-300 line-through" : "text-stone-700")}
                          style={{ borderLeftColor: (t.project_id && projectOf.get(t.project_id)?.color) || "#d6cfc6" }}
                        >
                          {t.title}
                        </span>
                      ))}
                      {tasks.length > 2 && <span className="text-[10px] text-stone-400">+{tasks.length - 2}</span>}
                    </>
                  ) : (
                    tasks.length > 0 && <span className={cx("h-1.5 w-1.5 rounded-full", open ? "bg-brand-500" : "bg-stone-300")} />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className={cx("min-w-0 rounded-xl border border-line bg-stone-50/50 p-3", pending && "opacity-60")}>
          <p className="text-[12px] font-semibold capitalize text-stone-800">{fmtLong(selected)}</p>
          {overdue.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">En retard</p>
              {overdue.map((t) => <TaskRow key={t.id} task={t} today={data.today} project={t.project_id ? projectOf.get(t.project_id) : undefined} />)}
            </div>
          )}
          <div className="mt-2">
            {dayTasks.length === 0 && overdue.length === 0 && <p className="text-[11px] text-stone-400">Aucune tâche ce jour-là.</p>}
            {dayTasks.map((t) => <TaskRow key={t.id} task={t} today={data.today} project={t.project_id ? projectOf.get(t.project_id) : undefined} />)}
          </div>
          <form key={formKey} action={(fd) => start(async () => { await createTask(fd); setFormKey((k) => k + 1); })} className="mt-3 space-y-1.5 border-t border-line pt-3">
            <input type="hidden" name="due_date" value={selected} />
            <input name="title" placeholder="Nouvelle tâche ce jour-là…" className="input py-1.5 text-xs" required />
            <div className="grid grid-cols-2 gap-1.5">
              <input name="due_time" type="time" className="input min-w-0 py-1 text-xs" aria-label="Heure" />
              <select key={projectFilter} name="project_id" defaultValue={projectFilter} className="input min-w-0 py-1 text-xs" aria-label="Projet">
                <option value="">Sans projet</option>
                {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <button className="btn-primary w-full py-1.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" />Ajouter</button>
          </form>
        </div>
      </div>
    </WidgetShell>
  );
}
