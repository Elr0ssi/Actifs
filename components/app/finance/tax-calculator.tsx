"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState } from "react";
import { formatEUR } from "@/lib/utils";
import { grossToNet, estimateIncomeTax, bracketBreakdown, taxQuotient } from "@/lib/tax-fr";

/** Pure client calculator: brut annuel → net mensuel, et une fourchette d'impôt indicative. Rien n'est enregistré. */
export function TaxCalculator() {
  const tr = useT();
  const [brut, setBrut] = useState(36000);
  const [statut, setStatut] = useState<"non-cadre" | "cadre">("non-cadre");
  const [parts, setParts] = useState(1);

  const [showBrackets, setShowBrackets] = useState(false);

  const net = useMemo(() => grossToNet(brut, statut), [brut, statut]);
  const tax = useMemo(() => estimateIncomeTax(net.netAnnuel, brut, parts), [net.netAnnuel, brut, parts]);
  const netAfterTaxMonthly = net.netMensuel - tax.monthlyProvision;
  const quotient = useMemo(() => taxQuotient(net.netAnnuel, parts), [net.netAnnuel, parts]);
  const brackets = useMemo(() => bracketBreakdown(quotient).filter((b) => b.taxableInBracket > 0), [quotient]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <label className="block text-xs font-medium text-stone-500">
          {tr("Salaire brut annuel")}
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
          <label className="text-xs font-medium text-stone-500">
            {tr("Statut")}
            <select value={statut} onChange={(e) => setStatut(e.target.value as "non-cadre" | "cadre")} className="input mt-1">
              <option value="non-cadre">{tr("Non-cadre")}</option>
              <option value="cadre">{tr("Cadre")}</option>
            </select>
          </label>
          <label className="text-xs font-medium text-stone-500">
            {tr("Parts fiscales du foyer")}
            <input type="number" min={1} step={0.5} value={parts} onChange={(e) => setParts(Math.max(1, Number(e.target.value) || 1))} className="input mt-1" />
          </label>
        </div>
        <p className="text-[11px] text-stone-400">
          {tr("Estimation indicative à partir de ratios publics (charges salariales, barème {year}). Ne remplace pas ta fiche de paie ni un simulateur officiel.", { year: new Date().getFullYear() })}
        </p>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-medium text-stone-500">{tr("Net mensuel estimé (avant impôt)")}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{formatEUR(net.netMensuel)}</p>
          <p className="text-[11px] text-stone-400">{tr("Fourchette :")} {formatEUR(net.low)} – {formatEUR(net.high)}</p>
        </div>
        <div className="rounded-2xl bg-brand-50 p-4">
          <p className="text-xs font-medium text-brand-800">{tr("Impôt sur le revenu — à provisionner chaque mois")}</p>
          <p className="mt-1 text-2xl font-bold text-brand-700">{formatEUR(tax.monthlyProvision)}</p>
          <p className="text-[11px] text-brand-700/70">
            {tr("Fourchette :")} {formatEUR(tax.low / 12)} – {formatEUR(tax.high / 12)} · {tr("soit {amount}/an · taux calculé ≈ {rate}%", { amount: formatEUR(tax.annualTax), rate: tax.withholdingRate.toFixed(1) })}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <p className="text-xs font-medium text-emerald-800">{tr("Net réel estimé après impôt")}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{formatEUR(netAfterTaxMonthly)}</p>
          <p className="text-[11px] text-emerald-700/70">{tr("par mois, si l'impôt n'est pas déjà prélevé à la source")}</p>
        </div>

        <button type="button" onClick={() => setShowBrackets((v) => !v)} className="text-xs font-medium text-stone-500 hover:text-stone-800">
          {showBrackets ? tr("Masquer le détail par tranche du barème →") : tr("Voir le détail par tranche du barème →")}
        </button>
        {showBrackets && (
          <div className="rounded-2xl border border-stone-100 p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-stone-400">
                  <th className="pb-1.5 font-medium">{tr("Tranche (par part)")}</th>
                  <th className="pb-1.5 text-right font-medium">{tr("Taux")}</th>
                  <th className="pb-1.5 text-right font-medium">{tr(parts > 1 ? "Impôt (× {n} parts)" : "Impôt (× {n} part)", { n: parts })}</th>
                </tr>
              </thead>
              <tbody>
                {brackets.map((b) => (
                  <tr key={b.label} className="border-t border-stone-50">
                    <td className="py-1.5 text-stone-600">{b.label}</td>
                    <td className="py-1.5 text-right text-stone-600">{(b.rate * 100).toFixed(0)}%</td>
                    <td className="py-1.5 text-right font-medium text-stone-800">{formatEUR(b.taxInBracket * parts)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-2 text-[10px] text-stone-400">{tr("Quotient familial : {amount} par part, après abattement forfaitaire de 10%.", { amount: formatEUR(quotient) })}</p>
          </div>
        )}
      </div>
    </div>
  );
}
