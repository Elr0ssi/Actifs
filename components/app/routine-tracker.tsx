"use client";

import { useState, useTransition } from "react";
import { addDays } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import { toggleRoutineLog } from "@/app/app/actions";
import { DOW, scheduledOn, weekday } from "@/components/app/widgets/helpers";
import type { Routine } from "@/lib/types";

/** Grille routines × 7 derniers jours : permet aussi de rattraper un jour oublié. */
export function RoutineTracker({ routines, doneKeys, today }: { routines: Routine[]; doneKeys: string[]; today: string }) {
  const [done, setDone] = useState(() => new Set(doneKeys));
  const [pending, start] = useTransition();
  const days = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  const toggle = (id: string, d: string) => {
    const key = `${id}_${d}`;
    const next = !done.has(key);
    setDone((s) => {
      const n = new Set(s);
      if (next) n.add(key);
      else n.delete(key);
      return n;
    });
    start(() => toggleRoutineLog(id, d, next));
  };

  if (routines.length === 0) return <p className="text-sm text-stone-400">Crée une routine ci-dessous pour la suivre ici.</p>;

  return (
    <div className={cx("overflow-x-auto", pending && "opacity-70")}>
      <table className="w-full min-w-[420px] border-separate border-spacing-y-1 text-left">
        <thead>
          <tr>
            <th className="w-full text-[10px] font-medium uppercase tracking-wide text-stone-400" />
            {days.map((d) => (
              <th key={d} className={cx("px-1 text-center text-[10px] font-medium", d === today ? "text-brand-700" : "text-stone-400")}>
                {DOW[(weekday(d) + 6) % 7]}
                <span className="block text-[12px] font-bold">{Number(d.slice(-2))}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {routines.map((r) => (
            <tr key={r.id}>
              <td className="max-w-[200px] truncate pr-3 text-[13px] font-medium text-stone-800">{r.title}</td>
              {days.map((d) => {
                if (!scheduledOn(r, d)) return <td key={d} className="text-center text-stone-200">·</td>;
                const on = done.has(`${r.id}_${d}`);
                return (
                  <td key={d} className="px-1 text-center">
                    <button
                      type="button"
                      onClick={() => toggle(r.id, d)}
                      aria-pressed={on}
                      aria-label={`${r.title}, ${d}`}
                      className={cx("mx-auto flex h-7 w-7 items-center justify-center rounded-lg border text-xs transition", on ? "border-brand-600 bg-brand-600 text-white" : "border-line bg-surface text-transparent hover:border-brand-300 hover:text-brand-300")}
                    >
                      ✓
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
