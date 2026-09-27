"use client";

import { useMemo, useState } from "react";
import { formatEUR } from "@/lib/utils";
import { simulateSplit } from "@/lib/finance-v2-engine";

const DEFAULT_DESTINATIONS = [
  { id: "livret", label: "Livret" },
  { id: "placement", label: "Placement" },
  { id: "projet", label: "Projet" },
];

/** Pure client-side simulation: nothing is saved until the user explicitly confirms. */
export function SplitSimulator({ amount, perWeek }: { amount: number; perWeek: number }) {
  const [values, setValues] = useState<Record<string, number>>({});
  const [saved, setSaved] = useState<Record<string, number> | null>(null);

  const destinations = DEFAULT_DESTINATIONS.map((d) => ({ ...d, value: values[d.id] ?? 0 }));
  const { allocated, remaining } = useMemo(() => simulateSplit(amount, destinations), [amount, values]);
  const remainingPerWeek = perWeek === 0 ? 0 : (remaining / amount) * perWeek;

  return (
    <div className="rounded-2xl border border-slate-100 p-4">
      <h3 className="mb-1 text-sm font-semibold text-slate-800">Répartir ce montant</h3>
      <p className="mb-3 text-xs text-slate-400">Simulation seulement : rien n'est modifié tant que tu n'enregistres pas.</p>
      <div className="space-y-2">
        {DEFAULT_DESTINATIONS.map((d) => (
          <div key={d.id} className="flex items-center gap-3">
            <label htmlFor={`split-${d.id}`} className="w-24 shrink-0 text-sm text-slate-600">{d.label}</label>
            <input
              id={`split-${d.id}`}
              type="number"
              min={0}
              step={10}
              value={values[d.id] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [d.id]: Math.max(0, Number(e.target.value) || 0) }))}
              className="input flex-1"
              placeholder="0"
            />
            <span className="w-8 text-xs text-slate-400">€</span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3 text-sm">
        <span className="text-slate-500">
          Affecté : <b className="text-slate-800">{formatEUR(allocated)}</b> · Reste : <b className={remaining < 0 ? "text-rose-600" : "text-emerald-700"}>{formatEUR(remaining)}</b>
        </span>
        <span className="text-xs text-slate-400">≈ {formatEUR(remainingPerWeek)}/semaine</span>
      </div>
      <button
        type="button"
        onClick={() => setSaved(values)}
        disabled={allocated === 0}
        className="btn-secondary mt-3 w-full py-2 text-xs disabled:opacity-40"
      >
        Enregistrer cette répartition
      </button>
      {saved && <p className="mt-2 text-center text-xs text-emerald-600">Répartition mémorisée pour cette session.</p>}
    </div>
  );
}
