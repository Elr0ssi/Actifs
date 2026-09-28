import { addDays, getDailyBalances, monthBounds, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";

const DOW = ["L", "M", "M", "J", "V", "S", "D"];

/** Aperçu compact et lecture seule du mois : vert/rouge selon le reste à vivre cumulé chaque jour. */
export function MiniMonth({ ops, anchor, year, month, today }: { ops: FinOp[]; anchor: BalanceAnchor; year: number; month: number; today: string }) {
  const { start, end } = monthBounds(year, month);
  const daily = getDailyBalances(ops, anchor, start, end);
  const byDate = new Map(daily.map((d) => [d.date, d.balance]));
  const firstWeekday = (new Date(`${start}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days: (string | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
        {DOW.map((d, i) => <div key={i}>{d}</div>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          if (!d) return <div key={i} />;
          const balance = byDate.get(d);
          const positive = balance === undefined || balance >= 0;
          return (
            <div
              key={d}
              title={balance !== undefined ? `${d} : ${Math.round(balance)} €` : d}
              className={cx(
                "flex aspect-square items-center justify-center rounded-md text-[10px] font-medium",
                positive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                d === today && "ring-1 ring-inset ring-brand-400"
              )}
            >
              {Number(d.slice(-2))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
