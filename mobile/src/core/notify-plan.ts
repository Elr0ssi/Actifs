import { dateFromISO, isoAddDays, isTimeBetween, localISO, minutesOf } from "./dates";
import { sel, type AppData } from "./model";
import type { NotificationSettings } from "./settings";
import { routinesFor } from "./today";

export interface PlannedNotification {
  /** Identifiant stable : replanifier ne crée jamais de doublon. */
  id: string;
  title: string;
  body: string;
  fireAt: Date;
  /** Lien profond ouvert au toucher. */
  url: string;
  kind: "task" | "due" | "routine";
}

/** iOS conserve au plus 64 notifications locales planifiées : on en garde une marge. */
export const MAX_PENDING = 60;
const HORIZON_DAYS = 7;

/** Repousse l'heure à la fin des heures calmes si elle tombe dedans. */
export function applyQuietHours(at: Date, s: NotificationSettings): Date {
  if (!s.quietEnabled) return at;
  const mins = at.getHours() * 60 + at.getMinutes();
  const start = minutesOf(s.quietStart);
  const end = minutesOf(s.quietEnd);
  if (start === end || !isTimeBetween(mins, start, end)) return at;
  const out = new Date(at);
  // Dans la plage de nuit : si on est avant minuit (>= début), la fin est le lendemain.
  if (start > end && mins >= start) out.setDate(out.getDate() + 1);
  out.setHours(Math.floor(end / 60), end % 60, 0, 0);
  return out;
}

/**
 * Calcule les notifications locales à planifier (fonction pure, testée) :
 *  - rappel d'une tâche à heure fixe, `taskLeadMin` minutes avant ;
 *  - rappel matinal pour les tâches du jour sans heure ;
 *  - rappel quotidien des routines restantes du jour.
 * Les tâches terminées, les routines déjà faites et les heures passées sont ignorées.
 */
export function planNotifications(data: AppData, s: NotificationSettings, now: Date): PlannedNotification[] {
  if (!s.enabled) return [];
  const out: PlannedNotification[] = [];
  const today = localISO(now);

  const push = (n: Omit<PlannedNotification, "fireAt"> & { at: Date }) => {
    const fireAt = applyQuietHours(n.at, s);
    if (fireAt.getTime() > now.getTime() + 5_000) out.push({ id: n.id, title: n.title, body: n.body, fireAt, url: n.url, kind: n.kind });
  };

  const horizon = isoAddDays(today, HORIZON_DAYS);
  for (const t of sel.tasks(data)) {
    if (t.status === "done" || !t.due_date || t.due_date < today || t.due_date > horizon) continue;
    if (t.due_time) {
      if (!s.tasks) continue;
      const at = dateFromISO(t.due_date, t.due_time);
      at.setMinutes(at.getMinutes() - s.taskLeadMin);
      push({ id: `task:${t.id}`, title: t.title, body: s.taskLeadMin > 0 ? `Dans ${s.taskLeadMin} min · ${t.due_time.slice(0, 5)}` : `Maintenant · ${t.due_time.slice(0, 5)}`, at, url: "flozea://tasks", kind: "task" });
    } else if (s.due) {
      push({ id: `due:${t.id}`, title: t.title, body: "À faire aujourd'hui", at: dateFromISO(t.due_date, s.dueTime), url: "flozea://tasks", kind: "due" });
    }
  }

  if (s.routines) {
    for (let i = 0; i <= HORIZON_DAYS; i++) {
      const day = isoAddDays(today, i);
      const r = routinesFor(data, day);
      const left = r.total - r.done;
      if (left <= 0) continue;
      const names = r.list.filter((x) => !x.done).map((x) => x.routine.title);
      const body = names.length <= 3 ? names.join(" · ") : `${names.slice(0, 3).join(" · ")} +${names.length - 3}`;
      push({ id: `routines:${day}`, title: left === 1 ? "1 routine à faire" : `${left} routines à faire`, body, at: dateFromISO(day, s.routineTime), url: "flozea://routines", kind: "routine" });
    }
  }

  return out.sort((a, b) => a.fireAt.getTime() - b.fireAt.getTime()).slice(0, MAX_PENDING);
}
