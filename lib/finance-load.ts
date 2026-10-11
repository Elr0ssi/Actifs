import { chargeRowToOp, incomeRowToOp, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";

/**
 * Transformation PURE « lignes SQL → état financier », partagée par le site (lib/data/finance.ts)
 * et par l'application iPhone (mobile/src/data). Aucune dépendance à React, Next ou Supabase :
 * les deux clients obtiennent ainsi exactement les mêmes chiffres pour les mêmes données.
 */

export const ACCOUNTS = ["Courant", "Épargne", "Investissement"] as const;
export type AccountName = (typeof ACCOUNTS)[number];

export interface TxnRow {
  id: string;
  label: string;
  merchant?: string | null;
  amount: number | string;
  kind: string;
  txn_date: string;
  txn_time?: string | null;
  card?: string | null;
  category?: string | null;
  source?: string;
}

export interface BalanceEntryRow {
  entry_date: string;
  balance: number | string;
  account: string;
}

export interface HouseholdFinanceRow {
  current_balance?: number | string | null;
  balance_ref_date?: string | null;
  savings_goal?: number | string | null;
  investment_goal?: number | string | null;
}

export function txnRowToOp(t: TxnRow): FinOp {
  return {
    id: `txn:${t.id}`,
    table: "charge",
    kind: t.kind === "income" ? "income" : "daily",
    name: t.merchant || t.label,
    amount: Number(t.amount),
    category: t.category || "Autre",
    frequency: "once",
    interval: 1,
    weekdays: [],
    monthDays: [],
    start: t.txn_date,
    end: null,
    skipped: [],
    weekendRule: "none",
    moved: {},
    active: true,
    note: t.card ? `Carte ${t.card}` : null,
    account: null,
    txn: { id: t.id, time: t.txn_time ? String(t.txn_time).slice(0, 5) : null, card: t.card ?? null },
  };
}

export interface FinanceState {
  ops: FinOp[];
  anchor: BalanceAnchor;
  accounts: Record<AccountName, { history: { date: string; balance: number }[]; last: { date: string; balance: number } | null }>;
  goals: { savings: number; investment: number };
}

/** `today` = date locale de l'utilisateur (AAAA-MM-JJ). */
export function buildFinanceState(
  rows: {
    charges: Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    incomes: Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any
    entries: BalanceEntryRow[];
    txns: TxnRow[];
    household: HouseholdFinanceRow | null;
  },
  today: string
): FinanceState {
  const { charges, incomes, entries, txns, household } = rows;
  const ops: FinOp[] = [...incomes.map(incomeRowToOp), ...charges.map(chargeRowToOp), ...txns.map(txnRowToOp)];
  const entriesByAccount = (name: AccountName) => entries.filter((e) => e.account === name).map((e) => ({ date: e.entry_date, balance: Number(e.balance) }));

  // Un solde saisi pour une date future est une prévision, jamais un point d'ancrage.
  const lastKnown = (list: { date: string; balance: number }[]) => [...list].filter((e) => e.date <= today).pop() ?? null;

  const courantEntries = entriesByAccount("Courant");
  const lastCourant = lastKnown(courantEntries);
  const anchor: BalanceAnchor = lastCourant
    ? { balance: lastCourant.balance, date: lastCourant.date, history: courantEntries.filter((e) => e.date <= today) }
    : { balance: Number(household?.current_balance ?? 0), date: household?.balance_ref_date ?? today };

  const accounts = Object.fromEntries(
    ACCOUNTS.map((name) => {
      const list = entriesByAccount(name);
      return [name, { history: list, last: lastKnown(list) }];
    })
  ) as FinanceState["accounts"];

  return { ops, anchor, accounts, goals: { savings: Number(household?.savings_goal ?? 0), investment: Number(household?.investment_goal ?? 0) } };
}
