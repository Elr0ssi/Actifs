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
