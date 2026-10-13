import { getT } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n";
import Link from "next/link";
import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { formatEUR, todayISO, cx } from "@/lib/utils";
import type { FinOp } from "@/lib/finance-engine";
import { OperationsBoard } from "@/components/app/finance/operations-board";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Opérations") };
}

const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(intlLocale(), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

/**
 * Toutes les opérations, en deux vues bien distinctes :
 *  - PRÉVU : ce qu'on projette — revenus, charges fixes, budgets, épargne ;
 *  - RÉEL : ce qui a vraiment été prélevé — paiements par carte et dépenses validées.
 */
export default async function OperationsPage({ searchParams }: { searchParams: { tri?: string; vue?: string } }) {
  const tr = getT();
  const data = await loadFinanceData();
  if (!data) return null;
  const today = todayISO();
  const vue = searchParams.vue === "reel" ? "reel" : "prevu";
  const planned = data.ops.filter((o) => !o.txn);
  const real = data.ops.filter((o) => !!o.txn).sort((a, b) => b.start.localeCompare(a.start) || (b.txn?.time ?? "").localeCompare(a.txn?.time ?? ""));

  const byDay = new Map<string, FinOp[]>();
  for (const o of real) byDay.set(o.start, [...(byDay.get(o.start) ?? []), o]);
  const spent = real.filter((o) => o.kind !== "income").reduce((s, o) => s + o.amount, 0);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/app/finance/budgets" className="text-sm font-medium text-stone-500 hover:text-stone-800">{tr("← Budget")}</Link>
        <h2 className="mt-1 text-lg font-bold tracking-tight text-stone-900">{tr("Toutes mes opérations")}</h2>
        <p className="mt-0.5 text-xs text-stone-500">{tr("Le prévu, c'est ce que tu projettes. Le réel, c'est ce qui a vraiment été prélevé. Les deux sont séparés pour que tu voies la différence.")}</p>
      </div>

      <nav aria-label={tr("Vue")} className="grid gap-2 sm:grid-cols-2">
        <Link href="/app/finance/operations?vue=prevu" aria-current={vue === "prevu" ? "page" : undefined} className={cx("card p-3.5 transition", vue === "prevu" ? "border-brand-300 bg-brand-50/60 ring-1 ring-brand-200" : "hover:bg-stone-50")}>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-stone-900"><span className="h-2.5 w-2.5 rounded-full bg-brand-400" />{tr("Prévu")} <span className="font-normal text-stone-400">({planned.length})</span></span>
          <span className="mt-0.5 block text-[11px] text-stone-500">{tr("Revenus, charges fixes, budgets et épargne que tu projettes.")}</span>
        </Link>
        <Link href="/app/finance/operations?vue=reel" aria-current={vue === "reel" ? "page" : undefined} className={cx("card p-3.5 transition", vue === "reel" ? "border-teal-300 bg-teal-50/60 ring-1 ring-teal-200" : "hover:bg-stone-50")}>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-stone-900"><span className="h-2.5 w-2.5 rounded-full bg-teal-500" />{tr("Réel")} <span className="font-normal text-stone-400">({real.length})</span></span>
          <span className="mt-0.5 block text-[11px] text-stone-500">{tr("Ce qui a vraiment été prélevé : paiements par carte et dépenses validées.")}</span>
        </Link>
      </nav>

      {vue === "prevu" ? (
        <OperationsBoard ops={planned} today={today} byDate={searchParams.tri === "date"} basePath="/app/finance/operations?vue=prevu" />
      ) : (
        <section className="card p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <p className="text-[13px] font-semibold text-stone-900">{tr("Paiements réels")} <span className="font-normal text-stone-400">· {tr("{n} récents", { n: real.length })}</span></p>
            <div className="flex items-center gap-3">
              {spent > 0 && <span className="text-[11px] text-stone-500">{tr("Total dépensé :")} <b className="text-stone-800">{formatEUR(spent)}</b></span>}
              <Link href="/app/finance/paiements" className="text-[11px] font-semibold text-brand-600 hover:underline">{tr("Paiements automatiques")}</Link>
            </div>
          </div>
          {real.length === 0 ? (
            <p className="rounded-xl bg-stone-50 px-3 py-8 text-center text-xs text-stone-400">{tr("Aucun paiement réel pour l'instant. Branche tes paiements par carte, ou valide une dépense prévue.")}</p>
          ) : (
            <div className="space-y-4">
              {[...byDay.entries()].map(([day, list]) => (
                <div key={day}>
                  <p className="mb-1.5 text-[11px] font-semibold capitalize text-stone-400">{fmtDay(day)}</p>
                  <ul className="space-y-1.5">
                    {list.map((o) => (
                      <li key={o.id} className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface px-3 py-2">
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-stone-800">{o.name}</span>
                          <span className="block truncate text-[11px] text-stone-400">
                            {tr(o.category)}{o.txn?.card ? ` · ${o.txn.card}` : ""}{o.txn?.time ? ` · ${o.txn.time}` : ""}
                          </span>
                        </span>
                        {o.txn?.validates && <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{tr("validé")}</span>}
                        <span className={cx("tabular shrink-0 text-[13px] font-semibold", o.kind === "income" ? "text-emerald-600" : "text-stone-800")}>
                          {o.kind === "income" ? "+" : "−"}{formatEUR(o.amount)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
