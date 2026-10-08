"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useMemo, useState, useTransition } from "react";
import { cx } from "@/lib/utils";
import { toggleTaskStatus, quickAddTask } from "@/app/(main)/app/actions";
import { createTask, deleteTask, saveTask } from "@/app/(main)/app/tasks/actions";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { PRIORITY_RANK, fmtLong, fmtShort, isDone } from "@/components/app/widgets/helpers";
import { CalendarGrid, CalendarNav, CheckRow, calRange, calShift, type CalItem, type CalView } from "@/components/app/widgets/calendar-grid";
import { TimeGrid, fmtMin, type TimeEvent, type Zoom } from "@/components/app/widgets/time-grid";
import { TaskEditor, type EditorValues } from "@/components/app/widgets/task-editor";
import { addDays } from "@/lib/finance-engine";
import { useAgendaToggles } from "@/components/app/widgets/agenda-state";
import type { WidgetProps } from "@/components/app/widgets/types";
import type { Task } from "@/lib/types";

type Project = { id: string; name: string; color: string };

export function TaskRow({ task, today, project, onTouch, onOpen }: { task: Task; today: string; project?: Project; onTouch?: (id: string) => void; onOpen?: (t: Task) => void }) {
  const tr = useT();
  const [done, setDone] = useState(isDone(task));
  const [, start] = useTransition();
  useEffect(() => setDone(isDone(task)), [task]);
  const late = !done && !!task.due_date && task.due_date < today;
  const sub = done
    ? tr("Terminée")
    : late
      ? tr("En retard · {date}", { date: fmtShort(task.due_date!) })
      : task.due_date === today
        ? tr("Aujourd'hui")
        : task.due_date
          ? tr("Échéance {date}", { date: fmtShort(task.due_date) })
          : task.priority === "high"
            ? tr("Priorité haute")
            : "";
  const toggle = () => {
    const next = !done;
    setDone(next);
    onTouch?.(task.id);
    start(() => toggleTaskStatus(task.id, next));
  };
  return (
    <div className="group flex items-start gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-stone-50">
      <button
        type="button"
        onClick={toggle}
        aria-label={done ? tr("Marquer comme à faire") : tr("Marquer comme faite")}
        aria-pressed={done}
        className={cx(
          "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold leading-none transition",
          done ? "border-transparent bg-emerald-500 text-white" : "border-stone-300 bg-surface text-transparent hover:border-emerald-500 hover:text-emerald-500"
        )}
      >
        ✓
      </button>
      <button type="button" onClick={() => onOpen?.(task)} className="min-w-0 flex-1 text-left" title={tr("Ouvrir la tâche")}>
        <span className={cx("flex items-center gap-1.5 truncate text-[13px] font-medium", done ? "text-stone-400 line-through" : "text-stone-800")}>
          <span className="truncate">{task.title}</span>
          {task.description && <span title={tr("Contient des notes")} className="shrink-0 text-[10px] text-stone-300">📝</span>}
        </span>
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
      </button>
    </div>
  );
}

/* ---------- Liste de tâches : à faire / faites / toutes ---------- */

type Tab = "todo" | "done" | "all";

export function TasksList({ data, size }: WidgetProps) {
  const tr = useT();
  const [tab, setTab] = useState<Tab>("todo");
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [draft, setDraft] = useState("");
  const [pending, start] = useTransition();
  const [open, setOpen] = useState<Task | null>(null);
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
      title={tr("Tâches")}
      subtitle={tr("{a} à faire · {b} faites", { a: todo.length, b: finished.length })}
      href="/app/tasks/list"
      right={
        <Segmented<Tab>
          value={tab}
          onChange={switchTab}
          options={[{ v: "todo", l: tr("À faire") }, { v: "done", l: tr("Faites") }, { v: "all", l: tr("Toutes") }]}
        />
      }
    >
      {rows.length === 0 ? (
        <Empty>{tab === "done" ? tr("Aucune tâche terminée pour l'instant.") : tr("Rien en attente. Profites-en.")}</Empty>
      ) : (
        <div className={cx("grid gap-x-4", size === "l" && "sm:grid-cols-2")}>
          {rows.slice(0, limit).map((t) => (
            <TaskRow key={t.id} task={t} today={data.today} project={t.project_id ? projectOf.get(t.project_id) : undefined} onTouch={(id) => setTouched((s) => new Set(s).add(id))} onOpen={setOpen} />
          ))}
        </div>
      )}
      {rows.length > limit && <p className="mt-1 px-1.5 text-[11px] text-stone-400">{tr("+ {n} autre(s)", { n: rows.length - limit })}</p>}
      <form action={(fd) => start(async () => { await quickAddTask(fd); setDraft(""); })} className={cx("mt-2 flex gap-1.5", pending && "opacity-60")}>
        <input name="title" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={tr("Ajouter une tâche pour aujourd'hui…")} className="input py-1.5 text-xs" />
        <button disabled={!draft.trim()} className="btn-primary shrink-0 px-2.5 py-1.5"><Icon name="plus" /></button>
      </form>
      {open && (
        <TaskEditor
          mode="edit"
          initial={{ title: open.title, date: open.due_date ?? "", start: open.due_time?.slice(0, 5) ?? "", end: open.due_end?.slice(0, 5) ?? "", projectId: open.project_id ?? "", notes: open.description ?? "", priority: open.priority }}
          projects={data.projects}
          saving={pending}
          onClose={() => setOpen(null)}
          onDelete={() => { const id = open.id; setOpen(null); if (confirm(tr("Supprimer cette tâche ?"))) start(() => deleteTask(id)); }}
          onSave={(v) => {
            const id = open.id;
            setOpen(null);
            start(() => saveTask(id, { title: v.title, project_id: v.projectId || null, due_date: v.date || null, due_time: v.start || null, due_end: v.end || null, description: v.notes, priority: v.priority }));
          }}
        />
      )}
    </WidgetShell>
  );
}

/* ---------- Agenda : tâches + routines, façon Google Agenda ---------- */

export function TasksCalendar({ data, size, opts, setOpts }: WidgetProps) {
  const tr = useT();
  const [selected, setSelected] = useState(data.today);
  const [anchor, setAnchor] = useState(data.today);
  const [view, setView] = useState<CalView>(opts.view === "day" || opts.view === "week" || opts.view === "month" ? opts.view : "week");
  const [projectFilter, setProjectFilter] = useState("");
  const [formKey, setFormKey] = useState(0);
  const [adding, setAdding] = useState(false);
  const [pending, start] = useTransition();
  const zoom: Zoom = opts.zoom === "normal" || opts.zoom === "large" ? opts.zoom : "compact";
  type Sched = { date: string | null; time: string | null; end: string | null };
  const [sched, setSched] = useState<Record<string, Sched>>({});
  const [editor, setEditor] = useState<{ id?: string; values: EditorValues } | null>(null);
  useEffect(() => setSched({}), [data.tasks]);
  const showTasks = opts.tasks !== false;
  const showRoutines = opts.routines !== false;
  const toggles = useAgendaToggles(data);
  const projectOf = useMemo(() => new Map(data.projects.map((p) => [p.id, p])), [data.projects]);

  const schedOf = (t: Task): Sched => sched[t.id] ?? { date: t.due_date, time: t.due_time ? t.due_time.slice(0, 5) : null, end: t.due_end ? t.due_end.slice(0, 5) : null };
  const toMin = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5));

  const byDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of data.tasks) {
      const date = sched[t.id] ? sched[t.id].date : t.due_date;
      if (!date || (projectFilter && t.project_id !== projectFilter)) continue;
      map.set(date, [...(map.get(date) ?? []), t]);
    }
    for (const list of map.values()) list.sort((a, b) => ((sched[a.id]?.time ?? a.due_time) ?? "99:99").localeCompare((sched[b.id]?.time ?? b.due_time) ?? "99:99"));
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.tasks, projectFilter, sched]);

  const persist = (id: string, next: Sched) => {
    setSched((s) => ({ ...s, [id]: next }));
    start(() => saveTask(id, { due_date: next.date, due_time: next.time, due_end: next.end }));
  };
  const eventFor = (t: Task): TimeEvent | null => {
    const sc = schedOf(t);
    if (!sc.date || !sc.time) return null;
    const startMin = toMin(sc.time);
    const endMin = sc.end && toMin(sc.end) > startMin ? toMin(sc.end) : Math.min(1440, startMin + 60);
    return { id: t.id, day: sc.date, startMin, endMin, title: t.title, color: (t.project_id && projectOf.get(t.project_id)?.color) || undefined, done: toggles.taskDone(t) };
  };
  const openCreate = (date: string, startMin?: number, endMin?: number) =>
    setEditor({ values: { title: "", date, start: startMin === undefined ? "" : fmtMin(startMin), end: endMin === undefined ? "" : fmtMin(endMin), projectId: projectFilter, notes: "", priority: "medium" } });
  const openEdit = (t: Task) => {
    const sc = schedOf(t);
    setEditor({ id: t.id, values: { title: t.title, date: sc.date ?? data.today, start: sc.time ?? "", end: sc.end ?? "", projectId: t.project_id ?? "", notes: t.description ?? "", priority: t.priority } });
  };

  const timeView = view === "day" || view === "week";
  const itemsFor = (d: string): CalItem[] => {
    const items: CalItem[] = [];
    if (showTasks) {
      for (const t of byDate.get(d) ?? []) {
        if (timeView && schedOf(t).time) continue; // affichées dans la grille horaire
        items.push({
          key: t.id,
          label: t.title,
          tone: "task",
          done: toggles.taskDone(t),
          color: (t.project_id && projectOf.get(t.project_id)?.color) || undefined,
          time: schedOf(t).time ?? undefined,
          onToggle: () => toggles.toggleTask(t),
          dragId: t.id,
        });
      }
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
      title={tr("Agenda")}
      subtitle={wide ? tr("Tes tâches et tes routines au même endroit : coche directement dans le calendrier") : undefined}
      right={
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={() => openCreate(timeView && view === "day" ? anchor : selected)} className="btn-primary px-2.5 py-1 text-[11px]"><Icon name="plus" className="h-3 w-3" />{tr("Tâche")}</button>
          {data.projects.length > 0 && (
          <select value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)} className="max-w-[130px] rounded-md border border-line bg-surface px-1.5 py-1 text-[11px] text-stone-600">
            <option value="">{tr("Tous les projets")}</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          )}
        </div>
      }
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <button type="button" onClick={() => setOpts({ tasks: !showTasks })} className={chip(showTasks)}>{tr("Tâches")}</button>
        <button type="button" onClick={() => setOpts({ routines: !showRoutines })} className={chip(showRoutines)}>{tr("Routines")}</button>
        {timeView && (
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-stone-400">
            {tr("Taille")}
            <Segmented<Zoom> value={zoom} onChange={(z) => setOpts({ zoom: z })} options={[{ v: "compact", l: tr("Compact") }, { v: "normal", l: tr("Normal") }, { v: "large", l: tr("Grand") }]} />
          </div>
        )}
      </div>
      <div className={cx("grid gap-4", wide && !timeView && "lg:grid-cols-[minmax(0,1fr)_290px]")}>
        <div className="flex min-w-0 flex-col">
          <CalendarNav view={view} anchor={anchor} views={["day", "week", "month"]} onView={changeView} onAnchor={setAnchor} onToday={() => { setAnchor(data.today); setSelected(data.today); }} />
          {timeView ? (
            <TimeGrid
              days={(() => { const { from, to } = calRange(view, anchor); const out: string[] = []; for (let d = from; d <= to; d = addDays(d, 1)) out.push(d); return out; })()}
              today={data.today}
              zoom={zoom}
              events={showTasks ? (data.tasks.map((t) => (projectFilter && t.project_id !== projectFilter ? null : eventFor(t))).filter(Boolean) as TimeEvent[]) : []}
              allDay={itemsFor}
              onPickDay={(d) => { setSelected(d); setAnchor(d); changeView("day"); }}
              onCreate={(d, s0, e0) => openCreate(d, s0, e0)}
              onMove={(id, d, s0, e0) => persist(id, { date: d, time: fmtMin(s0), end: fmtMin(e0) })}
              onResize={(id, e0) => { const t = data.tasks.find((x) => x.id === id); if (t) persist(id, { ...schedOf(t), end: fmtMin(e0) }); }}
              onOpen={(id) => { const t = data.tasks.find((x) => x.id === id); if (t) openEdit(t); }}
              onToggle={(id) => { const t = data.tasks.find((x) => x.id === id); if (t) toggles.toggleTask(t); }}
            />
          ) : (
            <CalendarGrid
              view={view}
              anchor={anchor}
              today={data.today}
              selected={selected}
              wide={wide}
              itemsFor={itemsFor}
              onSelect={(d) => { setSelected(d); if (d.slice(0, 7) !== anchor.slice(0, 7)) setAnchor(d); }}
              onShift={(delta) => setAnchor((a) => calShift(view, a, delta))}
              onDropItem={(d, id) => { const t = data.tasks.find((x) => x.id === id); if (t) persist(id, { ...schedOf(t), date: d }); }}
            />
          )}
        </div>

        {!timeView && <div className={cx("min-w-0 rounded-xl border border-line bg-stone-50/60 p-3", (pending || toggles.pending) && "opacity-70")}>
          <p className="text-[12px] font-semibold capitalize text-stone-800">{fmtLong(selected)}</p>
          {overdue.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500">{tr("En retard")}</p>
              {overdue.map((t) => <CheckRow key={t.id} onOpen={() => openEdit(t)} checked={toggles.taskDone(t)} onChange={() => toggles.toggleTask(t)} label={t.title} sub={tr("En retard · {date}", { date: fmtShort(t.due_date!) })} dot={(t.project_id && projectOf.get(t.project_id)?.color) || undefined} />)}
            </div>
          )}
          {dayTasks.length > 0 && (
            <div className="mt-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Tâches")}</p>
              {dayTasks.map((t) => (
                <CheckRow
                  key={t.id}
                  onOpen={() => openEdit(t)}
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
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Routines")}</p>
              {dayRoutines.map((r) => (
                <CheckRow
                  key={r.id}
                  checked={toggles.routineDone(r.id, selected)}
                  onChange={() => toggles.toggleRoutine(r.id, selected)}
                  label={r.title}
                  sub={selected > data.today ? tr("Prévue") : r.category ?? undefined}
                  disabled={selected > data.today}
                />
              ))}
            </div>
          )}
          {empty && <p className="mt-2 text-[11px] text-stone-400">{tr("Journée libre.")}</p>}

          {!adding ? (
            <button type="button" onClick={() => setAdding(true)} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-line py-2 text-[12px] font-medium text-stone-500 transition hover:border-brand-300 hover:text-brand-700">
              <Icon name="plus" className="h-3.5 w-3.5" />{tr("Ajouter une tâche ce jour-là")}
            </button>
          ) : (
            <form key={formKey} action={(fd) => start(async () => { await createTask(fd); setFormKey((k) => k + 1); setAdding(false); })} className="mt-3 space-y-1.5 border-t border-line pt-3">
              <input type="hidden" name="due_date" value={selected} />
              <input name="title" placeholder={tr("Nouvelle tâche ce jour-là…")} className="input py-1.5 text-xs" required autoFocus />
              <div className="grid grid-cols-2 gap-1.5">
                <input name="due_time" type="time" className="input min-w-0 py-1 text-xs" aria-label={tr("Heure")} />
                <select key={projectFilter} name="project_id" defaultValue={projectFilter} className="input min-w-0 py-1 text-xs" aria-label={tr("Projet")}>
                  <option value="">{tr("Sans projet")}</option>
                  {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex gap-1.5">
                <button className="btn-primary flex-1 py-1.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" />{tr("Ajouter")}</button>
                <button type="button" onClick={() => setAdding(false)} className="btn-secondary px-3 py-1.5 text-xs">{tr("Annuler")}</button>
              </div>
            </form>
          )}
        </div>}
      </div>
      {editor && (
        <TaskEditor
          mode={editor.id ? "edit" : "create"}
          initial={editor.values}
          projects={data.projects}
          saving={pending}
          onClose={() => setEditor(null)}
          onDelete={editor.id ? () => { const id = editor.id as string; setEditor(null); if (confirm(tr("Supprimer cette tâche ?"))) start(() => deleteTask(id)); } : undefined}
          onSave={(v) => {
            const values = v;
            setEditor(null);
            if (editor.id) {
              const id = editor.id;
              setSched((m) => ({ ...m, [id]: { date: values.date, time: values.start || null, end: values.start ? values.end || null : null } }));
              start(() => saveTask(id, { title: values.title, project_id: values.projectId || null, due_date: values.date, due_time: values.start || null, due_end: values.end || null, description: values.notes, priority: values.priority }));
            } else {
              const fd = new FormData();
              fd.set("title", values.title);
              fd.set("due_date", values.date);
              if (values.start) fd.set("due_time", values.start);
              if (values.start && values.end) fd.set("due_end", values.end);
              if (values.projectId) fd.set("project_id", values.projectId);
              if (values.notes) fd.set("description", values.notes);
              fd.set("priority", values.priority);
              start(() => createTask(fd));
            }
          }}
        />
      )}
    </WidgetShell>
  );
}
