import Link from "next/link";
import { expand, monthBounds, type FinOp } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import type { Routine, RoutineLog, Task } from "@/lib/types";

const DOW = ["L", "M", "M", "J", "V", "S", "D"];

/**
 * Mini calendrier du mois sur le tableau de bord : un coup d'œil sur tâches, routines et flux
 * financiers du jour, tous connectés — clique un jour pour aller au calendrier détaillé.
 */
export function DashboardCalendar({
  year,
  month,
  today,
  tasks,
  routines,
  logs,
  ops,
}: {
  year: number;
  month: number;
  today: string;
  tasks: Task[];
  routines: Routine[];
  logs: RoutineLog[];
  ops: FinOp[];
}) {
  const { start, end } = monthBounds(year, month);
  const firstWeekday = (new Date(`${start}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days: (string | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = start; d <= end; ) {
    days.push(d);
    const next = new Date(`${d}T00:00:00Z`);
    next.setUTCDate(next.getUTCDate() + 1);
    d = next.toISOString().slice(0, 10);
  }

  const logsByRoutineDate = new Map(logs.map((l) => [`${l.routine_id}_${l.log_date}`, l.done]));
  const financeByDate = new Map<string, { in: number; out: number }>();
  for (const o of expand(ops, start, end)) {
    const e = financeByDate.get(o.date) ?? { in: 0, out: 0 };
    if (o.signed > 0) e.in += o.signed;
    else e.out += -o.signed;
    financeByDate.set(o.date, e);
  }

  function routinesForDate(dateISO: string) {
    const weekday = new Date(`${dateISO}T00:00:00Z`).getUTCDay();
    return routines.filter((r) => r.frequency === "daily" || (r.frequency === "weekly" && r.days_of_week?.includes(weekday)));
  }

  return (
    <div className="card p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Mon mois</h2>
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />Routines</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" />Tâches</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-rose-400" />Finance</span>
          <Link href="/app/calendar" className="font-medium text-brand-600">Voir tout →</Link>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const dayRoutines = routinesForDate(d);
          const doneCount = dayRoutines.filter((r) => logsByRoutineDate.get(`${r.id}_${d}`)).length;
          const taskCount = tasks.filter((t) => t.due_date === d).length;
          const flow = financeByDate.get(d);
          return (
            <Link
              key={d}
              href={`/app/calendar?month=${year}-${String(month + 1).padStart(2, "0")}`}
              className={cx(
                "flex aspect-square flex-col items-center justify-center gap-0.5 rounded-lg text-[11px] transition hover:bg-slate-50",
                d === today && "bg-brand-50 font-semibold text-brand-700 ring-1 ring-brand-300"
              )}
            >
              <span>{Number(d.slice(-2))}</span>
              <span className="flex gap-0.5">
                {dayRoutines.length > 0 && <span className={cx("h-1.5 w-1.5 rounded-full", doneCount === dayRoutines.length ? "bg-emerald-500" : "bg-emerald-200")} />}
                {taskCount > 0 && <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />}
                {flow && (flow.in > 0 || flow.out > 0) && <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
