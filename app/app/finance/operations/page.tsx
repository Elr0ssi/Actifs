import Link from "next/link";
import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { KIND_LABEL, type OpKind } from "@/lib/finance-engine";
import { formatEUR, todayISO } from "@/lib/utils";
import { OperationRow } from "@/components/app/finance/operation-row";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import {
  createVariableBudget,
  deleteVariableBudget,
  updateBalanceAnchor,
  updateSavingsConfig,
  updateVariableBudget,
} from "@/app/app/finance/actions";

export const metadata: Metadata = { title: "Gérer les opérations" };

const ORDER: OpKind[] = ["fixed", "income", "variable", "savings"];

export default async function OperationsPage() {
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor, budgets, savingsRule } = data;
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

      <div className="grid gap-4 lg:grid-cols-3">
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

        <div className="card p-5">
          <p className="label mb-2">Budget variable planifié / mois</p>
          <ul className="space-y-1.5">
            {budgets.map((b) => (
              <li key={b.id} className="flex items-center gap-2 text-sm">
                <span className="flex-1 truncate text-slate-700">{b.name}</span>
                <form action={updateVariableBudget.bind(null, b.id)} className="flex items-center gap-1">
                  <input name="planned_amount" type="number" step="0.01" defaultValue={b.amount} className="input w-24 py-1 text-xs" />
                  <button className="text-xs text-brand-600">✓</button>
                </form>
                <form action={deleteVariableBudget.bind(null, b.id)}>
                  <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                </form>
              </li>
            ))}
          </ul>
          <form action={createVariableBudget} className="mt-3 flex gap-1.5">
            <input name="name" placeholder="Courses, Sorties…" className="input py-1.5 text-xs" required />
            <input name="planned_amount" type="number" step="0.01" placeholder="€" className="input w-20 py-1.5 text-xs" required />
            <button className="btn-secondary px-2 py-1.5 text-xs">+</button>
          </form>
          <p className="mt-2 text-right text-xs text-slate-400">Total : {formatEUR(budgets.reduce((s, b) => s + b.amount, 0))}</p>
        </div>
      </div>

      {ORDER.map((kind) => {
        const list = ops.filter((o) => o.kind === kind);
        return (
          <section key={kind} className="card p-5">
            <h2 className="mb-3 font-semibold text-slate-900">{KIND_LABEL[kind]} <span className="text-sm font-normal text-slate-400">({list.length})</span></h2>
            {list.length === 0 && <p className="text-sm text-slate-400">Aucune opération.</p>}
            <ul className="space-y-2">
              {list.map((op) => <OperationRow key={`${op.table}-${op.id}`} op={op} today={today} />)}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
