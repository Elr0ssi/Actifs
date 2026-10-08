import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { loadTaxProfile } from "@/lib/data/finance-budgets";
import { todayISO } from "@/lib/utils";
import { TaxPeriods } from "@/components/app/finance/tax-periods";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Impôts") };
}

export default async function TaxesPage({ searchParams }: { searchParams: { year?: string } }) {
  const tr = getT();
  const year = Number(searchParams.year) || new Date(`${todayISO()}T00:00:00Z`).getUTCFullYear();
  const profile = await loadTaxProfile(year);
  if (!profile) return null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link href={`/app/finance/taxes?year=${year - 1}`} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
        <p className="text-lg font-bold text-stone-900">Revenus {year}</p>
        <Link href={`/app/finance/taxes?year=${year + 1}`} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
        <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">{tr("Estimation")}</span>
      </div>
      <p className="text-xs text-stone-400">
        {tr("Estimation indicative, à partir d'un barème public — ne remplace pas ta déclaration ni un simulateur officiel.")}</p>
      <TaxPeriods key={year} year={year} profile={profile} />
    </div>
  );
}
