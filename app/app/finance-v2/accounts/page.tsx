import type { Metadata } from "next";
import { loadFinanceV2Data } from "@/lib/data/finance-v2";
import { accountBalanceAt } from "@/lib/finance-v2-engine";
import { formatEUR, todayISO } from "@/lib/utils";
import { createAccount, deleteAccount, addBalancePoint, createTransfer, savePrefs } from "@/app/app/finance-v2/actions";

export const metadata: Metadata = { title: "Finance — Comptes" };

const TYPE_LABEL: Record<string, string> = { checking: "Compte courant", savings: "Livret", investment: "Investissement", other: "Autre" };

export default async function AccountsPage() {
  const data = await loadFinanceV2Data();
  if (!data) return null;
  const today = todayISO();

  return (
    <div className="space-y-6">
      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouveau compte</h2>
        <form action={createAccount} className="flex flex-wrap gap-2">
          <input name="name" placeholder="Nom (ex. Compte joint, Livret A…)" className="input flex-1 min-w-[180px]" required />
          <select name="type" defaultValue="checking" className="input w-48">
            {Object.entries(TYPE_LABEL).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          <button className="btn-primary">Ajouter</button>
        </form>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {data.accounts.map((a) => {
          const { balance, asOf, unknown } = accountBalanceAt(a, data.points, data.transfers, data.ops, today);
          const history = data.points.filter((p) => p.accountId === a.id).sort((x, y) => y.effectiveDate.localeCompare(x.effectiveDate));
          const included = data.prefs.includedAccounts.includes(a.id);
          return (
            <div key={a.id} className="card p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900">{a.name}</p>
                  <p className="text-xs text-slate-400">
                    {TYPE_LABEL[a.type]} · {included ? "compte inclus dans la trésorerie" : "exclu de la trésorerie"}
                  </p>
                </div>
                <form action={deleteAccount.bind(null, a.id)}>
                  <button className="text-xs text-slate-400 hover:text-rose-600">Supprimer</button>
                </form>
              </div>

              <p className="mt-3 text-2xl font-bold text-slate-900">{unknown ? "Solde inconnu" : formatEUR(balance ?? 0)}</p>
              {!unknown && <p className="text-xs text-slate-400">Depuis le point du {asOf && new Date(`${asOf}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })}, mouvements compris</p>}

              <form action={addBalancePoint.bind(null, a.id)} className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-100 pt-3">
                <label className="text-xs text-slate-500">
                  Solde
                  <input name="amount" type="number" step="0.01" placeholder="0,00" className="input mt-1 w-28" required />
                </label>
                <label className="text-xs text-slate-500">
                  À la date
                  <input name="effective_date" type="date" defaultValue={today} className="input mt-1" required />
                </label>
                <button className="btn-secondary py-2 text-xs">Enregistrer</button>
              </form>

              {history.length > 0 && (
                <details className="mt-3 text-xs">
                  <summary className="cursor-pointer text-slate-400">Historique ({history.length})</summary>
                  <ul className="mt-2 space-y-1">
                    {history.map((h) => (
                      <li key={h.effectiveDate} className="flex justify-between text-slate-500">
                        <span>{new Date(`${h.effectiveDate}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</span>
                        <span className="font-medium text-slate-700">{formatEUR(h.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </div>
          );
        })}
        {data.accounts.length === 0 && <p className="text-sm text-slate-400">Aucun compte pour l'instant.</p>}
      </div>

      {data.accounts.length >= 2 && (
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Virement entre comptes</h2>
          <p className="mb-3 text-xs text-slate-400">Débite un compte, crédite l'autre. N'est jamais compté comme dépense ou revenu.</p>
          <form action={createTransfer} className="flex flex-wrap items-end gap-2">
            <label className="text-xs text-slate-500">
              De
              <select name="from_account_id" className="input mt-1" required>
                {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Vers
              <select name="to_account_id" className="input mt-1" required>
                {data.accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </label>
            <label className="text-xs text-slate-500">
              Montant
              <input name="amount" type="number" step="0.01" min="0.01" className="input mt-1 w-28" required />
            </label>
            <label className="text-xs text-slate-500">
              Date
              <input name="transfer_date" type="date" defaultValue={today} className="input mt-1" required />
            </label>
            <button className="btn-primary py-2 text-xs">Virer</button>
          </form>
        </div>
      )}

      <div className="card p-5">
        <h2 className="mb-1 text-sm font-semibold text-slate-700">Comptes inclus dans la trésorerie</h2>
        <p className="mb-3 text-xs text-slate-400">Livrets et placements sont exclus par défaut. Choisis ce que tu considères comme dépensable.</p>
        <form action={savePrefs} className="space-y-2">
          {data.accounts.map((a) => (
            <label key={a.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="included_accounts" value={a.id} defaultChecked={data.prefs.includedAccounts.includes(a.id)} />
              {a.name} <span className="text-xs text-slate-400">({TYPE_LABEL[a.type]})</span>
            </label>
          ))}
          <input type="hidden" name="default_mode" value={data.prefs.defaultMode} />
          <button className="btn-secondary mt-2 py-1.5 text-xs">Enregistrer</button>
        </form>
      </div>
    </div>
  );
}
