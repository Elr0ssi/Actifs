"use client";

import { useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { setFinanceOwner } from "@/app/(main)/app/finance/owner-actions";

export type OwnerOption = { id: string; name: string; self: boolean };

/** Choix « ma finance / la finance de … » : n'apparaît que si un proche partage la sienne avec toi. */
export function FinanceOwnerSwitcher({ options, current }: { options: OwnerOption[]; current: string }) {
  const tr = useT();
  const [pending, start] = useTransition();
  if (options.length < 2) return null;
  return (
    <div role="group" aria-label={tr("Finance de")} className={`inline-flex flex-wrap gap-1 rounded-2xl bg-stone-100 p-1 ${pending ? "opacity-70" : ""}`}>
      {options.map((o) => {
        const active = o.id === current;
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={active}
            disabled={pending}
            onClick={() => start(() => setFinanceOwner(o.self ? null : o.id))}
            className={`rounded-xl px-3 py-1.5 text-[13px] font-semibold transition ${active ? "bg-surface text-stone-900 shadow-soft" : "text-stone-500 hover:text-stone-800"}`}
          >
            {o.self ? tr("Ma finance") : tr("Finance de {name}", { name: o.name })}
          </button>
        );
      })}
    </div>
  );
}
