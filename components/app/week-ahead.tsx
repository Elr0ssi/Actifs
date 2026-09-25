import { formatEUR } from "@/lib/utils";
import { sumOccurrencesInRange, type RangeChargeLike } from "@/lib/finance";
import { updateBalance } from "@/app/app/actions";

export function WeekAhead({
  currentBalance,
  charges,
  incomes,
  todayISO,
  weekEndISO,
}: {
  currentBalance: number;
  charges: RangeChargeLike[];
  incomes: RangeChargeLike[];
  todayISO: string;
  weekEndISO: string;
}) {
  const chargesWeek = sumOccurrencesInRange(charges, todayISO, weekEndISO);
  const incomesWeek = sumOccurrencesInRange(incomes, todayISO, weekEndISO);
  const projected = currentBalance - chargesWeek.total + incomesWeek.total;
  const items = [
    ...chargesWeek.breakdown.map((b) => ({ ...b, kind: "expense" as const })),
    ...incomesWeek.breakdown.map((b) => ({ ...b, kind: "income" as const })),
  ].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="card overflow-hidden">
      <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
        <div className="border-b border-slate-100 p-6 sm:border-b-0 sm:border-r">
          <p className="label">Solde actuel</p>
          <form action={updateBalance} className="mt-1.5 flex items-center gap-2">
            <input
              name="current_balance"
              type="number"
              step="0.01"
              defaultValue={currentBalance}
              className="input w-32 text-lg font-bold text-slate-900"
            />
            <span className="text-sm text-slate-400">€</span>
            <button className="btn-secondary py-1.5 text-xs">Mettre à jour</button>
          </form>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="label">Charges (7j)</p>
              <p className="mt-1 text-xl font-bold text-rose-600">-{formatEUR(chargesWeek.total)}</p>
            </div>
            <div>
              <p className="label">Revenus (7j)</p>
              <p className="mt-1 text-xl font-bold text-emerald-600">+{formatEUR(incomesWeek.total)}</p>
            </div>
          </div>

          <div className="mt-5 rounded-xl bg-slate-50 p-4">
            <p className="label">Solde projeté dans 7 jours</p>
            <p className={`mt-1 text-2xl font-bold ${projected >= 0 ? "text-slate-900" : "text-rose-600"}`}>
              {formatEUR(projected)}
            </p>
          </div>
        </div>

        <div className="p-6">
          <p className="mb-3 text-sm font-semibold text-slate-700">Échéances des 7 prochains jours</p>
          {items.length === 0 && <p className="text-sm text-slate-400">Rien de programmé cette semaine 🎉</p>}
          <ul className="max-h-64 space-y-2 overflow-y-auto">
            {items.map((it, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="min-w-0 truncate text-slate-700">{it.name}</span>
                <span className="ml-3 flex shrink-0 items-center gap-2">
                  <span className="text-xs text-slate-400">{it.date.slice(5)}</span>
                  <span className={`w-20 text-right font-semibold ${it.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>
                    {it.kind === "income" ? "+" : "-"}
                    {formatEUR(it.amount)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
