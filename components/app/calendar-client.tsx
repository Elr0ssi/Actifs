"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Routine, RoutineLog, Task, RecurringCharge, Income } from "@/lib/types";
import { formatEUR, WEEKDAYS_FR, MONTHS_FR, cx, todayISO } from "@/lib/utils";
import { projectOccurrences, sumOccurrencesInRange } from "@/lib/finance";
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

export function CalendarClient({
  year,
  month,
  monthIso,
  routines,
  logs,
  tasks,
  charges,
  incomes,
}: {
  year: number;
  month: number;
  monthIso: string;
  routines: Routine[];
  logs: RoutineLog[];
  tasks: Task[];
  charges: RecurringCharge[];
  incomes: Income[];
}) {
  const today = todayISO();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = new Date(year, month, 1).getDay();

  const [selected, setSelected] = useState(() => {
    const t = new Date(today);
    if (t.getFullYear() === year && t.getMonth() === month) return today;
    return `${year}-${pad(month + 1)}-01`;
  });
  const [rangeStart, setRangeStart] = useState(today);
  const [rangeEnd, setRangeEnd] = useState(selected);

  const logsByRoutineDate = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const l of logs) map.set(`${l.routine_id}_${l.log_date}`, l.done);
    return map;
  }, [logs]);

  function routinesForDate(dateISO: string) {
    const weekday = new Date(`${dateISO}T00:00:00`).getDay();
    return routines.filter((r) => r.frequency === "daily" || (r.frequency === "weekly" && r.days_of_week?.includes(weekday)));
  }

  function chargeAmountForDate(dateISO: string) {
    return charges.reduce((sum, c) => sum + projectOccurrences(c.next_date, c.frequency, dateISO, dateISO).length * Number(c.amount), 0);
  }

  function incomeAmountForDate(dateISO: string) {
    return incomes.reduce((sum, i) => {
      const freq = i.recurring ? i.frequency : "once";
      return sum + projectOccurrences(i.expected_date, freq, dateISO, dateISO).length * Number(i.amount);
    }, 0);
  }

  const cells: { dateISO: string | null }[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push({ dateISO: null });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ dateISO: `${year}-${pad(month + 1)}-${pad(d)}` });

  const chargesRangeLike = charges;
  const incomesRangeLike = useMemo(
    () => incomes.map((i) => ({ id: i.id, name: i.name, amount: Number(i.amount), next_date: i.expected_date, frequency: i.recurring ? i.frequency : ("once" as const) })),
    [incomes]
  );

  const expenseCalc = useMemo(() => sumOccurrencesInRange(chargesRangeLike, rangeStart, rangeEnd), [chargesRangeLike, rangeStart, rangeEnd]);
  const incomeCalc = useMemo(() => sumOccurrencesInRange(incomesRangeLike, rangeStart, rangeEnd), [incomesRangeLike, rangeStart, rangeEnd]);

  const selectedRoutines = routinesForDate(selected);
  const selectedTasks = tasks.filter((t) => t.due_date === selected);
  const selectedCharges = charges.filter((c) => projectOccurrences(c.next_date, c.frequency, selected, selected).length > 0);
  const selectedIncomes = incomes.filter((i) => projectOccurrences(i.expected_date, i.recurring ? i.frequency : "once", selected, selected).length > 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <Link href={`/app/calendar?month=${shiftMonth(monthIso, -1)}`} className="btn-secondary px-3 py-1.5 text-sm">←</Link>
          <p className="font-semibold text-slate-900">{MONTHS_FR[month]} {year}</p>
          <Link href={`/app/calendar?month=${shiftMonth(monthIso, 1)}`} className="btn-secondary px-3 py-1.5 text-sm">→</Link>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
          {WEEKDAYS_FR.map((d) => (
            <div key={d} className="py-1">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((cell, i) => {
            if (!cell.dateISO) return <div key={i} />;
            const dateISO = cell.dateISO;
            const dayRoutines = routinesForDate(dateISO);
            const doneCount = dayRoutines.filter((r) => logsByRoutineDate.get(`${r.id}_${dateISO}`)).length;
            const taskCount = tasks.filter((t) => t.due_date === dateISO).length;
            const expense = chargeAmountForDate(dateISO);
            const income = incomeAmountForDate(dateISO);
            const isSelected = dateISO === selected;
            const isToday = dateISO === today;

            return (
              <button
                key={dateISO}
                onClick={() => {
                  setSelected(dateISO);
                  setRangeEnd(dateISO);
                }}
                className={cx(
                  "flex h-24 flex-col items-start gap-0.5 rounded-xl border p-1.5 text-left text-xs transition",
                  isSelected ? "border-brand-400 bg-brand-50 ring-2 ring-brand-200" : "border-transparent hover:bg-slate-50",
                )}
              >
                <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold", isToday ? "bg-brand-600 text-white" : "text-slate-600")}>
                  {Number(dateISO.slice(-2))}
                </span>
                <div className="flex flex-wrap gap-1">
                  {dayRoutines.length > 0 && (
                    <span className="rounded bg-emerald-100 px-1 text-[10px] text-emerald-700">{doneCount}/{dayRoutines.length}</span>
                  )}
                  {taskCount > 0 && <span className="rounded bg-brand-100 px-1 text-[10px] text-brand-700">{taskCount} tâche{taskCount > 1 ? "s" : ""}</span>}
                </div>
                {expense > 0 && <span className="text-[10px] font-semibold text-rose-600">-{formatEUR(expense)}</span>}
                {income > 0 && <span className="text-[10px] font-semibold text-emerald-600">+{formatEUR(income)}</span>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        <div className="card p-5">
          <p className="label">Jour sélectionné</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">{selected}</p>

          {selectedRoutines.length > 0 && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Routines</p>
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
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Tâches</p>
              <ul className="space-y-1 text-sm text-slate-700">
                {selectedTasks.map((t) => <li key={t.id}>• {t.title}</li>)}
              </ul>
            </div>
          )}

          {(selectedCharges.length > 0 || selectedIncomes.length > 0) && (
            <div className="mt-4">
              <p className="mb-1 text-xs font-semibold uppercase text-slate-400">Finances</p>
              <ul className="space-y-1 text-sm">
                {selectedCharges.map((c) => (
                  <li key={c.id} className="flex justify-between text-rose-600"><span>{c.name}</span><span>-{formatEUR(Number(c.amount))}</span></li>
                ))}
                {selectedIncomes.map((inc) => (
                  <li key={inc.id} className="flex justify-between text-emerald-600"><span>{inc.name}</span><span>+{formatEUR(Number(inc.amount))}</span></li>
                ))}
              </ul>
            </div>
          )}

          {selectedRoutines.length === 0 && selectedTasks.length === 0 && selectedCharges.length === 0 && selectedIncomes.length === 0 && (
            <p className="mt-3 text-sm text-slate-400">Rien de programmé ce jour-là.</p>
          )}
        </div>

        <div className="card p-5">
          <p className="label">Cumul entre deux dates</p>
          <div className="mt-2 flex gap-2">
            <input type="date" value={rangeStart} onChange={(e) => setRangeStart(e.target.value)} className="input" />
            <input type="date" value={rangeEnd} onChange={(e) => setRangeEnd(e.target.value)} className="input" />
          </div>
          <div className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Charges fixes</span><span className="font-semibold text-rose-600">{formatEUR(expenseCalc.total)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Revenus</span><span className="font-semibold text-emerald-600">{formatEUR(incomeCalc.total)}</span></div>
            <div className="mt-2 flex justify-between border-t border-slate-100 pt-2 font-semibold"><span>Solde net</span><span className={incomeCalc.total - expenseCalc.total >= 0 ? "text-emerald-600" : "text-rose-600"}>{formatEUR(incomeCalc.total - expenseCalc.total)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
