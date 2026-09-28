"use client";

import { useMemo, useState } from "react";
import { addDays, expand, getDailyBalances, monthBounds, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { cx, formatEUR } from "@/lib/utils";

const DOW = ["L", "M", "M", "J", "V", "S", "D"];
const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/** Solde théorique fin de mois + à la date cliquée dans le mini-calendrier (calcul instantané côté navigateur). */
export function OverviewMonth({ ops, anchor, year, month, today, carried }: { ops: FinOp[]; anchor: BalanceAnchor; year: number; month: number; today: string; carried: boolean }) {
  const { start, end } = monthBounds(year, month);
  const [selected, setSelected] = useState(today >= start && today <= end ? today : start);

  const daily = useMemo(() => getDailyBalances(ops, anchor, start, end), [ops, anchor, start, end]);
  const byDate = useMemo(() => new Map(daily.map((d) => [d.date, d.balance])), [daily]);
  const endBalance = daily[daily.length - 1]?.balance ?? 0;
  const atDate = byDate.get(selected) ?? 0;
  const dayOps = useMemo(() => expand(ops, selected, selected), [ops, selected]);

  const firstWeekday = (new Date(`${start}T00:00:00Z`).getUTCDay() + 6) % 7;
  const days: (string | null)[] = [...Array(firstWeekday).fill(null)];
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card grid gap-6 p-7 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solde théorique à date</p>
          <p className="text-[11px] capitalize text-slate-400">{fmt(selected)}</p>
          <p className={cx("mt-1 text-4xl font-bold tabular-nums", atDate < 0 ? "text-rose-600" : "text-slate-900")}>{formatEUR(atDate)}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solde théorique fin de mois</p>
          <p className="text-[11px] text-slate-400">{fmt(end)}</p>
          <p className={cx("mt-1 text-4xl font-bold tabular-nums", endBalance < 0 ? "text-rose-600" : "text-slate-900")}>{formatEUR(endBalance)}</p>
        </div>
        <div className="sm:col-span-2">
          <p className="text-xs text-slate-400">
            {carried ? "Part du solde réel du compte courant, reporté d'un mois à l'autre." : "Repart de 0 au 1er du mois, sans les gains ni les pertes des mois précédents."}
          </p>
          {dayOps.length > 0 && (
            <ul className="mt-3 space-y-1 border-t border-slate-100 pt-3 text-sm">
              {dayOps.map((o, i) => (
                <li key={i} className="flex justify-between">
                  <span className="text-slate-600">{o.op.name}</span>
                  <span className={o.signed > 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>{o.signed > 0 ? "+" : "−"}{formatEUR(o.op.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card p-5">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Aperçu du mois — clique un jour</p>
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-slate-400">
          {DOW.map((d, i) => <div key={i}>{d}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d, i) => {
            if (!d) return <div key={i} />;
            const balance = byDate.get(d) ?? 0;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelected(d)}
                title={`${Math.round(balance)} €`}
                className={cx(
                  "flex aspect-square items-center justify-center rounded-md text-[11px] font-medium transition",
                  balance >= 0 ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" : "bg-rose-50 text-rose-700 hover:bg-rose-100",
                  d === today && "ring-1 ring-inset ring-slate-400",
                  d === selected && "!bg-brand-600 !text-white"
                )}
              >
                {Number(d.slice(-2))}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
