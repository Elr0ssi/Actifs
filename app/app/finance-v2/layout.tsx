import Link from "next/link";
import { FinanceV2Subnav } from "@/components/app/finance-v2/subnav";

export default function FinanceV2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finance</h1>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700">Aperçu v2</span>
          </div>
          <p className="mt-1 text-sm text-slate-500">Nouvelle version, en test. Tes données de Finance actuelle ne sont pas touchées.</p>
        </div>
        <Link href="/app/finance" className="text-xs font-medium text-slate-500 hover:text-slate-800">← Revenir à Finance actuelle</Link>
      </div>
      <FinanceV2Subnav />
      {children}
    </div>
  );
}
