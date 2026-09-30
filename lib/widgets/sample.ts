import { addDays, type FinOp } from "@/lib/finance-engine";
import type { WidgetData } from "@/lib/data/widgets";

/** Données fictives pour les aperçus du panneau « Ajouter un widget » : jamais lues ni écrites en base. */
export function sampleWidgetData(today: string): WidgetData {
  const op = (id: string, name: string, kind: FinOp["kind"], amount: number, day: number, category: string): FinOp => ({
    id, table: kind === "income" ? "income" : "charge", kind, name, amount, category, frequency: "monthly", interval: 1,
    weekdays: [], monthDays: [day], start: addDays(today, -200), end: null, skipped: [], active: true, note: null, account: "Courant",
  });
  const monday = addDays(today, -((new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7));
  const stamp = `${addDays(today, -30)}T08:00:00Z`;
  const task = (id: string, title: string, off: number, project: string | null, status: "todo" | "done" = "todo", time: string | null = null) => ({
    id, household_id: "x", project_id: project, title, description: null, priority: "medium" as const, status, due_date: addDays(today, off),
    due_time: time, assigned_to: null, created_by: null, created_at: stamp, completed_at: status === "done" ? stamp : null,
  });
  const routine = (id: string, title: string, days: number[]) => ({
    id, household_id: "x", user_id: null, title, category: null, color: "#10b981", frequency: (days.length === 7 ? "daily" : "weekly") as "daily" | "weekly",
    days_of_week: days, active: true, created_at: stamp,
  });
  const routines = [routine("r1", "Salle de sport", [1, 3, 5]), routine("r2", "Lecture 20 min", [0, 1, 2, 3, 4, 5, 6]), routine("r3", "Méditation", [0, 1, 2, 3, 4, 5, 6])];
  const logs = routines.flatMap((r, ri) =>
    Array.from({ length: 21 }, (_, i) => ({ d: addDays(today, -i - 1), i })).filter(({ i }) => (i + ri) % 4 !== 3).map(({ d }, k) => ({ id: `${r.id}${k}`, routine_id: r.id, user_id: null, log_date: d, done: true }))
  );
  const acc = (balance: number) => ({ date: today, balance });
  return {
    today,
    finance: {
      ops: [
        op("o1", "Salaire", "income", 2100, 28, "Salaire"),
        op("o2", "Loyer", "fixed", 720, 3, "Logement"),
        op("o3", "Électricité", "fixed", 64, 12, "Énergie"),
        op("o4", "Abonnement salle", "fixed", 29, 8, "Sport"),
        op("o5", "Courses", "variable", 90, 15, "Courses"),
        op("o6", "Épargne", "savings", 200, 29, "Épargne"),
      ],
      anchor: { balance: 1480, date: today },
      accounts: { Courant: acc(1480), Épargne: acc(5200), Investissement: acc(2300) },
    },
    tasks: [
      task("t1", "Rendez-vous dentiste", 0, "p1", "todo", "14:30"),
      task("t2", "Envoyer le devis", 1, "p1"),
      task("t3", "Réserver le week-end", 2, "p2"),
      task("t4", "Appeler la banque", -1, null),
      task("t5", "Ranger le bureau", 4, null),
      task("t6", "Payer l'assurance", -2, null, "done"),
    ],
    routines,
    logs,
    lists: [
      {
        id: "l1", name: "Courses de la semaine", type: "shopping", store: "Carrefour", archived: false, date: today, weekStart: null, amount: 42.5,
        items: [["Pâtes", "500 g"], ["Tomates", "6"], ["Poulet", "1 kg"], ["Yaourts", "8"], ["Pain", null]].map(([label, quantity], i) => ({ id: `i${i}`, label: label as string, quantity: quantity as string | null, checked: i < 2 })),
        recipes: [{ name: "Poulet rôti", icon: "🍗", count: 1 }, { name: "Pâtes tomate", icon: "🍝", count: 2 }],
      },
    ],
    menu: [
      { id: "m1", name: "Poulet rôti", icon: "🍗", weekStart: monday },
      { id: "m2", name: "Pâtes tomate", icon: "🍝", weekStart: monday },
    ],
    myRecipes: [],
    notes: [
      { id: "n1", title: "Idées de voyage", icon: "✈️", search: "Lisbonne, Porto, road trip en Algarve au printemps…", updated_at: stamp },
      { id: "n2", title: "Compte rendu réunion", icon: "💼", search: "Points clés : budget validé, prochaine étape lundi.", updated_at: stamp },
      { id: "n3", title: "Recettes à tester", icon: "🍳", search: "Curry de pois chiches, gratin dauphinois…", updated_at: stamp },
    ],
    words: [
      { id: "w1", french: "Bonjour", english: "Hello", created_at: stamp },
      { id: "w2", french: "Merci", english: "Thank you", created_at: stamp },
      { id: "w3", french: "Maison", english: "House", created_at: stamp },
    ],
    wordsTotal: 42,
    projects: [
      { id: "p1", name: "Travail", color: "#8b5cf6", total: 8, done: 5 },
      { id: "p2", name: "Vacances", color: "#0ea5e9", total: 5, done: 1 },
    ],
  };
}
