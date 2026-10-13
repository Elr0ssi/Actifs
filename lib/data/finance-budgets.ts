import { getAppContext } from "@/lib/data/context";
import { getFinanceOwner } from "@/lib/data/finance-owner";

export interface TaxPeriod {
  label: string;
  activity: string;
  amount: number;
}

export interface TaxProfile {
  year: number;
  periods: TaxPeriod[];
  withholdingRate: number | null;
  alreadyWithheld: number | null;
  householdParts: number;
  provisionManual: number | null;
}

export async function loadTaxProfile(year: number): Promise<TaxProfile | null> {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const owner = await getFinanceOwner();
  if (!owner) return null;
  const { data } = await ctx.supabase.from("tax_profiles").select("*").eq("owner_id", owner.ownerId).eq("year", year).maybeSingle();
  const inputs = (data?.inputs as { periods?: TaxPeriod[]; withholdingRate?: number; alreadyWithheld?: number; householdParts?: number }) ?? {};
  return {
    year,
    periods: inputs.periods ?? [],
    withholdingRate: inputs.withholdingRate ?? null,
    alreadyWithheld: inputs.alreadyWithheld ?? null,
    householdParts: inputs.householdParts ?? 1,
    provisionManual: data?.provision_manual !== undefined && data?.provision_manual !== null ? Number(data.provision_manual) : null,
  };
}
