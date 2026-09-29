import { getAppContext } from "@/lib/data/context";
import { loadFinanceData, type AccountName } from "@/lib/data/finance";
import { addDays, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";
import { sanitizeLayout, type WidgetItem, type WidgetPage } from "@/lib/widgets/registry";
import type { Routine, RoutineLog, Task } from "@/lib/types";

export interface WidgetData {
  today: string;
  finance: {
    ops: FinOp[];
    anchor: BalanceAnchor;
    accounts: Record<AccountName, { date: string; balance: number } | null>;
  } | null;
  tasks: Task[];
  routines: Routine[];
  logs: RoutineLog[];
  lists: { id: string; name: string; items: { id: string; label: string; quantity: string | null; checked: boolean }[] }[];
  words: { id: string; french: string; english: string; created_at: string }[];
  wordsTotal: number;
  projects: { id: string; name: string; color: string; total: number; done: number }[];
  recipes: { id: string; name: string; category: string | null; image_url: string | null; is_favorite: boolean; items: number }[];
}

/** Toutes les données dont les widgets peuvent avoir besoin, chargées en parallèle (un aller-retour par table). */
export async function loadWidgetData(): Promise<WidgetData | null> {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";
  const today = todayISO();
  const from = addDays(today, -62);
  const to = addDays(today, 124);

  const [finance, { data: tasks }, { data: routines }, { data: logs }, { data: lists }, { data: words, count: wordsTotal }, { data: projects }, { data: projectTasks }, { data: recipes }] = await Promise.all([
    loadFinanceData(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .or(`status.neq.done,and(due_date.gte.${from},due_date.lte.${to})`)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(300)
      .returns<Task[]>(),
    supabase.from("routines").select("*").eq("household_id", householdId).eq("active", true).returns<Routine[]>(),
    supabase.from("routine_logs").select("*").gte("log_date", from).lte("log_date", today).returns<RoutineLog[]>(),
    supabase
      .from("lists")
      .select("id, name, type, archived, created_at, list_items(id, label, quantity, checked, position)")
      .eq("household_id", householdId)
      .eq("archived", false)
      .neq("type", "recipe")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase.from("vocab_words").select("id, french, english, created_at", { count: "exact" }).eq("household_id", householdId).order("created_at", { ascending: false }).limit(200),
    supabase.from("projects").select("id, name, color").eq("household_id", householdId).eq("archived", false).order("created_at"),
    supabase.from("tasks").select("project_id, status").eq("household_id", householdId).not("project_id", "is", null),
    supabase
      .from("recipes")
      .select("id, name, category, image_url, is_favorite, recipe_items(count)")
      .eq("household_id", householdId)
      .order("is_favorite", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(12),
  ]);

  return {
    today,
    finance: finance
      ? {
          ops: finance.ops,
          anchor: finance.anchor,
          accounts: {
            Courant: finance.accounts.Courant.last,
            Épargne: finance.accounts["Épargne"].last,
            Investissement: finance.accounts.Investissement.last,
          },
        }
      : null,
    tasks: tasks ?? [],
    routines: routines ?? [],
    logs: logs ?? [],
    lists: ((lists ?? []) as { id: string; name: string; list_items: { id: string; label: string; quantity: string | null; checked: boolean; position: number }[] }[]).map((l) => ({
      id: l.id,
      name: l.name,
      items: [...l.list_items].sort((a, b) => a.position - b.position).map(({ id, label, quantity, checked }) => ({ id, label, quantity, checked })),
    })),
    words: words ?? [],
    wordsTotal: wordsTotal ?? words?.length ?? 0,
    projects: (projects ?? []).map((p) => {
      const own = (projectTasks ?? []).filter((t) => t.project_id === p.id);
      return { id: p.id, name: p.name, color: p.color ?? "#b05538", total: own.length, done: own.filter((t) => t.status === "done").length };
    }),
    recipes: ((recipes ?? []) as { id: string; name: string; category: string | null; image_url: string | null; is_favorite: boolean; recipe_items: { count: number }[] }[]).map((r) => ({
      id: r.id,
      name: r.name,
      category: r.category,
      image_url: r.image_url,
      is_favorite: r.is_favorite,
      items: r.recipe_items?.[0]?.count ?? 0,
    })),
  };
}

export async function loadWidgetLayout(page: WidgetPage): Promise<WidgetItem[]> {
  const ctx = await getAppContext();
  const layouts = (ctx?.profile as { widget_layouts?: Record<string, unknown> } | null)?.widget_layouts ?? {};
  return layouts[page] === undefined ? sanitizeLayout(undefined, page) : sanitizeLayout(layouts[page], page);
}
