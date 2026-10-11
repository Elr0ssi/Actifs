import type { TaskPriority } from "@/lib/types";
import { conflictTarget, type Op } from "./outbox";
import { sel, type AppData } from "./model";

/** Contexte nécessaire pour fabriquer des opérations (injecté pour pouvoir tester sans réseau). */
export interface MutCtx {
  householdId: string;
  userId: string;
  newId: () => string;
  now: () => number;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;
const opId = (c: MutCtx) => c.newId();

/* ---------------- Tâches (mêmes règles de validation que app/(main)/app/tasks/actions.ts) ---------------- */

export interface TaskInput {
  title: string;
  priority?: TaskPriority;
  due_date?: string | null;
  due_time?: string | null;
  due_end?: string | null;
  project_id?: string | null;
  description?: string | null;
}

export function normalizeTaskTimes(v: { due_date?: string | null; due_time?: string | null; due_end?: string | null }) {
  const due_date = v.due_date && DATE_RE.test(v.due_date) ? v.due_date : null;
  const due_time = due_date && v.due_time && TIME_RE.test(v.due_time) ? v.due_time : null;
  const due_end = due_time && v.due_end && TIME_RE.test(v.due_end) && v.due_end > due_time ? v.due_end : null;
  return { due_date, due_time, due_end };
}

export function addTask(c: MutCtx, input: TaskInput): Op[] {
  const title = input.title.trim().slice(0, 300);
  if (!title) return [];
  const times = normalizeTaskTimes(input);
  return [
    {
      id: opId(c), at: c.now(), kind: "upsert", table: "tasks",
      row: {
        id: c.newId(), household_id: c.householdId, title, project_id: input.project_id || null,
        priority: input.priority ?? "medium", status: "todo", description: input.description?.trim().slice(0, 10000) || null,
        ...times, created_by: c.userId, created_at: new Date(c.now()).toISOString(), completed_at: null, assigned_to: null,
      },
    },
  ];
}

export function toggleTask(c: MutCtx, id: string, done: boolean): Op[] {
  return [{ id: opId(c), at: c.now(), kind: "patch", table: "tasks", match: { id }, patch: { status: done ? "done" : "todo", completed_at: done ? new Date(c.now()).toISOString() : null } }];
}

export function saveTask(c: MutCtx, id: string, v: Partial<TaskInput>): Op[] {
  const patch: Record<string, unknown> = {};
  if (typeof v.title === "string" && v.title.trim()) patch.title = v.title.trim().slice(0, 300);
  if (v.description !== undefined) patch.description = v.description?.trim() ? v.description.trim().slice(0, 10000) : null;
  if (v.priority && ["low", "medium", "high"].includes(v.priority)) patch.priority = v.priority;
  if (v.project_id !== undefined) patch.project_id = v.project_id || null;
  if (v.due_date !== undefined || v.due_time !== undefined || v.due_end !== undefined) Object.assign(patch, normalizeTaskTimes({ due_date: v.due_date, due_time: v.due_time, due_end: v.due_end }));
  return Object.keys(patch).length ? [{ id: opId(c), at: c.now(), kind: "patch", table: "tasks", match: { id }, patch }] : [];
}

export const deleteTask = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "tasks", match: { id } }];

/* ---------------- Routines ---------------- */

export interface RoutineInput { title: string; category?: string; frequency: "daily" | "weekly"; days?: number[] }
const routineDays = (i: RoutineInput) => (i.frequency === "weekly" ? [...new Set((i.days ?? []).filter((d) => d >= 0 && d <= 6))].sort() : [0, 1, 2, 3, 4, 5, 6]);

export function addRoutine(c: MutCtx, input: RoutineInput): Op[] {
  const title = input.title.trim().slice(0, 200);
  if (!title) return [];
  return [{ id: opId(c), at: c.now(), kind: "upsert", table: "routines", row: { id: c.newId(), household_id: c.householdId, user_id: c.userId, title, category: input.category?.trim() || "Général", color: "#8b5cf6", frequency: input.frequency, days_of_week: routineDays(input), active: true, created_at: new Date(c.now()).toISOString() } }];
}

export function updateRoutine(c: MutCtx, id: string, input: RoutineInput): Op[] {
  const title = input.title.trim().slice(0, 200);
  if (!title) return [];
  return [{ id: opId(c), at: c.now(), kind: "patch", table: "routines", match: { id }, patch: { title, category: input.category?.trim() || "Général", frequency: input.frequency, days_of_week: routineDays(input) } }];
}

export const setRoutineActive = (c: MutCtx, id: string, active: boolean): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "routines", match: { id }, patch: { active } }];
export const deleteRoutine = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "routines", match: { id } }];

/** Coche / décoche une routine pour un jour (une ligne par routine, jour et utilisateur — comme sur le site). */
export function setRoutineLog(c: MutCtx, routineId: string, date: string, done: boolean): Op[] {
  if (!DATE_RE.test(date)) return [];
  const key = { routine_id: routineId, log_date: date, user_id: c.userId };
  return done
    ? [{ id: opId(c), at: c.now(), kind: "upsert", table: "routine_logs", row: { ...key, done: true }, onConflict: conflictTarget("routine_logs") }]
    : [{ id: opId(c), at: c.now(), kind: "delete", table: "routine_logs", match: key }];
}

/* ---------------- Courses ---------------- */

export function addList(c: MutCtx, name: string, store?: string | null): Op[] {
  const n = name.trim().slice(0, 120);
  if (!n) return [];
  return [{ id: opId(c), at: c.now(), kind: "upsert", table: "lists", row: { id: c.newId(), household_id: c.householdId, name: n, type: "shopping", store: store?.trim() || null, category: null, week_start: null, archived: false, created_by: c.userId, created_at: new Date(c.now()).toISOString() } }];
}

export function addListItem(c: MutCtx, data: AppData, listId: string, label: string, quantity?: string | null): Op[] {
  const l = label.trim().slice(0, 200);
  if (!l) return [];
  const pos = Math.max(-1, ...sel.items(data).filter((i) => i.list_id === listId).map((i) => i.position)) + 1;
  return [{ id: opId(c), at: c.now(), kind: "upsert", table: "list_items", row: { id: c.newId(), list_id: listId, label: l, quantity: quantity?.trim() || null, note: null, checked: false, position: pos, ingredient_id: null, price: null, count: 1, qty: null, qty_unit: null, source: "mobile", created_at: new Date(c.now()).toISOString() } }];
}

export const toggleListItem = (c: MutCtx, id: string, checked: boolean): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "list_items", match: { id }, patch: { checked } }];
export const deleteListItem = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "list_items", match: { id } }];
export const clearCheckedItems = (c: MutCtx, data: AppData, listId: string): Op[] =>
  sel.items(data).filter((i) => i.list_id === listId && i.checked).map((i) => ({ id: opId(c), at: c.now(), kind: "delete" as const, table: "list_items" as const, match: { id: i.id } }));
export const setListArchived = (c: MutCtx, id: string, archived: boolean): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "lists", match: { id }, patch: { archived } }];
export const deleteList = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "lists", match: { id } }];

/* ---------------- Menu de la semaine ---------------- */

export const mondayOfISO = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() - ((dt.getUTCDay() + 6) % 7));
  return dt.toISOString().slice(0, 10);
};

export function addMeal(c: MutCtx, data: AppData, day: string, meal: { name: string; icon?: string | null; servings?: number | null }, slot?: "midi" | "soir"): Op[] {
  const name = meal.name.trim().slice(0, 120);
  if (!DATE_RE.test(day) || !name) return [];
  // Un même repas n'est pas ajouté deux fois le même jour et au même créneau (règle du site).
  if (sel.menu(data).some((m) => m.day === day && (m.slot ?? null) === (slot ?? null) && m.name.toLowerCase() === name.toLowerCase())) return [];
  return [{ id: opId(c), at: c.now(), kind: "upsert", table: "menu_items", row: { id: c.newId(), household_id: c.householdId, week_start: mondayOfISO(day), day, name, icon: meal.icon?.slice(0, 8) ?? null, servings: meal.servings ? Math.min(100, Math.max(1, Math.round(meal.servings))) : null, slot: slot ?? null, created_by: c.userId, created_at: new Date(c.now()).toISOString() } }];
}
export const removeMeal = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "menu_items", match: { id } }];
export const setMealServings = (c: MutCtx, id: string, servings: number): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "menu_items", match: { id }, patch: { servings: Math.min(100, Math.max(1, Math.round(servings))) } }];
export const setMealSlot = (c: MutCtx, id: string, slot: "midi" | "soir"): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "menu_items", match: { id }, patch: { slot } }];

/* ---------------- Recettes ---------------- */

export function addRecipe(c: MutCtx, r: { name: string; category?: string | null; notes?: string | null; servings?: number; ingredients: { label: string; quantity?: string | null }[] }): Op[] {
  const name = r.name.trim().slice(0, 160);
  if (!name) return [];
  const id = c.newId();
  const ops: Op[] = [{ id: opId(c), at: c.now(), kind: "upsert", table: "recipes", row: { id, household_id: c.householdId, name, category: r.category?.trim() || null, notes: r.notes?.trim() || null, image_url: null, is_favorite: false, servings: r.servings ?? 4, created_by: c.userId, created_at: new Date(c.now()).toISOString() } }];
  r.ingredients.filter((i) => i.label.trim()).forEach((i, pos) => ops.push({ id: opId(c), at: c.now(), kind: "upsert", table: "recipe_items", row: { id: c.newId(), recipe_id: id, label: i.label.trim().slice(0, 200), quantity: i.quantity?.trim() || null, note: null, position: pos, ingredient_id: null, qty: null, qty_unit: null } }));
  return ops;
}
export const setRecipeFavorite = (c: MutCtx, id: string, favorite: boolean): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table: "recipes", match: { id }, patch: { is_favorite: favorite } }];
export const deleteRecipe = (c: MutCtx, id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table: "recipes", match: { id } }];

/** Ajoute les ingrédients d'une recette à une liste de courses (sans doublon d'étiquette déjà présente non cochée). */
export function recipeToList(c: MutCtx, data: AppData, recipeId: string, listId: string): Op[] {
  const have = new Set(sel.items(data).filter((i) => i.list_id === listId && !i.checked).map((i) => i.label.trim().toLowerCase()));
  let pos = Math.max(-1, ...sel.items(data).filter((i) => i.list_id === listId).map((i) => i.position)) + 1;
  return sel.recipeItems(data)
    .filter((i) => i.recipe_id === recipeId && !have.has(i.label.trim().toLowerCase()))
    .sort((a, b) => a.position - b.position)
    .map((i) => ({ id: opId(c), at: c.now(), kind: "upsert" as const, table: "list_items" as const, row: { id: c.newId(), list_id: listId, label: i.label, quantity: i.quantity, note: null, checked: false, position: pos++, ingredient_id: i.ingredient_id, price: null, count: 1, qty: i.qty, qty_unit: i.qty_unit, source: "recipe", created_at: new Date(c.now()).toISOString() } }));
}

/* ---------------- Finances ---------------- */

export interface OperationInput {
  name: string;
  amount: number;
  kind: "income" | "fixed" | "variable" | "savings";
  start: string;
  frequency: "once" | "weekly" | "monthly" | "yearly";
  category?: string;
  account?: string | null;
}

export function addOperation(c: MutCtx, o: OperationInput): Op[] {
  const name = o.name.trim().slice(0, 120);
  const amount = Math.abs(Number(o.amount));
  if (!name || !amount || !DATE_RE.test(o.start)) return [];
  const common = { id: c.newId(), household_id: c.householdId, name, amount, category: o.category?.trim() || (o.kind === "income" ? "Revenu" : "Autre"), frequency: o.frequency, interval_count: 1, weekdays: [], month_days: [], end_date: null, note: null, account: o.account ?? null, weekend_rule: "none", skipped_dates: [], moved_dates: {}, active: true, created_by: c.userId, created_at: new Date(c.now()).toISOString() };
  if (o.kind === "income") return [{ id: opId(c), at: c.now(), kind: "upsert", table: "incomes", row: { ...common, expected_date: o.start, recurring: o.frequency !== "once" } }];
  return [{ id: opId(c), at: c.now(), kind: "upsert", table: "recurring_charges", row: { ...common, next_date: o.start, kind: o.kind } }];
}

export const setOperationActive = (c: MutCtx, table: "incomes" | "recurring_charges", id: string, active: boolean): Op[] => [{ id: opId(c), at: c.now(), kind: "patch", table, match: { id }, patch: { active } }];
export const deleteOperation = (c: MutCtx, table: "incomes" | "recurring_charges" | "transactions", id: string): Op[] => [{ id: opId(c), at: c.now(), kind: "delete", table, match: { id } }];

/** Solde réel d'un compte à une date (n'écrase jamais l'historique d'autres dates) ; le compte courant met aussi à jour le cache du foyer s'il s'agit du solde le plus récent, comme sur le site. */
export function setBalance(c: MutCtx, data: AppData, account: "Courant" | "Épargne" | "Investissement", date: string, balance: number): Op[] {
  if (!DATE_RE.test(date) || !Number.isFinite(balance)) return [];
  const ops: Op[] = [{ id: opId(c), at: c.now(), kind: "upsert", table: "balance_entries", row: { household_id: c.householdId, entry_date: date, account, balance }, onConflict: conflictTarget("balance_entries") }];
  const laterExists = data.tables.balance_entries.some((e) => e.account === "Courant" && String(e.entry_date) > date);
  if (account === "Courant" && !laterExists) ops.push({ id: opId(c), at: c.now(), kind: "patch", table: "households", match: { id: c.householdId }, patch: { current_balance: balance, balance_ref_date: date } });
  return ops;
}
