import Link from "next/link";
import { getAppContext } from "@/lib/data/context";
import { formatEUR, todayISO } from "@/lib/utils";
import type { Task, Routine, RoutineLog, RecurringCharge, Income } from "@/lib/types";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";
import { WeekAhead } from "@/components/app/week-ahead";
import { toggleTaskStatus, toggleRoutineLog, quickAddTask } from "@/app/app/actions";
import { monthlyEquivalent } from "@/lib/finance";

export default async function DashboardPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id;
  const today = todayISO();
  const weekday = new Date().getDay();
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndISO = weekEnd.toISOString().slice(0, 10);

  const [{ data: tasks }, { data: routines }, { data: logs }, { data: charges }, { data: incomes }] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId ?? "")
      .neq("status", "done")
      .order("priority", { ascending: false })
      .order("due_date", { ascending: true })
      .limit(8)
      .returns<Task[]>(),
    supabase.from("routines").select("*").eq("household_id", householdId ?? "").eq("active", true).returns<Routine[]>(),
    supabase.from("routine_logs").select("*").eq("log_date", today).returns<RoutineLog[]>(),
    supabase
      .from("recurring_charges")
      .select("*")
      .eq("household_id", householdId ?? "")
      .eq("active", true)
      .order("next_date", { ascending: true })
      .returns<RecurringCharge[]>(),
    supabase
      .from("incomes")
      .select("*")
      .eq("household_id", householdId ?? "")
      .order("expected_date", { ascending: true })
      .returns<Income[]>(),
  ]);

  const todaysRoutines = (routines ?? []).filter(
    (r) => r.frequency === "daily" || (r.frequency === "weekly" && r.days_of_week?.includes(weekday))
  );
  const logByRoutine = new Map((logs ?? []).map((l) => [l.routine_id, l]));

  const chargesRangeLike = (charges ?? []).map((c) => ({ id: c.id, name: c.name, amount: Number(c.amount), next_date: c.next_date, frequency: c.frequency }));
  const incomesRangeLike = (incomes ?? [])
    .filter((i) => i.status !== "received")
    .map((i) => ({ id: i.id, name: i.name, amount: Number(i.amount), next_date: i.expected_date, frequency: i.recurring ? i.frequency : ("once" as const) }));

  const monthlyExpenses = (charges ?? []).reduce((sum, c) => sum + monthlyEquivalent(Number(c.amount), c.frequency), 0);
  const monthlyIncomes = (incomes ?? [])
    .filter((i) => i.recurring)
    .reduce((sum, i) => sum + monthlyEquivalent(Number(i.amount), i.frequency), 0);

  const doneRoutines = todaysRoutines.filter((r) => logByRoutine.get(r.id)?.done).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Bonjour {profile?.display_name || ""} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500">Voici ton point du jour.</p>
        </div>
        <form action={quickAddTask} className="flex gap-2">
          <input name="title" placeholder="Ajouter une tâche rapide…" className="input w-64" />
          <button className="btn-primary">Ajouter</button>
        </form>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Tâches en cours" value={String(tasks?.length ?? 0)} accent="text-brand-600" />
        <StatCard label="Routines du jour" value={`${doneRoutines}/${todaysRoutines.length}`} accent="text-emerald-600" />
        <StatCard label="Charges fixes / mois" value={formatEUR(monthlyExpenses)} accent="text-rose-600" />
        <StatCard label="Revenus fixes / mois" value={formatEUR(monthlyIncomes)} accent="text-emerald-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="card p-6 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Tâches prioritaires</h2>
            <Link href="/app/tasks" className="text-sm font-medium text-brand-600">Tout voir</Link>
          </div>
          <div className="space-y-1">
            {(tasks ?? []).length === 0 && <p className="text-sm text-slate-400">Rien en attente. Profites-en 🎉</p>}
            {(tasks ?? []).map((t) => (
              <ToggleCheckbox
                key={t.id}
                initialChecked={t.status === "done"}
                onToggle={toggleTaskStatus.bind(null, t.id)}
                label={t.title}
                sublabel={t.priority === "high" ? "Priorité haute" : t.due_date ? `Échéance ${t.due_date}` : undefined}
              />
            ))}
          </div>
        </section>

        <section className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900">Routines du jour</h2>
            <Link href="/app/calendar" className="text-sm font-medium text-brand-600">Calendrier</Link>
          </div>
          <div className="space-y-1">
            {todaysRoutines.length === 0 && <p className="text-sm text-slate-400">Aucune routine programmée aujourd'hui.</p>}
            {todaysRoutines.map((r) => (
              <ToggleCheckbox
                key={r.id}
                initialChecked={!!logByRoutine.get(r.id)?.done}
                onToggle={toggleRoutineLog.bind(null, r.id, today)}
                label={r.title}
                sublabel={r.category ?? undefined}
                strikeThrough={false}
              />
            ))}
          </div>
        </section>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Cette semaine</h2>
          <Link href="/app/finance" className="text-sm font-medium text-brand-600">Voir toute la finance</Link>
        </div>
        <WeekAhead
          currentBalance={Number(household?.current_balance ?? 0)}
          charges={chargesRangeLike}
          incomes={incomesRangeLike}
          todayISO={today}
          weekEndISO={weekEndISO}
        />
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="card p-5">
      <p className="label">{label}</p>
      <p className={`mt-2 text-2xl font-bold ${accent}`}>{value}</p>
    </div>
  );
}
