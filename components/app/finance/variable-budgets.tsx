import { formatEUR } from "@/lib/utils";
import { DonutChart } from "@/components/app/charts/donut-chart";
import type { VariableBudget } from "@/lib/types";
import { createVariableBudget, updateVariableBudget, deleteVariableBudget } from "@/app/app/finance/actions";

export function VariableBudgetsSection({ budgets, spentByBudget }: { budgets: VariableBudget[]; spentByBudget: Map<string, number> }) {
  const total = budgets.reduce((s, b) => s + Number(b.planned_amount), 0);

  return (
    <section className="card p-6">
      <h2 className="mb-1 font-semibold text-slate-900">Répartition du budget variable</h2>
      <p className="mb-4 text-sm text-slate-500">Alimentation, sorties, transport… hors charges fixes.</p>

      <DonutChart items={budgets.map((b) => ({ label: `${b.icon ?? ""} ${b.name}`.trim(), value: Number(b.planned_amount) }))} />

      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4">
        {budgets.map((b) => {
          const spent = spentByBudget.get(b.id) ?? 0;
          const pct = Number(b.planned_amount) > 0 ? Math.min(100, (spent / Number(b.planned_amount)) * 100) : 0;
          return (
            <div key={b.id} className="rounded-xl border border-slate-100 p-3">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-700">
                  <span>{b.icon}</span> {b.name}
                </span>
                <span className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{formatEUR(spent)} / {formatEUR(Number(b.planned_amount))}</span>
                  <form action={deleteVariableBudget.bind(null, b.id)}>
                    <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                  </form>
                </span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div className={`h-1.5 rounded-full ${pct >= 100 ? "bg-rose-500" : "bg-brand-500"}`} style={{ width: `${pct}%` }} />
              </div>
              <form action={updateVariableBudget.bind(null, b.id)} className="mt-2 flex items-center gap-2">
                <input name="planned_amount" type="number" step="0.01" defaultValue={b.planned_amount} className="input py-1 text-xs" />
                <button className="btn-secondary py-1 text-xs">Modifier</button>
              </form>
            </div>
          );
        })}
      </div>

      <form action={createVariableBudget} className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <input name="icon" defaultValue="🛍️" className="input w-14 py-1.5 text-center" maxLength={2} />
        <input name="name" placeholder="Ex. Alimentation" className="input flex-1 min-w-[140px] py-1.5" required />
        <input name="planned_amount" type="number" step="0.01" placeholder="€ / mois" className="input w-28 py-1.5" required />
        <button className="btn-primary py-1.5 text-xs">Ajouter</button>
      </form>
      <p className="mt-2 text-right text-xs text-slate-400">Total budget variable : {formatEUR(total)}</p>
    </section>
  );
}
