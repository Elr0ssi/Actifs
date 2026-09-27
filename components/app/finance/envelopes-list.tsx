"use client";

import { formatEUR } from "@/lib/utils";
import { createEnvelope, updateEnvelopeAmount, deleteEnvelope } from "@/app/app/finance/actions";
import type { Envelope } from "@/lib/data/finance-budgets";

const ICONS = ["🛒", "🚗", "🎮", "🍽️", "👕", "💊", "🏠", "🎁"];

export function EnvelopesList({ envelopes }: { envelopes: Envelope[] }) {
  const total = envelopes.reduce((s, e) => s + e.plannedAmount, 0);

  return (
    <section className="card p-6">
      <div className="flex items-baseline justify-between">
        <p className="font-semibold text-slate-900">Enveloppes mensuelles</p>
        {envelopes.length > 0 && <p className="text-sm text-slate-500">Total : <b className="text-slate-800">{formatEUR(total)}</b></p>}
      </div>
      <div className="mt-3 divide-y divide-slate-100">
        {envelopes.map((e) => (
          <div key={e.id} className="group flex items-center gap-3 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-50 text-sm">{e.icon}</span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium text-slate-800">{e.name}</p>
            <form action={updateEnvelopeAmount.bind(null, e.id)}>
              <input
                name="planned_amount"
                type="number"
                step="0.01"
                defaultValue={e.plannedAmount}
                onBlur={(ev) => ev.currentTarget.form?.requestSubmit()}
                className="input w-24 px-2 py-1.5 text-right text-sm"
              />
            </form>
            <form action={deleteEnvelope.bind(null, e.id)}>
              <button className="text-xs text-slate-300 hover:text-rose-600 group-hover:text-slate-400">✕</button>
            </form>
          </div>
        ))}
        {envelopes.length === 0 && <p className="py-2 text-sm text-slate-400">Aucune enveloppe pour l'instant.</p>}
      </div>
      <form action={createEnvelope} className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <select name="icon" defaultValue="🛒" className="input w-16 px-1 py-1.5 text-center">
          {ICONS.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <input name="name" placeholder="Nom (ex. Courses)" className="input min-w-[140px] flex-1" required />
        <input name="planned_amount" type="number" step="0.01" placeholder="€ / mois" className="input w-28" />
        <button className="btn-secondary py-1.5 text-xs">+ Ajouter</button>
      </form>
    </section>
  );
}
