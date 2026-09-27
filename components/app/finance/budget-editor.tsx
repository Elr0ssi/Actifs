"use client";

import { useMemo, useState } from "react";
import { formatEUR, cx } from "@/lib/utils";
import { saveMonthlyBudget } from "@/app/app/finance/actions";
import type { MonthPlan } from "@/lib/data/finance-budgets";

const ROWS: { key: "income" | "fixed" | "variable" | "savings"; label: string; hint: string; icon: string }[] = [
  { key: "income", label: "Revenus prévus", hint: "Salaires, revenus complémentaires…", icon: "↑" },
  { key: "fixed", label: "Charges fixes", hint: "Loyer, abonnements, assurances…", icon: "↓" },
  { key: "variable", label: "Dépenses variables prévues", hint: "Courses, transport, loisirs, autres…", icon: "↓" },
  { key: "savings", label: "Épargne planifiée", hint: "Livret, PEA, projets…", icon: "🐷" },
];

/** "Prévision du mois" éditable + panneau "Personnaliser", au plus proche de la maquette. */
export function BudgetEditor({ year, month, plan }: { year: number; month: number; plan: MonthPlan }) {
  const [values, setValues] = useState({ income: plan.income, fixed: plan.fixed, variable: plan.variable, savings: plan.savings });
  const [showCategories, setShowCategories] = useState(plan.showCategories);
  const [capVariable, setCapVariable] = useState(plan.capVariable);
  const margin = useMemo(() => values.income - values.fixed - values.variable - values.savings, [values]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <form action={saveMonthlyBudget.bind(null, year, month)} className="card p-6">
        <p className="font-semibold text-slate-900">Prévision du mois</p>
        <div className="mt-3 divide-y divide-slate-100">
          {ROWS.map((r) => {
            if (r.key === "variable" && capVariable === false) return null;
            return (
              <div key={r.key} className="flex items-center gap-3 py-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm">{r.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">{r.label}</p>
                  <p className="truncate text-xs text-slate-400">{r.hint}</p>
                </div>
                <input
                  name={r.key}
                  type="number"
                  step="0.01"
                  value={values[r.key]}
                  onChange={(e) => setValues((v) => ({ ...v, [r.key]: Math.max(0, Number(e.target.value) || 0) }))}
                  className="input w-28 shrink-0 px-2 py-1.5 text-right font-semibold"
                />
              </div>
            );
          })}
          {!capVariable && <input type="hidden" name="variable" value={values.variable} />}
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl bg-emerald-50/60 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-emerald-900">Marge théorique du mois</p>
            <p className="text-[11px] text-emerald-700/80">
              {formatEUR(values.income)} − {formatEUR(values.fixed)} − {formatEUR(values.variable)} − {formatEUR(values.savings)} = {formatEUR(margin)}
            </p>
          </div>
          <p className={cx("text-2xl font-bold", margin >= 0 ? "text-emerald-700" : "text-rose-600")}>{formatEUR(margin)}</p>
        </div>

        <input type="hidden" name="show_categories" value={showCategories ? "on" : ""} />
        <input type="hidden" name="cap_variable" value={capVariable ? "on" : ""} />
        <label className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" name="recurring" defaultChecked={plan.recurring} />
          Dupliquer ce budget sur les 11 prochains mois
        </label>
        <button className="btn-primary mt-4 w-full py-2 text-sm">Enregistrer</button>
      </form>

      <div className="card space-y-4 p-5">
        <p className="font-semibold text-slate-900">Personnaliser</p>
        <label className="flex cursor-pointer items-start justify-between gap-3">
          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800"><span>📋</span>Afficher les catégories</span>
            <span className="mt-0.5 block text-xs text-slate-400">Voir et modifier les enveloppes mensuelles ci-dessous.</span>
          </span>
          <input type="checkbox" checked={showCategories} onChange={(e) => setShowCategories(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
        </label>
        <label className="flex cursor-pointer items-start justify-between gap-3">
          <span>
            <span className="flex items-center gap-2 text-sm font-medium text-slate-800"><span>🛡️</span>Fixer un plafond</span>
            <span className="mt-0.5 block text-xs text-slate-400">Définir un plafond global de dépenses variables.</span>
          </span>
          <input type="checkbox" checked={capVariable} onChange={(e) => setCapVariable(e.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-brand-600" />
        </label>
        <a href="#comparer" className="flex items-center gap-2 border-t border-slate-100 pt-4 text-sm font-medium text-brand-600">
          📊 Comparer au réel
        </a>
      </div>
    </div>
  );
}
