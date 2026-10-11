import type { Household, ListItem, ListRow, Profile, Project, Recipe, RecipeItem, Routine, RoutineLog, Task } from "@/lib/types";

/** Tables du projet Supabase lues/écrites par l'app (aucune création de table : schéma existant du site). */
export const TABLES = [
  "profiles",
  "households",
  "tasks",
  "projects",
  "routines",
  "routine_logs",
  "lists",
  "list_items",
  "list_recipes",
  "menu_items",
  "recipes",
  "recipe_items",
  "recurring_charges",
  "incomes",
  "balance_entries",
  "transactions",
  "variable_budgets",
] as const;
export type TableName = (typeof TABLES)[number];

export type Row = Record<string, unknown> & { id?: string };

export interface MenuItemRow {
  id: string;
  household_id: string;
  week_start: string | null;
  day: string | null;
  name: string;
  icon: string | null;
  servings: number | null;
  slot: "midi" | "soir" | null;
}

export interface ListRecipeRow {
  id: string;
  list_id: string;
  recipe_id: string | null;
  name: string;
  icon: string | null;
  count: number;
  servings: number | null;
}

export interface BalanceEntry {
  household_id: string;
  entry_date: string;
  account: string;
  balance: number;
}

export interface VariableBudget {
  id: string;
  household_id: string;
  name: string;
  planned_amount: number;
  icon: string | null;
  position: number;
}

/** Instantané complet des données du foyer, côté appareil. `tables` est un reflet du serveur + opérations en attente. */
export interface AppData {
  userId: string;
  syncedAt: string | null;
  tables: Record<TableName, Row[]>;
}

export const emptyTables = (): Record<TableName, Row[]> =>
  Object.fromEntries(TABLES.map((t) => [t, [] as Row[]])) as unknown as Record<TableName, Row[]>;

/** Accès typés (les lignes sont stockées de façon générique pour que la file d'attente soit simple). */
export const sel = {
  profile: (d: AppData) => (d.tables.profiles[0] ?? null) as unknown as Profile | null,
  household: (d: AppData) => (d.tables.households[0] ?? null) as unknown as (Household & { default_servings?: number; savings_goal?: number; investment_goal?: number; balance_ref_date?: string | null }) | null,
  tasks: (d: AppData) => d.tables.tasks as unknown as Task[],
  projects: (d: AppData) => d.tables.projects as unknown as Project[],
  routines: (d: AppData) => d.tables.routines as unknown as Routine[],
  logs: (d: AppData) => d.tables.routine_logs as unknown as RoutineLog[],
  lists: (d: AppData) => d.tables.lists as unknown as ListRow[],
  items: (d: AppData) => d.tables.list_items as unknown as ListItem[],
  listRecipes: (d: AppData) => d.tables.list_recipes as unknown as ListRecipeRow[],
  menu: (d: AppData) => d.tables.menu_items as unknown as MenuItemRow[],
  recipes: (d: AppData) => d.tables.recipes as unknown as Recipe[],
  recipeItems: (d: AppData) => d.tables.recipe_items as unknown as RecipeItem[],
  budgets: (d: AppData) => d.tables.variable_budgets as unknown as VariableBudget[],
};
