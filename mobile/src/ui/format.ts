import { formatEUR } from "@/lib/utils";
import { dateFromISO } from "~/core/dates";

export { formatEUR };

export const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(Number.isFinite(n) ? n : 0);

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);
export const fmtLong = (iso: string) => cap(dateFromISO(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" }));
export const fmtShort = (iso: string) => dateFromISO(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
export const fmtWeekday = (iso: string) => cap(dateFromISO(iso).toLocaleDateString("fr-FR", { weekday: "short" }).replace(".", ""));
export const fmtMonth = (year: number, month: number) => cap(new Date(year, month, 1).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }));

/** « Aujourd'hui », « Demain », « Hier » ou le jour en toutes lettres. */
export function relativeDay(iso: string, today: string): string {
  const diff = Math.round((dateFromISO(iso).getTime() - dateFromISO(today).getTime()) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff === -1) return "Hier";
  return fmtLong(iso);
}

export const PRIORITY_LABEL = { high: "Haute", medium: "Moyenne", low: "Basse" } as const;
