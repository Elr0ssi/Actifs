// Pure engine for Finance v2 (preview). Complements lib/finance-engine.ts (recurring ops)
// with per-account balance history, transfers and month-scoped budgets.
import { addDays, diffDays, expand, monthBounds, toMs, type BalanceAnchor, type FinOp, type Occurrence } from "@/lib/finance-engine";

export type AccountType = "checking" | "savings" | "investment" | "other";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  includeInTreasury: boolean;
}

export interface BalancePoint {
  accountId: string;
  effectiveDate: string;
  amount: number;
  source: string;
}

export interface Transfer {
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  transferDate: string;
}

/**
 * Reconstructs one account's balance at `date`: last manual point at/before `date`,
 * plus net transfers and plus recurring ops whose free-text `account` matches this
 * account's name (best-effort — legacy recurring ops aren't linked to account ids).
 * Returns `unknown: true` (never a silent 0) when no point exists yet.
 */
export function accountBalanceAt(
  account: Account,
  points: BalancePoint[],
  transfers: Transfer[],
  ops: FinOp[],
  date: string
) {
  const own = points.filter((p) => p.accountId === account.id && p.effectiveDate <= date).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate));
  const last = own[0];
  if (!last) return { balance: null as number | null, asOf: null as string | null, unknown: true };
  if (last.effectiveDate === date) return { balance: last.amount, asOf: last.effectiveDate, unknown: false };

  const from = addDays(last.effectiveDate, 1);
  let balance = last.amount;
  for (const t of transfers) {
    if (t.transferDate < from || t.transferDate > date) continue;
    if (t.fromAccountId === account.id) balance -= t.amount;
    if (t.toAccountId === account.id) balance += t.amount;
  }
  const matched = ops.filter((o) => o.account && o.account.trim().toLowerCase() === account.name.trim().toLowerCase());
  balance += expand(matched, from, date).reduce((s, o) => s + o.signed, 0);
  return { balance, asOf: last.effectiveDate, unknown: false };
}

/** Total treasury of the selected accounts at `date`, plus flows not attributed to any account (added once). */
export function treasuryAt(
  accounts: Account[],
  includedIds: string[],
  points: BalancePoint[],
  transfers: Transfer[],
  ops: FinOp[],
  date: string
) {
  const included = accounts.filter((a) => includedIds.includes(a.id));
  const accountNames = new Set(accounts.map((a) => a.name.trim().toLowerCase()));
  const perAccount = included.map((a) => ({ account: a, ...accountBalanceAt(a, points, transfers, ops, date) }));
  const anyKnown = perAccount.some((p) => !p.unknown);
  const attributed = perAccount.reduce((s, p) => s + (p.balance ?? 0), 0);
  const unmatched = ops.filter((o) => !o.account || !accountNames.has(o.account.trim().toLowerCase()));
  // General (unattributed) flows only make sense once we have at least one known starting point.
  const earliestKnownDate = perAccount.filter((p) => p.asOf).map((p) => p.asOf as string).sort()[0];
  const unattributedFlow = anyKnown && earliestKnownDate ? expand(unmatched, addDays(earliestKnownDate, 1), date).reduce((s, o) => s + o.signed, 0) : 0;
  return { total: attributed + unattributedFlow, perAccount, hasUnknown: perAccount.some((p) => p.unknown) };
}

/** Theoretical monthly budget: independent of any carried balance. */
export interface MonthPlan {
  income: number;
  fixed: number;
  variable: number;
  savings: number;
}

export function theoreticalMargin(plan: MonthPlan) {
  return plan.income - plan.fixed - plan.variable - plan.savings;
}

/** Actual flows for the month, derived from recurring ops (for comparison against a manually budgeted plan). */
export function monthActuals(ops: FinOp[], year: number, month: number) {
  const { start, end } = monthBounds(year, month);
  const occ = expand(ops, start, end);
  const sumKind = (k: FinOp["kind"]) => occ.filter((o) => o.op.kind === k).reduce((s, o) => s + o.op.amount, 0);
  return { income: sumKind("income"), fixed: sumKind("fixed"), variable: sumKind("variable"), savings: sumKind("savings"), occurrences: occ };
}

/** Remaining amount split per week until month end, from the exact number of days left (never divided by a flat 4). */
export function perWeekRemaining(remaining: number, referenceDate: string) {
  const d = new Date(toMs(referenceDate));
  const { end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
  const daysRemaining = diffDays(referenceDate, end);
  if (daysRemaining <= 0) return { daysRemaining: 0, weeks: 0, perWeek: remaining, isLastDay: true };
  const weeks = daysRemaining / 7;
  return { daysRemaining, weeks, perWeek: remaining / weeks, isLastDay: false };
}

/** A simulated split of `amount` across destinations — pure, nothing is persisted until the caller saves it. */
export interface SplitDestination {
  id: string;
  label: string;
  value: number;
}

export function simulateSplit(amount: number, destinations: SplitDestination[]) {
  const allocated = destinations.reduce((s, d) => s + d.value, 0);
  return { allocated, remaining: amount - allocated };
}
