"use client";

import { useState } from "react";
import { addOperation } from "@/app/app/finance/actions";
import type { VariableBudget } from "@/lib/types";

export function AddOperationModal({ budgets }: { budgets: VariableBudget[] }) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState("expense");

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary">
        + Ajouter une opération
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">Nouvelle opération</h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
            </div>
            <form
              action={async (formData) => {
                await addOperation(formData);
                setOpen(false);
              }}
              className="space-y-3"
            >
              <div className="flex rounded-xl bg-slate-100 p-1 text-sm font-medium">
                {[
                  { v: "expense", l: "Dépense" },
                  { v: "income", l: "Revenu" },
                  { v: "investment", l: "Investissement" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    type="button"
                    onClick={() => setKind(opt.v)}
                    className={`flex-1 rounded-lg py-1.5 transition ${kind === opt.v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
              <input type="hidden" name="op_kind" value={kind} />

              <input name="label" placeholder="Libellé" className="input" required />
              <div className="flex gap-2">
                <input name="amount" type="number" step="0.01" placeholder="Montant €" className="input" required />
                <input name="txn_date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="input" />
              </div>

              {kind === "expense" && budgets.length > 0 && (
                <select name="variable_budget_id" className="input">
                  <option value="">Sans catégorie de budget</option>
                  {budgets.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.icon} {b.name}
                    </option>
                  ))}
                </select>
              )}

              <button className="btn-primary w-full">Enregistrer</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
