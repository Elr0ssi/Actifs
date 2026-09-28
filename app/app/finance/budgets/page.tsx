import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { CATEGORIES, KIND_LABEL, KIND_STYLE, getMonthlyBudget, monthlyAmount, type OpKind } from "@/lib/finance-engine";
import { formatEUR, todayISO, cx } from "@/lib/utils";
import { OperationRow } from "@/components/app/finance/operation-row";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";

export const metadata: Metadata = { title: "Finance — Budgets" };
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const ORDER: OpKind[] = ["income", "fixed", "variable", "savings"];

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor } = data;
  const today = todayISO();

  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const budget = getMonthlyBudget(ops, anchor, year, month);
  const margin = budget.income - budget.fixed - budget.variable - budget.savings;

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={`/app/finance/budgets?year=${prevMonth.y}&month=${prevMonth.m}`} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
          <p className="text-lg font-bold text-slate-900">{MONTHS_FR[month]} {year}</p>
          <Link href={`/app/finance/budgets?year=${nextMonth.y}&month=${nextMonth.m}`} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
        </div>
        <NewOperationButton defaultDate={today} label="+ Nouvelle opération" />
      </div>

      <p className="text-xs text-slate-500">
        Toutes tes opérations, remplies ici — les mêmes que sur le calendrier. La marge du mois est calculée automatiquement, rien à saisir à côté.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="card flex items-center justify-between gap-3 border-emerald-200 bg-emerald-50/60 p-4">
          <div>
            <p className="text-xs font-medium text-emerald-800">Marge du mois</p>
            <p className="text-[11px] text-emerald-700/70">
              {formatEUR(budget.income)} − {formatEUR(budget.fixed)} − {formatEUR(budget.variable)} − {formatEUR(budget.savings)}
            </p>
          </div>
          <p className={cx("text-2xl font-bold", margin >= 0 ? "text-emerald-700" : "text-rose-600")}>{formatEUR(margin)}</p>
        </div>
        <BudgetBreakdown budget={budget} />
      </div>

      {ORDER.map((kind) => {
        const list = ops.filter((o) => o.kind === kind);
        const order = CATEGORIES[kind];
        const groups = [...new Set(list.map((o) => o.category))].sort((x, y) => {
          const ix = order.indexOf(x), iy = order.indexOf(y);
          return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy) || x.localeCompare(y);
        });
        const monthly = list.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
        return (
          <section key={kind} className="card p-5">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="flex items-center gap-2 font-semibold text-slate-900">
                <span className={cx("h-2.5 w-2.5 rounded-full", KIND_STYLE[kind].dot)} />
                {KIND_LABEL[kind]} <span className="text-sm font-normal text-slate-400">({list.length})</span>
              </h2>
              <div className="flex items-center gap-3">
                {monthly > 0 && <span className="text-sm text-slate-500">≈ {formatEUR(monthly)} / mois</span>}
                <NewOperationButton defaultDate={today} defaultKind={kind} label="+ Ajouter" className="text-xs font-medium text-brand-600" />
              </div>
            </div>
            {list.length === 0 && <p className="text-sm text-slate-400">Aucune opération. Ajoute la première ci-dessus.</p>}
            <div className="space-y-4">
              {groups.map((cat) => {
                const items = list.filter((o) => o.category === cat);
                const sub = items.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
                return (
                  <div key={cat}>
                    <div className="mb-1.5 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <span>{cat}</span>
                      {sub > 0 && <span className="normal-case">≈ {formatEUR(sub)} / mois</span>}
                    </div>
                    <ul className="space-y-2">
                      {items.map((op) => <OperationRow key={`${op.table}-${op.id}`} op={op} today={today} />)}
                    </ul>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
