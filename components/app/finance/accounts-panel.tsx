"use client";

import { useState } from "react";
import { formatEUR, cx } from "@/lib/utils";
import { updateBalanceAnchor, updateGoal } from "@/app/app/finance/actions";
import type { AccountName } from "@/lib/data/finance";

const ACCOUNT_META: Record<AccountName, { icon: string; hint: string; goalType?: "savings" | "investment" }> = {
  Courant: { icon: "💳", hint: "Trésorerie du quotidien" },
  Épargne: { icon: "🐷", hint: "Livrets", goalType: "savings" },
  Investissement: { icon: "📈", hint: "PEA, CTO, assurance-vie…", goalType: "investment" },
};

type Entry = { date: string; balance: number };

/**
 * Saisie du solde réel par compte, daté : ressaisir une valeur à une date annule le cumul
 * projeté depuis le dernier point pour ce compte uniquement. Épargne/Investissement gardent
 * en plus une jauge d'objectif.
 */
export function AccountsPanel({
  accounts,
  goals,
  today,
}: {
  accounts: Record<AccountName, { history: Entry[]; last: Entry | null }>;
  goals: { savings: number; investment: number };
  today: string;
}) {
  const names = Object.keys(accounts) as AccountName[];
  const [tab, setTab] = useState<AccountName>("Courant");
  const acc = accounts[tab];
  const meta = ACCOUNT_META[tab];
  const goal = meta.goalType ? goals[meta.goalType] : 0;
  const pct = goal > 0 && acc.last ? Math.min(100, Math.round((acc.last.balance / goal) * 100)) : null;

  return (
    <div className="card p-4">
      <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
        {names.map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setTab(n)}
            className={cx("flex-1 rounded-lg px-2 py-1.5 transition", tab === n ? "bg-white text-slate-900 shadow-sm" : "text-slate-500")}
          >
            {ACCOUNT_META[n].icon} {n}
          </button>
        ))}
      </div>

      <div className="mt-3">
        <p className="text-xs text-slate-400">{meta.hint}</p>
        <p className="mt-0.5 text-2xl font-bold text-slate-900">{acc.last ? formatEUR(acc.last.balance) : "—"}</p>
        {acc.last && <p className="text-[11px] text-slate-400">au {new Date(`${acc.last.date}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })}</p>}

        {meta.goalType && (
          <div className="mt-2">
            {goal > 0 ? (
              <>
                <div className="h-1.5 rounded-full bg-slate-100">
                  <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{pct}% de l'objectif ({formatEUR(goal)})</p>
              </>
            ) : (
              <p className="text-[11px] text-slate-400">Aucun objectif fixé.</p>
            )}
            <form action={updateGoal.bind(null, meta.goalType)} className="mt-1.5 flex gap-1.5">
              <input name="goal" type="number" step="0.01" placeholder="Objectif €" defaultValue={goal || ""} className="input min-w-0 px-2 py-1 text-xs" />
              <button className="btn-secondary shrink-0 px-2 py-1 text-xs">Fixer</button>
            </form>
          </div>
        )}

        <form action={updateBalanceAnchor.bind(null, tab)} className="mt-3 flex gap-1.5 border-t border-slate-100 pt-3">
          <input name="entry_date" type="date" defaultValue={today} className="input min-w-0 px-2 py-1 text-xs" />
          <input name="current_balance" type="number" step="0.01" placeholder="Solde" className="input w-20 min-w-0 px-2 py-1 text-xs" required />
          <button className="btn-primary shrink-0 px-2.5 py-1 text-xs">OK</button>
        </form>
      </div>
    </div>
  );
}
