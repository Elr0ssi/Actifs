import { SectionTabs } from "@/components/app/section-tabs";

export function FinanceSubnav() {
  return (
    <SectionTabs
      label="Sections Finance"
      tabs={[
        { href: "/app/finance", label: "Vue d'ensemble" },
        { href: "/app/finance/calendar", label: "Calendrier" },
        { href: "/app/finance/budgets", label: "Budgets" },
        { href: "/app/finance/operations", label: "Opérations" },
        { href: "/app/finance/paiements", label: "Paiements" },
        { href: "/app/finance/accounts", label: "Comptes" },
        { href: "/app/finance/taxes", label: "Impôts" },
      ]}
    />
  );
}
