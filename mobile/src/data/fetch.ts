import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays } from "@/lib/finance-engine";
import { emptyTables, type AppData, type Row, type TableName } from "~/core/model";
import { mondayOfISO } from "~/core/mutations";

const PAGE = 1000;

/** Colonnes du foyer lues par l'app : on n'extrait JAMAIS ical_token / wallet_token (jetons de flux secrets). */
const HOUSEHOLD_COLS = "id, name, invite_code, current_balance, balance_ref_date, savings_mode, savings_value, savings_goal, investment_goal, default_servings";

type R = { data: Row[] | null; error: { message: string } | null };

function must(res: R, what: string): Row[] {
  if (res.error) throw new Error(`${what}: ${res.error.message}`);
  return res.data ?? [];
}

/** PostgREST plafonne à 1000 lignes par réponse : on récupère les pages suivantes. */
async function loadLogs(sb: SupabaseClient, from: string, to: string): Promise<Row[]> {
  const rows: Row[] = [];
  for (let page = 0; page < 6; page++) {
    const res = await sb.from("routine_logs").select("*").gte("log_date", from).lte("log_date", to).order("log_date").order("id").range(page * PAGE, (page + 1) * PAGE - 1);
    const got = must(res as unknown as R, "routine_logs");
    rows.push(...got);
    if (got.length < PAGE) break;
  }
  return rows;
}

/**
 * Charge toutes les données du foyer (mêmes fenêtres de dates que le tableau de bord du site).
 * Toutes les requêtes passent par la clé anon + session : la RLS ne renvoie que le foyer de l'utilisateur.
 */
export async function fetchAll(sb: SupabaseClient, userId: string, today: string): Promise<AppData> {
  const profileRes = await sb.from("profiles").select("id, household_id, display_name, avatar_url").eq("id", userId).maybeSingle();
  if (profileRes.error) throw new Error(`profiles: ${profileRes.error.message}`);
  const profile = profileRes.data as Row | null;
  const householdId = (profile?.household_id as string | null) ?? null;
  const tables = emptyTables();
  if (profile) tables.profiles = [profile];
  if (!householdId) return { userId, syncedAt: new Date().toISOString(), tables };

  const from = addDays(today, -62);
  const to = addDays(today, 124);
  const weekStart = mondayOfISO(today);
  const h = householdId;

  const [household, tasks, projects, routines, logs, lists, menu, recipes, charges, incomes, entries, txns, budgets] = await Promise.all([
    sb.from("households").select(HOUSEHOLD_COLS).eq("id", h),
    sb.from("tasks").select("*").eq("household_id", h).or(`status.neq.done,and(due_date.gte.${from},due_date.lte.${to}),completed_at.gte.${from}T00:00:00Z`).order("due_date", { ascending: true, nullsFirst: false }).limit(500),
    sb.from("projects").select("*").eq("household_id", h),
    sb.from("routines").select("*").eq("household_id", h),
    loadLogs(sb, addDays(today, -400), today),
    sb.from("lists").select("*, list_items(*), list_recipes(*)").eq("household_id", h).neq("type", "recipe").or(`archived.eq.false,created_at.gte.${addDays(today, -120)}T00:00:00Z`).order("created_at", { ascending: false }).limit(60),
    sb.from("menu_items").select("*").eq("household_id", h).gte("day", addDays(weekStart, -14)).lte("day", addDays(weekStart, 42)).order("created_at"),
    sb.from("recipes").select("*, recipe_items(*)").eq("household_id", h).order("name").limit(300),
    sb.from("recurring_charges").select("*").eq("household_id", h).order("next_date"),
    sb.from("incomes").select("*").eq("household_id", h).order("expected_date"),
    sb.from("balance_entries").select("household_id, entry_date, balance, account").eq("household_id", h).order("entry_date"),
    sb.from("transactions").select("id, household_id, label, merchant, amount, kind, txn_date, txn_time, card, category, source").eq("household_id", h).gte("txn_date", addDays(today, -120)).order("txn_date"),
    sb.from("variable_budgets").select("*").eq("household_id", h).order("position"),
  ]);

  tables.households = must(household as unknown as R, "households");
  tables.tasks = must(tasks as unknown as R, "tasks");
  tables.projects = must(projects as unknown as R, "projects");
  tables.routines = must(routines as unknown as R, "routines");
  tables.routine_logs = logs;

  const listRows = must(lists as unknown as R, "lists");
  tables.lists = listRows.map(({ list_items: _i, list_recipes: _r, ...l }) => l);
  tables.list_items = listRows.flatMap((l) => (l.list_items as Row[]) ?? []);
  tables.list_recipes = listRows.flatMap((l) => (l.list_recipes as Row[]) ?? []);

  tables.menu_items = must(menu as unknown as R, "menu_items");

  const recipeRows = must(recipes as unknown as R, "recipes");
  tables.recipes = recipeRows.map(({ recipe_items: _x, ...r }) => r);
  tables.recipe_items = recipeRows.flatMap((r) => (r.recipe_items as Row[]) ?? []);

  tables.recurring_charges = must(charges as unknown as R, "recurring_charges");
  tables.incomes = must(incomes as unknown as R, "incomes");
  tables.balance_entries = must(entries as unknown as R, "balance_entries");
  tables.transactions = must(txns as unknown as R, "transactions");
  tables.variable_budgets = must(budgets as unknown as R, "variable_budgets");

  return { userId, syncedAt: new Date().toISOString(), tables };
}

export type { TableName };
