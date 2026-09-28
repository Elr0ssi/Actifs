"use client";

import { useMemo, useState } from "react";
import { formatEUR } from "@/lib/utils";
import { grossToNet, estimateIncomeTax } from "@/lib/tax-fr";

/** Pure client calculator: brut annuel → net mensuel, et une fourchette d'impôt indicative. Rien n'est enregistré. */
export function TaxCalculator() {
  const [brut, setBrut] = useState(36000);
  const [statut, setStatut] = useState<"non-cadre" | "cadre">("non-cadre");
  const [parts, setParts] = useState(1);

  const net = useMemo(() => grossToNet(brut, statut), [brut, statut]);
  const tax = useMemo(() => estimateIncomeTax(net.netAnnuel, brut, parts), [net.netAnnuel, brut, parts]);
  const netAfterTaxMonthly = net.netMensuel - tax.monthlyProvision;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="block text-xs font-medium text-slate-500">
          Salaire brut annuel
          <input
            type="number"
            min={0}
            step={500}
            value={brut}
            onChange={(e) => setBrut(Math.max(0, Number(e.target.value) || 0))}
            className="input mt-1"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs font-medium text-slate-500">
            Statut
            <select value={statut} onChange={(e) => setStatut(e.target.value as "non-cadre" | "cadre")} className="input mt-1">
              <option value="non-cadre">Non-cadre</option>
              <option value="cadre">Cadre</option>
            </select>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Parts fiscales du foyer
            <input type="number" min={1} step={0.5} value={parts} onChange={(e) => setParts(Math.max(1, Number(e.target.value) || 1))} className="input mt-1" />
          </label>
        </div>
        <p className="text-[11px] text-slate-400">
          Estimation indicative à partir de ratios publics (charges salariales, barème {new Date().getFullYear()}). Ne remplace pas ta fiche de paie ni un simulateur officiel.
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-medium text-slate-500">Net mensuel estimé (avant impôt)</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{formatEUR(net.netMensuel)}</p>
          <p className="text-[11px] text-slate-400">Fourchette : {formatEUR(net.low)} – {formatEUR(net.high)}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-medium text-brand-800">Impôt sur le revenu — à provisionner chaque mois</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{formatEUR(tax.monthlyProvision)}</p>
          <p className="text-[11px] text-brand-700/70">
            Fourchette : {formatEUR(tax.low / 12)} – {formatEUR(tax.high / 12)} · soit {formatEUR(tax.annualTax)}/an · taux calculé ≈ {tax.withholdingRate.toFixed(1)}%
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-medium text-emerald-800">Net réel estimé après impôt</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatEUR(netAfterTaxMonthly)}</p>
          <p className="text-[11px] text-emerald-700/70">par mois, si l'impôt n'est pas déjà prélevé à la source</p>
        </div>
      </div>
    </div>
  );
}
