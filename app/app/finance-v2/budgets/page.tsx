import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceV2Data } from "@/lib/data/finance-v2";
import { monthActuals } from "@/lib/finance-v2-engine";
import { formatEUR, todayISO } from "@/lib/utils";
import { saveMonthlyBudget, reconductMonthlyBudget } from "@/app/app/finance-v2/actions";

export const metadata: Metadata = { title: "Finance — Budgets" };
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const data = await loadFinanceV2Data();
  if (!data) return null;

  const now = new Date(`${todayISO()}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const planned = data.plansByMonth.get(`${year}-${month}`);
  const actuals = monthActuals(data.ops, year, month);

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const hasPrevPlan = data.plansByMonth.has(`${prevMonth.y}-${prevMonth.m}`);

  const row = (label: string, key: "income" | "fixed" | "variable" | "savings") => {
    const budgeted = planned?.[key] ?? 0;
    const real = actuals[key];
    const diff = budgeted - real;
    return (
      <tr key={key} className="border-t border-slate-100">
        <td className="py-2 text-sm text-slate-700">{label}</td>
        <td className="py-2 text-right text-sm font-medium text-slate-800">{formatEUR(budgeted)}</td>
        <td className="py-2 text-right text-sm text-slate-500">{formatEUR(real)}</td>
        <td className={`py-2 text-right text-sm font-medium ${Math.abs(diff) < 0.01 ? "text-slate-300" : diff < 0 ? "text-rose-600" : "text-emerald-600"}`}>
          {Math.abs(diff) < 0.01 ? "—" : `${diff > 0 ? "+" : ""}${formatEUR(diff)}`}
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href={`/app/finance-v2/budgets?year=${prevMonth.y}&month=${prevMonth.m}`} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
        <span className="text-sm font-semibold capitalize text-slate-800">{MONTHS_FR[month]} {year}</span>
        <Link href={`/app/finance-v2/budgets?year=${month === 11 ? year + 1 : year}&month=${month === 11 ? 0 : month + 1}`} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
      </div>

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">Budget théorique — propre à ce mois</h2>
          {!planned && hasPrevPlan && (
            <form action={reconductMonthlyBudget.bind(null, prevMonth.y, prevMonth.m, year, month)}>
              <button className="text-xs font-medium text-brand-600">Reconduire le mois précédent</button>
            </form>
          )}
        </div>
        <p className="mb-3 text-xs text-slate-400">Modifier ce mois ne change jamais les mois passés. Un budget non saisi est calculé depuis les opérations récurrentes.</p>
        <form action={saveMonthlyBudget.bind(null, year, month)} className="grid gap-3 sm:grid-cols-4">
          {(["income", "fixed", "variable", "savings"] as const).map((k) => (
            <label key={k} className="text-xs text-slate-500">
              {{ income: "Revenus", fixed: "Charges fixes", variable: "Enveloppes variables", savings: "Épargne / invest." }[k]}
              <input name={k} type="number" step="0.01" defaultValue={planned?.[k] ?? actuals[k]} className="input mt-1" />
            </label>
          ))}
          <button className="btn-primary sm:col-span-4">Enregistrer le budget de {MONTHS_FR[month]}</button>
        </form>
      </div>

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Budget saisi vs opérations récurrentes</h2>
        <p className="mb-3 text-xs text-slate-400">Aucune somme silencieuse entre les deux sources : l'écart est toujours affiché.</p>
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-medium">Poste</th>
              <th className="pb-2 text-right font-medium">Budgété</th>
              <th className="pb-2 text-right font-medium">Opérations prévues</th>
              <th className="pb-2 text-right font-medium">Écart</th>
            </tr>
          </thead>
          <tbody>
            {row("Revenus", "income")}
            {row("Charges fixes", "fixed")}
            {row("Enveloppes variables", "variable")}
            {row("Épargne / invest.", "savings")}
          </tbody>
        </table>
        {!planned && <p className="mt-3 text-xs text-slate-400">Aucun budget saisi pour ce mois : les deux colonnes reprennent les opérations récurrentes, écart nul par construction.</p>}
      </div>
    </div>
  );
}
