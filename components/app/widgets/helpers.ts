import { toMs } from "@/lib/finance-engine";
import type { Routine, Task } from "@/lib/types";

export const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
export const weekday = (d: string) => new Date(toMs(d)).getUTCDay();
export const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
export const fmtLong = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
export const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
export const scheduledOn = (r: Routine, d: string) => r.frequency === "daily" || (r.frequency === "weekly" && (r.days_of_week ?? []).includes(weekday(d)));
export const PRIORITY_RANK = { high: 0, medium: 1, low: 2 } as const;

/** Monday of the week containing `d`. */
export const mondayOf = (d: string) => new Date(toMs(d) - ((weekday(d) + 6) % 7) * 86_400_000).toISOString().slice(0, 10);

export const isDone = (t: Task) => t.status === "done";
