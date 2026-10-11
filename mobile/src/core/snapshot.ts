import { addDays } from "@/lib/finance-engine";
import { hhmm, localISO, minutesOf } from "./dates";
import { financeFrom, summarize } from "./finance";
import { sel, type AppData } from "./model";
import { routinesFor, tasksFor } from "./today";

/**
 * Instantané lu par les widgets iOS (extension WidgetKit). Il est écrit dans l'App Group partagé :
 * c'est un résumé minimal, jamais de jeton ni de clé. Si l'utilisateur masque les montants, `finance`
 * ne contient AUCUN montant (rien de sensible n'est même écrit dans le conteneur partagé).
 */
export const SNAPSHOT_VERSION = 1;
export const SNAPSHOT_KEY = "flozea.widgets.v1";

export interface WidgetSnapshot {
  v: typeof SNAPSHOT_VERSION;
  generatedAt: string;
  today: string;
  signedIn: boolean;
  hideAmounts: boolean;
  routines: { total: number; done: number; next: { id: string; title: string }[] };
  tasks: { total: number; remaining: number; items: { id: string; title: string; priority: string; time: string | null }[] };
  finance: { hidden: boolean; resteAVivre: number | null; monthSpent: number | null; balance: number | null; daysRemaining: number | null } | null;
  shopping: { listId: string | null; name: string | null; remaining: number; items: string[] };
  planning: { events: { id: string; title: string; day: string; time: string | null }[]; meals: { day: string; slot: string | null; name: string }[] };
}

export const signedOutSnapshot = (now: Date): WidgetSnapshot => ({
  v: SNAPSHOT_VERSION, generatedAt: now.toISOString(), today: localISO(now), signedIn: false, hideAmounts: false,
  routines: { total: 0, done: 0, next: [] }, tasks: { total: 0, remaining: 0, items: [] }, finance: null,
  shopping: { listId: null, name: null, remaining: 0, items: [] }, planning: { events: [], meals: [] },
});

export function buildSnapshot(data: AppData, now: Date, opts: { hideAmounts: boolean }): WidgetSnapshot {
  const today = localISO(now);
  const tomorrow = addDays(today, 1);

  const r = routinesFor(data, today);
  const t = tasksFor(data, today);

  let finance: WidgetSnapshot["finance"] = null;
  const hasFinance = data.tables.recurring_charges.length + data.tables.incomes.length + data.tables.balance_entries.length > 0;
  if (hasFinance) {
    const f = summarize(financeFrom(data, today), today);
    finance = opts.hideAmounts
      ? { hidden: true, resteAVivre: null, monthSpent: null, balance: null, daysRemaining: f.daysRemaining }
      : { hidden: false, resteAVivre: Math.round(f.resteAVivre * 100) / 100, monthSpent: Math.round(f.monthSpent * 100) / 100, balance: Math.round(f.balance * 100) / 100, daysRemaining: f.daysRemaining };
  }

  // Liste de courses « active » : la plus récente non archivée qui a des articles à acheter.
  const items = sel.items(data);
  const lists = sel.lists(data).filter((l) => !l.archived && l.type !== "recipe").sort((a, b) => b.created_at.localeCompare(a.created_at));
  const withLeft = lists.map((l) => ({ l, left: items.filter((i) => i.list_id === l.id && !i.checked).sort((a, b) => a.position - b.position) })).filter((x) => x.left.length > 0)[0];

  const nowMin = now.getHours() * 60 + now.getMinutes();
  const events = sel.tasks(data)
    .filter((x) => x.status !== "done" && x.due_time && x.due_date && (x.due_date === tomorrow || (x.due_date === today && minutesOf(x.due_time) >= nowMin - 30)))
    .sort((a, b) => `${a.due_date}${a.due_time}`.localeCompare(`${b.due_date}${b.due_time}`))
    .slice(0, 4)
    .map((x) => ({ id: x.id, title: x.title, day: x.due_date as string, time: hhmm(x.due_time) || null }));
  const meals = sel.menu(data)
    .filter((m) => m.day === today || m.day === tomorrow)
    .sort((a, b) => `${a.day}${a.slot === "soir" ? 1 : 0}`.localeCompare(`${b.day}${b.slot === "soir" ? 1 : 0}`))
    .slice(0, 4)
    .map((m) => ({ day: m.day as string, slot: m.slot, name: m.name }));

  return {
    v: SNAPSHOT_VERSION,
    generatedAt: now.toISOString(),
    today,
    signedIn: true,
    hideAmounts: opts.hideAmounts,
    routines: { total: r.total, done: r.done, next: r.list.filter((x) => !x.done).slice(0, 5).map((x) => ({ id: x.routine.id, title: x.routine.title })) },
    tasks: { total: t.total, remaining: t.remaining, items: t.open.slice(0, 6).map((x) => ({ id: x.id, title: x.title, priority: x.priority, time: hhmm(x.due_time) || null })) },
    finance,
    shopping: withLeft ? { listId: withLeft.l.id, name: withLeft.l.name, remaining: withLeft.left.length, items: withLeft.left.slice(0, 8).map((i) => i.label) } : { listId: null, name: null, remaining: 0, items: [] },
    planning: { events, meals },
  };
}
