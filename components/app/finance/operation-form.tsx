"use client";

import { useT } from "@/components/i18n/provider";
import { useState } from "react";
import { createOperation, updateOperation } from "@/app/(main)/app/finance/actions";
import { CATEGORIES, type FinOp, type OpKind, type OpFrequency } from "@/lib/finance-engine";
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

export function OperationForm({ op, defaultDate, defaultKind, onDone }: { op?: FinOp; defaultDate?: string; defaultKind?: OpKind; onDone?: () => void }) {
  const tr = useT();
  const [kind, setKind] = useState<OpKind>(op?.kind ?? defaultKind ?? "fixed");
  const [freq, setFreq] = useState<OpFrequency>(op?.frequency ?? "monthly");
  const [pending, setPending] = useState(false);
  const unit = FREQS.find((f) => f.v === freq)?.unit;
  const categories = op && op.kind === kind && !CATEGORIES[kind].includes(op.category) ? [op.category, ...CATEGORIES[kind]] : CATEGORIES[kind];

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
      <div className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1 text-xs font-medium sm:grid-cols-4">
        {KINDS.map((k) => (
          <button
            key={k.v}
            type="button"
            onClick={() => setKind(k.v)}
            className={cx("rounded-lg py-1.5 transition", kind === k.v ? "bg-surface text-stone-900 shadow-sm" : "text-stone-500")}
          >
            {tr(k.l)}
          </button>
        ))}
      </div>

      <input name="name" defaultValue={op?.name} placeholder={tr("Nom (ex. Loyer, Netflix, Salaire…)")} className="input" required />
      <div className="grid grid-cols-2 gap-2">
        <label className="text-xs text-stone-500">
          {tr("Montant")}
          <input name="amount" type="number" step="0.01" min="0" defaultValue={op?.amount} placeholder="€" className="input mt-1" required />
        </label>
        <label className="text-xs text-stone-500">
          {tr("Catégorie")}
          <select key={kind} name="category" defaultValue={categories.includes(op?.category ?? "") ? op?.category : categories[0]} className="input mt-1">
            {categories.map((c) => <option key={c} value={c}>{tr(c)}</option>)}
          </select>
        </label>
        <label className="col-span-2 text-xs text-stone-500">
          {tr("Compte (optionnel)")}
          <input name="account" list="finance-accounts" defaultValue={op?.account ?? ""} placeholder={tr("Ex. Compte courant, Compte joint…")} className="input mt-1" />
          <datalist id="finance-accounts">
            <option value="Compte courant" />
            <option value="Compte joint" />
            <option value="Livret A" />
          </datalist>
        </label>
      </div>

      <div className="rounded-xl border border-stone-100 p-3">
        <p className="label mb-2">{tr("Date & récurrence")}</p>
        <input type="hidden" name="frequency" value={freq} />
        <select value={freq} onChange={(e) => setFreq(e.target.value as OpFrequency)} className="input">
          {FREQS.map((f) => (
            <option key={f.v} value={f.v}>{tr(f.l)}</option>
          ))}
        </select>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <label className="text-xs text-stone-500">
            {freq === "once" ? tr("Date") : tr("Date de début")}
            <input name="start" type="date" defaultValue={op?.start ?? defaultDate} className="input mt-1" required />
          </label>
          {freq !== "once" && (
            <label className="text-xs text-stone-500">
              {tr("Date de fin")} <span className="text-stone-400">{tr("(optionnelle)")}</span>
              <input name="end_date" type="date" defaultValue={op?.end ?? ""} className="input mt-1" />
            </label>
          )}
        </div>
        {freq !== "once" && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-2 text-sm text-stone-600">
              {tr("Tous les")} <input name="interval" type="number" min="1" defaultValue={op?.interval ?? 1} className="input w-16 py-1" /> {unit ? tr(unit) : ""}
            </label>
            {freq === "weekly" && (
              <div className="flex gap-1">
                {WEEKDAYS.map((d, i) => (
                  <label key={i} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-stone-200 text-xs has-[:checked]:border-brand-500 has-[:checked]:bg-brand-50 has-[:checked]:text-brand-700">
                    <input type="checkbox" name="weekdays" value={WEEKDAY_VALUES[i]} defaultChecked={op?.weekdays.includes(WEEKDAY_VALUES[i])} className="sr-only" />
                    {d}
                  </label>
                ))}
              </div>
            )}
            {freq === "monthly" && (
              <input name="month_days" defaultValue={op?.monthDays.join(", ")} placeholder={tr("Jour(s) du mois, ex. 5 ou 15, 30 (vide = date de début)")} className="input" />
            )}
            {(freq === "monthly" || freq === "yearly") && (
              <label className="block text-xs text-stone-500">
                {tr("Si la date tombe un week-end")}
                <select key={kind} name="weekend_rule" defaultValue={op?.weekendRule ?? (kind === "income" ? "next" : "none")} className="input mt-1">
                  <option value="none">{tr("Ne pas décaler")}</option>
                  <option value="next">{tr("Reporter au lundi suivant")}</option>
                  <option value="prev">{tr("Avancer au vendredi précédent")}</option>
                </select>
              </label>
            )}
          </div>
        )}
      </div>

      <input name="note" defaultValue={op?.note ?? ""} placeholder={tr("Note (optionnel)")} className="input" />
      <button disabled={pending} className="btn-primary w-full">{pending ? tr("Enregistrement…") : tr("Enregistrer")}</button>
    </form>
  );
}

export function NewOperationButton({
  defaultDate,
  defaultKind,
  label = "+ Nouvelle opération",
  className,
}: {
  defaultDate?: string;
  defaultKind?: OpKind;
  label?: string;
  className?: string;
}) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)} className={className ?? "btn-primary"}>{tr(label)}</button>
      {open && (
        <div className="fixed inset-0 z-50 flex animate-fade items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="max-h-[90vh] w-full max-w-lg animate-modal overflow-y-auto rounded-3xl border border-line bg-surface p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-stone-900">{tr("Nouvelle opération")}</h3>
              <button onClick={() => setOpen(false)} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <OperationForm defaultDate={defaultDate} defaultKind={defaultKind} onDone={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
