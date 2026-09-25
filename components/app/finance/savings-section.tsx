import { formatEUR } from "@/lib/utils";
import type { Investment, SavingsMode } from "@/lib/types";
import { updateSavingsConfig, createInvestment, deleteInvestment } from "@/app/app/finance/actions";

export function SavingsSection({
  mode,
  value,
  computedAmount,
  investments,
}: {
  mode: SavingsMode;
  value: number;
  computedAmount: number;
  investments: Investment[];
}) {
  return (
    <section className="card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Épargne / Investissements</h2>
        <span className="text-sm font-semibold text-brand-600">{formatEUR(computedAmount)}/mois</span>
      </div>
      <p className="mb-4 text-sm text-slate-500">Montant fixe ou pourcentage des revenus, mis de côté chaque mois.</p>

      <form action={updateSavingsConfig} className="mb-5 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 p-3">
        <select name="savings_mode" defaultValue={mode} className="input w-32 py-1.5">
          <option value="fixed">Montant fixe</option>
          <option value="percent">% des revenus</option>
        </select>
        <input name="savings_value" type="number" step="0.01" defaultValue={value} className="input w-28 py-1.5" />
        <button className="btn-secondary py-1.5 text-xs">Enregistrer</button>
      </form>

      <ul className="space-y-2">
        {investments.map((inv) => (
          <li key={inv.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
            <span>
              <span className="font-medium text-slate-800">{inv.project_name}</span>
              <span className="ml-2 text-xs text-slate-400">investi le {inv.invested_date}</span>
            </span>
            <span className="flex items-center gap-3">
              <span className="font-semibold text-brand-600">{formatEUR(Number(inv.amount_invested))}</span>
              <form action={deleteInvestment.bind(null, inv.id)}>
                <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
              </form>
            </span>
          </li>
        ))}
        {investments.length === 0 && <p className="text-sm text-slate-400">Aucun investissement enregistré.</p>}
      </ul>

      <form action={createInvestment} className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <input name="project_name" placeholder="Ex. Livret A, PEA…" className="input flex-1 min-w-[140px] py-1.5" required />
        <input name="amount_invested" type="number" step="0.01" placeholder="€" className="input w-24 py-1.5" required />
        <input name="invested_date" type="date" className="input w-40 py-1.5" required />
        <button className="btn-secondary py-1.5 text-xs">+ Ajouter un investissement</button>
      </form>
    </section>
  );
}
