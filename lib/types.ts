export type TaskPriority = "low" | "medium" | "high";
export type TaskStatus = "todo" | "doing" | "done";

export interface Project {
  id: string;
  household_id: string;
  name: string;
  color: string;
  icon: string | null;
  archived: boolean;
  created_at: string;
}

export interface Task {
  id: string;
  household_id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  assigned_to: string | null;
  created_by: string | null;
  created_at: string;
  completed_at: string | null;
}

export type ListType = "generic" | "shopping" | "recipe";

export interface ListRow {
  id: string;
  household_id: string;
  name: string;
  category: string | null;
  type: ListType;
  created_by: string | null;
  created_at: string;
}

export interface ListItem {
  id: string;
  list_id: string;
  label: string;
  quantity: string | null;
  note: string | null;
  checked: boolean;
  position: number;
  created_at: string;
}

export interface ItemLocation {
  id: string;
  household_id: string;
  item_label: string;
  store_name: string;
  note: string | null;
  created_at: string;
}

export interface Recipe {
  id: string;
  household_id: string;
  name: string;
  category: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
}

export interface RecipeItem {
  id: string;
  recipe_id: string;
  label: string;
  quantity: string | null;
  note: string | null;
  position: number;
}

export type RoutineFrequency = "daily" | "weekly";

export interface Routine {
  id: string;
  household_id: string;
  user_id: string | null;
  title: string;
  category: string | null;
  color: string;
  frequency: RoutineFrequency;
  days_of_week: number[];
  active: boolean;
  created_at: string;
}

export interface RoutineLog {
  id: string;
  routine_id: string;
  user_id: string | null;
  log_date: string;
  done: boolean;
}

export type FinanceKind = "expense" | "income";
export type ChargeFrequency = "monthly" | "yearly" | "weekly" | "once";

export interface FinanceCategory {
  id: string;
  household_id: string;
  name: string;
  kind: FinanceKind;
  color: string | null;
}

export interface RecurringCharge {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  category_id: string | null;
  category: string;
  frequency: ChargeFrequency;
  next_date: string;
  active: boolean;
  created_at: string;
}

export interface Income {
  id: string;
  household_id: string;
  name: string;
  amount: number;
  expected_date: string;
  recurring: boolean;
  frequency: ChargeFrequency;
  category: string;
  status: string;
  active: boolean;
  created_at: string;
}

export interface Investment {
  id: string;
  household_id: string;
  project_name: string;
  amount_invested: number;
  invested_date: string;
  expected_return: number | null;
  expected_return_date: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  household_id: string;
  label: string;
  amount: number;
  kind: FinanceKind;
  txn_date: string;
  category_id: string | null;
  variable_budget_id: string | null;
  source: string;
  created_at: string;
}

export interface VariableBudget {
  id: string;
  household_id: string;
  name: string;
  planned_amount: number;
  icon: string | null;
  position: number;
  created_at: string;
}

export type SavingsMode = "fixed" | "percent";

export interface Profile {
  id: string;
  household_id: string | null;
  display_name: string | null;
  avatar_url: string | null;
}

export interface Household {
  id: string;
  name: string;
  invite_code: string;
  current_balance: number;
  savings_mode: SavingsMode;
  savings_value: number;
}
