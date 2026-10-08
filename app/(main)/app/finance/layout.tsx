import { getT } from "@/lib/i18n/server";
import { FinanceSubnav } from "@/components/app/finance/finance-subnav";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { todayISO } from "@/lib/utils";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  const tr = getT();
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">{tr("Finance")}</h1>
          <p className="mt-0.5 text-sm text-stone-500">{tr("Gère ton budget, suis tes dépenses et anticipe sereinement.")}</p>
        </div>
        <NewOperationButton defaultDate={todayISO()} label={tr("+ Nouvelle opération")} />
      </div>
      <FinanceSubnav />
      {children}
    </div>
  );
}
