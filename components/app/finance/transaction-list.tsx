"use client";

import { useT } from "@/components/i18n/provider";
import { intlLocale } from "@/lib/i18n";
import { useMemo, useState, useTransition } from "react";
import { deleteTransaction, setTransactionCategory } from "@/app/(main)/app/finance/actions";
import { CATEGORIES } from "@/lib/finance-engine";
import { cx, formatEUR } from "@/lib/utils";

export interface Txn {
  id: string;
  merchant: string;
  amount: number;
  income: boolean;
  date: string;
  time: string | null;
  card: string | null;
  category: string;
}

const dayLabel = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(intlLocale(), { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

export function TransactionList({ txns }: { txns: Txn[] }) {
  const tr = useT();
  const [pending, start] = useTransition();
  const [gone, setGone] = useState<string[]>([]);
  const [cats, setCats] = useState<Record<string, string>>({});
  const [q, setQ] = useState("");
  const list = txns.filter((t) => !gone.includes(t.id) && (!q || t.merchant.toLowerCase().includes(q.toLowerCase())));
  const groups = useMemo(() => {
    const m = new Map<string, Txn[]>();
    for (const t of list) m.set(t.date, [...(m.get(t.date) ?? []), t]);
    return [...m.entries()];
  }, [list]);
  const options = CATEGORIES.variable;

  if (txns.length === 0) return <p className="rounded-xl bg-stone-50 py-8 text-center text-sm text-stone-400">{tr("Aucun paiement reçu pour l'instant. Configure le raccourci ci-dessus puis fais un achat, ou envoie un paiement test.")}</p>;

  return (
    <section className={cx("card p-4", pending && "opacity-70")}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[13px] font-semibold text-stone-900">{tr("Paiements récents")} <span className="font-normal text-stone-400">({list.length})</span></h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Rechercher un commerçant…")} className="input w-56 py-1.5 text-xs" />
      </div>
      <div className="space-y-4">
        {groups.map(([date, items]) => {
          const total = items.reduce((s, t) => s + (t.income ? -t.amount : t.amount), 0);
          return (
            <div key={date}>
              <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                <span className="capitalize">{dayLabel(date)}</span>
                <span className="tabular normal-case">{total >= 0 ? "-" : "+"}{formatEUR(Math.abs(total))}</span>
              </div>
              <ul className="divide-y divide-line/70">
                {items.map((t) => (
                  <li key={t.id} className="flex items-center gap-3 py-2">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-[13px] font-bold text-teal-700">{t.merchant.slice(0, 1).toUpperCase()}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-stone-800">{t.merchant}{!t.income && <span className="ml-2 rounded-full bg-teal-50 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-teal-700">{tr("Quotidien")}</span>}</p>
                      <p className="truncate text-[11px] text-stone-400">{[t.time, t.card].filter(Boolean).join(" · ") || tr("Carte")}</p>
                    </div>
                    <select
                      value={cats[t.id] ?? t.category}
                      onChange={(e) => { const c = e.target.value; setCats((m) => ({ ...m, [t.id]: c })); start(() => setTransactionCategory(t.id, c)); }}
                      className="hidden max-w-[150px] rounded-md border border-line bg-surface px-1.5 py-1 text-[11px] text-stone-600 sm:block"
                      aria-label={tr("Catégorie")}
                    >
                      {[...new Set([cats[t.id] ?? t.category, ...options])].map((c) => <option key={c} value={c}>{tr(c)}</option>)}
                    </select>
                    <span className={cx("tabular w-20 shrink-0 text-right text-[13px] font-semibold", t.income ? "text-emerald-600" : "text-teal-600")}>{t.income ? "+" : "-"}{formatEUR(t.amount)}</span>
                    <button onClick={() => { setGone((g) => [...g, t.id]); start(() => deleteTransaction(t.id)); }} title={tr("Supprimer")} className="text-xs text-stone-300 hover:text-rose-600">✕</button>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </section>
  );
}
