"use client";

import { useT } from "@/components/i18n/provider";
import { useState, useTransition } from "react";
import { describeRecurrence, KIND_STYLE, occurrenceEntries, addDays, type FinOp } from "@/lib/finance-engine";
import { formatEUR, cx } from "@/lib/utils";
import { ToggleSwitch } from "@/components/app/toggle-switch";
import { OperationForm } from "@/components/app/finance/operation-form";
import { deleteOperation, moveOccurrence, restoreOccurrence, skipOccurrence, toggleOperationActive } from "@/app/app/finance/actions";

export function OperationRow({ op, today }: { op: FinOp; today: string }) {
  const tr = useT();
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  const next = occurrenceEntries(op, today, addDays(today, 400)).slice(0, 4);
  const [picked, setPicked] = useState<{ raw: string; date: string } | null>(null);
  const [newDate, setNewDate] = useState("");
  const moves = Object.entries(op.moved).filter(([raw]) => raw >= addDays(today, -60));

  return (
    <li className={cx("rounded-xl border border-line p-2.5", pending && "opacity-60", !op.active && "bg-stone-50")}>
      <div className="flex items-center gap-3">
        <span className={cx("h-2.5 w-2.5 shrink-0 rounded-full", KIND_STYLE[op.kind].dot)} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium text-stone-800">{op.name} <span className="text-xs font-normal text-stone-400">· {tr(op.category)}</span></p>
          <p className="truncate text-xs text-stone-400">{describeRecurrence(op, tr)} · {tr("dès le {date}", { date: op.start })}{op.end ? ` ${tr("jusqu'au {date}", { date: op.end })}` : ""}</p>
        </div>
        <span className={cx("tabular shrink-0 text-[13px] font-semibold", KIND_STYLE[op.kind].text)}>{formatEUR(op.amount)}</span>
        <ToggleSwitch initialChecked={op.active} onToggle={toggleOperationActive.bind(null, op.table, op.id)} />
        <button onClick={() => setEditing((e) => !e)} className="text-xs font-medium text-brand-600">{editing ? tr("Fermer") : tr("Modifier")}</button>
        <button
          onClick={() => confirm(tr("Supprimer « {name} » et toute sa récurrence ?", { name: op.name })) && start(() => deleteOperation(op.table, op.id))}
          className="text-xs text-stone-300 hover:text-rose-600"
        >
          ✕
        </button>
      </div>

      {op.frequency !== "once" && (next.length > 0 || op.skipped.length > 0 || moves.length > 0) && (
        <div className="mt-2 pl-5 text-[11px]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-stone-400">{tr("Prochaines dates :")}</span>
            {next.map((e) => (
              <button
                key={e.raw}
                title={tr("Déplacer ou ignorer cette date")}
                onClick={() => { setPicked(picked?.raw === e.raw ? null : e); setNewDate(e.date); }}
                className={cx("rounded-md px-1.5 py-0.5 transition", picked?.raw === e.raw ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-600 hover:bg-brand-50 hover:text-brand-700")}
              >
                {e.date.slice(8)}/{e.date.slice(5, 7)}
                {e.date !== e.raw && <span className="opacity-60"> ↷</span>}
              </button>
            ))}
            {op.skipped.map((d) => (
              <button key={d} title={tr("Rétablir cette occurrence")} onClick={() => start(() => restoreOccurrence(op.table, op.id, d))} className="rounded-md bg-rose-50 px-1.5 py-0.5 text-rose-500 line-through hover:no-underline">
                {d.slice(8)}/{d.slice(5, 7)} ↺
              </button>
            ))}
          </div>
          {picked && (
            <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg bg-stone-50 p-2">
              <span className="text-stone-500">{tr("Prévu le {date} · tombe le", { date: `${picked.raw.slice(8)}/${picked.raw.slice(5, 7)}` })}</span>
              <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="input w-auto py-1 text-xs" />
              <button
                disabled={!newDate}
                onClick={() => start(async () => { await moveOccurrence(op.table, op.id, picked.raw, newDate); setPicked(null); })}
                className="btn-primary px-2.5 py-1 text-[11px]"
              >
                {tr("Déplacer")}</button>
              <button onClick={() => start(async () => { await skipOccurrence(op.table, op.id, picked.date); setPicked(null); })} className="btn-secondary px-2.5 py-1 text-[11px]">{tr("Ignorer cette fois")}</button>
              {op.moved[picked.raw] && <button onClick={() => start(async () => { await moveOccurrence(op.table, op.id, picked.raw, null); setPicked(null); })} className="text-stone-400 underline">{tr("Remettre la date prévue")}</button>}
            </div>
          )}
          {moves.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5 text-stone-400">
              {moves.map(([raw, to]) => (
                <button key={raw} title={tr("Remettre la date prévue")} onClick={() => start(() => moveOccurrence(op.table, op.id, raw, null))} className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-amber-700 hover:line-through">
                  {raw.slice(8)}/{raw.slice(5, 7)} → {to.slice(8)}/{to.slice(5, 7)} ↺
                </button>
              ))}
            </div>
          )}
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
