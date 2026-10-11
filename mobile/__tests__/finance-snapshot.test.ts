import { getDateSituation } from "@/lib/finance-engine";
import { buildFinanceState } from "@/lib/finance-load";
import { financeFrom, summarize } from "~/core/finance";
import { buildSnapshot, signedOutSnapshot } from "~/core/snapshot";
import { HOUSEHOLD, makeData, routine, task } from "./fixtures";

const charges = [{ id: "c1", household_id: HOUSEHOLD, name: "Loyer", amount: 700, category: "Logement", kind: "fixed", frequency: "monthly", next_date: "2026-06-05", active: true, interval_count: 1, weekdays: [], month_days: [], end_date: null, skipped_dates: [], moved_dates: {}, weekend_rule: "none", note: null, account: null }];
const incomes = [{ id: "i1", household_id: HOUSEHOLD, name: "Salaire", amount: 2000, expected_date: "2026-06-28", recurring: true, frequency: "monthly", active: true, interval_count: 1, weekdays: [], month_days: [], end_date: null, skipped_dates: [], moved_dates: {}, weekend_rule: "none", note: null, account: null, category: "Revenu" }];
const entries = [{ household_id: HOUSEHOLD, entry_date: "2026-06-10", account: "Courant", balance: 1500 }];

describe("finances : mêmes résultats que le moteur du site", () => {
  it("financeFrom == buildFinanceState du site sur les mêmes lignes", () => {
    const d = makeData({ recurring_charges: charges, incomes, balance_entries: entries });
    const a = financeFrom(d, "2026-06-15");
    const b = buildFinanceState({ charges, incomes, entries: entries as never, txns: [], household: d.tables.households[0] as never }, "2026-06-15");
    expect(a).toEqual(b);
    const s = getDateSituation(a.ops, a.anchor, "2026-06-15");
    expect(summarize(a, "2026-06-15").resteAVivre).toBe(s.endBalance);
    // solde 1500 au 10/06, aucune charge entre le 11 et le 15, revenu de 2000 le 28 : reste à vivre = 3500
    expect(s.endBalance).toBe(3500);
  });

  it("un solde saisi dans le futur n'ancre jamais le calcul d'aujourd'hui", () => {
    const d = makeData({ recurring_charges: charges, incomes, balance_entries: [...entries, { household_id: HOUSEHOLD, entry_date: "2026-06-25", account: "Courant", balance: 9999 }] });
    expect(financeFrom(d, "2026-06-15").anchor.balance).toBe(1500);
  });
});

describe("instantané des widgets", () => {
  const now = new Date(2026, 5, 15, 9, 0);
  const base = () => makeData({
    recurring_charges: charges, incomes, balance_entries: entries,
    routines: [routine({ id: "a" }), routine({ id: "b", title: "Lire" })],
    routine_logs: [{ routine_id: "a", log_date: "2026-06-15", user_id: "u-1", done: true }],
    tasks: [task({ id: "t1", due_time: "17:00" }), task({ id: "t2", status: "done" })],
    lists: [{ id: "l1", name: "Courses", type: "shopping", archived: false, created_at: "2026-06-14T00:00:00Z" }],
    list_items: [{ id: "i1", list_id: "l1", label: "Lait", checked: false, position: 0 }, { id: "i2", list_id: "l1", label: "Pain", checked: true, position: 1 }],
    menu_items: [{ id: "m1", day: "2026-06-15", name: "Pâtes", slot: "midi" }],
  });

  it("résume routines, tâches, courses et planning", () => {
    const s = buildSnapshot(base(), now, { hideAmounts: false });
    expect(s.routines).toMatchObject({ total: 2, done: 1 });
    expect(s.routines.next.map((r) => r.title)).toEqual(["Lire"]);
    expect(s.tasks).toMatchObject({ total: 2, remaining: 1 });
    expect(s.shopping).toMatchObject({ listId: "l1", remaining: 1, items: ["Lait"] });
    expect(s.planning.meals[0].name).toBe("Pâtes");
    expect(s.planning.events[0]).toMatchObject({ id: "t1", time: "17:00" });
    expect(s.finance?.resteAVivre).toBe(3500);
  });

  it("option « masquer les montants » : aucun montant n'est écrit dans l'instantané", () => {
    const s = buildSnapshot(base(), now, { hideAmounts: true });
    expect(s.finance).toMatchObject({ hidden: true, resteAVivre: null, monthSpent: null, balance: null });
    expect(JSON.stringify(s)).not.toMatch(/3500|1500|2000/);
  });

  it("ne contient ni jeton ni identifiant de foyer", () => {
    const json = JSON.stringify(buildSnapshot(base(), now, { hideAmounts: false }));
    expect(json).not.toMatch(/token|household|wallet|ical/i);
  });

  it("déconnecté : instantané vide", () => {
    const s = signedOutSnapshot(now);
    expect(s.signedIn).toBe(false);
    expect(s.finance).toBeNull();
  });
});
