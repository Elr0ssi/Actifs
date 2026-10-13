import { getT } from "@/lib/i18n/server";
import { SectionTabs } from "@/components/app/section-tabs";

export function FinanceSubnav() {
  const tr = getT();
  return (
    <SectionTabs
      label={tr("Sections Finance")}
      tabs={[
        { href: "/app/finance/calendar", label: tr("Calendrier") },
        { href: "/app/finance/budgets", label: tr("Budget") },
        { href: "/app/finance/paiements", label: tr("Paiements") },
        { href: "/app/finance/accounts", label: tr("Comptes") },
        { href: "/app/finance/taxes", label: tr("Impôts") },
      ]}
    />
  );
}
