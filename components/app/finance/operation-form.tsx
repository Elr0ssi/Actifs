"use client";

import { useState } from "react";
import { createOperation, updateOperation } from "@/app/app/finance/actions";
import type { FinOp, OpKind, OpFrequency } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";

const KINDS: { v: OpKind; l: string }[] = [
  { v: "fixed", l: "Charge fixe" },
  { v: "variable", l: "Dépense variable" },
  { v: "income", l: "Revenu" },
  { v: "savings", l: "Épargne / invest." },
];
const FREQS: { v: OpFrequency; l: string; unit: string }[] = [
  { v: "once", l: "Une seule fois", unit: "" },
  { v: "daily", l: "Tous les jours", unit: "jour(s)" },
  { v: "weekly", l: "Toutes les semaines", unit: "semaine(s)" },
  { v: "monthly", l: "Tous les mois", unit: "mois" },
  { v: "yearly", l: "Tous les ans", unit: "an(s)" },
];
const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const WEEKDAY_VALUES = [1, 2, 3, 4, 5, 6, 0];

export function OperationForm({ op, defaultDate, onDone }: { op?: FinOp; defaultDate?: string; onDone?: () => void }) {
  const [kind, setKind] = useState<OpKind>(op?.kind ?? "fixed");
  const [freq, setFreq] = useState<OpFrequency>(op?.frequency ?? "monthly");
  const [pending, setPending] = useState(false);
  const unit = FREQS.find((f) => f.v === freq)?.unit;

  return (
    <form
      action={async (fd) => {
        setPending(true);
        if (op) await updateOperation(op.table, op.id, fd);
        else await createOperation(fd);
        setPending(false);
        onDone?.();
      }}
      className="space-y-3"
    >
      <input type="hidden" name="kind" value={kind} />
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium sm:grid-cols-4">
        {KINDS.map((k) => (
          <button
            key={k.v}
            type="button"
            onClick={() => setKind(k.v)}
            className={cx("rounded-lg py-1.5 transition", kind === k.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            {k.l}
          </button>
        ))}
      </div>

      <input name="name" defaultValue={op?.name} placeholder="Nom (ex. Loyer, Salaire, PEA…)" className="input" required />
      <div className="grid grid-cols-2 gap-2">
        <input name="amount" type="number" step="0.01" min="0" defaultValue={op?.amount} placeholder="Montant €" className="input" required />
        <input name="start" type="date" defaultValue={op?.start ?? defaultDate} className="input" required />
        <input name="category" defaultValue={op?.category} placeholder="Catégorie" className="input" />
        <input name="account" defaultValue={op?.account ?? ""} placeholder="Compte (optionnel)" className="input" />
      </div>

      <div className="rounded-xl border border-slate-100 p-3">
        <p className="label mb-2">Récurrence</p>
        <input type="hidden" name="frequency" value={freq} />
        <select value={freq} onChange={(e) => setFreq(e.target.value as OpFrequency)} className="input">
          {FREQS.map((f) => (
            <option key={f.v} value={f.v}>{f.l}</option>
          ))}
        </select>
        {freq !== "once" && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Tous les <input name="interval" type="number" min="1" defaultValue={op?.interval ?? 1} className="input w-16 py-1" /> {unit}
            </label>
            {freq === "weekly" && (
              <div className="flex gap-1">
                {WEEKDAYS.map((d, i) => (
                  <label key={i} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-slate-200 text-xs has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
                    <input type="checkbox" name="weekdays" value={WEEKDAY_VALUES[i]} defaultChecked={op?.weekdays.includes(WEEKDAY_VALUES[i])} className="sr-only" />
                    {d}
                  </label>
                ))}
              </div>
            )}
            {freq === "monthly" && (
              <input name="month_days" defaultValue={op?.monthDays.join(", ")} placeholder="Jour(s) du mois, ex. 5 ou 15, 30 (vide = date de début)" className="input" />
            )}
            <label className="flex items-center gap-2 text-sm text-slate-600">
              Fin <input name="end_date" type="date" defaultValue={op?.end ?? ""} className="input py-1" /> <span className="text-xs text-slate-400">(optionnel)</span>
            </label>
          </div>
        )}
      </div>

      <input name="note" defaultValue={op?.note ?? ""} placeholder="Note (optionnel)" className="input" />
      <button disabled={pending} className="btn-primary w-full">{pending ? "Enregistrement…" : "Enregistrer"}</button>
    </form>
  );
}

export function NewOperationButton({ defaultDate, label = "+ Nouvelle opération", className }: { defaultDate?: string; label?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className ?? "btn-primary"}>{label}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Nouvelle opération</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <OperationForm defaultDate={defaultDate} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
