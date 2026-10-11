import { getDateSituation, getEnvelopes, getMonthlyBudget, type FinOp } from "@/lib/finance-engine";
import { buildFinanceState, type BalanceEntryRow, type FinanceState, type HouseholdFinanceRow, type TxnRow } from "@/lib/finance-load";
import { sel, type AppData } from "./model";

/** Même calcul que le site (lib/finance-load.ts + lib/finance-engine.ts), appliqué aux lignes locales. */
export function financeFrom(data: AppData, today: string): FinanceState {
  return buildFinanceState(
    {
      charges: data.tables.recurring_charges,
      incomes: data.tables.incomes,
      entries: data.tables.balance_entries as unknown as BalanceEntryRow[],
      txns: data.tables.transactions as unknown as TxnRow[],
      household: sel.household(data) as unknown as HouseholdFinanceRow | null,
    },
    today
  );
}

export interface FinanceSummary {
  /** « Reste à vivre » : solde prévu en fin de mois, après toutes les charges à venir (écran Finance du site). */
  resteAVivre: number;
  /** Solde du compte courant à la date. */
  balance: number;
  /** Dépensé depuis le début du mois. */
  monthSpent: number;
  /** Encore prévu d'ici la fin du mois. */
  monthPlanned: number;
  perDay: number;
  daysRemaining: number;
  monthEnd: string;
}

export function summarize(state: FinanceState, today: string): FinanceSummary {
  const s = getDateSituation(state.ops, state.anchor, today);
  return { resteAVivre: s.endBalance, balance: s.balance, monthSpent: s.pastOut, monthPlanned: s.upcomingOut, perDay: s.perDay, daysRemaining: s.daysRemaining, monthEnd: s.monthEnd };
}

export const monthBudget = (state: FinanceState, year: number, month: number) => getMonthlyBudget(state.ops, state.anchor, year, month);
export const monthEnvelopes = (state: FinanceState, year: number, month: number) => getEnvelopes(state.ops, year, month);
export type { FinOp };
