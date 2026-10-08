"use client";

import { useT } from "@/components/i18n/provider";
import { intlLocale } from "@/lib/i18n";
import { useState, useTransition } from "react";
import { deleteBalanceEntry, editBalanceEntry, pruneBalanceHistory } from "@/app/app/finance/actions";
import { cx, formatEUR } from "@/lib/utils";

const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(intlLocale(), { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const shift = (iso: string, months: number) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCMonth(d.getUTCMonth() - months);
  return d.toISOString().slice(0, 10);
};

/** Soldes saisis d'un compte : chaque ligne est un montant précis à une date (pas un cumul). Modifiable, supprimable, nettoyable. */
export function BalanceHistory({ account, entries, today }: { account: string; entries: { date: string; balance: number }[]; today: string }) {
  const tr = useT();
  const [pending, start] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [gone, setGone] = useState<string[]>([]);
  const list = [...entries].filter((e) => !gone.includes(e.date)).reverse();
  if (entries.length === 0) return null;

  return (
    <details className="text-xs">
      <summary className="cursor-pointer text-stone-400">Historique des soldes ({list.length})</summary>
      <p className="mt-2 text-[11px] text-stone-400">{tr("Chaque ligne est le solde réel à cette date, pas un montant à additionner.")}</p>
      <ul className={cx("mt-2 space-y-1", pending && "opacity-60")}>
        {list.map((h) =>
          editing === h.date ? (
            <li key={h.date}>
              <form
                action={(fd) => start(async () => { await editBalanceEntry(account, h.date, fd); setEditing(null); })}
                className="flex items-center gap-1.5"
              >
                <input name="entry_date" type="date" defaultValue={h.date} className="input min-w-0 px-2 py-1 text-xs" required />
                <input name="balance" type="number" step="0.01" defaultValue={h.balance} className="input w-24 min-w-0 px-2 py-1 text-xs" required />
                <button className="btn-primary px-2 py-1 text-xs">{tr("OK")}</button>
                <button type="button" onClick={() => setEditing(null)} className="text-stone-400">✕</button>
              </form>
            </li>
          ) : (
            <li key={h.date} className="group flex items-center justify-between gap-2 text-stone-500">
              <span>
                {fmt(h.date)}
                {h.date > today && <span className="ml-1 rounded-full bg-amber-100 px-1.5 py-px text-[10px] font-medium text-amber-700">{tr("à venir")}</span>}
              </span>
              <span className="flex items-center gap-2">
                <span className="font-medium text-stone-700">{formatEUR(h.balance)}</span>
                <button type="button" onClick={() => setEditing(h.date)} title={tr("Modifier")} className="text-stone-300 hover:text-brand-600">✎</button>
                <button
                  type="button"
                  onClick={() => { setGone((g) => [...g, h.date]); start(() => deleteBalanceEntry(account, h.date)); }}
                  title={tr("Supprimer cette date")}
                  className="text-stone-300 hover:text-rose-600"
                >
                  ✕
                </button>
              </span>
            </li>
          )
        )}
      </ul>
      {list.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-line pt-2 text-[11px] text-stone-400">
          Nettoyer :
          {[{ l: tr("+ d'1 mois"), m: 1 }, { l: tr("+ de 3 mois"), m: 3 }, { l: tr("+ de 6 mois"), m: 6 }].map((o) => (
            <button
              key={o.m}
              type="button"
              onClick={() => confirm(`Effacer les soldes de plus de ${o.m} mois ? (le plus récent est toujours gardé)`) && start(() => pruneBalanceHistory(account, shift(today, o.m)))}
              className="rounded-md bg-stone-100 px-2 py-0.5 text-stone-500 hover:bg-rose-50 hover:text-rose-600"
            >
              {o.l}
            </button>
          ))}
        </div>
      )}
    </details>
  );
}
