import { getT } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { getEnvelopes, getMonthlyBudget, monthBounds } from "@/lib/finance-engine";
import { formatEUR, todayISO, cx, MONTHS_FR } from "@/lib/utils";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";
import { EnvelopesCard } from "@/components/app/finance/envelopes";
import { Icon } from "@/components/app/icons";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Budgets") };
}

const eur0 = (n: number) => new Intl.NumberFormat(intlLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const tr = getT();
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor } = data;
  const today = todayISO();

  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const budget = getMonthlyBudget(ops, anchor, year, month);
  const envelopes = getEnvelopes(ops, year, month);

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  const history = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 5 + i, 1));
    const b = getMonthlyBudget(ops, anchor, d.getUTCFullYear(), d.getUTCMonth());
    return { label: MONTHS_FR[d.getUTCMonth()].slice(0, 3), margin: b.income - b.fixed - b.variable - b.daily - b.savings, current: i === 5 };
  });
  const maxAbs = Math.max(1, ...history.map((h) => Math.abs(h.margin)));
  const actionCls = "flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50/50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href={`/app/finance/budgets?year=${prev.y}&month=${prev.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois précédent")}><Icon name="chevronLeft" /></Link>
          <p className="min-w-[130px] text-center text-[15px] font-bold text-stone-900">{MONTHS_FR[month]} {year}</p>
          <Link href={`/app/finance/budgets?year=${next.y}&month=${next.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois suivant")}><Icon name="chevronRight" /></Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/app/finance/operations" className={actionCls}><Icon name="list" className="text-brand-600" />{tr("Gérer mes opérations")}</Link>
          <Link href="/app/finance/accounts" className={actionCls}><Icon name="bank" className="text-brand-600" />{tr("Mettre à jour mon solde")}</Link>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <EnvelopesCard rows={envelopes} monthStart={monthBounds(year, month).start} />
        <BudgetBreakdown budget={budget} size={190} />
        <section className="card p-4 lg:col-span-2">
          <p className="text-[13px] font-semibold text-stone-900">{tr("Marge des 6 derniers mois")}</p>
          <p className="text-[11px] text-stone-400">{tr("Revenus moins toutes les sorties prévues, mois par mois.")}</p>
          <div className="mt-4 flex h-52 items-stretch gap-3">
            {history.map((h) => (
              <div key={h.label} className="flex flex-1 flex-col items-center gap-1" title={formatEUR(h.margin)}>
                <div className="flex w-full flex-1 flex-col">
                  <div className="flex flex-1 items-end">
                    {h.margin > 0 && <div className={cx("w-full rounded-t-[4px]", h.current ? "bg-brand-600" : "bg-brand-300")} style={{ height: `${(h.margin / maxAbs) * 100}%` }} />}
                  </div>
                  <div className="h-px bg-stone-300" />
                  <div className="flex flex-1 items-start">
                    {h.margin < 0 && <div className="w-full rounded-b-[4px] bg-rose-300" style={{ height: `${(-h.margin / maxAbs) * 100}%` }} />}
                  </div>
                </div>
                <span className={cx("tabular text-[10px] font-semibold", h.margin >= 0 ? "text-stone-700" : "text-rose-600")}>{eur0(h.margin)}</span>
                <span className={cx("text-[10px]", h.current ? "font-semibold text-brand-700" : "text-stone-400")}>{h.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
