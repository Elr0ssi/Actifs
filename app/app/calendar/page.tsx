import type { Metadata } from "next";
import Link from "next/link";
import { getAppContext } from "@/lib/data/context";
import type { Routine, RoutineLog, Task } from "@/lib/types";
import { CalendarClient } from "@/components/app/calendar-client";

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

  const [{ data: routines }, { data: logs }, { data: tasks }] = await Promise.all([
    supabase.from("routines").select("*").eq("household_id", householdId).eq("active", true).returns<Routine[]>(),
    supabase.from("routine_logs").select("*").gte("log_date", startISO).lte("log_date", endISO).returns<RoutineLog[]>(),
    supabase
      .from("tasks")
      .select("*")
      .eq("household_id", householdId)
      .gte("due_date", startISO)
      .lte("due_date", endISO)
      .returns<Task[]>(),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Calendrier</h1>
          <p className="mt-1 text-sm text-stone-500">Routines et tâches, tout au même endroit — les finances vivent dans Finance.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/tasks/routines" className="btn-secondary">🔁 Gérer mes routines</Link>
          <Link href="/app/tasks/list" className="btn-secondary">✅ Gérer mes tâches</Link>
        </div>
      </div>
      <CalendarClient
        year={year}
        month={month}
        monthIso={iso}
        routines={routines ?? []}
        logs={logs ?? []}
        tasks={tasks ?? []}
      />
    </div>
  );
}
