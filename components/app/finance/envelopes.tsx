"use client";

import { useT } from "@/components/i18n/provider";
import Link from "next/link";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import type { Envelope } from "@/lib/finance-engine";
import { cx, formatEUR } from "@/lib/utils";

/** Prévu contre réel : ce qu'on estime dépenser par grande catégorie, face à ce qui a vraiment été payé par carte. */
export function EnvelopesCard({ rows, monthStart }: { rows: Envelope[]; monthStart: string }) {
  const tr = useT();
  const planned = rows.reduce((s, r) => s + r.planned, 0);
  const real = rows.reduce((s, r) => s + r.real, 0);
  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-semibold text-stone-900">{tr("Prévu et réel par catégorie")}</p>
          <p className="mt-0.5 max-w-md text-[11px] text-stone-500">{tr("Ce que tu estimes dépenser dans chaque grande catégorie, face à ce que tu as réellement payé par carte.")}</p>
        </div>
        <div className="flex gap-4 text-right">
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Prévu")}</p><p className="tabular text-sm font-bold text-stone-800">{formatEUR(planned)}</p></div>
          <div><p className="text-[10px] font-semibold uppercase tracking-wide text-teal-600">{tr("Réel")}</p><p className="tabular text-sm font-bold text-teal-700">{formatEUR(real)}</p></div>
        </div>
      </div>

      {rows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-stone-50 px-3 py-6 text-center text-xs text-stone-400">{tr("Rien de prévu ni de payé par carte ce mois-ci. Fixe un budget par catégorie pour suivre ta consommation.")}</p>
      ) : (
        <ul className="mt-4 space-y-3.5">
          {rows.map((r) => {
            const over = r.planned > 0 && r.real > r.planned;
            const pct = r.planned > 0 ? Math.min(100, (r.real / r.planned) * 100) : r.real > 0 ? 100 : 0;
            return (
              <li key={r.category}>
                <div className="flex items-baseline justify-between gap-3 text-[12px]">
                  <span className="min-w-0 truncate font-medium text-stone-800">{tr(r.category)}</span>
                  <span className="tabular shrink-0 text-[11px] text-stone-500">
                    <b className={over ? "text-rose-600" : "text-teal-700"}>{formatEUR(r.real)}</b>
                    {r.planned > 0 ? <> / {formatEUR(r.planned)}</> : null}
                  </span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-stone-100">
                  <div className={cx("fill-grow h-full rounded-full", r.planned === 0 ? "bg-stone-300" : over ? "bg-rose-400" : "bg-teal-500")} style={{ width: `${pct}%` }} />
                </div>
                <div className="mt-1 flex items-center justify-between text-[11px]">
                  {r.planned === 0 ? (
                    <>
                      <span className="text-stone-400">{tr("Sans budget fixé")}</span>
                      <NewOperationButton defaultDate={monthStart} defaultKind="variable" defaultCategory={r.category} defaultName={tr(r.category)} title="Fixer un budget" label="+ Fixer un budget" className="font-semibold text-brand-600 hover:underline" />
                    </>
                  ) : over ? (
                    <span className="font-medium text-rose-600">{tr("Dépassé de {amount}", { amount: formatEUR(r.real - r.planned) })}</span>
                  ) : (
                    <span className="text-stone-500">{tr("Il reste {amount}", { amount: formatEUR(r.left) })}</span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
      <p className="mt-4 text-[11px] text-stone-400">
        {tr("Tes paiements par carte (Apple Pay) comptent dans le budget de leur catégorie : ils ne s'ajoutent pas à l'estimation, ils la consomment.")}{" "}
        <Link href="/app/finance/paiements" className="font-medium text-brand-600 hover:underline">{tr("Voir mes paiements")}</Link>
      </p>
    </section>
  );
}
