// Indicative French salary/tax helpers. Approximate, publicly known rules — not a substitute
// for a payslip or an official simulator. Always exposed as a range, never a single "exact" figure.

/** Rough net-of-charges ratio applied to a gross annual salary (indicative only). */
const NET_RATIO: Record<"non-cadre" | "cadre", number> = { "non-cadre": 0.78, cadre: 0.76 };

export function grossToNet(brutAnnuel: number, statut: "non-cadre" | "cadre" = "non-cadre") {
  const ratio = NET_RATIO[statut];
  const netAnnuel = brutAnnuel * ratio;
  return {
    netAnnuel,
    netMensuel: netAnnuel / 12,
    // Indicative range: net-of-charges ratios vary a few points by convention/status.
    low: (netAnnuel * 0.97) / 12,
    high: (netAnnuel * 1.03) / 12,
  };
}

// 2025 barème (revenus 2024), par part — donnée publique, à vérifier chaque année.
const BRACKETS_2025 = [
  { upTo: 11294, rate: 0 },
  { upTo: 28797, rate: 0.11 },
  { upTo: 82341, rate: 0.3 },
  { upTo: 177106, rate: 0.41 },
  { upTo: Infinity, rate: 0.45 },
];

/** Progressive tax on one "part" of the family quotient. */
function taxOnPart(quotient: number) {
  let tax = 0;
  let lower = 0;
  for (const b of BRACKETS_2025) {
    if (quotient <= lower) break;
    const taxable = Math.min(quotient, b.upTo) - lower;
    tax += taxable * b.rate;
    lower = b.upTo;
  }
  return tax;
}

export interface TaxEstimate {
  annualTax: number;
  monthlyProvision: number;
  low: number;
  high: number;
  withholdingRate: number; // %, calculé — jamais à saisir par l'utilisateur
}

/**
 * Indicative annual income tax, with a ±10% range (rates, deductions and personal
 * circumstances change the real bill). `netImposableAnnuel` is the taxable net income
 * before the 10% professional-expense allowance, which is applied here.
 */
export function estimateIncomeTax(netImposableAnnuel: number, grossForRate: number, parts = 1): TaxEstimate {
  const base = Math.max(0, netImposableAnnuel * 0.9); // 10% abattement forfaitaire (simplifié, non plafonné)
  const quotient = base / Math.max(0.5, parts);
  const annualTax = taxOnPart(quotient) * parts;
  const withholdingRate = grossForRate > 0 ? Math.min(100, (annualTax / grossForRate) * 100) : 0;
  return { annualTax, monthlyProvision: annualTax / 12, low: annualTax * 0.9, high: annualTax * 1.1, withholdingRate };
}

const ALTERNANCE_EXEMPTION = 21000; // Salaire d'apprenti/alternant exonéré d'IR jusqu'à ce plafond annuel (SMIC annuel, arrondi).

/** Somme des périodes, avec l'exonération alternance appliquée en priorité sur les périodes marquées comme telles. */
export function taxableIncomeFromPeriods(periods: { activity: string; amount: number }[]) {
  let exemptionLeft = ALTERNANCE_EXEMPTION;
  let taxable = 0;
  let exempted = 0;
  for (const p of periods) {
    if (p.activity === "Alternance") {
      const exempt = Math.min(p.amount, exemptionLeft);
      exemptionLeft -= exempt;
      exempted += exempt;
      taxable += p.amount - exempt;
    } else {
      taxable += p.amount;
    }
  }
  return { taxable, exempted };
}
