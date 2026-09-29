"use client";

import { useState, useTransition } from "react";
import { describeRecurrence, KIND_STYLE, occurrencesOf, addDays, type FinOp } from "@/lib/finance-engine";
import { formatEUR, cx } from "@/lib/utils";
import { ToggleSwitch } from "@/components/app/toggle-switch";
import { OperationForm } from "@/components/app/finance/operation-form";
import { deleteOperation, restoreOccurrence, skipOccurrence, toggleOperationActive } from "@/app/app/finance/actions";

export function OperationRow({ op, today }: { op: FinOp; today: string }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const next = occurrencesOf(op, today, addDays(today, 400)).slice(0, 4);

  return (
    <li className={cx("rounded-xl border border-line p-2.5", pending && "opacity-60", !op.active && "bg-stone-50")}>
      <div className="flex items-center gap-3">
        <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", KIND_STYLE[op.kind].dot)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-stone-800">{op.name} <span className="text-xs font-normal text-stone-400">· {op.category}</span></p>
          <p className="truncate text-xs text-stone-400">{describeRecurrence(op)} · dès le {op.start}{op.end ? ` jusqu'au ${op.end}` : ""}</p>
        </div>
        <span className={cx("tabular shrink-0 text-[13px] font-semibold", KIND_STYLE[op.kind].text)}>{formatEUR(op.amount)}</span>
        <ToggleSwitch initialChecked={op.active} onToggle={toggleOperationActive.bind(null, op.table, op.id)} />
        <button onClick={() => setEditing((e) => !e)} className="text-xs font-medium text-brand-600">{editing ? "Fermer" : "Modifier"}</button>
        <button
          onClick={() => confirm(`Supprimer "${op.name}" et toute sa récurrence ?`) && start(() => deleteOperation(op.table, op.id))}
          className="text-xs text-stone-300 hover:text-rose-600"
        >
          ✕
        </button>
      </div>

      {op.frequency !== "once" && (next.length > 0 || op.skipped.length > 0) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 pl-5 text-[11px]">
          {next.map((d) => (
            <button key={d} title="Ignorer cette occurrence" onClick={() => start(() => skipOccurrence(op.table, op.id, d))} className="rounded-md bg-stone-100 px-1.5 py-0.5 text-stone-600 hover:bg-rose-50 hover:text-rose-600 hover:line-through">
              {d.slice(5)}
            </button>
          ))}
          {op.skipped.map((d) => (
            <button key={d} title="Rétablir cette occurrence" onClick={() => start(() => restoreOccurrence(op.table, op.id, d))} className="rounded-md bg-rose-50 px-1.5 py-0.5 text-rose-500 line-through hover:no-underline">
              {d} ↺
            </button>
          ))}
        </div>
      )}

      {editing && (
        <div className="mt-3 border-t border-stone-100 pt-3">
          <OperationForm op={op} onDone={() => setEditing(false)} />
        </div>
      )}
    </li>
  );
}
