/**
 * Dates « métier » = chaînes AAAA-MM-JJ dans le fuseau de l'appareil.
 * (Le site utilise l'UTC pour « aujourd'hui » ; le mobile utilise l'heure locale, qui est la bonne référence.)
 */
const pad = (n: number) => String(n).padStart(2, "0");

export function localISO(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Minutes depuis minuit (heure locale) pour une heure « HH:MM » ou « HH:MM:SS ». */
export function minutesOf(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

export const hhmm = (time: string | null | undefined) => (time ? time.slice(0, 5) : "");

/** Date locale (à midi, pour éviter les décalages d'heure d'été) à partir d'une chaîne AAAA-MM-JJ. */
export function dateFromISO(iso: string, time?: string | null): Date {
  const [y, m, d] = iso.split("-").map(Number);
  if (time) {
    const [hh, mm] = time.split(":").map(Number);
    return new Date(y, m - 1, d, hh, mm || 0, 0, 0);
  }
  return new Date(y, m - 1, d, 12, 0, 0, 0);
}

/** 0 = dimanche … 6 = samedi (même convention que `routines.days_of_week` du site). */
export const weekdayOfISO = (iso: string) => dateFromISO(iso).getDay();

export function isoAddDays(iso: string, n: number): string {
  const d = dateFromISO(iso);
  d.setDate(d.getDate() + n);
  return localISO(d);
}

export const isTimeBetween = (minutes: number, start: number, end: number) =>
  start <= end ? minutes >= start && minutes < end : minutes >= start || minutes < end;
