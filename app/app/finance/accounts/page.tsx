import type { Metadata } from "next";
import { loadFinanceData, ACCOUNTS } from "@/lib/data/finance";
import { formatEUR, todayISO } from "@/lib/utils";
import { updateBalanceAnchor, updateGoal } from "@/app/app/finance/actions";

export const metadata: Metadata = { title: "Finance — Comptes" };

const META: Record<string, { icon: string; hint: string; goalType?: "savings" | "investment" }> = {
  Courant: { icon: "💳", hint: "Trésorerie du quotidien" },
  Épargne: { icon: "🐷", hint: "Livrets", goalType: "savings" },
  Investissement: { icon: "📈", hint: "PEA, CTO, assurance-vie…", goalType: "investment" },
};

export default async function AccountsPage() {
  const data = await loadFinanceData();
  if (!data) return null;
  const today = todayISO();

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {ACCOUNTS.map((name) => {
        const acc = data.accounts[name];
        const meta = META[name];
        const goal = meta.goalType ? data.goals[meta.goalType] : 0;
        const pct = goal > 0 && acc.last ? Math.min(100, Math.round((acc.last.balance / goal) * 100)) : null;
        return (
          <div key={name} className="card space-y-3 p-5">
            <div>
              <p className="flex items-center gap-2 font-semibold text-slate-900">{meta.icon} {name}</p>
              <p className="text-xs text-slate-400">{meta.hint}</p>
            </div>

            <div>
              <p className="text-2xl font-bold text-slate-900">{acc.last ? formatEUR(acc.last.balance) : "Solde inconnu"}</p>
              {acc.last && <p className="text-[11px] text-slate-400">au {new Date(`${acc.last.date}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })}, mouvements ultérieurs non compris ici</p>}
            </div>

            {meta.goalType && (
              <div>
                {goal > 0 ? (
                  <>
                    <div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${pct}%` }} /></div>
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

            <form action={updateBalanceAnchor.bind(null, name)} className="flex gap-1.5 border-t border-slate-100 pt-3">
              <input name="entry_date" type="date" defaultValue={today} className="input min-w-0 px-2 py-1 text-xs" />
              <input name="current_balance" type="number" step="0.01" placeholder="Solde" className="input w-20 min-w-0 px-2 py-1 text-xs" required />
              <button className="btn-primary shrink-0 px-2.5 py-1 text-xs">OK</button>
            </form>

            {acc.history.length > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-slate-400">Historique ({acc.history.length})</summary>
                <ul className="mt-2 space-y-1">
                  {[...acc.history].reverse().map((h) => (
                    <li key={h.date} className="flex justify-between text-slate-500">
                      <span>{new Date(`${h.date}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span>
                      <span className="font-medium text-slate-700">{formatEUR(h.balance)}</span>
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </div>
        );
      })}
    </div>
  );
}
