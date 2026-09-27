"use client";

import { useMemo, useState } from "react";
import { formatEUR, cx } from "@/lib/utils";
import { updateBudgetPlan } from "@/app/app/finance/actions";
import type { BudgetPlan, MonthlyBudget } from "@/lib/finance-engine";

const ROWS: { key: "income" | "fixed" | "variable" | "savings"; label: string; hint: string; icon: string; sign: 1 | -1 }[] = [
  { key: "income", label: "Revenus prévus", hint: "Salaires, revenus complémentaires…", icon: "↑", sign: 1 },
  { key: "fixed", label: "Charges fixes", hint: "Loyer, abonnements, assurances…", icon: "↓", sign: -1 },
  { key: "variable", label: "Dépenses variables prévues", hint: "Courses, transport, loisirs…", icon: "↓", sign: -1 },
  { key: "savings", label: "Épargne planifiée", hint: "Livret, PEA, projets…", icon: "🐷", sign: -1 },
];

/** Budget théorique éditable, avec le réel de chaque poste juste à côté pour comparer d'un coup d'œil. */
export function BudgetEditor({ plan, budget }: { plan: BudgetPlan; budget: MonthlyBudget }) {
  const [values, setValues] = useState({ income: plan.income, fixed: plan.fixed, variable: plan.variable, savings: plan.savingsMode === "percent" ? Math.round((plan.income * plan.savingsValue) / 100) : plan.savingsValue });
  const [savingsMode, setSavingsMode] = useState(plan.savingsMode);
  const margin = useMemo(() => values.income - values.fixed - values.variable - values.savings, [values]);
  const real = { income: budget.income, fixed: budget.fixed, variable: budget.variable, savings: budget.savings };

  return (
    <section className="card p-5">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold text-slate-900">Budget & réel du mois</p>
        <p className="text-xs text-slate-400">Le chiffre grisé sous chaque case est ce que tu as vraiment fait, d'après tes opérations.</p>
      </div>

      <form action={updateBudgetPlan} className="mt-4 divide-y divide-slate-100">
        {ROWS.map((r) => (
          <div key={r.key} className="flex items-center gap-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm">{r.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{r.label}</p>
              <p className="truncate text-xs text-slate-400">{r.hint}</p>
            </div>
            <div className="shrink-0 text-right">
              {r.key === "savings" ? (
                <div className="flex gap-1">
                  <select
                    name="savings_mode"
                    value={savingsMode}
                    onChange={(e) => setSavingsMode(e.target.value as "fixed" | "percent")}
                    className="input w-16 px-1 py-1.5 text-xs"
                  >
                    <option value="fixed">€</option>
                    <option value="percent">%</option>
                  </select>
                  <input
                    name="savings_value"
                    type="number"
                    step="0.01"
                    value={savingsMode === "percent" ? plan.savingsValue : values.savings}
                    onChange={(e) => {
                      const n = Math.max(0, Number(e.target.value) || 0);
                      setValues((v) => ({ ...v, savings: savingsMode === "percent" ? Math.round((values.income * n) / 100) : n }));
                    }}
                    className="input w-24 px-2 py-1.5 text-right font-semibold"
                  />
                </div>
              ) : (
                <input
                  name={`budget_${r.key}`}
                  type="number"
                  step="0.01"
                  value={values[r.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [r.key]: Math.max(0, Number(e.target.value) || 0) }))}
                  className="input w-28 px-2 py-1.5 text-right font-semibold"
                />
              )}
              <p className={cx("mt-1 text-xs", real[r.key] === values[r.key] ? "text-slate-400" : real[r.key] * r.sign >= values[r.key] * r.sign ? "text-emerald-600" : "text-rose-500")}>
                Réel : {formatEUR(real[r.key])}
              </p>
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between gap-3 pt-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">Marge théorique du mois</p>
            <p className="text-[11px] text-slate-400">
              {formatEUR(values.income)} − {formatEUR(values.fixed)} − {formatEUR(values.variable)} − {formatEUR(values.savings)} = {formatEUR(margin)}
            </p>
          </div>
          <p className={cx("text-2xl font-bold", margin >= 0 ? "text-emerald-600" : "text-rose-600")}>{formatEUR(margin)}</p>
        </div>
        <div className="flex justify-end pt-3">
          <button className="btn-primary px-4 py-1.5 text-xs">Enregistrer le budget</button>
        </div>
      </form>
    </section>
  );
}
