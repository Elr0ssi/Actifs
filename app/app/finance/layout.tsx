import { FinanceSubnav } from "@/components/app/finance/finance-subnav";
import { QuickBalances } from "@/components/app/finance/quick-balances";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
        <QuickBalances />
      </div>
      <FinanceSubnav />
      {children}
    </div>
  );
}
