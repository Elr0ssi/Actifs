import { getT } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n";
import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceData } from "@/lib/data/finance";
import { getBudgetLines, getDateSituation, getEnvelopes, getMonthlyBudget, getSavingsAt, monthBounds, type BudgetLine } from "@/lib/finance-engine";
import { formatEUR, todayISO, cx, MONTHS_FR } from "@/lib/utils";
import { BudgetBreakdown } from "@/components/app/finance/finance-dashboard";
import { EnvelopesCard } from "@/components/app/finance/envelopes";
import { BudgetPlanner } from "@/components/app/finance/budget-planner";
import { ValidateButton } from "@/components/app/finance/validate-button";
import { OperationsBoard } from "@/components/app/finance/operations-board";
import { Icon } from "@/components/app/icons";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Budget") };
}

const eur0 = (n: number) => new Intl.NumberFormat(intlLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(intlLocale(), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

export default async function BudgetsPage({ searchParams }: { searchParams: { year?: string; month?: string; tri?: string } }) {
  const tr = getT();
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor, accounts } = data;
  const today = todayISO();

  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const isCurrent = year === now.getUTCFullYear() && month === now.getUTCMonth();
  const { start, end } = monthBounds(year, month);
  const refDate = isCurrent ? today : end;
  const budget = getMonthlyBudget(ops, anchor, year, month);
  // Prévu et réel comparés sur la même période : jusqu'à aujourd'hui pour le mois en cours.
  const envelopes = getEnvelopes(ops, year, month, isCurrent ? today : undefined);
  const situation = getDateSituation(ops, anchor, refDate);
  const savings = getSavingsAt(ops, accounts["Épargne"].last, end);
  const lines = getBudgetLines(ops, start, end, today);
  const due = lines.filter((l) => l.status === "due");
  const upcoming = lines.filter((l) => l.status === "upcoming");
  const validated = lines.filter((l) => l.status === "validated");

  const prev = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const next = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const plannedTotal = envelopes.reduce((s, r) => s + r.planned, 0);
  const realTotal = envelopes.reduce((s, r) => s + r.real, 0);
  const actionCls = "flex items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[12px] font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50/50";

  const history = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(year, month - 5 + i, 1));
    const b = getMonthlyBudget(ops, anchor, d.getUTCFullYear(), d.getUTCMonth());
    return { label: MONTHS_FR[d.getUTCMonth()].slice(0, 3), margin: b.income - b.fixed - b.variable - b.daily - b.savings, current: i === 5 };
  });
  const maxAbs = Math.max(1, ...history.map((h) => Math.abs(h.margin)));

  const row = (l: BudgetLine) => (
    <li key={`${l.op.id}-${l.date}`} className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface px-3 py-2">
      <span className="w-16 shrink-0 text-[11px] font-medium capitalize text-stone-500">{fmtDay(l.date)}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[13px] font-medium text-stone-800">{l.op.name}</span>
        <span className="block truncate text-[11px] text-stone-400">
          {tr(l.op.category)}
          {l.covered > 0 && <> · {tr("{amount} déjà couverts par tes paiements carte", { amount: formatEUR(l.covered) })}</>}
        </span>
      </span>
      <span className="tabular shrink-0 text-right text-[13px] font-semibold text-stone-800">
        {l.status === "validated" && l.actual !== null && Math.abs(l.actual - l.planned) >= 0.005 ? (
          <><span className="mr-1 text-[11px] font-normal text-stone-400 line-through">{formatEUR(l.planned)}</span>{formatEUR(l.actual)}</>
        ) : formatEUR(l.status === "validated" ? l.actual ?? l.planned : l.planned)}
      </span>
      {l.status !== "upcoming" && (
        <ValidateButton opId={l.op.id} date={l.date} planned={l.planned} name={l.op.name} validated={l.status === "validated" ? { actual: l.actual ?? l.planned, txnId: l.txnId } : null} />
      )}
    </li>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <Link href={`/app/finance/budgets?year=${prev.y}&month=${prev.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois précédent")}><Icon name="chevronLeft" /></Link>
          <p className="min-w-[130px] text-center text-[15px] font-bold text-stone-900">{MONTHS_FR[month]} {year}</p>
          <Link href={`/app/finance/budgets?year=${next.y}&month=${next.m}`} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois suivant")}><Icon name="chevronRight" /></Link>
        </div>
        <Link href="/app/finance/accounts" className={actionCls}><Icon name="bank" className="text-brand-600" />{tr("Mettre à jour mon solde")}</Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Reste à vivre")}</p>
          <p className={cx("tabular mt-1 text-2xl font-bold", situation.endBalance >= 0 ? "text-stone-900" : "text-rose-600")}>{eur0(situation.endBalance)}</p>
          <p className="text-[11px] text-stone-500">{tr("prévu au {date}", { date: new Date(`${situation.monthEnd}T00:00:00Z`).toLocaleDateString(intlLocale(), { day: "numeric", month: "short", timeZone: "UTC" }) })}</p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Budget · réel")}</p>
          <p className="tabular mt-1 text-2xl font-bold text-stone-900">{eur0(realTotal)} <span className="text-base font-medium text-stone-400">/ {eur0(plannedTotal)}</span></p>
          <p className={cx("text-[11px]", realTotal > plannedTotal && plannedTotal > 0 ? "text-rose-600" : "text-stone-500")}>
            {plannedTotal === 0 ? tr("Aucun budget fixé") : realTotal > plannedTotal ? tr("Dépassé de {amount}", { amount: eur0(realTotal - plannedTotal) }) : tr("Il reste {amount}", { amount: eur0(plannedTotal - realTotal) })}
          </p>
        </div>
        <div className="card p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Reste sur l'épargne")}</p>
          <p className="tabular mt-1 text-2xl font-bold text-stone-900">{savings === null ? "—" : eur0(savings)}</p>
          <p className="text-[11px] text-stone-500">{savings === null ? tr("Aucun solde d'épargne saisi") : tr("estimé fin de mois")}</p>
        </div>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <EnvelopesCard rows={envelopes} monthStart={start} />

        <section className="card p-4">
          <h2 className="text-[13px] font-semibold text-stone-900">{tr("Répartir un budget")}</h2>
          <p className="mb-3 mt-0.5 text-[11px] text-stone-500">{tr("Donne-toi un montant pour une catégorie : Flozea le répartit sur le mois. Ce sont des budgets, pas des dépenses : tu les valides à leur date.")}</p>
          <BudgetPlanner defaultStart={isCurrent ? today : start} defaultMonthLabel={`${MONTHS_FR[month]} ${year}`} />
        </section>

        <section className="card p-4 lg:col-span-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[13px] font-semibold text-stone-900">{tr("Dépenses prévues du mois")}</h2>
            <p className="text-[11px] text-stone-500">{tr("Valide ce que tu as vraiment dépensé : le montant réel remplace le prévu, sans double comptage.")}</p>
          </div>
          {lines.length === 0 && <p className="mt-3 rounded-xl bg-stone-50 px-3 py-6 text-center text-xs text-stone-400">{tr("Aucune dépense prévue ce mois-ci. Répartis un budget pour commencer.")}</p>}
          {due.length > 0 && (
            <div className="mt-3">
              <p className="mb-1.5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-amber-700"><span className="h-2 w-2 rounded-full bg-amber-500" />{tr("À valider")} ({due.length})</p>
              <ul className="space-y-1.5">{due.map(row)}</ul>
            </div>
          )}
          {upcoming.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-stone-400">{tr("À venir")} ({upcoming.length})</p>
              <ul className="space-y-1.5">{upcoming.map(row)}</ul>
            </div>
          )}
          {validated.length > 0 && (
            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700">{tr("Validées")} ({validated.length})</p>
              <ul className="space-y-1.5">{validated.map(row)}</ul>
            </div>
          )}
        </section>
      </div>

      <details className="card group p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold text-stone-900">
          {tr("Répartition du mois et marge des 6 derniers mois")}<span className="text-lg text-brand-500 transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4 grid items-start gap-4 lg:grid-cols-2">
          <BudgetBreakdown budget={budget} size={190} />
          <div>
            <p className="text-[13px] font-semibold text-stone-900">{tr("Marge des 6 derniers mois")}</p>
            <p className="text-[11px] text-stone-400">{tr("Revenus moins toutes les sorties prévues, mois par mois.")}</p>
            <div className="mt-4 flex h-44 items-stretch gap-3">
              {history.map((h, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-1" title={formatEUR(h.margin)}>
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
          </div>
        </div>
      </details>

      <details className="card group p-4">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[13px] font-semibold text-stone-900">
          {tr("Toutes mes opérations (revenus, charges fixes, budgets, épargne)")}<span className="text-lg text-brand-500 transition group-open:rotate-45">+</span>
        </summary>
        <div className="mt-4">
          <OperationsBoard ops={ops.filter((o) => !o.txn)} today={today} byDate={searchParams.tri === "date"} basePath={`/app/finance/budgets?year=${year}&month=${month}`} />
        </div>
      </details>
    </div>
  );
}
