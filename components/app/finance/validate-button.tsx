"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { cancelValidation, validateOccurrence } from "@/app/(main)/app/finance/actions";
import { cx, formatEUR } from "@/lib/utils";

/**
 * Valide une ligne de budget dont la date est arrivée : « j'ai bien dépensé 70 € » (ou un autre montant, si j'ai payé en espèces,
 * par virement ou avec une autre carte non synchronisée). Le montant réel remplace le prévu : il n'est jamais compté deux fois.
 */
export function ValidateButton({
  opId,
  date,
  planned,
  name,
  validated,
  className,
}: {
  opId: string;
  date: string;
  planned: number;
  name: string;
  /** Si la ligne est déjà validée : montant réel et identifiant du paiement associé. */
  validated?: { actual: number; txnId: string | null } | null;
  className?: string;
}) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState(String(validated?.actual ?? planned));
  const [pending, start] = useTransition();
  const value = Number(amount.replace(",", "."));
  const valid = Number.isFinite(value) && value >= 0;
  const save = (v: number) =>
    start(async () => {
      await validateOccurrence(opId, date, v);
      setOpen(false);
    });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cx(
          "inline-flex min-h-8 shrink-0 items-center rounded-lg px-2.5 text-[11px] font-semibold transition",
          validated ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-brand-600 text-white hover:bg-brand-700",
          className
        )}
      >
        {validated ? `✓ ${tr("Validé")}` : tr("Valider")}
      </button>
      {open && (
        <div className="fixed inset-0 z-[60] flex animate-fade items-center justify-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label={tr("Valider la dépense")} className="w-full max-w-sm animate-modal rounded-3xl border border-line bg-surface p-5 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate text-base font-bold text-stone-900">{name}</h3>
                <p className="text-xs text-stone-500">{tr("Prévu : {amount}", { amount: formatEUR(planned) })}</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label={tr("Fermer")} className="text-stone-400 hover:text-stone-700">✕</button>
            </div>
            <p className="mt-3 text-[13px] text-stone-600">{tr("Combien as-tu réellement dépensé ? Ce montant remplace le prévu : il ne sera pas compté en double, même si tu as payé en espèces, par virement ou avec une autre carte.")}</p>
            <label className="mt-3 block text-xs text-stone-500">
              {tr("Montant réel")}
              <input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="decimal" className="input mt-1" autoFocus />
            </label>
            <div className="mt-4 grid gap-2">
              <button type="button" disabled={pending || !valid} onClick={() => save(value)} className="btn-primary w-full">
                {pending ? tr("Enregistrement…") : Math.abs(value - planned) < 0.005 ? tr("Valider {amount}", { amount: formatEUR(planned) }) : tr("Valider avec {amount}", { amount: formatEUR(valid ? value : 0) })}
              </button>
              {validated?.txnId && (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => start(async () => { await cancelValidation(validated.txnId as string); setOpen(false); })}
                  className="btn-secondary w-full"
                >
                  {tr("Annuler la validation")}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
