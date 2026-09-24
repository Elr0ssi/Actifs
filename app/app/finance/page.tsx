import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { formatEUR, todayISO } from "@/lib/utils";
import type { RecurringCharge, Income, Investment } from "@/lib/types";
import { projectOccurrences, monthlyEquivalent } from "@/lib/finance";
import {
  createCharge,
  deleteCharge,
  createIncome,
  deleteIncome,
  markIncomeReceived,
  createInvestment,
  deleteInvestment,
} from "@/app/app/finance/actions";

export const metadata: Metadata = { title: "Finance" };

export default async function FinancePage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: investments }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId).eq("active", true).order("next_date").returns<RecurringCharge[]>(),
    supabase.from("incomes").select("*").eq("household_id", householdId).order("expected_date").returns<Income[]>(),
    supabase.from("investments").select("*").eq("household_id", householdId).order("invested_date", { ascending: false }).returns<Investment[]>(),
  ]);

  const today = todayISO();
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + 60);
  const horizonISO = horizon.toISOString().slice(0, 10);

  type FlowRow = { date: string; label: string; amount: number; kind: "expense" | "income" };
  const flow: FlowRow[] = [];
  for (const c of charges ?? []) {
    for (const d of projectOccurrences(c.next_date, c.frequency, today, horizonISO)) {
      flow.push({ date: d, label: c.name, amount: -Number(c.amount), kind: "expense" });
    }
  }
  for (const i of incomes ?? []) {
    if (i.status === "received") continue;
    const freq = i.recurring ? i.frequency : "once";
    for (const d of projectOccurrences(i.expected_date, freq, today, horizonISO)) {
      flow.push({ date: d, label: i.name, amount: Number(i.amount), kind: "income" });
    }
  }
  flow.sort((a, b) => a.date.localeCompare(b.date));
  let running = 0;
  const flowWithBalance = flow.map((f) => {
    running += f.amount;
    return { ...f, balance: running };
  });

  const monthlyExpenses = (charges ?? []).reduce((s, c) => s + monthlyEquivalent(Number(c.amount), c.frequency), 0);
  const monthlyIncomes = (incomes ?? []).filter((i) => i.recurring).reduce((s, i) => s + monthlyEquivalent(Number(i.amount), i.frequency), 0);
  const totalInvested = (investments ?? []).reduce((s, i) => s + Number(i.amount_invested), 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance</h1>
        <p className="mt-1 text-sm text-slate-500">Budget, échéances, investissements et flux en direct.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div className="card p-5">
          <p className="label">Charges fixes / mois</p>
          <p className="mt-2 text-2xl font-bold text-rose-600">{formatEUR(monthlyExpenses)}</p>
        </div>
        <div className="card p-5">
          <p className="label">Revenus fixes / mois</p>
          <p className="mt-2 text-2xl font-bold text-emerald-600">{formatEUR(monthlyIncomes)}</p>
        </div>
        <div className="card p-5">
          <p className="label">Total investi</p>
          <p className="mt-2 text-2xl font-bold text-brand-600">{formatEUR(totalInvested)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Charges récurrentes</h2>
          <form action={createCharge} className="mb-4 space-y-2">
            <input name="name" placeholder="Ex. Loyer" className="input" required />
            <div className="flex gap-2">
              <input name="amount" type="number" step="0.01" placeholder="Montant €" className="input" required />
              <select name="frequency" className="input" defaultValue="monthly">
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
                <option value="weekly">Hebdo</option>
                <option value="once">Ponctuel</option>
              </select>
            </div>
            <input name="next_date" type="date" className="input" required />
            <button className="btn-primary w-full">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {(charges ?? []).map((c) => (
              <li key={c.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{c.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{c.next_date} · {c.frequency}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-rose-600">{formatEUR(Number(c.amount))}</span>
                  <form action={deleteCharge.bind(null, c.id)}>
                    <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6">
          <h2 className="mb-4 font-semibold text-slate-900">Revenus programmés</h2>
          <form action={createIncome} className="mb-4 space-y-2">
            <input name="name" placeholder="Ex. Salaire" className="input" required />
            <div className="flex gap-2">
              <input name="amount" type="number" step="0.01" placeholder="Montant €" className="input" required />
              <input name="expected_date" type="date" className="input" required />
            </div>
            <div className="flex items-center gap-2">
              <select name="frequency" className="input flex-1" defaultValue="monthly">
                <option value="monthly">Mensuel</option>
                <option value="yearly">Annuel</option>
                <option value="weekly">Hebdo</option>
                <option value="once">Ponctuel</option>
              </select>
              <label className="flex items-center gap-1.5 text-xs text-slate-500">
                <input type="checkbox" name="recurring" className="h-4 w-4 rounded border-slate-300" /> Récurrent
              </label>
            </div>
            <button className="btn-primary w-full">Ajouter</button>
          </form>
          <ul className="space-y-2">
            {(incomes ?? []).map((i) => (
              <li key={i.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
                <span>
                  <span className="font-medium text-slate-800">{i.name}</span>
                  <span className="ml-2 text-xs text-slate-400">{i.expected_date} {i.status === "received" && "· reçu"}</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="font-semibold text-emerald-600">{formatEUR(Number(i.amount))}</span>
                  {i.status !== "received" && (
                    <form action={markIncomeReceived.bind(null, i.id)}>
                      <button className="text-xs text-slate-400 hover:text-emerald-600">✓</button>
                    </form>
                  )}
                  <form action={deleteIncome.bind(null, i.id)}>
                    <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                  </form>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Investissements</h2>
        <form action={createInvestment} className="mb-4 grid gap-2 sm:grid-cols-2">
          <input name="project_name" placeholder="Projet (ex. Boîte X)" className="input" required />
          <input name="amount_invested" type="number" step="0.01" placeholder="Montant investi €" className="input" required />
          <input name="invested_date" type="date" className="input" required />
          <input name="expected_return" type="number" step="0.01" placeholder="Retour attendu € (optionnel)" className="input" />
          <input name="expected_return_date" type="date" className="input" />
          <input name="notes" placeholder="Notes" className="input" />
          <button className="btn-primary sm:col-span-2">Ajouter l'investissement</button>
        </form>
        <ul className="space-y-2">
          {(investments ?? []).map((inv) => (
            <li key={inv.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-slate-800">{inv.project_name}</span>
                <span className="ml-2 text-xs text-slate-400">
                  investi le {inv.invested_date}
                  {inv.expected_return_date && ` · retour attendu ${inv.expected_return_date}`}
                </span>
              </span>
              <span className="flex items-center gap-3">
                <span className="font-semibold text-brand-600">{formatEUR(Number(inv.amount_invested))}</span>
                <form action={deleteInvestment.bind(null, inv.id)}>
                  <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                </form>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">Flux en direct (60 prochains jours)</h2>
          <span className="text-xs text-slate-400">Solde cumulé</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-sm">
            <tbody>
              {flowWithBalance.length === 0 && (
                <tr><td className="py-4 text-slate-400">Aucune échéance à venir.</td></tr>
              )}
              {flowWithBalance.map((f, idx) => (
                <tr key={idx} className="border-b border-slate-50 last:border-0">
                  <td className="py-2 text-xs text-slate-400">{f.date}</td>
                  <td className="py-2 text-slate-700">{f.label}</td>
                  <td className={`py-2 text-right font-medium ${f.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {f.amount > 0 ? "+" : ""}{formatEUR(f.amount)}
                  </td>
                  <td className={`py-2 pl-6 text-right font-semibold ${f.balance >= 0 ? "text-slate-700" : "text-rose-700"}`}>{formatEUR(f.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="font-semibold text-slate-900">Connexion bancaire</h2>
        <p className="mt-2 max-w-xl text-sm text-slate-500">
          La synchronisation automatique avec ta carte bancaire nécessite un partenaire agréé (Open Banking, type
          Powens ou Bridge) et sa propre configuration sécurisée. La base est prête à l'accueillir — en attendant,
          renseigne tes charges et revenus manuellement ci-dessus.
        </p>
        <button disabled className="btn-secondary mt-4 opacity-50">Connecter ma carte (bientôt)</button>
      </section>
    </div>
  );
}
