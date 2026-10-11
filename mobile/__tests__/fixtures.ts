import { emptyTables, type AppData, type Row } from "~/core/model";
import type { MutCtx } from "~/core/mutations";

export const HOUSEHOLD = "h-1";
export const USER = "u-1";

let n = 0;
export const ctx = (over: Partial<MutCtx> = {}): MutCtx => ({ householdId: HOUSEHOLD, userId: USER, newId: () => `id-${++n}`, now: () => Date.UTC(2026, 5, 15, 8, 0, 0), ...over });

export function makeData(tables: Partial<Record<keyof ReturnType<typeof emptyTables>, Row[]>> = {}, userId = USER): AppData {
  return { userId, syncedAt: null, tables: { ...emptyTables(), households: [{ id: HOUSEHOLD, name: "Foyer", current_balance: 1000, balance_ref_date: "2026-06-01" }], ...tables } };
}

export const routine = (over: Row = {}): Row => ({ id: "r1", household_id: HOUSEHOLD, user_id: USER, title: "Sport", category: "Santé", color: "#8b5cf6", frequency: "daily", days_of_week: [0, 1, 2, 3, 4, 5, 6], active: true, created_at: "2026-01-01T00:00:00Z", ...over });
export const task = (over: Row = {}): Row => ({ id: "t1", household_id: HOUSEHOLD, title: "Appeler", priority: "medium", status: "todo", due_date: "2026-06-15", due_time: null, due_end: null, project_id: null, description: null, created_at: "2026-06-01T00:00:00Z", completed_at: null, ...over });
