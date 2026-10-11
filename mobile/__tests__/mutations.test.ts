import { addMeal, addOperation, addTask, normalizeTaskTimes, saveTask, setBalance } from "~/core/mutations";
import { applyOps } from "~/core/outbox";
import { sel } from "~/core/model";
import { ctx, HOUSEHOLD, makeData } from "./fixtures";

describe("mutations (mêmes règles que les Server Actions du site)", () => {
  it("normalise les heures : pas d'heure sans date, fin > début", () => {
    expect(normalizeTaskTimes({ due_date: null, due_time: "10:00" })).toEqual({ due_date: null, due_time: null, due_end: null });
    expect(normalizeTaskTimes({ due_date: "2026-06-15", due_time: "10:00", due_end: "09:00" })).toEqual({ due_date: "2026-06-15", due_time: "10:00", due_end: null });
    expect(normalizeTaskTimes({ due_date: "2026-06-15", due_time: "10:00", due_end: "11:30" }).due_end).toBe("11:30");
    expect(normalizeTaskTimes({ due_date: "pas-une-date" }).due_date).toBeNull();
  });

  it("rejette un titre vide et rattache la tâche au foyer de l'utilisateur", () => {
    expect(addTask(ctx(), { title: "   " })).toEqual([]);
    const [op] = addTask(ctx(), { title: "Dentiste", due_date: "2026-06-20", due_time: "14:30" });
    expect(op).toMatchObject({ kind: "upsert", table: "tasks", row: { household_id: HOUSEHOLD, created_by: "u-1", status: "todo", due_time: "14:30" } });
  });

  it("saveTask ignore les priorités invalides", () => {
    const ops = saveTask(ctx(), "t1", { priority: "urgent" as never });
    expect(ops).toEqual([]);
  });

  it("n'ajoute pas deux fois le même repas le même jour et au même créneau", () => {
    const c = ctx();
    let d = makeData();
    d = applyOps(d, addMeal(c, d, "2026-06-16", { name: "Pâtes" }, "midi"));
    expect(addMeal(c, d, "2026-06-16", { name: "pâtes" }, "midi")).toEqual([]);
    expect(addMeal(c, d, "2026-06-16", { name: "Pâtes" }, "soir")).toHaveLength(1);
    expect(sel.menu(d)[0].week_start).toBe("2026-06-15"); // lundi de la semaine
  });

  it("solde : ne remplace le cache du foyer que si c'est le solde courant le plus récent", () => {
    const c = ctx();
    const d = makeData({ balance_entries: [{ household_id: HOUSEHOLD, entry_date: "2026-06-10", account: "Courant", balance: 5 }] });
    expect(setBalance(c, d, "Courant", "2026-06-12", 100)).toHaveLength(2);
    expect(setBalance(c, d, "Courant", "2026-06-01", 100)).toHaveLength(1);
    expect(setBalance(c, d, "Épargne", "2026-06-12", 100)).toHaveLength(1);
  });

  it("opération : revenu → table incomes, dépense → recurring_charges", () => {
    const c = ctx();
    const [inc] = addOperation(c, { name: "Salaire", amount: 2000, kind: "income", start: "2026-06-28", frequency: "monthly" });
    const [chg] = addOperation(c, { name: "Loyer", amount: -700, kind: "fixed", start: "2026-06-05", frequency: "monthly" });
    expect(inc).toMatchObject({ table: "incomes", row: { recurring: true, expected_date: "2026-06-28" } });
    expect(chg).toMatchObject({ table: "recurring_charges", row: { amount: 700, kind: "fixed", next_date: "2026-06-05" } });
    expect(addOperation(c, { name: "", amount: 5, kind: "fixed", start: "2026-06-05", frequency: "once" })).toEqual([]);
  });
});
