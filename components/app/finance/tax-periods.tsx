"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState } from "react";
import { formatEUR } from "@/lib/utils";
import { estimateIncomeTax, taxableIncomeFromPeriods } from "@/lib/tax-fr";
import { saveTaxProfile } from "@/app/app/finance/actions";
import type { TaxProfile } from "@/lib/data/finance-budgets";
import { SubmitButton } from "@/components/ui/submit-button";

const ACTIVITIES = ["Salarié", "Alternance", "Intérim", "Freelance / indépendant", "Autre"];

export function TaxPeriods({ year, profile }: { year: number; profile: TaxProfile }) {
  const tr = useT();
  const [periods, setPeriods] = useState(profile.periods);
  const [adding, setAdding] = useState(false);
  const [alreadyWithheld, setAlreadyWithheld] = useState(profile.alreadyWithheld ?? 0);
  const [parts, setParts] = useState(profile.householdParts);
  const [provisionManual, setProvisionManual] = useState(profile.provisionManual);

  const grossTotal = periods.reduce((s, p) => s + p.amount, 0);
  const hasCompletePeriods = periods.length > 0 && periods.every((p) => p.amount > 0);
  const { taxable, exempted } = useMemo(() => taxableIncomeFromPeriods(periods), [periods]);
  const estimate = useMemo(() => (hasCompletePeriods ? estimateIncomeTax(taxable, grossTotal, parts) : null), [hasCompletePeriods, taxable, grossTotal, parts]);
  const netOfWithholding = estimate ? Math.max(0, estimate.annualTax - alreadyWithheld) : null;

  const addPeriod = () => setPeriods((p) => [...p, { label: "", activity: ACTIVITIES[0], amount: 0 }]);
  const updatePeriod = (i: number, patch: Partial<(typeof periods)[number]>) => setPeriods((p) => p.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  const removePeriod = (i: number) => setPeriods((p) => p.filter((_, idx) => idx !== i));

  return (
    <form action={saveTaxProfile.bind(null, year)} className="space-y-6">
      <input type="hidden" name="periods" value={JSON.stringify(periods)} />

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-semibold text-stone-900">{tr("Périodes de revenus")}</p>
            <button type="button" onClick={() => { addPeriod(); setAdding(true); }} className="text-sm font-medium text-brand-600">{tr("+ Ajouter une période")}</button>
          </div>
          {periods.length === 0 && !adding && <p className="text-sm text-stone-400">Aucune période. Ajoute tes périodes de revenus {year}.</p>}
          <div className="space-y-2">
            {periods.map((p, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_100px_auto] items-center gap-2 rounded-xl border border-stone-100 p-2">
                <input value={p.label} onChange={(e) => updatePeriod(i, { label: e.target.value })} placeholder={tr("Ex. Janv. – août")} className="input px-2 py-1 text-sm" />
                <select value={p.activity} onChange={(e) => updatePeriod(i, { activity: e.target.value })} className="input px-2 py-1 text-sm">
                  {ACTIVITIES.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
                <input
                  type="number"
                  step="0.01"
                  value={p.amount || ""}
                  onChange={(e) => updatePeriod(i, { amount: Math.max(0, Number(e.target.value) || 0) })}
                  placeholder={tr("à compléter")}
                  className="input px-2 py-1 text-right text-sm"
                />
                <button type="button" onClick={() => removePeriod(i)} className="text-xs text-stone-300 hover:text-rose-600">✕</button>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-5">
          <p className="mb-3 font-semibold text-stone-900">{tr("Prélèvement à la source")}</p>
          <div className="mb-3 flex items-center justify-between gap-3 text-sm">
            <span className="text-stone-600">{tr("Taux calculé")}</span>
            <span className="font-semibold text-stone-800">{estimate ? `${estimate.withholdingRate.toFixed(1)} %` : "à calculer"}</span>
          </div>
          <p className="mb-3 text-[11px] text-stone-400">{tr("Calculé à partir de tes revenus imposables et du barème — pas à saisir toi-même.")}</p>
          <label className="flex items-center justify-between gap-3 text-sm">
            <span className="text-stone-600">{tr("Déjà prélevé cette année")}</span>
            <input type="number" step="0.01" value={alreadyWithheld || ""} onChange={(e) => setAlreadyWithheld(Number(e.target.value) || 0)} name="already_withheld" placeholder={tr("à compléter")} className="input w-28 px-2 py-1 text-right" />
          </label>
          <label className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm">
            <span className="text-stone-600">{tr("Parts fiscales du foyer")}</span>
            <input type="number" step="0.5" min="1" value={parts} onChange={(e) => setParts(Math.max(1, Number(e.target.value) || 1))} name="household_parts" className="input w-20 px-2 py-1 text-right" />
          </label>
        </section>
      </div>

      <section className="card p-5">
        <p className="mb-3 font-semibold text-stone-900">{tr("Provision conseillée")}</p>
        {!estimate ? (
          <div className="flex items-center gap-3 rounded-2xl bg-stone-50 p-4">
            <span className="text-2xl">🧮</span>
            <div>
              <p className="text-sm font-semibold text-stone-600">{tr("Calculer après saisie")}</p>
              <p className="text-xs text-stone-400">{tr("Estimation à partir des revenus imposables et des prélèvements saisis.")}</p>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-brand-50 p-4">
            <p className="text-xs font-medium text-brand-800">{tr("Provision indicative pour le reste de l'année")}</p>
            <p className="mt-1 text-3xl font-bold text-brand-700">{formatEUR(Math.max(0, netOfWithholding ?? 0))}</p>
            <p className="text-[11px] text-brand-700/70">
              Fourchette annuelle : {formatEUR(estimate.low)} – {formatEUR(estimate.high)} · soit ≈ {formatEUR(estimate.monthlyProvision)}/mois
            </p>
          </div>
        )}
        <details className="mt-3 text-xs">
          <summary className="cursor-pointer text-stone-400">{tr("Hypothèses et détail du calcul")}</summary>
          <div className="mt-2 space-y-1 text-stone-500">
            <p>Revenu brut total saisi : {formatEUR(grossTotal)}</p>
            {exempted > 0 && <p>Dont exonéré (alternance, jusqu'à 21 000 €) : − {formatEUR(exempted)}</p>}
            <p>Revenu imposable retenu : {formatEUR(taxable)}</p>
            <p>Barème {year} par part, {parts} part(s) fiscale(s) — estimation indicative, non contractuelle.</p>
            <p>Déjà prélevé : {formatEUR(alreadyWithheld)}</p>
            <p>{tr("Aucune assiette, exonération ou barème non vérifié n'est inventé : si une donnée manque, aucun montant « exact » n'est affiché.")}</p>
          </div>
        </details>
        <label className="mt-3 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm">
          <span className="text-stone-600">{tr("Provision manuelle (si tu préfères la tienne)")}</span>
          <input
            type="number"
            step="0.01"
            value={provisionManual ?? ""}
            onChange={(e) => setProvisionManual(e.target.value === "" ? null : Number(e.target.value))}
            name="provision_manual"
            placeholder="€"
            className="input w-28 px-2 py-1 text-right"
          />
        </label>
      </section>

      <SubmitButton className="btn-primary">{tr("Enregistrer")}</SubmitButton>
    </form>
  );
}
