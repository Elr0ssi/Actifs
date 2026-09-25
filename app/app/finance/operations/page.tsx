import Link from "next/link";
import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { CATEGORIES, KIND_LABEL, monthlyAmount, type OpKind } from "@/lib/finance-engine";
import { formatEUR, todayISO } from "@/lib/utils";
import { OperationRow } from "@/components/app/finance/operation-row";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { updateBalanceAnchor, updateSavingsConfig } from "@/app/app/finance/actions";

export const metadata: Metadata = { title: "Gérer les opérations" };

const ORDER: OpKind[] = ["fixed", "income", "variable", "savings"];

export default async function OperationsPage() {
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor, savingsRule } = data;
  const today = todayISO();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/app/finance" className="text-sm text-slate-500 hover:text-slate-800">← Finances</Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Gérer les opérations</h1>
          <p className="text-sm text-slate-500">Modifier, désactiver, supprimer ou ignorer une occurrence (cliquez sur une date à venir).</p>
        </div>
        <NewOperationButton defaultDate={today} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <form action={updateBalanceAnchor} className="card space-y-2 p-5">
          <p className="label">Solde bancaire réel aujourd'hui</p>
          <input name="current_balance" type="number" step="0.01" defaultValue={anchor.balance} className="input text-lg font-bold" />
          <p className="text-xs text-slate-400">Point de départ de toute la trésorerie (dernière mise à jour : {anchor.date}).</p>
          <button className="btn-secondary w-full">Mettre à jour</button>
        </form>

        <form action={updateSavingsConfig} className="card space-y-2 p-5">
          <p className="label">Objectif d'épargne (si aucune opération d'épargne)</p>
          <div className="flex gap-2">
            <select name="savings_mode" defaultValue={savingsRule.mode} className="input">
              <option value="fixed">Montant fixe €</option>
              <option value="percent">% des revenus</option>
            </select>
            <input name="savings_value" type="number" step="0.01" defaultValue={savingsRule.value} className="input w-28" />
          </div>
          <button className="btn-secondary w-full">Enregistrer</button>
        </form>

      </div>

      {ORDER.map((kind) => {
        const list = ops.filter((o) => o.kind === kind);
        const order = CATEGORIES[kind];
        const groups = [...new Set(list.map((o) => o.category))].sort((x, y) => {
          const ix = order.indexOf(x), iy = order.indexOf(y);
          return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy) || x.localeCompare(y);
        });
        const monthly = list.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
        return (
          <section key={kind} className="card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="font-semibold text-slate-900">{KIND_LABEL[kind]} <span className="text-sm font-normal text-slate-400">({list.length})</span></h2>
              {monthly > 0 && <span className="text-sm text-slate-500">≈ {formatEUR(monthly)} / mois</span>}
            </div>
            {list.length === 0 && <p className="text-sm text-slate-400">Aucune opération.</p>}
            <div className="space-y-4">
              {groups.map((cat) => {
                const items = list.filter((o) => o.category === cat);
                const sub = items.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span>{cat}</span>
                      {sub > 0 && <span className="normal-case">≈ {formatEUR(sub)} / mois</span>}
                    </div>
                    <ul className="space-y-2">
                      {items.map((op) => <OperationRow key={`${op.table}-${op.id}`} op={op} today={today} />)}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
