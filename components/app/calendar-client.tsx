"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Routine, RoutineLog, Task } from "@/lib/types";
import { WEEKDAYS_FR, MONTHS_FR, cx, todayISO } from "@/lib/utils";
import { toggleRoutineLog } from "@/app/app/actions";
import { ToggleCheckbox } from "@/components/app/toggle-checkbox";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function shiftMonth(iso: string, delta: number) {
  const [y, m] = iso.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function mondayOf(iso: string) {
  const dow = new Date(`${iso}T00:00:00`).getDay();
  return shiftDate(iso, -((dow + 6) % 7));
}

/** Vue routines & tâches uniquement — pas de rentrées/sorties d'argent, ça vit dans Finance. */
export function CalendarClient({
  year,
  month,
  monthIso,
  routines,
  logs,
  tasks,
}: {
  year: number;
  month: number;
  monthIso: string;
  routines: Routine[];
  logs: RoutineLog[];
  tasks: Task[];
}) {
  const router = useRouter();
  const today = todayISO();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const [selected, setSelected] = useState(() => {
    const t = new Date(today);
    if (t.getFullYear() === year && t.getMonth() === month) return today;
    return `${year}-${pad(month + 1)}-01`;
  });
  const [view, setView] = useState<"month" | "week">("month");

  const logsByRoutineDate = new Map(logs.map((l) => [`${l.routine_id}_${l.log_date}`, l.done]));

  function routinesForDate(dateISO: string) {
    const weekday = new Date(`${dateISO}T00:00:00`).getDay();
    return routines.filter((r) => r.frequency === "daily" || (r.frequency === "weekly" && r.days_of_week?.includes(weekday)));
  }

  const cells: { dateISO: string | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ dateISO: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ dateISO: `${year}-${pad(month + 1)}-${pad(d)}` });

  const selectedRoutines = routinesForDate(selected);
  const selectedTasks = tasks.filter((t) => t.due_date === selected);

  // Cliquer-glisser horizontalement pour changer de mois, comme sur le calendrier Finance.
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef({ active: false, startX: 0, moved: false });
  useEffect(() => {
    const THRESHOLD = 70;
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > THRESHOLD) {
        drag.current.moved = true;
        if (view === "week") {
          setSelected((s) => shiftDate(s, dx < 0 ? 7 : -7));
        } else {
          router.push(`/app/calendar?month=${shiftMonth(monthIso, dx < 0 ? 1 : -1)}`);
        }
        drag.current.startX = e.clientX;
      }
    };
    const onUp = () => {
      drag.current.active = false;
      setGrabbing(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [monthIso, router, view]);
  const onGridMouseDown = (e: React.MouseEvent) => {
    drag.current = { active: true, startX: e.clientX, moved: false };
    setGrabbing(true);
  };
  const onDaySelect = (dateISO: string) => {
    if (drag.current.moved) return;
    setSelected(dateISO);
  };

  const weekStart = mondayOf(selected);
  const weekDays = Array.from({ length: 7 }, (_, i) => shiftDate(weekStart, i));

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between gap-2">
          {view === "month" ? (
            <>
              <Link href={`/app/calendar?month=${shiftMonth(monthIso, -1)}`} className="btn-secondary px-3 py-1.5 text-sm">←</Link>
              <p className="font-semibold text-stone-900">{MONTHS_FR[month]} {year}</p>
              <Link href={`/app/calendar?month=${shiftMonth(monthIso, 1)}`} className="btn-secondary px-3 py-1.5 text-sm">→</Link>
            </>
          ) : (
            <>
              <button onClick={() => setSelected(shiftDate(selected, -7))} className="btn-secondary px-3 py-1.5 text-sm">←</button>
              <p className="font-semibold text-stone-900">Semaine du {Number(weekStart.slice(-2))} {MONTHS_FR[new Date(`${weekStart}T00:00:00`).getMonth()]}</p>
              <button onClick={() => setSelected(shiftDate(selected, 7))} className="btn-secondary px-3 py-1.5 text-sm">→</button>
            </>
          )}
          <div className="ml-auto flex gap-1 rounded-lg bg-stone-100 p-1 text-xs font-medium">
            <button onClick={() => setView("month")} className={cx("rounded-md px-2.5 py-1", view === "month" ? "bg-white shadow-sm text-stone-900" : "text-stone-500")}>Mois</button>
            <button onClick={() => setView("week")} className={cx("rounded-md px-2.5 py-1", view === "week" ? "bg-white shadow-sm text-stone-900" : "text-stone-500")}>Semaine</button>
          </div>
        </div>

        {view === "month" ? (
          <>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-400">
              {WEEKDAYS_FR.map((d) => (
                <div key={d} className="py-1">{d}</div>
              ))}
            </div>
            <div
              onMouseDown={onGridMouseDown}
              className={cx("grid grid-cols-7 gap-1 select-none", grabbing ? "cursor-grabbing" : "cursor-grab")}
            >
              {cells.map((cell, i) => {
                if (!cell.dateISO) return <div key={i} />;
                const dateISO = cell.dateISO;
                const dayRoutines = routinesForDate(dateISO);
                const doneCount = dayRoutines.filter((r) => logsByRoutineDate.get(`${r.id}_${dateISO}`)).length;
                const taskCount = tasks.filter((t) => t.due_date === dateISO).length;
                const isSelected = dateISO === selected;
                const isToday = dateISO === today;

                return (
                  <button
                    key={dateISO}
                    onClick={() => onDaySelect(dateISO)}
                    className={cx(
                      "flex h-20 flex-col items-start gap-1 rounded-xl border p-1.5 text-left text-xs transition",
                      isSelected ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-transparent hover:bg-stone-50",
                    )}
                  >
                    <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold", isToday ? "bg-brand-600 text-white" : "text-stone-600")}>
                      {Number(dateISO.slice(-2))}
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {dayRoutines.length > 0 && (
                        <span className="rounded bg-emerald-100 px-1 text-[10px] text-emerald-700">{doneCount}/{dayRoutines.length}</span>
                      )}
                      {taskCount > 0 && <span className="rounded bg-brand-100 px-1 text-[10px] text-brand-700">{taskCount} tâche{taskCount > 1 ? "s" : ""}</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        ) : (
          <div onMouseDown={onGridMouseDown} className={cx("grid grid-cols-7 gap-2 select-none", grabbing ? "cursor-grabbing" : "cursor-grab")}>
            {weekDays.map((dateISO) => {
              const dayRoutines = routinesForDate(dateISO);
              const dayTasks = tasks.filter((t) => t.due_date === dateISO);
              const isSelected = dateISO === selected;
              const isToday = dateISO === today;
              return (
                <button
                  key={dateISO}
                  onClick={() => onDaySelect(dateISO)}
                  className={cx(
                    "flex h-56 flex-col items-start gap-1.5 overflow-hidden rounded-xl border p-2 text-left text-xs transition",
                    isSelected ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-stone-100 hover:bg-stone-50",
                  )}
                >
                  <span className="text-[10px] font-medium uppercase text-stone-400">{WEEKDAYS_FR[new Date(`${dateISO}T00:00:00`).getDay()]}</span>
                  <span className={cx("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", isToday ? "bg-brand-600 text-white" : "text-stone-700")}>
                    {Number(dateISO.slice(-2))}
                  </span>
                  <div className="mt-1 flex w-full flex-col gap-1 overflow-hidden">
                    {dayRoutines.map((r) => (
                      <span key={r.id} className={cx("truncate rounded px-1.5 py-0.5 text-[10px]", logsByRoutineDate.get(`${r.id}_${dateISO}`) ? "bg-emerald-100 text-emerald-700 line-through" : "bg-emerald-50 text-emerald-600")}>
                        {r.title}
                      </span>
                    ))}
                    {dayTasks.map((t) => (
                      <span key={t.id} className="truncate rounded bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-700">{t.title}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="card p-5">
        <p className="label">Jour sélectionné</p>
        <p className="mt-1 text-lg font-semibold text-stone-900">{selected}</p>

        {selectedRoutines.length > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-400">Routines</p>
            {selectedRoutines.map((r) => (
              <ToggleCheckbox
                key={r.id}
                initialChecked={!!logsByRoutineDate.get(`${r.id}_${selected}`)}
                onToggle={(checked) => toggleRoutineLog(r.id, selected, checked)}
                label={r.title}
                strikeThrough={false}
              />
            ))}
          </div>
        )}

        {selectedTasks.length > 0 && (
          <div className="mt-4">
            <p className="mb-1 text-xs font-semibold uppercase text-stone-400">Tâches</p>
            <ul className="space-y-1 text-sm text-stone-700">
              {selectedTasks.map((t) => <li key={t.id}>• {t.title}</li>)}
            </ul>
          </div>
        )}

        {selectedRoutines.length === 0 && selectedTasks.length === 0 && (
          <p className="mt-3 text-sm text-stone-400">Rien de programmé ce jour-là.</p>
        )}
      </div>
    </div>
  );
}
