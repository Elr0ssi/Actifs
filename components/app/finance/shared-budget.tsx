import { getT } from "@/lib/i18n/server";
import { intlLocale } from "@/lib/i18n";
import type { Occurrence } from "@/lib/finance-engine";
import { formatEUR } from "@/lib/utils";
import { SpaceBadge } from "@/components/app/space-badge";
import { NewOperationButton } from "@/components/app/finance/operation-form";

const fmtDay = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString(intlLocale(), { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/**
 * Budget partagé : les dépenses que les membres du foyer ont choisi de mettre en commun, ce mois-ci.
 * Chacun garde son budget perso intact ; une ligne commune ne compte que chez celui qui l'a créée (c'est lui qui paie).
 * Les lignes des autres se consultent, elles ne se modifient pas.
 */
export function SharedBudget({ occurrences, owners, meId, monthStart, monthLabel }: { occurrences: Occurrence[]; owners: Record<string, string>; meId: string; monthStart: string; monthLabel: string }) {
  const tr = getT();
  const ownerOf = (o: Occurrence) => o.op.ownerId ?? meId;
  const outflows = occurrences.filter((o) => o.signed < 0);
  const total = outflows.reduce((s, o) => s + o.amount, 0);
  const perPerson = new Map<string, number>();
  for (const o of outflows) perPerson.set(ownerOf(o), (perPerson.get(ownerOf(o)) ?? 0) + o.amount);

  return (
    <section className="card border-violet-200/70 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-[13px] font-semibold text-stone-900"><span aria-hidden>👥</span>{tr("Budget partagé")} <span className="font-normal capitalize text-stone-400">· {monthLabel}</span></h2>
          <p className="mt-0.5 max-w-xl text-[11px] text-stone-500">{tr("Les dépenses communes que chacun a choisi de partager. Ton budget perso reste le tien : une ligne partagée ne compte que chez celui qui la paie.")}</p>
        </div>
        <NewOperationButton defaultDate={monthStart} defaultKind="variable" defaultShared label={tr("+ Dépense commune")} className="btn-secondary px-3 py-1.5 text-xs" />
      </div>

      {outflows.length === 0 ? (
        <p className="mt-4 rounded-xl bg-violet-50/60 px-3 py-6 text-center text-xs text-stone-500">{tr("Aucune dépense partagée ce mois-ci. Ajoute-en une, ou passe une ligne de ton budget en « Partagé ».")}</p>
      ) : (
        <>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-violet-100 px-3 py-1.5 text-[12px] font-semibold text-violet-900">{tr("Total commun")} · {formatEUR(total)}</span>
            {[...perPerson.entries()].map(([id, amount]) => (
              <span key={id} className="rounded-xl bg-stone-100 px-3 py-1.5 text-[12px] text-stone-700">
                {id === meId ? tr("Toi") : owners[id] ?? "—"} · <b className="tabular">{formatEUR(amount)}</b>
              </span>
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {outflows.map((o, i) => (
              <li key={`${o.op.id}-${o.date}-${i}`} className="flex items-center gap-3 rounded-xl border border-line/70 bg-surface px-3 py-2">
                <span className="w-16 shrink-0 text-[11px] font-medium capitalize text-stone-500">{fmtDay(o.date)}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-stone-800">{o.op.name}</span>
                  <span className="block truncate text-[11px] text-stone-400">{tr(o.op.category)}</span>
                </span>
                <SpaceBadge shared mine={ownerOf(o) === meId} ownerName={owners[ownerOf(o)]} className="hidden sm:inline-flex" />
                <span className="tabular shrink-0 text-right text-[13px] font-semibold text-stone-800">{formatEUR(o.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
