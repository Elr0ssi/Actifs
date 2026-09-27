import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, type FinOp } from "@/lib/finance-engine";

export interface MonthPlan {
  income: number;
  fixed: number;
  variable: number;
  savings: number;
  showCategories: boolean;
  capVariable: boolean;
  recurring: boolean;
  explicit: boolean; // false = no row saved yet for this month, values are a prefill from the household defaults
}

export interface Envelope {
  id: string;
  name: string;
  icon: string;
  plannedAmount: number;
}

export async function loadBudgetsPage(year: number, month: number) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: charges }, { data: incomes }, { data: monthRow }, { data: envelopeRows }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("household_id", householdId),
    supabase.from("incomes").select("*").eq("household_id", householdId),
    supabase.from("monthly_budget_plans").select("*").eq("household_id", householdId).eq("year", year).eq("month", month).maybeSingle(),
    supabase.from("variable_budgets").select("*").eq("household_id", householdId).order("position").order("created_at"),
  ]);

  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp)];
  const h = household as (typeof household & { budget_income?: number; budget_fixed?: number; budget_variable?: number }) | null;

  const plan: MonthPlan = monthRow
    ? {
        income: Number(monthRow.income),
        fixed: Number(monthRow.fixed),
        variable: Number(monthRow.variable),
        savings: Number(monthRow.savings),
        showCategories: monthRow.show_categories,
        capVariable: monthRow.cap_variable,
        recurring: monthRow.recurring,
        explicit: true,
      }
    : {
        income: Number(h?.budget_income ?? 0),
        fixed: Number(h?.budget_fixed ?? 0),
        variable: Number(h?.budget_variable ?? 0),
        savings: 0,
        showCategories: true,
        capVariable: false,
        recurring: false,
        explicit: false,
      };

  const envelopes: Envelope[] = (envelopeRows ?? []).map((e) => ({ id: e.id, name: e.name, icon: e.icon, plannedAmount: Number(e.planned_amount) }));

  return { householdId, ops, plan, envelopes };
}

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
