import type { IconName } from "@/components/app/icons";

export type WidgetSize = "s" | "m" | "l" | "xl";
export type WidgetSection = "finance" | "tasks" | "routines" | "calendar" | "courses" | "notes";
export type WidgetPage = "dashboard" | "finance" | "tasks" | "courses" | "notes";

export type WidgetType =
  | "fin-accounts"
  | "fin-reste"
  | "fin-calendar"
  | "fin-breakdown"
  | "fin-budgets"
  | "fin-incomes"
  | "fin-charges"
  | "fin-trend"
  | "fin-actions"
  | "tasks-list"
  | "tasks-stat"
  | "projects"
  | "lists-overview"
  | "recipes-mine"
  | "vocab-stats"
  | "vocab-quiz"
  | "routines-today"
  | "routines-week"
  | "cal-agenda"
  | "cal-week"
  | "lists-shopping"
  | "recipes-ideas"
  | "notes-vocab";

export type WidgetOpts = Record<string, string | boolean>;

export interface WidgetItem {
  id: string;
  type: WidgetType;
  size: WidgetSize;
  opts?: WidgetOpts;
}

export interface WidgetDef {
  type: WidgetType;
  section: WidgetSection;
  title: string;
  description: string;
  icon: IconName;
  sizes: WidgetSize[];
  defaultSize: WidgetSize;
  /** Occupe deux rangées quand il est large (calendriers). */
  tall?: boolean;
}

export const SECTIONS: { key: WidgetSection; label: string; icon: IconName }[] = [
  { key: "finance", label: "Finance", icon: "wallet" },
  { key: "calendar", label: "Calendrier", icon: "calendar" },
  { key: "tasks", label: "Tâches", icon: "tasks" },
  { key: "routines", label: "Routines", icon: "repeat" },
  { key: "courses", label: "Courses", icon: "cart" },
  { key: "notes", label: "Notes", icon: "notes" },
];

export const SIZE_LABEL: Record<WidgetSize, string> = { s: "Petit", m: "Moyen", l: "Large", xl: "Pleine largeur" };

export const WIDGETS: WidgetDef[] = [
  { type: "fin-accounts", section: "finance", title: "Situation des comptes", description: "Courant, épargne et solde total, modifiables en un clic.", icon: "bank", sizes: ["m", "l", "xl"], defaultSize: "l" },
  { type: "fin-reste", section: "finance", title: "Reste à vivre", description: "Ce qu'il te reste ce mois-ci, par jour et en % du budget.", icon: "target", sizes: ["s", "m"], defaultSize: "s" },
  { type: "fin-calendar", section: "finance", title: "Calendrier financier", description: "Revenus, dépenses et solde jour par jour, avec le détail d'une journée.", icon: "calendar", sizes: ["m", "l", "xl"], defaultSize: "l", tall: true },
  { type: "fin-breakdown", section: "finance", title: "Répartition du mois", description: "Camembert des charges, dépenses et épargne du mois.", icon: "pie", sizes: ["s", "m"], defaultSize: "s" },
  { type: "fin-budgets", section: "finance", title: "Budgets", description: "Dépenses variables consommées par catégorie.", icon: "chart", sizes: ["s", "m"], defaultSize: "s" },
  { type: "fin-incomes", section: "finance", title: "Revenus à venir", description: "Tes prochaines rentrées d'argent.", icon: "arrowIn", sizes: ["s", "m"], defaultSize: "s" },
  { type: "fin-charges", section: "finance", title: "Charges à venir", description: "Loyer, abonnements, factures : les prochaines sorties.", icon: "arrowOut", sizes: ["s", "m"], defaultSize: "s" },
  { type: "fin-trend", section: "finance", title: "Évolution du solde", description: "Courbe du solde prévu sur le mois.", icon: "trend", sizes: ["s", "m", "l", "xl"], defaultSize: "m" },
  { type: "fin-actions", section: "finance", title: "Actions rapides", description: "Ajouter une opération, mettre à jour un solde, gérer tes comptes.", icon: "bolt", sizes: ["s", "m"], defaultSize: "s" },
  { type: "cal-agenda", section: "calendar", title: "Calendrier", description: "Tâches, routines et flux d'argent réunis, avec filtres.", icon: "calendar", sizes: ["m", "l", "xl"], defaultSize: "l", tall: true },
  { type: "cal-week", section: "calendar", title: "Cette semaine", description: "Les 7 prochains jours d'un coup d'œil.", icon: "list", sizes: ["m", "l", "xl"], defaultSize: "m" },
  { type: "tasks-list", section: "tasks", title: "Tâches prioritaires", description: "Tes tâches en cours, à cocher directement.", icon: "tasks", sizes: ["s", "m", "l"], defaultSize: "m" },
  { type: "tasks-stat", section: "tasks", title: "Compteur de tâches", description: "Tâches en cours et en retard.", icon: "tasks", sizes: ["s"], defaultSize: "s" },
  { type: "projects", section: "tasks", title: "Projets", description: "Avancement de chaque projet, en tâches terminées.", icon: "target", sizes: ["s", "m", "l"], defaultSize: "m" },
  { type: "routines-today", section: "routines", title: "Routines du jour", description: "Coche tes routines d'aujourd'hui.", icon: "repeat", sizes: ["s", "m"], defaultSize: "s" },
  { type: "routines-week", section: "routines", title: "Progression des routines", description: "Taux de réalisation sur les 7 derniers jours.", icon: "chart", sizes: ["m", "l"], defaultSize: "m" },
  { type: "lists-shopping", section: "courses", title: "Liste de courses", description: "Les articles qu'il reste à acheter.", icon: "cart", sizes: ["s", "m"], defaultSize: "s" },
  { type: "lists-overview", section: "courses", title: "Mes listes", description: "Toutes tes listes en cours et leur progression.", icon: "list", sizes: ["s", "m"], defaultSize: "s" },
  { type: "recipes-mine", section: "courses", title: "Mes recettes", description: "Tes recettes enregistrées, favorites en premier.", icon: "chef", sizes: ["m", "l", "xl"], defaultSize: "m" },
  { type: "recipes-ideas", section: "courses", title: "Idées de recettes", description: "Une sélection de recettes qui change chaque jour.", icon: "chef", sizes: ["m", "l", "xl"], defaultSize: "m" },
  { type: "vocab-stats", section: "notes", title: "Compteur de mots", description: "Nombre de mots appris, au total et cette semaine.", icon: "chart", sizes: ["s"], defaultSize: "s" },
  { type: "vocab-quiz", section: "notes", title: "Révision éclair", description: "Une carte à retourner pour réviser ton vocabulaire.", icon: "book", sizes: ["s", "m"], defaultSize: "m" },
  { type: "notes-vocab", section: "notes", title: "Vocabulaire récent", description: "Tes derniers mots enregistrés.", icon: "book", sizes: ["s", "m"], defaultSize: "s" },
];

export const WIDGET_BY_TYPE = Object.fromEntries(WIDGETS.map((w) => [w.type, w])) as Record<WidgetType, WidgetDef>;

export const PAGE_SECTIONS: Record<WidgetPage, WidgetSection[]> = {
  dashboard: ["finance", "calendar", "tasks", "routines", "courses", "notes"],
  finance: ["finance"],
  tasks: ["tasks", "routines", "calendar"],
  courses: ["courses"],
  notes: ["notes"],
};

const item = (type: WidgetType, size: WidgetSize, opts?: WidgetOpts): WidgetItem => ({ id: type, type, size, ...(opts ? { opts } : {}) });

export const DEFAULT_LAYOUTS = {
  dashboard: [
    item("cal-week", "l"),
    item("fin-reste", "s"),
    item("tasks-list", "m"),
    item("routines-today", "s"),
    item("lists-shopping", "s"),
    item("cal-agenda", "l"),
    item("fin-breakdown", "s"),
    item("notes-vocab", "s"),
    item("recipes-ideas", "xl"),
  ],
  finance: [
    item("fin-accounts", "l"),
    item("fin-reste", "s"),
    item("fin-calendar", "l"),
    item("fin-breakdown", "s"),
    item("fin-budgets", "s"),
    item("fin-incomes", "s"),
    item("fin-charges", "s"),
    item("fin-trend", "s"),
    item("fin-actions", "s"),
  ],
} as Record<WidgetPage, WidgetItem[]>;

DEFAULT_LAYOUTS.tasks = [
  item("tasks-stat", "s"),
  item("routines-today", "s"),
  item("projects", "m"),
  item("tasks-list", "m"),
  item("routines-week", "m"),
  item("cal-week", "xl"),
];
DEFAULT_LAYOUTS.courses = [
  item("lists-shopping", "s"),
  item("lists-overview", "s"),
  item("recipes-mine", "m"),
  item("recipes-ideas", "xl"),
];
DEFAULT_LAYOUTS.notes = [
  item("vocab-stats", "s"),
  item("vocab-quiz", "m"),
  item("notes-vocab", "s"),
];

/** Nettoie une disposition venue de la base : types inconnus retirés, tailles ramenées à une taille permise. */
export function sanitizeLayout(raw: unknown, page: WidgetPage): WidgetItem[] {
  if (!Array.isArray(raw)) return DEFAULT_LAYOUTS[page];
  const allowed = new Set(PAGE_SECTIONS[page]);
  const out: WidgetItem[] = [];
  const seen = new Set<string>();
  for (const r of raw) {
    const def = r && WIDGET_BY_TYPE[r.type as WidgetType];
    if (!def || !allowed.has(def.section) || typeof r.id !== "string" || seen.has(r.id)) continue;
    seen.add(r.id);
    out.push({ id: r.id, type: def.type, size: def.sizes.includes(r.size) ? r.size : def.defaultSize, opts: r.opts && typeof r.opts === "object" ? r.opts : undefined });
  }
  return out;
}

/** Classes de grille (1 col mobile, 2 cols tablette, 4 cols bureau). */
export function spanClass(size: WidgetSize, tall?: boolean) {
  const base = { s: "col-span-1", m: "sm:col-span-2", l: "sm:col-span-2 xl:col-span-3", xl: "sm:col-span-2 xl:col-span-4" }[size];
  return tall && (size === "l" || size === "xl") ? `${base} xl:row-span-2` : base;
}
