import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { CATEGORIES, KIND_LABEL, KIND_STYLE, addDays, monthlyAmount, occurrencesOf, type FinOp, type OpKind } from "@/lib/finance-engine";
import { formatEUR, todayISO, cx } from "@/lib/utils";
import { OperationRow } from "@/components/app/finance/operation-row";
import { NewOperationButton } from "@/components/app/finance/operation-form";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Opérations") };
}
const ORDER: OpKind[] = ["income", "fixed", "variable", "savings"];

export default async function OperationsPage({ searchParams }: { searchParams: { tri?: string } }) {
  const tr = getT();
  const data = await loadFinanceData();
  if (!data) return null;
  const ops = data.ops.filter((o) => !o.txn);
  const today = todayISO();
  const byDate = searchParams.tri === "date";

  // Prochaine occurrence à venir ; une opération terminée ou sans occurrence retombe sur sa date de départ.
  const nextDate = (op: FinOp) => occurrencesOf(op, today, addDays(today, 800))[0] ?? op.start;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-stone-500">{byDate ? tr("Triées par prochaine date, la plus proche d'abord.") : tr("Rangées par catégorie.")}</p>
        <div className="segmented">
          <Link href="/app/finance/operations" data-active={!byDate}>{tr("Par catégorie")}</Link>
          <Link href="/app/finance/operations?tri=date" data-active={byDate}>{tr("Par date")}</Link>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {ORDER.map((kind) => {
          const list = ops.filter((o) => o.kind === kind);
          const order = CATEGORIES[kind];
          const groups = [...new Set(list.map((o) => o.category))].sort((x, y) => {
            const ix = order.indexOf(x), iy = order.indexOf(y);
            return (ix < 0 ? 99 : ix) - (iy < 0 ? 99 : iy) || x.localeCompare(y);
          });
          const monthly = list.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
          const sorted = [...list].sort((a, b) => nextDate(a).localeCompare(nextDate(b)) || a.name.localeCompare(b.name));
          return (
            <section key={kind} className="card p-4">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 text-[13px] font-semibold text-stone-900">
                  <span className={cx("h-2 w-2 rounded-full", KIND_STYLE[kind].dot)} />
                  {KIND_LABEL[kind]} <span className="font-normal text-stone-400">({list.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  {monthly > 0 && <span className="text-[11px] text-stone-500">≈ {formatEUR(monthly)} / mois</span>}
                  <NewOperationButton defaultDate={today} defaultKind={kind} label={tr("+ Ajouter")} className="btn-ghost" />
                </div>
              </div>
              {list.length === 0 && <p className="rounded-xl bg-stone-50 py-4 text-center text-xs text-stone-400">{tr("Aucune opération.")}</p>}
              {byDate ? (
                <ul className="space-y-1.5">
                  {sorted.map((op) => <OperationRow key={`${op.table}-${op.id}`} op={op} today={today} />)}
                </ul>
              ) : (
                <div className="space-y-3">
                  {groups.map((cat) => {
                    const items = list.filter((o) => o.category === cat);
                    const sub = items.filter((o) => o.active).reduce((s, o) => s + monthlyAmount(o), 0);
                    return (
                      <div key={cat}>
                        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-stone-400">
                          <span>{cat}</span>
                          {sub > 0 && <span className="normal-case">≈ {formatEUR(sub)} / mois</span>}
                        </div>
                        <ul className="space-y-1.5">
                          {items.map((op) => <OperationRow key={`${op.table}-${op.id}`} op={op} today={today} />)}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
