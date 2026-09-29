import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { CATEGORIES, KIND_LABEL, expand, getMonthlyBudget, monthBounds, type OpKind } from "@/lib/finance-engine";
import { formatEUR, todayISO, cx, MONTHS_FR } from "@/lib/utils";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";
import { Icon } from "@/components/app/icons";

export const metadata: Metadata = { title: "Finance — Budgets" };

const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const KIND_BAR: Record<OpKind, string> = { income: "bg-emerald-500", fixed: "bg-rose-400", variable: "bg-amber-400", savings: "bg-violet-400" };

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string } }) {
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor } = data;
  const today = todayISO();

  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const budget = getMonthlyBudget(ops, anchor, year, month);
  const outflow = budget.fixed + budget.variable + budget.savings;
  const margin = budget.income - outflow;
  const pctOfIncome = (n: number) => (budget.income > 0 ? `${Math.round((n / budget.income) * 100)} % des revenus` : "—");
  const { start, end } = monthBounds(year, month);
  const occ = expand(ops, start, end);

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  const history = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 5 + i, 1));
    const b = getMonthlyBudget(ops, anchor, d.getUTCFullYear(), d.getUTCMonth());
    return { label: MONTHS_FR[d.getUTCMonth()].slice(0, 3), margin: b.income - b.fixed - b.variable - b.savings, current: i === 5 };
  });
  const maxAbs = Math.max(1, ...history.map((h) => Math.abs(h.margin)));

  const byKind = (kind: OpKind) => {
    const map = new Map<string, { planned: number; passed: number }>();
    for (const o of occ.filter((o) => o.op.kind === kind)) {
      const k = o.op.category || "Autre";
      const e = map.get(k) ?? { planned: 0, passed: 0 };
      e.planned += o.op.amount;
      if (o.date <= today) e.passed += o.op.amount;
      map.set(k, e);
    }
    const order = CATEGORIES[kind];
    return [...map.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.planned - a.planned || order.indexOf(a.label) - order.indexOf(b.label));
  };

  const tiles = [
    { label: "Revenus", value: budget.income, sub: `${budget.incomeCount} prévu(s)`, tone: "text-emerald-600", dot: "bg-emerald-500" },
    { label: "Charges fixes", value: budget.fixed, sub: pctOfIncome(budget.fixed), tone: "text-stone-900", dot: KIND_BAR.fixed },
    { label: "Dépenses variables", value: budget.variable, sub: pctOfIncome(budget.variable), tone: "text-stone-900", dot: KIND_BAR.variable },
    { label: "Épargne", value: budget.savings, sub: pctOfIncome(budget.savings), tone: "text-stone-900", dot: KIND_BAR.savings },
    { label: "Marge du mois", value: margin, sub: "revenus − sorties", tone: margin >= 0 ? "text-brand-700" : "text-rose-600", dot: "bg-brand-500" },
  ];
  const actionCls = "flex items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-[12px] font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50/50";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href={`/app/finance/budgets?year=${prev.y}&month=${prev.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronLeft" /></Link>
          <p className="min-w-[130px] text-center text-[15px] font-bold text-stone-900">{MONTHS_FR[month]} {year}</p>
          <Link href={`/app/finance/budgets?year=${next.y}&month=${next.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronRight" /></Link>
        </div>
        <div className="flex flex-wrap gap-2">
          <NewOperationButton defaultDate={today} defaultKind="fixed" label="+ Charge fixe" className={actionCls} />
          <NewOperationButton defaultDate={today} defaultKind="variable" label="+ Dépense" className={actionCls} />
          <NewOperationButton defaultDate={today} defaultKind="income" label="+ Revenu" className={actionCls} />
          <NewOperationButton defaultDate={today} defaultKind="savings" label="+ Épargne" className={actionCls} />
          <Link href="/app/finance/operations" className={actionCls}><Icon name="list" className="text-brand-600" />Gérer mes opérations</Link>
          <Link href="/app/finance/accounts" className={actionCls}><Icon name="bank" className="text-brand-600" />Mettre à jour mon solde</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className={cx("card p-3.5", t.label === "Marge du mois" && "col-span-2 bg-brand-50/60 md:col-span-1")}>
            <p className="flex items-center gap-1.5 text-[11px] text-stone-500"><span className={cx("h-1.5 w-1.5 rounded-full", t.dot)} />{t.label}</p>
            <p className={cx("tabular mt-1 text-xl font-bold", t.tone)}>{formatEUR(t.value)}</p>
            <p className="text-[10px] text-stone-400">{t.sub}</p>
          </div>
        ))}
      </div>

      <section className="card p-4">
        <p className="text-[13px] font-semibold text-stone-900">Où vont tes revenus</p>
        <p className="text-[11px] text-stone-400">Chaque segment est une part de tes {eur0(budget.income)} de revenus du mois.</p>
        <div className="mt-3 flex h-3 gap-[2px] overflow-hidden rounded-full bg-stone-100">
          {(["fixed", "variable", "savings"] as OpKind[]).map((k) => {
            const v = k === "fixed" ? budget.fixed : k === "variable" ? budget.variable : budget.savings;
            const base = Math.max(budget.income, outflow) || 1;
            return v > 0 ? <div key={k} className={KIND_BAR[k]} style={{ width: `${(v / base) * 100}%` }} title={`${KIND_LABEL[k]} : ${formatEUR(v)}`} /> : null;
          })}
          {margin > 0 && <div className="bg-brand-200" style={{ width: `${(margin / (budget.income || 1)) * 100}%` }} title={`Marge : ${formatEUR(margin)}`} />}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-stone-500">
          {(["fixed", "variable", "savings"] as OpKind[]).map((k) => (
            <span key={k} className="flex items-center gap-1.5"><span className={cx("h-2 w-2 rounded-sm", KIND_BAR[k])} />{KIND_LABEL[k]}</span>
          ))}
          <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-brand-200" />Marge</span>
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-3">
        {(["fixed", "variable", "savings"] as OpKind[]).map((kind) => {
          const rows = byKind(kind);
          const max = Math.max(1, ...rows.map((r) => r.planned));
          return (
            <section key={kind} className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-2 text-[13px] font-semibold text-stone-900"><span className={cx("h-2 w-2 rounded-full", KIND_BAR[kind])} />{KIND_LABEL[kind]}</p>
                <p className="tabular text-[12px] font-semibold text-stone-700">{formatEUR(rows.reduce((s, r) => s + r.planned, 0))}</p>
              </div>
              {rows.length === 0 ? (
                <p className="rounded-xl bg-stone-50 py-4 text-center text-xs text-stone-400">Rien de prévu ce mois-ci.</p>
              ) : (
                <ul className="space-y-2.5">
                  {rows.map((r) => (
                    <li key={r.label}>
                      <div className="flex items-baseline justify-between gap-2 text-[12px]">
                        <span className="truncate text-stone-700">{r.label}</span>
                        <span className="tabular shrink-0 text-[11px] text-stone-500"><b className="text-stone-800">{eur0(r.passed)}</b> / {eur0(r.planned)}</span>
                      </div>
                      <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                        <div className={cx("absolute inset-y-0 left-0 rounded-full opacity-30", KIND_BAR[kind])} style={{ width: `${(r.planned / max) * 100}%` }} />
                        <div className={cx("absolute inset-y-0 left-0 rounded-full", KIND_BAR[kind])} style={{ width: `${(r.passed / max) * 100}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-[10px] text-stone-400">Foncé : déjà passé · clair : prévu sur le mois</p>
            </section>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <BudgetBreakdown budget={budget} />
        <section className="card p-4">
          <p className="text-[13px] font-semibold text-stone-900">Marge des 6 derniers mois</p>
          <p className="text-[11px] text-stone-400">Revenus moins toutes les sorties prévues, mois par mois.</p>
          <div className="mt-4 flex h-40 items-stretch gap-3">
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
