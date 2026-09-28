"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatEUR, cx } from "@/lib/utils";

const DESTINATIONS = [
  { id: "livret", label: "Livret A", icon: "🐷" },
  { id: "pea", label: "PEA", icon: "📈" },
  { id: "projet", label: "Projet", icon: "🎯" },
];

export function OverviewPanel({
  monthLabel,
  year,
  month,
  mode,
  headline,
  isCarried,
  refDateLabel,
  realBalance,
  realBalanceDateLabel,
  perWeek,
  formulaLine,
}: {
  monthLabel: string;
  year: number;
  month: number;
  mode: "month" | "carried";
  headline: number;
  isCarried: boolean;
  refDateLabel: string;
  realBalance: number;
  realBalanceDateLabel: string;
  perWeek: number | null;
  formulaLine: string;
}) {
  const monthUrl = (m: "month" | "carried") => `/app/finance?year=${year}&month=${month}&mode=${m}`;
  const [values, setValues] = useState<Record<string, number>>({});
  const allocated = Object.values(values).reduce((s, v) => s + v, 0);
  const after = headline - allocated;
  const afterPerWeek = perWeek !== null && headline !== 0 ? (after / headline) * perWeek : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-slate-900">{monthLabel}</p>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
          <Link href={monthUrl("month")} className={cx("rounded-lg px-3 py-1.5", mode === "month" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
            Mois seul
          </Link>
          <Link href={monthUrl("carried")} className={cx("rounded-lg px-3 py-1.5", mode === "carried" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}>
            Avec solde reporté
          </Link>
        </div>
      </div>
      <p className="-mt-3 text-xs text-slate-400">
        {isCarried ? "Trésorerie projetée : ton solde réel daté, plus les opérations à venir." : "Mois seul : sans les gains ni les pertes des mois précédents."}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{isCarried ? "Trésorerie projetée" : "Reste à vivre théorique"}</p>
          <p className={cx("mt-1 text-4xl font-bold tabular-nums", headline < 0 ? "text-rose-600" : "text-slate-900")}>{formatEUR(headline)}</p>
          <p className="mt-2 text-xs text-slate-400">Référence : {refDateLabel} · estimation</p>
        </div>
        <div className="card flex flex-col justify-between p-6">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solde réel au {realBalanceDateLabel}</p>
            <p className="mt-1 text-3xl font-bold text-slate-900">{formatEUR(realBalance)}</p>
          </div>
          <Link href="/app/finance/accounts" className="btn-secondary mt-4 py-1.5 text-center text-xs">✏️ Mettre à jour</Link>
        </div>
      </div>

      <section className="card p-6">
        <p className="font-semibold text-slate-900">Répartir ce montant</p>
        <div className="mt-4 space-y-4">
          {DESTINATIONS.map((d) => {
            const max = Math.max(50, Math.round(headline / 10) * 10);
            const value = values[d.id] ?? 0;
            return (
              <div key={d.id} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-slate-600">{d.icon} {d.label}</span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(max, value)}
                  step={10}
                  value={value}
                  onChange={(e) => setValues((v) => ({ ...v, [d.id]: Number(e.target.value) }))}
                  className="h-1.5 flex-1 accent-brand-600"
                />
                <input
                  type="number"
                  min={0}
                  step={10}
                  value={value}
                  onChange={(e) => setValues((v) => ({ ...v, [d.id]: Math.max(0, Number(e.target.value) || 0) }))}
                  className="input w-24 px-2 py-1.5 text-right text-sm"
                />
              </div>
            );
          })}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-emerald-50/60 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-emerald-800">Après répartition</p>
            <p className={cx("text-2xl font-bold", after >= 0 ? "text-emerald-700" : "text-rose-600")}>{formatEUR(after)} <span className="text-sm font-normal">à vivre</span></p>
          </div>
          {afterPerWeek !== null && <p className="text-sm text-emerald-700">≈ {formatEUR(afterPerWeek)} / semaine</p>}
        </div>

        <details className="mt-4 text-sm">
          <summary className="cursor-pointer text-slate-500">
            <span className="mr-1">📋</span>Voir le calcul et les opérations prévues
          </summary>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">{formulaLine}</p>
          <Link href="/app/finance/calendar" className="mt-2 inline-block text-xs font-medium text-brand-600">Voir les opérations sur le calendrier →</Link>
        </details>
      </section>
    </div>
  );
}
