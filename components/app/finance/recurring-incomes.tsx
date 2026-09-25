import { formatEUR } from "@/lib/utils";
import type { Income } from "@/lib/types";
import { ToggleSwitch } from "@/components/app/toggle-switch";
import { createIncome, deleteIncome, toggleIncomeActive } from "@/app/app/finance/actions";

const FREQ_LABEL: Record<string, string> = { monthly: "mois", yearly: "an", weekly: "semaine", once: "unique" };

export function RecurringIncomes({ incomes }: { incomes: Income[] }) {
  return (
    <section className="card p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold text-slate-900">Revenus récurrents</h2>
      </div>
      <div className="space-y-1">
        {incomes.map((i) => (
          <div key={i.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-sm">💶</span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-800">{i.name}</p>
                <p className="truncate text-xs text-slate-400">
                  {i.recurring ? `Le ${new Date(`${i.expected_date}T00:00:00`).getDate()} de chaque ${FREQ_LABEL[i.frequency]}` : `Le ${i.expected_date}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="text-sm font-semibold text-slate-700">{formatEUR(Number(i.amount))}</span>
              <ToggleSwitch initialChecked={i.active} onToggle={toggleIncomeActive.bind(null, i.id)} />
              <form action={deleteIncome.bind(null, i.id)}>
                <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
              </form>
            </div>
          </div>
        ))}
        {incomes.length === 0 && <p className="text-sm text-slate-400">Aucun revenu programmé.</p>}
      </div>

      <form action={createIncome} className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <input name="name" placeholder="Ex. Salaire" className="input flex-1 min-w-[120px] py-1.5" required />
        <input name="amount" type="number" step="0.01" placeholder="€" className="input w-24 py-1.5" required />
        <input name="expected_date" type="date" className="input w-40 py-1.5" required />
        <select name="frequency" className="input w-28 py-1.5" defaultValue="monthly">
          <option value="monthly">Mensuel</option>
          <option value="yearly">Annuel</option>
          <option value="weekly">Hebdo</option>
          <option value="once">Ponctuel</option>
        </select>
        <label className="flex items-center gap-1.5 text-xs text-slate-500">
          <input type="checkbox" name="recurring" defaultChecked className="h-4 w-4 rounded border-slate-300" /> Récurrent
        </label>
        <button className="btn-secondary py-1.5 text-xs">+ Ajouter un revenu</button>
      </form>
    </section>
  );
}
