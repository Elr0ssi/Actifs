"use client";

import { useState } from "react";
import { formatEUR, cx } from "@/lib/utils";
import type { PeriodAvailable } from "@/lib/finance";

type PeriodCard = PeriodAvailable & { label: string };

const TABS = ["Semaine", "Week-end", "Mois"] as const;

export function AvailableByPeriod({
  weeks,
  weekends,
  month,
  nextIncome,
}: {
  weeks: PeriodCard[];
  weekends: PeriodCard[];
  month: PeriodCard;
  nextIncome: { date: string; name: string; amount: number; days: number; available: number; perDay: number } | null;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Semaine");
  const cards = tab === "Semaine" ? weeks : tab === "Week-end" ? weekends : [month];

  return (
    <section className="card p-6">
      <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Disponible par période</h2>
          <p className="text-sm text-slate-500">Montant estimé après charges, budget variable et épargne.</p>
        </div>
        <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cx("rounded-lg px-3 py-1.5 transition", tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {nextIncome && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-brand-900">
              Disponible jusqu'au {nextIncome.date} <span className="text-brand-600">({nextIncome.days}j)</span>
            </p>
            <p className="text-xs text-brand-700/70">
              Prochain revenu : {nextIncome.name} le {nextIncome.date} (+{formatEUR(nextIncome.amount)})
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-brand-700">{formatEUR(nextIncome.available)}</p>
            <p className="text-xs text-brand-600">≈ {formatEUR(nextIncome.perDay)}/jour</p>
          </div>
        </div>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => (
          <div key={i} className="rounded-2xl border border-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{c.label}</p>
            <p className={cx("mt-1 text-2xl font-bold", c.available >= 0 ? "text-slate-900" : "text-rose-600")}>{formatEUR(c.available)}</p>
            <p className="text-xs text-slate-400">{formatEUR(c.perDay)}/jour</p>
            <dl className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <Row label="Revenus" value={c.income} positive />
              <Row label="Charges fixes" value={-c.expense} />
              <Row label="Budget variable" value={-c.variable} />
              <Row label="Épargne" value={-c.savings} />
            </dl>
          </div>
        ))}
        {cards.length === 0 && <p className="text-sm text-slate-400">Rien à afficher.</p>}
      </div>
    </section>
  );
}

function Row({ label, value, positive }: { label: string; value: number; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt>{label}</dt>
      <dd className={positive ? "text-emerald-600" : "text-rose-500"}>
        {value >= 0 ? "+" : ""}
        {formatEUR(value)}
      </dd>
    </div>
  );
}
