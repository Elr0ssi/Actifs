import { getAppContext } from "@/lib/data/context";

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
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";
  const { data } = await supabase.from("tax_profiles").select("*").eq("household_id", householdId).eq("year", year).maybeSingle();
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
