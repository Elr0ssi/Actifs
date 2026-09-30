import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Project, Task, Routine, RoutineLog } from "@/lib/types";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { toggleTaskStatus, toggleRoutineLog } from "@/app/app/actions";
import { createProject, createTask, deleteTask } from "@/app/app/tasks/actions";
import { todayISO, cx } from "@/lib/utils";

export const metadata: Metadata = { title: "Tâches & projets" };

const PRIORITY_LABEL: Record<string, string> = { high: "Haute", medium: "Moyenne", low: "Basse" };
const PRIORITY_DOT: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-stone-300" };

export default async function TasksPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";
  const today = todayISO();
  const weekday = new Date(`${today}T00:00:00Z`).getUTCDay();

  const [{ data: projects }, { data: tasks }, { data: routines }, { data: logs }] = await Promise.all([
    supabase.from("projects").select("*").eq("household_id", householdId).eq("archived", false).order("created_at").returns<Project[]>(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .order("status", { ascending: true })
      .order("priority", { ascending: false })
      .returns<Task[]>(),
    supabase.from("routines").select("*").eq("household_id", householdId).eq("active", true).returns<Routine[]>(),
    supabase.from("routine_logs").select("*").eq("log_date", today).returns<RoutineLog[]>(),
  ]);

  const allTasks = tasks ?? [];
  const groups: { project: Project | null; tasks: Task[] }[] = [
    { project: null, tasks: allTasks.filter((t) => !t.project_id) },
    ...(projects ?? []).map((p) => ({ project: p, tasks: allTasks.filter((t) => t.project_id === p.id) })),
  ];

  // Une tâche non faite dont l'échéance est passée se reporte automatiquement à aujourd'hui —
  // sans jamais réécrire sa date, juste à l'affichage.
  const dueToday = allTasks.filter((t) => t.status !== "done" && t.due_date === today).sort((a, b) => (a.due_time ?? "99:99").localeCompare(b.due_time ?? "99:99"));
  const overdue = allTasks.filter((t) => t.status !== "done" && t.due_date && t.due_date < today);
  const todayRoutines = (routines ?? []).filter((r) => r.frequency === "daily" || (r.frequency === "weekly" && r.days_of_week?.includes(weekday)));
  const doneRoutineIds = new Set((logs ?? []).filter((l) => l.done).map((l) => l.routine_id));

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-stone-900">Aujourd'hui</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Tâches</p>
            {dueToday.length === 0 && overdue.length === 0 && <p className="text-sm text-stone-400">Rien de prévu aujourd'hui.</p>}
            <div className="space-y-1.5">
              {overdue.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <ToggleCheckbox initialChecked={false} onToggle={toggleTaskStatus.bind(null, t.id)} label={t.title} />
                  </div>
                  <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">reportée</span>
                  <span className={cx("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[t.priority])} title={PRIORITY_LABEL[t.priority]} />
                </div>
              ))}
              {dueToday.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <ToggleCheckbox initialChecked={false} onToggle={toggleTaskStatus.bind(null, t.id)} label={t.title} sublabel={t.due_time ?? undefined} />
                  </div>
                  <span className={cx("h-2 w-2 shrink-0 rounded-full", PRIORITY_DOT[t.priority])} title={PRIORITY_LABEL[t.priority]} />
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Routines</p>
            {todayRoutines.length === 0 && <p className="text-sm text-stone-400">Aucune routine aujourd'hui.</p>}
            <div className="space-y-1.5">
              {todayRoutines.map((r) => (
                <ToggleCheckbox
                  key={r.id}
                  initialChecked={doneRoutineIds.has(r.id)}
                  onToggle={toggleRoutineLog.bind(null, r.id, today)}
                  label={r.title}
                  sublabel={r.category ?? undefined}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-stone-700">Nouveau projet</h2>
        <form action={createProject} className="flex flex-wrap items-center gap-2">
          <input name="icon" defaultValue="📁" className="input w-16 text-center" maxLength={2} />
          <input name="name" placeholder="Ex. Création boîte" className="input flex-1 min-w-[180px]" required />
          <input name="color" type="color" defaultValue="#8b5cf6" className="h-11 w-14 rounded-xl border border-stone-200" />
          <button className="btn-primary">Créer</button>
        </form>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.project?.id ?? "none"} className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">{g.project?.icon ?? "📌"}</span>
              <h2 className="font-semibold text-stone-900">{g.project?.name ?? "Sans projet"}</h2>
              <span className="ml-auto text-xs text-stone-400">{g.tasks.filter((t) => t.status !== "done").length} en cours</span>
            </div>

            <div className="space-y-1">
              {g.tasks.length === 0 && <p className="text-sm text-stone-400">Aucune tâche.</p>}
              {g.tasks.map((t) => {
                const isOverdue = t.status !== "done" && t.due_date && t.due_date < today;
                return (
                  <div key={t.id} className="flex items-center gap-2">
                    <div className="flex-1">
                      <ToggleCheckbox
                        initialChecked={t.status === "done"}
                        onToggle={toggleTaskStatus.bind(null, t.id)}
                        label={t.title}
                        sublabel={[t.due_date, t.due_time].filter(Boolean).join(" ") || undefined}
                      />
                    </div>
                    {isOverdue && <span className="rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">reportée</span>}
                    <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[t.priority]}`} title={PRIORITY_LABEL[t.priority]} />
                    <form action={deleteTask.bind(null, t.id)}>
                      <button className="rounded-lg px-2 py-1 text-xs text-stone-400 hover:bg-stone-100 hover:text-rose-600">✕</button>
                    </form>
                  </div>
                );
              })}
            </div>

            <form action={createTask} className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
              <input type="hidden" name="project_id" value={g.project?.id ?? ""} />
              <input name="title" placeholder="Nouvelle tâche…" className="input flex-1 min-w-[160px]" required />
              <select name="priority" defaultValue="medium" className="input w-32">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              <input name="due_date" type="date" className="input w-40" />
              <input name="due_time" type="time" className="input w-28" title="Heure (optionnel)" />
              <button className="btn-secondary">Ajouter</button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
