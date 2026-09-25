// Pure, framework-free finance engine shared by server and client components.
// All dates are "YYYY-MM-DD" strings handled in UTC to avoid timezone drift.

export type OpKind = "income" | "fixed" | "variable" | "savings";
export type OpFrequency = "once" | "daily" | "weekly" | "monthly" | "yearly";
export type OpTable = "charge" | "income";

export interface FinOp {
  id: string;
  table: OpTable;
  kind: OpKind;
  name: string;
  amount: number;
  category: string;
  frequency: OpFrequency;
  interval: number;
  weekdays: number[];
  monthDays: number[];
  start: string;
  end: string | null;
  skipped: string[];
  active: boolean;
  note: string | null;
  account: string | null;
}

export interface Occurrence {
  date: string;
  op: FinOp;
  signed: number;
}

export interface BalanceAnchor {
  balance: number;
  date: string;
}

const DAY = 86_400_000;

export function toMs(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}
export function fromMs(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}
export function addDays(iso: string, n: number) {
  return fromMs(toMs(iso) + n * DAY);
}
export function diffDays(a: string, b: string) {
  return Math.round((toMs(b) - toMs(a)) / DAY);
}
export function monthBounds(year: number, month: number) {
  const start = fromMs(Date.UTC(year, month, 1));
  const end = fromMs(Date.UTC(year, month + 1, 0));
  return { start, end, days: new Date(Date.UTC(year, month + 1, 0)).getUTCDate() };
}
function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

export function signOf(op: FinOp) {
  return op.kind === "income" ? 1 : -1;
}

/** All occurrence dates of an operation within [from, to], honoring interval, weekdays, month days, end date and skipped dates. */
export function occurrencesOf(op: FinOp, from: string, to: string): string[] {
  if (!op.active) return [];
  const lo = op.start > from ? op.start : from;
  const hi = op.end && op.end < to ? op.end : to;
  if (lo > hi) return [];
  const every = Math.max(1, op.interval || 1);
  const out: string[] = [];

  if (op.frequency === "once") {
    if (op.start >= lo && op.start <= hi) out.push(op.start);
  } else if (op.frequency === "daily") {
    const offset = diffDays(op.start, lo);
    let cursor = addDays(op.start, Math.ceil(offset / every) * every);
    while (cursor <= hi) {
      out.push(cursor);
      cursor = addDays(cursor, every);
    }
  } else if (op.frequency === "weekly") {
    const days = op.weekdays.length ? op.weekdays : [new Date(toMs(op.start)).getUTCDay()];
    const startWeek = Math.floor((toMs(op.start) / DAY + 4) / 7); // epoch day 0 was a Thursday
    for (let cursor = lo; cursor <= hi; cursor = addDays(cursor, 1)) {
      const ms = toMs(cursor);
      const week = Math.floor((ms / DAY + 4) / 7);
      if ((week - startWeek) % every === 0 && days.includes(new Date(ms).getUTCDay())) out.push(cursor);
    }
  } else if (op.frequency === "monthly") {
    const s = new Date(toMs(op.start));
    const days = op.monthDays.length ? op.monthDays : [s.getUTCDate()];
    const loD = new Date(toMs(lo));
    let idx = (loD.getUTCFullYear() - s.getUTCFullYear()) * 12 + (loD.getUTCMonth() - s.getUTCMonth());
    idx = Math.max(0, Math.floor(idx / every) * every);
    for (; ; idx += every) {
      const y = s.getUTCFullYear() + Math.floor((s.getUTCMonth() + idx) / 12);
      const m = (s.getUTCMonth() + idx) % 12;
      if (fromMs(Date.UTC(y, m, 1)) > hi) break;
      for (const d of days) {
        const date = fromMs(Date.UTC(y, m, Math.min(d, daysInMonth(y, m))));
        if (date >= lo && date <= hi && date >= op.start) out.push(date);
      }
    }
  } else if (op.frequency === "yearly") {
    const s = new Date(toMs(op.start));
    for (let y = s.getUTCFullYear(); ; y += every) {
      const date = fromMs(Date.UTC(y, s.getUTCMonth(), Math.min(s.getUTCDate(), daysInMonth(y, s.getUTCMonth()))));
      if (date > hi) break;
      if (date >= lo) out.push(date);
    }
  }
  const skipped = new Set(op.skipped);
  return out.filter((d) => !skipped.has(d)).sort();
}

export function expand(ops: FinOp[], from: string, to: string): Occurrence[] {
  const out: Occurrence[] = [];
  for (const op of ops) for (const date of occurrencesOf(op, from, to)) out.push({ date, op, signed: signOf(op) * op.amount });
  return out.sort((a, b) => a.date.localeCompare(b.date) || b.signed - a.signed);
}

/** Continuous treasury: end-of-day balance at `date`, starting from the user's real anchor balance. */
export function getBalanceAtDate(ops: FinOp[], anchor: BalanceAnchor, date: string) {
  if (date === anchor.date) return anchor.balance;
  if (date > anchor.date) return anchor.balance + sum(expand(ops, addDays(anchor.date, 1), date));
  return anchor.balance - sum(expand(ops, addDays(date, 1), anchor.date));
}

export function getDailyBalances(ops: FinOp[], anchor: BalanceAnchor, from: string, to: string) {
  const byDate = new Map<string, number>();
  for (const o of expand(ops, from, to)) byDate.set(o.date, (byDate.get(o.date) ?? 0) + o.signed);
  const result: { date: string; balance: number }[] = [];
  let running = getBalanceAtDate(ops, anchor, addDays(from, -1));
  for (let d = from; d <= to; d = addDays(d, 1)) {
    running += byDate.get(d) ?? 0;
    result.push({ date: d, balance: running });
  }
  return result;
}

export function getOperationsForDate(ops: FinOp[], date: string) {
  return expand(ops, date, date);
}

export function getUpcomingOperations(ops: FinOp[], date: string, limit = 6) {
  return expand(ops, addDays(date, 1), addDays(date, 120)).slice(0, limit);
}

export function getNextIncome(ops: FinOp[], date: string) {
  return expand(ops.filter((o) => o.kind === "income"), addDays(date, 1), addDays(date, 400))[0] ?? null;
}

/** What can be freely spent from `date` until the next income, after every planned outflow in between. */
export function getRemainingBudgetAtDate(ops: FinOp[], anchor: BalanceAnchor, date: string) {
  const next = getNextIncome(ops, date);
  const until = next ? addDays(next.date, -1) : monthBounds(new Date(toMs(date)).getUTCFullYear(), new Date(toMs(date)).getUTCMonth()).end;
  const days = Math.max(1, diffDays(date, until) + 1);
  const balance = getBalanceAtDate(ops, anchor, date);
  const committed = until > date ? -sum(expand(ops.filter((o) => o.kind !== "income"), addDays(date, 1), until)) : 0;
  const available = balance - committed;
  return { balance, available, days, perDay: available / days, until, nextIncome: next };
}

export interface MonthlyBudget {
  income: number;
  incomeCount: number;
  fixed: number;
  variable: number;
  savings: number;
  startBalance: number;
  endBalance: number;
  resteAVivre: number;
  variableByCategory: { label: string; value: number }[];
}

export function getMonthlyBudget(
  ops: FinOp[],
  anchor: BalanceAnchor,
  year: number,
  month: number,
  plannedVariable: { name: string; amount: number }[],
  savingsRule: { mode: "fixed" | "percent"; value: number }
): MonthlyBudget {
  const { start, end } = monthBounds(year, month);
  const occ = expand(ops, start, end);
  const total = (k: OpKind) => occ.filter((o) => o.op.kind === k).reduce((s, o) => s + o.op.amount, 0);
  const income = total("income");
  const fixed = total("fixed");
  const scheduledVariable = total("variable");
  const plannedTotal = plannedVariable.reduce((s, b) => s + b.amount, 0);
  const variable = Math.max(plannedTotal, scheduledVariable);
  const savingsOps = total("savings");
  const ruleAmount = savingsRule.mode === "percent" ? (income * savingsRule.value) / 100 : savingsRule.value;
  const savings = savingsOps > 0 ? savingsOps : ruleAmount;
  const startBalance = getBalanceAtDate(ops, anchor, addDays(start, -1));

  const byCat = new Map<string, number>();
  if (plannedTotal > 0) for (const b of plannedVariable) byCat.set(b.name, (byCat.get(b.name) ?? 0) + b.amount);
  else for (const o of occ.filter((o) => o.op.kind === "variable")) byCat.set(o.op.category || "Autre", (byCat.get(o.op.category || "Autre") ?? 0) + o.op.amount);

  return {
    income,
    incomeCount: occ.filter((o) => o.op.kind === "income").length,
    fixed,
    variable,
    savings,
    startBalance,
    endBalance: getBalanceAtDate(ops, anchor, end),
    resteAVivre: startBalance + income - fixed - variable - savings,
    variableByCategory: [...byCat.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value),
  };
}

function sum(occ: Occurrence[]) {
  return occ.reduce((s, o) => s + o.signed, 0);
}

/** Normalizes rows from `recurring_charges` / `incomes` into engine operations. */
export function chargeRowToOp(r: Record<string, any>): FinOp {
  return {
    id: r.id,
    table: "charge",
    kind: (["fixed", "variable", "savings"].includes(r.kind) ? r.kind : "fixed") as OpKind,
    name: r.name,
    amount: Number(r.amount),
    category: r.category ?? "Autre",
    frequency: r.frequency,
    interval: r.interval_count ?? 1,
    weekdays: r.weekdays ?? [],
    monthDays: r.month_days ?? [],
    start: r.next_date,
    end: r.end_date ?? null,
    skipped: r.skipped_dates ?? [],
    active: r.active ?? true,
    note: r.note ?? null,
    account: r.account ?? null,
  };
}

export function incomeRowToOp(r: Record<string, any>): FinOp {
  return {
    id: r.id,
    table: "income",
    kind: "income",
    name: r.name,
    amount: Number(r.amount),
    category: r.category ?? "Revenu",
    frequency: r.frequency,
    interval: r.interval_count ?? 1,
    weekdays: r.weekdays ?? [],
    monthDays: r.month_days ?? [],
    start: r.expected_date,
    end: r.end_date ?? null,
    skipped: r.skipped_dates ?? [],
    active: r.active ?? true,
    note: r.note ?? null,
    account: r.account ?? null,
  };
}

const FREQ_TEXT: Record<OpFrequency, string> = { once: "Une fois", daily: "jour", weekly: "semaine", monthly: "mois", yearly: "an" };
const WEEKDAY_FR = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

export function describeRecurrence(op: FinOp) {
  if (op.frequency === "once") return "Une fois";
  const plural: Record<OpFrequency, string> = { once: "", daily: "jours", weekly: "semaines", monthly: "mois", yearly: "ans" };
  const every = op.interval > 1 ? `Tous les ${op.interval} ${plural[op.frequency]}` : `Chaque ${FREQ_TEXT[op.frequency]}`;
  if (op.frequency === "weekly" && op.weekdays.length) return `${every} (${op.weekdays.map((d) => WEEKDAY_FR[d]).join(", ")})`;
  if (op.frequency === "monthly") {
    const days = op.monthDays.length ? op.monthDays : [new Date(toMs(op.start)).getUTCDate()];
    return `${every}, le ${days.join(" et ")}`;
  }
  return every;
}

export const KIND_LABEL: Record<OpKind, string> = { income: "Revenu", fixed: "Charge fixe", variable: "Dépense variable", savings: "Épargne / invest." };
export const KIND_STYLE: Record<OpKind, { chip: string; text: string; dot: string }> = {
  income: { chip: "bg-emerald-50 text-emerald-700", text: "text-emerald-600", dot: "bg-emerald-500" },
  fixed: { chip: "bg-rose-50 text-rose-700", text: "text-rose-600", dot: "bg-rose-500" },
  variable: { chip: "bg-amber-50 text-amber-700", text: "text-amber-600", dot: "bg-amber-500" },
  savings: { chip: "bg-violet-50 text-violet-700", text: "text-violet-600", dot: "bg-violet-500" },
};
