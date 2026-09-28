import { loadFinanceData } from "@/lib/data/finance";
import { formatEUR, todayISO } from "@/lib/utils";
import { updateBalanceAnchor } from "@/app/app/finance/actions";
import { SubmitButton } from "@/components/ui/submit-button";

const ACCOUNTS: { name: "Courant" | "Épargne"; icon: string }[] = [
  { name: "Courant", icon: "💳" },
  { name: "Épargne", icon: "🐷" },
];

/** Bandeau persistant : le montant réel de chaque compte à une date, visible et modifiable depuis n'importe quel onglet Finance. */
export async function QuickBalances() {
  const data = await loadFinanceData();
  if (!data) return null;
  const today = todayISO();

  return (
    <div className="flex flex-wrap gap-3">
      {ACCOUNTS.map((a) => {
        const acc = data.accounts[a.name];
        return (
          <form key={a.name} action={updateBalanceAnchor.bind(null, a.name)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5">
            <span className="text-sm">{a.icon}</span>
            <div className="text-xs">
              <p className="text-slate-400">{a.name}{acc.last && <> · {new Date(`${acc.last.date}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })}</>}</p>
              <p className="font-bold text-slate-800">{acc.last ? formatEUR(acc.last.balance) : "—"}</p>
            </div>
            <input type="hidden" name="entry_date" value={today} />
            <input name="current_balance" type="number" step="0.01" placeholder="Modifier" className="input w-20 min-w-0 px-2 py-1 text-xs" />
            <SubmitButton className="btn-secondary shrink-0 px-2 py-1 text-xs">OK</SubmitButton>
          </form>
        );
      })}
    </div>
  );
}
