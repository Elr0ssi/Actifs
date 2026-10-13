"use client";

import { useState } from "react";
import { useT } from "@/components/i18n/provider";
import { DonutChart } from "@/components/app/charts/donut-chart";
import { formatEUR } from "@/lib/utils";

/**
 * « Où est vraiment parti mon argent ? » : ce qui a réellement été prélevé avec les cartes (et validé) ce mois-ci, par catégorie.
 * À lire à côté de la répartition du budget, qui montre ce qui était PRÉVU.
 */
export function RealBreakdown({ items, plannedVariable }: { items: { label: string; value: number }[]; plannedVariable: number }) {
  const tr = useT();
  const [picked, setPicked] = useState<string | null>(null);
  const sorted = items.filter((i) => i.value > 0).sort((a, b) => b.value - a.value);
  // La palette n'a que 6 teintes distinctes : on garde les plus grosses catégories et on regroupe le reste.
  const folded = sorted.length <= 6 ? sorted : [...sorted.slice(0, 5), { label: "Autres", value: sorted.slice(5).reduce((s, i) => s + i.value, 0) }];
  const shown = folded.map((i) => ({ ...i, label: tr(i.label) }));
  const total = shown.reduce((s, i) => s + i.value, 0);
  const pickedItem = shown.find((i) => i.label === picked);

  return (
    <section className="card p-4">
      <p className="text-[13px] font-semibold text-stone-900">{tr("Répartition réelle")}</p>
      <p className="mt-0.5 text-[11px] text-stone-500">{tr("Ce qui a vraiment été prélevé avec tes cartes (et validé) ce mois-ci.")}</p>
      <p className="mt-2 text-xs text-stone-500">
        {tr("Total réellement dépensé :")} <b className="text-stone-800">{formatEUR(total)}</b>
        {plannedVariable > 0 && <> · {tr("{n} % du budget prévu", { n: Math.round((total / plannedVariable) * 100) })}</>}
      </p>
      <div className="mt-4">
        {total <= 0 ? (
          <p className="rounded-xl bg-stone-50 px-3 py-8 text-center text-xs text-stone-400">{tr("Aucun paiement réel pour l'instant ce mois-ci.")}</p>
        ) : (
          <>
            <DonutChart items={shown} size={190} strokeWidth={27} centerCaption={tr("dépensé")} selected={picked} onSelect={(l) => setPicked(l === picked ? null : l)} />
            {pickedItem && (
              <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
                <b>{pickedItem.label}</b> : {formatEUR(pickedItem.value)} {tr("soit {n} %", { n: Math.round((pickedItem.value / total) * 100) })} {tr("du réel")}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
