import { intlLocale } from "@/lib/i18n";
import { DAYS_SHORT_MON } from "@/lib/i18n";
import { addDays, toMs } from "@/lib/finance-engine";
import type { Routine, RoutineLog, Task } from "@/lib/types";

export const DOW = DAYS_SHORT_MON;
export const weekday = (d: string) => new Date(toMs(d)).getUTCDay();
export const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString(intlLocale(), { day: "numeric", month: "short", timeZone: "UTC" });
export const fmtLong = (d: string) => new Date(toMs(d)).toLocaleDateString(intlLocale(), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
export const eur0 = (n: number) => new Intl.NumberFormat(intlLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
export const scheduledOn = (r: Routine, d: string) => r.frequency === "daily" || (r.frequency === "weekly" && (r.days_of_week ?? []).includes(weekday(d)));
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

/** Monday of the week containing `d`. */
export const mondayOf = (d: string) => new Date(toMs(d) - ((weekday(d) + 6) % 7) * 86_400_000).toISOString().slice(0, 10);

export const isDone = (t: Task) => t.status === "done";

/**
 * Nombre de jours d'affilée où toutes les routines prévues ont été faites.
 * Un jour sans routine ne casse pas la série ; la journée en cours ne la casse pas tant qu'elle n'est pas terminée.
 */
export function routineStreak(routines: Routine[], logs: Pick<RoutineLog, "routine_id" | "log_date" | "done">[], today: string) {
  const done = new Set(logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`));
  const state = (d: string) => {
    const due = routines.filter((r) => scheduledOn(r, d) && r.created_at.slice(0, 10) <= d);
    if (!due.length) return "none";
    return due.every((r) => done.has(`${r.id}_${d}`)) ? "full" : "miss";
  };
  let day = today;
  if (state(day) === "miss") day = addDays(day, -1);
  let streak = 0;
  for (let i = 0; i < 400; i++) {
    const s = state(day);
    if (s === "miss") break;
    if (s === "full") streak++;
    day = addDays(day, -1);
  }
  return streak;
}
