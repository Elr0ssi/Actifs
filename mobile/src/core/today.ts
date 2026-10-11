import { PRIORITY_RANK, routineStreak, scheduledOn } from "@/components/app/widgets/helpers";
import type { Routine, Task } from "@/lib/types";
import { hhmm } from "./dates";
import { sel, type AppData } from "./model";

export { PRIORITY_RANK, routineStreak, scheduledOn };

/** Routines actives prévues ce jour-là, avec leur état « fait » pour l'utilisateur courant. */
export function routinesFor(data: AppData, date: string) {
  const done = new Set(sel.logs(data).filter((l) => l.done && l.log_date === date && (!l.user_id || l.user_id === data.userId)).map((l) => l.routine_id));
  const list = sel.routines(data)
    .filter((r) => r.active && scheduledOn(r, date))
    .map((r) => ({ routine: r as Routine, done: done.has(r.id) }));
  return { list, total: list.length, done: list.filter((x) => x.done).length };
}

/** Tâches datées d'un jour : à faire d'abord (heure puis priorité), faites ensuite. */
export function tasksFor(data: AppData, date: string) {
  const all = sel.tasks(data).filter((t) => t.due_date === date);
  const open = all.filter((t) => t.status !== "done").sort(byTimeThenPriority);
  const done = all.filter((t) => t.status === "done");
  return { open, done, total: all.length, remaining: open.length };
}

export function byTimeThenPriority(a: Task, b: Task) {
  const ta = a.due_time ? hhmm(a.due_time) : "99:99";
  const tb = b.due_time ? hhmm(b.due_time) : "99:99";
  return ta.localeCompare(tb) || PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] || a.title.localeCompare(b.title);
}

/** Tâches en retard (non terminées, date passée). */
export const overdueTasks = (data: AppData, today: string) =>
  sel.tasks(data).filter((t) => t.status !== "done" && t.due_date && t.due_date < today).sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string));

/** Tâches sans date, non terminées. */
export const inboxTasks = (data: AppData) => sel.tasks(data).filter((t) => t.status !== "done" && !t.due_date).sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);

export const activeProjects = (data: AppData) => sel.projects(data).filter((p) => !p.archived);

/** Série de routines : mêmes règles que le site (jour sans routine = neutre, journée en cours non cassée tant qu'elle n'est pas finie). */
export const streakOf = (data: AppData, today: string) => routineStreak(sel.routines(data).filter((r) => r.active), sel.logs(data), today);
