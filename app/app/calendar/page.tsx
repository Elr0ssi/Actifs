import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Routine, RoutineLog, Task, RecurringCharge, Income } from "@/lib/types";
import { CalendarClient } from "@/components/app/calendar-client";
import { createRoutine, deleteRoutine } from "@/app/app/calendar/actions";
import { WEEKDAYS_FR } from "@/lib/utils";

export const metadata: Metadata = { title: "Calendrier" };

function monthRange(monthParam?: string) {
  const now = monthParam ? new Date(`${monthParam}-01T00:00:00`) : new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  return { year, month, start, end, iso: `${year}-${String(month + 1).padStart(2, "0")}` };
}

export default async function CalendarPage({ searchParams }: { searchParams: { month?: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const { year, month, start, end, iso } = monthRange(searchParams.month);
  const startISO = start.toISOString().slice(0, 10);
  const endISO = end.toISOString().slice(0, 10);

  const [{ data: routines }, { data: logs }, { data: tasks }, { data: charges }, { data: incomes }] = await Promise.all([
    supabase.from("routines").select("*").eq("household_id", householdId).eq("active", true).returns<Routine[]>(),
    supabase.from("routine_logs").select("*").gte("log_date", startISO).lte("log_date", endISO).returns<RoutineLog[]>(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .gte("due_date", startISO)
      .lte("due_date", endISO)
      .returns<Task[]>(),
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).eq("active", true).returns<RecurringCharge[]>(),
    supabase.from("incomes").select("*").eq("household_id", householdId).returns<Income[]>(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendrier</h1>
        <p className="mt-1 text-sm text-slate-500">Routines, tâches et échéances financières, tout au même endroit.</p>
      </div>
      <CalendarClient
        year={year}
        month={month}
        monthIso={iso}
        routines={routines ?? []}
        logs={logs ?? []}
        tasks={tasks ?? []}
        charges={charges ?? []}
        incomes={incomes ?? []}
      />

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Mes routines</h2>
        <form action={createRoutine} className="mb-5 flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Titre</label>
            <input name="title" placeholder="Ex. Séance de sport" className="input mt-1 w-56" required />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <input name="category" placeholder="Sport, Projet…" className="input mt-1 w-40" />
          </div>
          <div>
            <label className="label">Fréquence</label>
            <select name="frequency" className="input mt-1 w-36" defaultValue="daily">
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS_FR.map((d, i) => (
              <label key={d} className="flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs">
                <input type="checkbox" name="days" value={i} className="h-3 w-3" /> {d}
              </label>
            ))}
          </div>
          <button className="btn-primary">Créer</button>
        </form>
        <ul className="space-y-2">
          {(routines ?? []).map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-slate-800">{r.title}</span>
                <span className="ml-2 text-xs text-slate-400">
                  {r.category} · {r.frequency === "daily" ? "Quotidienne" : "Hebdo"}
                </span>
              </span>
              <form action={deleteRoutine.bind(null, r.id)}>
                <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
