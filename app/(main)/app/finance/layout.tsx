import { getT } from "@/lib/i18n/server";
import { FinanceSubnav } from "@/components/app/finance/finance-subnav";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { FinanceOwnerSwitcher } from "@/components/app/finance/owner-switcher";
import { getFinanceOwner } from "@/lib/data/finance-owner";
import { todayISO } from "@/lib/utils";

export default async function FinanceLayout({ children }: { children: React.ReactNode }) {
  const tr = getT();
  const owner = await getFinanceOwner();
  const readOnly = owner?.readOnly ?? false;
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{tr("Finance")}</h1>
          <p className="mt-0.5 text-sm text-stone-500">{tr("Gère ton budget, suis tes dépenses et anticipe sereinement.")}</p>
        </div>
        {!readOnly && <NewOperationButton defaultDate={todayISO()} label={tr("+ Nouvelle opération")} />}
      </div>
      {owner && owner.options.length > 1 && <FinanceOwnerSwitcher options={owner.options} current={owner.ownerId} />}
      {readOnly && (
        <p role="status" className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-[13px] text-amber-900">
          {tr("Tu consultes la finance de {name} (lecture seule). Ton propre budget n'est pas modifié.", { name: owner?.ownerName ?? "" })}
        </p>
      )}
      <FinanceSubnav />
      {children}
    </div>
  );
}
