import { FinanceSubnav } from "@/components/app/finance/finance-subnav";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
      <FinanceSubnav />
      {children}
    </div>
  );
}
