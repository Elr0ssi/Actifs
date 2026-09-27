import { formatEUR, cx } from "@/lib/utils";
import { planSavings, type BudgetPlan, type MonthlyBudget } from "@/lib/finance-engine";

const ROWS: { key: "income" | "fixed" | "variable" | "savings"; label: string; bar: string; good: "higher" | "lower" }[] = [
  { key: "income", label: "Revenus", bar: "bg-emerald-500", good: "higher" },
  { key: "fixed", label: "Charges fixes", bar: "bg-rose-500", good: "lower" },
  { key: "variable", label: "Dépenses variables", bar: "bg-amber-500", good: "lower" },
  { key: "savings", label: "Épargne / invest.", bar: "bg-violet-500", good: "higher" },
];

/** Objectif (budget saisi) et réel (opérations) mis côte à côte pour chaque poste. */
export function ObjectifsVsReel({ plan, budget }: { plan: BudgetPlan; budget: MonthlyBudget }) {
  const planned = { income: plan.income, fixed: plan.fixed, variable: plan.variable, savings: planSavings(plan) };
  const max = Math.max(1, ...ROWS.map((r) => Math.max(planned[r.key], budget[r.key])));

  return (
    <section className="card p-5">
      <p className="font-semibold text-slate-900">Objectif vs réel</p>
      <p className="mt-0.5 text-xs text-slate-400">Ce que tu as budgété ce mois, comparé aux opérations réelles.</p>
      <div className="mt-4 space-y-3">
        {ROWS.map((r) => {
          const p = planned[r.key];
          const v = budget[r.key];
          const onTrack = p === 0 || (r.good === "higher" ? v >= p : v <= p);
          return (
            <div key={r.key}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700">{r.label}</span>
                <span className={cx("font-semibold", p === 0 ? "text-slate-400" : onTrack ? "text-emerald-600" : "text-rose-600")}>
                  {p > 0 ? `${formatEUR(v)} / ${formatEUR(p)}` : formatEUR(v)}
                </span>
              </div>
              <div className="mt-1 space-y-1">
                <div className="h-1.5 w-full rounded-full bg-slate-100">
                  <div className={cx("h-1.5 rounded-full", r.bar)} style={{ width: `${(v / max) * 100}%` }} />
                </div>
                {p > 0 && (
                  <div className="h-1.5 w-full rounded-full bg-slate-50">
                    <div className="h-1.5 rounded-full bg-slate-300" style={{ width: `${(p / max) * 100}%` }} />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        <span className="mr-3"><span className="mr-1 inline-block h-1.5 w-3 rounded-full bg-slate-400 align-middle" />réel</span>
        <span><span className="mr-1 inline-block h-1.5 w-3 rounded-full bg-slate-200 align-middle" />objectif</span>
      </p>
    </section>
  );
}
