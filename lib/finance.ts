import type { ChargeFrequency } from "@/lib/types";

export function monthlyEquivalent(amount: number, frequency: string) {
  if (frequency === "yearly") return amount / 12;
  if (frequency === "weekly") return amount * 4.33;
  if (frequency === "once") return 0;
  return amount;
}

function addPeriod(date: Date, frequency: ChargeFrequency) {
  const d = new Date(date);
  if (frequency === "monthly") d.setMonth(d.getMonth() + 1);
  else if (frequency === "yearly") d.setFullYear(d.getFullYear() + 1);
  else if (frequency === "weekly") d.setDate(d.getDate() + 7);
  else return null;
  return d;
}

/** Projects all occurrence dates (ISO strings) of a recurring item between rangeStart and rangeEnd, inclusive. */
export function projectOccurrences(anchorDateISO: string, frequency: ChargeFrequency, rangeStartISO: string, rangeEndISO: string): string[] {
  const rangeStart = new Date(rangeStartISO);
  const rangeEnd = new Date(rangeEndISO);
  let cursor = new Date(anchorDateISO);
  const results: string[] = [];

  // walk backwards is unnecessary: anchor is "next_date", so just walk forward.
  // If anchor is already after rangeEnd, nothing to add.
  let guard = 0;
  while (cursor <= rangeEnd && guard < 500) {
    guard++;
    if (cursor >= rangeStart) {
      results.push(cursor.toISOString().slice(0, 10));
    }
    if (frequency === "once") break;
    const next = addPeriod(cursor, frequency);
    if (!next) break;
    cursor = next;
  }
  return results;
}

export interface RangeChargeLike {
  id: string;
  name: string;
  amount: number;
  next_date: string;
  frequency: ChargeFrequency;
}

export function sumOccurrencesInRange(items: RangeChargeLike[], rangeStartISO: string, rangeEndISO: string) {
  let total = 0;
  const breakdown: { id: string; name: string; date: string; amount: number }[] = [];
  for (const item of items) {
    const dates = projectOccurrences(item.next_date, item.frequency, rangeStartISO, rangeEndISO);
    for (const date of dates) {
      total += Number(item.amount);
      breakdown.push({ id: item.id, name: item.name, date, amount: Number(item.amount) });
    }
  }
  breakdown.sort((a, b) => a.date.localeCompare(b.date));
  return { total, breakdown };
}

/** Sums recurring amounts per calendar month (YYYY-MM) for the next `monthsAhead` months. */
export function monthlyTotals(items: RangeChargeLike[], monthsAhead: number, fromISO: string) {
  const from = new Date(fromISO);
  const start = new Date(from.getFullYear(), from.getMonth(), 1);
  const end = new Date(from.getFullYear(), from.getMonth() + monthsAhead, 0);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const totalsByMonth = new Map<string, number>();
  for (const item of items) {
    for (const date of projectOccurrences(item.next_date, item.frequency, startISO, endISO)) {
      const key = date.slice(0, 7);
      totalsByMonth.set(key, (totalsByMonth.get(key) ?? 0) + Number(item.amount));
    }
  }

  const months: { key: string; label: string; total: number }[] = [];
  for (let i = 0; i < monthsAhead; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    months.push({ key, label: d.toLocaleDateString("fr-FR", { month: "short" }), total: totalsByMonth.get(key) ?? 0 });
  }
  return months;
}

/** Groups recurring items by category, summing their monthly-equivalent amount. */
export function groupByCategory(items: (RangeChargeLike & { category?: string | null })[]) {
  const totals = new Map<string, number>();
  for (const item of items) {
    const key = item.category?.trim() || "Autre";
    totals.set(key, (totals.get(key) ?? 0) + monthlyEquivalent(Number(item.amount), item.frequency));
  }
  return [...totals.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}
