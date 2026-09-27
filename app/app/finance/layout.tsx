import Link from "next/link";
import { FinanceSubnav } from "@/components/app/finance/finance-subnav";

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
        <Link href="/app/finance/operations" className="text-sm font-medium text-slate-500 hover:text-slate-800">Gérer les opérations →</Link>
      </div>
      <FinanceSubnav />
      {children}
    </div>
  );
}
