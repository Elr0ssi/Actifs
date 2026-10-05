import { getAppContext } from "@/lib/data/context";
import { loadFinanceData, type AccountName } from "@/lib/data/finance";
import { addDays, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";
import { sanitizeLayout, type WidgetItem, type WidgetPage } from "@/lib/widgets/registry";
import type { Routine, RoutineLog, Task } from "@/lib/types";

export interface WidgetList {
  id: string;
  name: string;
  type: string;
  store: string | null;
  archived: boolean;
  /** Début de semaine de la liste si renseigné, sinon date de création : sert à la ranger dans un mois. */
  date: string;
  weekStart: string | null;
  /** Total estimé des articles chiffrés (prix × quantité). */
  amount: number;
  items: { id: string; label: string; quantity: string | null; checked: boolean }[];
  recipes: { name: string; icon: string | null; count: number }[];
}

export interface WidgetData {
  /** Date de référence des widgets. Sur la vue d'ensemble Finance, elle suit le mois choisi. */
  today: string;
  /** Vraie date du jour quand `today` a été déplacée pour consulter un autre mois. */
  realToday?: string;
  finance: {
    ops: FinOp[];
    anchor: BalanceAnchor;
    accounts: Record<AccountName, { date: string; balance: number } | null>;
  } | null;
  tasks: Task[];
  routines: Routine[];
  logs: RoutineLog[];
  lists: WidgetList[];
  /** Menu de la semaine saisi à la main (en plus des recettes des listes de courses de la semaine). */
  menu: { id: string; name: string; icon: string | null; day: string; servings: number | null; slot?: "midi" | "soir" | null }[];
  /** Nombre de personnes proposé par défaut (réglé pour le foyer). */
  defaultServings: number;
  myRecipes: { name: string; category: string | null; image_url: string | null; servings: number; notes: string | null; items: { label: string; quantity: string | null; qty: number | null; unit: string | null }[] }[];
  notes: { id: string; title: string; icon: string | null; search: string; updated_at: string }[];
  words: { id: string; french: string; english: string; created_at: string }[];
  wordsTotal: number;
  projects: { id: string; name: string; color: string; total: number; done: number }[];
}

type Client = NonNullable<Awaited<ReturnType<typeof getAppContext>>>["supabase"];

const PAGE = 1000;

/** PostgREST plafonne à 1000 lignes par réponse : on récupère les pages suivantes en parallèle. */
async function loadLogs(supabase: Client, from: string, to: string): Promise<RoutineLog[]> {
  const query = () => supabase.from("routine_logs").select("*", { count: "exact" }).gte("log_date", from).lte("log_date", to).order("log_date");
  const first = await query().range(0, PAGE - 1);
  const rows = [...((first.data ?? []) as RoutineLog[])];
  const total = first.count ?? rows.length;
  if (total > PAGE) {
    const extra = Math.min(4, Math.ceil((total - PAGE) / PAGE));
    const pages = await Promise.all(Array.from({ length: extra }, (_, i) => query().range(PAGE * (i + 1), PAGE * (i + 2) - 1)));
    for (const p of pages) rows.push(...((p.data ?? []) as RoutineLog[]));
  }
  return rows;
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
  const weekStart = addDays(today, -((new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7));

  const [finance, { data: tasks }, { data: routines }, logs, { data: lists }, { data: words, count: wordsTotal }, { data: projects }, { data: projectTasks }, { data: notes }, { data: menu }, { data: myRecipes }] = await Promise.all([
    loadFinanceData(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .or(`status.neq.done,and(due_date.gte.${from},due_date.lte.${to}),completed_at.gte.${from}T00:00:00Z`)
      .order("due_date", { ascending: true, nullsFirst: false })
      .limit(500)
      .returns<Task[]>(),
    supabase.from("routines").select("*").eq("household_id", householdId).eq("active", true).returns<Routine[]>(),
    loadLogs(supabase, addDays(today, -800), today),
    supabase
      .from("lists")
      .select("id, name, type, store, week_start, archived, created_at, list_items(id, label, quantity, checked, price, count, position), list_recipes(name, icon, count)")
      .eq("household_id", householdId)
      .neq("type", "recipe")
      .or(`archived.eq.false,created_at.gte.${addDays(today, -120)}T00:00:00Z`)
      .order("created_at", { ascending: false })
      .limit(60),
    supabase.from("vocab_words").select("id, french, english, created_at", { count: "exact" }).eq("household_id", householdId).order("created_at", { ascending: false }).limit(200),
    supabase.from("projects").select("id, name, color").eq("household_id", householdId).eq("archived", false).order("created_at"),
    supabase.from("tasks").select("project_id, status").eq("household_id", householdId).not("project_id", "is", null),
    supabase.from("notes").select("id, title, icon, search, updated_at").eq("household_id", householdId).order("updated_at", { ascending: false }).limit(8),
    supabase.from("menu_items").select("id, name, icon, day, servings, slot").eq("household_id", householdId).gte("day", addDays(weekStart, -14)).lte("day", addDays(weekStart, 42)).order("created_at"),
    supabase.from("recipes").select("name, category, image_url, servings, notes, recipe_items(label, quantity, qty, qty_unit, position)").eq("household_id", householdId).order("name").limit(300),
  ]);

  type ListRow = {
    id: string;
    name: string;
    type: string;
    store: string | null;
    week_start: string | null;
    archived: boolean;
    created_at: string;
    list_items: { id: string; label: string; quantity: string | null; checked: boolean; price: number | null; count: number | null; position: number }[];
    list_recipes: { name: string; icon: string | null; count: number }[];
  };

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
    logs,
    lists: ((lists ?? []) as ListRow[]).map((l) => ({
      id: l.id,
      name: l.name,
      type: l.type,
      store: l.store,
      archived: l.archived,
      weekStart: l.week_start,
      date: l.week_start ?? l.created_at.slice(0, 10),
      amount: l.list_items.reduce((s, i) => s + (i.price !== null ? Number(i.price) * (i.count || 1) : 0), 0),
      items: [...l.list_items].sort((a, b) => a.position - b.position).map(({ id, label, quantity, checked }) => ({ id, label, quantity, checked })),
      recipes: l.list_recipes ?? [],
    })),
    menu: (menu ?? []).filter((m) => m.day).map((m) => ({ id: m.id, name: m.name, icon: m.icon, day: m.day as string, servings: m.servings ?? null, slot: (m.slot as "midi" | "soir" | null) ?? null })),
    defaultServings: (ctx.household as { default_servings?: number } | null)?.default_servings ?? 2,
    myRecipes: (myRecipes ?? []).map((r) => ({
      name: r.name,
      category: r.category,
      image_url: r.image_url,
      servings: r.servings ?? 4,
      notes: r.notes,
      items: [...((r.recipe_items ?? []) as { label: string; quantity: string | null; qty: number | null; qty_unit: string | null; position: number }[])].sort((a, b) => a.position - b.position).map(({ label, quantity, qty, qty_unit }) => ({ label, quantity, qty: qty === null ? null : Number(qty), unit: qty_unit })),
    })),
    notes: (notes ?? []).map((n) => ({ ...n, search: n.search.slice(0, 160) })),
    words: words ?? [],
    wordsTotal: wordsTotal ?? words?.length ?? 0,
    projects: (projects ?? []).map((p) => {
      const own = (projectTasks ?? []).filter((t) => t.project_id === p.id);
      return { id: p.id, name: p.name, color: p.color ?? "#8b5cf6", total: own.length, done: own.filter((t) => t.status === "done").length };
    }),
  };
}

export async function loadWidgetLayout(page: WidgetPage): Promise<WidgetItem[]> {
  const ctx = await getAppContext();
  const layouts = (ctx?.profile as { widget_layouts?: Record<string, unknown> } | null)?.widget_layouts ?? {};
  return layouts[page] === undefined ? sanitizeLayout(undefined, page) : sanitizeLayout(layouts[page], page);
}
