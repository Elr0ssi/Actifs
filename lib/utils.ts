import { DAYS_SHORT_SUN, MONTHS_LONG, intlLocale } from "@/lib/i18n";

export function formatEUR(amount: number) {
  return new Intl.NumberFormat(intlLocale(), { style: "currency", currency: "EUR" }).format(amount);
}

export function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

/** Noms de jours (dimanche en premier) et de mois dans la langue de l'interface (tableaux mis à jour par setUiLocale). */
export const WEEKDAYS_FR = DAYS_SHORT_SUN;
export const MONTHS_FR = MONTHS_LONG;
