import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Project, Task } from "@/lib/types";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { toggleTaskStatus } from "@/app/app/actions";
import { createProject, createTask, deleteTask } from "@/app/app/tasks/actions";

export const metadata: Metadata = { title: "Tâches & projets" };

const PRIORITY_LABEL: Record<string, string> = { high: "Haute", medium: "Moyenne", low: "Basse" };
const PRIORITY_DOT: Record<string, string> = { high: "bg-rose-500", medium: "bg-amber-500", low: "bg-slate-300" };

export default async function TasksPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: projects }, { data: tasks }] = await Promise.all([
    supabase.from("projects").select("*").eq("household_id", householdId).eq("archived", false).order("created_at").returns<Project[]>(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .order("status", { ascending: true })
      .order("priority", { ascending: false })
      .returns<Task[]>(),
  ]);

  const groups: { project: Project | null; tasks: Task[] }[] = [
    { project: null, tasks: (tasks ?? []).filter((t) => !t.project_id) },
    ...(projects ?? []).map((p) => ({ project: p, tasks: (tasks ?? []).filter((t) => t.project_id === p.id) })),
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Tâches & projets</h1>
        <p className="mt-1 text-sm text-slate-500">Priorise, regroupe par projet, avance.</p>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouveau projet</h2>
        <form action={createProject} className="flex flex-wrap items-center gap-2">
          <input name="icon" defaultValue="📁" className="input w-16 text-center" maxLength={2} />
          <input name="name" placeholder="Ex. Création boîte" className="input flex-1 min-w-[180px]" required />
          <input name="color" type="color" defaultValue="#4d5dfb" className="h-11 w-14 rounded-xl border border-slate-200" />
          <button className="btn-primary">Créer</button>
        </form>
      </div>

      <div className="space-y-6">
        {groups.map((g) => (
          <section key={g.project?.id ?? "none"} className="card p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="text-xl">{g.project?.icon ?? "📌"}</span>
              <h2 className="font-semibold text-slate-900">{g.project?.name ?? "Sans projet"}</h2>
              <span className="ml-auto text-xs text-slate-400">{g.tasks.filter((t) => t.status !== "done").length} en cours</span>
            </div>

            <div className="space-y-1">
              {g.tasks.length === 0 && <p className="text-sm text-slate-400">Aucune tâche.</p>}
              {g.tasks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <div className="flex-1">
                    <ToggleCheckbox
                      initialChecked={t.status === "done"}
                      onToggle={(checked) => toggleTaskStatus(t.id, checked)}
                      label={t.title}
                      sublabel={t.due_date ?? undefined}
                    />
                  </div>
                  <span className={`h-2 w-2 rounded-full ${PRIORITY_DOT[t.priority]}`} title={PRIORITY_LABEL[t.priority]} />
                  <form action={deleteTask.bind(null, t.id)}>
                    <button className="rounded-lg px-2 py-1 text-xs text-slate-400 hover:bg-slate-100 hover:text-rose-600">✕</button>
                  </form>
                </div>
              ))}
            </div>

            <form action={createTask} className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
              <input type="hidden" name="project_id" value={g.project?.id ?? ""} />
              <input name="title" placeholder="Nouvelle tâche…" className="input flex-1 min-w-[160px]" required />
              <select name="priority" defaultValue="medium" className="input w-32">
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
              </select>
              <input name="due_date" type="date" className="input w-40" />
              <button className="btn-secondary">Ajouter</button>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
