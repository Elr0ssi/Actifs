// Pure, framework-free finance engine shared by server and client components.
// All dates are "YYYY-MM-DD" strings handled in UTC to avoid timezone drift.
import { DAYS_SHORT_SUN as WEEKDAYS_FR } from "@/lib/i18n";

/** « daily » : consommation quotidienne, c'est-à-dire les paiements réels par carte (Apple Pay) ; « variable » : ce qu'on estime dépenser. */
export type OpKind = "income" | "fixed" | "variable" | "daily" | "savings";
export type OpFrequency = "once" | "daily" | "weekly" | "monthly" | "yearly";
export type OpTable = "charge" | "income";
export type WeekendRule = "none" | "next" | "prev";

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
  /** Report automatique quand la date tombe un week-end : lundi suivant ("next"), vendredi précédent ("prev") ou rien. */
  weekendRule: WeekendRule;
  /** Déplacements ponctuels : date prévue par la récurrence → date réelle choisie à la main. */
  moved: Record<string, string>;
  active: boolean;
  note: string | null;
  account: string | null;
  /** Renseigné pour un paiement réel reçu du Wallet (et non une opération planifiée). */
  txn?: { id: string; time: string | null; card: string | null; /** Paiement saisi pour VALIDER une occurrence prévue : il la remplace (jamais de double comptage). */ validates?: { opId: string; date: string } };
}

export interface Occurrence {
  date: string;
  op: FinOp;
  signed: number;
  /** Montant réellement compté : celui de l'opération, sauf pour une estimation déjà consommée par des paiements réels. */
  amount: number;
}

export interface BalanceAnchor {
  balance: number;
  date: string;
  /**
   * Tous les soldes réels saisis (jusqu'à aujourd'hui). Chacun est un montant précis à une date, pas un mouvement :
   * pour une date donnée, on repart du solde réel le plus proche avant elle au lieu de tout recalculer depuis le dernier.
   */
  history?: { date: string; balance: number }[];
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

export function shiftWeekend(date: string, rule: WeekendRule) {
  if (rule === "none") return date;
  const dow = new Date(toMs(date)).getUTCDay();
  if (dow === 6) return addDays(date, rule === "next" ? 2 : -1);
  if (dow === 0) return addDays(date, rule === "next" ? 1 : -2);
  return date;
}

/** Dates réelles d'une opération (après report du week-end et déplacements manuels), avec la date prévue d'origine. */
export function occurrenceEntries(op: FinOp, from: string, to: string): { raw: string; date: string }[] {
  if (!op.active) return [];
  const pad = 4;
  const rawFrom = addDays(from, -pad);
  const rawTo = addDays(to, pad);
  const out: { raw: string; date: string }[] = [];
  for (const raw of rawOccurrences(op, rawFrom, rawTo)) {
    const date = op.moved[raw] ?? shiftWeekend(raw, op.weekendRule);
    if (date >= from && date <= to) out.push({ raw, date });
  }
  // Une occurrence déplacée loin de sa date prévue peut venir d'en dehors de la fenêtre.
  for (const [raw, date] of Object.entries(op.moved)) {
    if ((raw < rawFrom || raw > rawTo) && date >= from && date <= to && !(op.end && raw > op.end) && raw >= op.start) out.push({ raw, date });
  }
  const skipped = new Set(op.skipped);
  return out.filter((e) => !skipped.has(e.date)).sort((a, b) => a.date.localeCompare(b.date));
}

/** All occurrence dates of an operation within [from, to], honoring interval, weekdays, month days, end date, weekend rule, manual moves and skipped dates. */
export function occurrencesOf(op: FinOp, from: string, to: string): string[] {
  return occurrenceEntries(op, from, to).map((e) => e.date);
}

function rawOccurrences(op: FinOp, from: string, to: string): string[] {
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
  return out.sort();
}

/** Occurrences the user chose to ignore — kept visible (struck through) so they can be restored. */
export function getSkippedOccurrences(ops: FinOp[], from: string, to: string): Occurrence[] {
  const out: Occurrence[] = [];
  for (const op of ops) {
    if (!op.skipped.length) continue;
    for (const date of occurrencesOf({ ...op, skipped: [] }, from, to)) {
      if (op.skipped.includes(date)) out.push({ date, op, signed: signOf(op) * op.amount, amount: op.amount });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date));
}

/** `source` d'un paiement créé en validant une occurrence prévue : `valide:<id de l'opération>:<date de l'occurrence>`. */
export const VALIDATION_PREFIX = "valide:";
export const validationSource = (opId: string, date: string) => `${VALIDATION_PREFIX}${opId}:${date}`;
export function parseValidation(source: string | null | undefined): { opId: string; date: string } | null {
  if (!source || !source.startsWith(VALIDATION_PREFIX)) return null;
  const rest = source.slice(VALIDATION_PREFIX.length);
  const i = rest.lastIndexOf(":");
  const date = rest.slice(i + 1);
  return i > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date) ? { opId: rest.slice(0, i), date } : null;
}

/**
 * Une estimation (dépense variable) n'est pas une dépense en plus des paiements réels : c'est une enveloppe.
 *  - Une occurrence VALIDÉE à la main est remplacée par le paiement saisi (son montant prévu ne compte plus).
 *  - Dans un mois et une catégorie donnés, les autres paiements par carte « consomment » l'estimation (les premières dates d'abord) ;
 *    seul le reste de l'estimation est encore compté, et ce qui dépasse l'enveloppe s'ajoute tel quel.
 * Clé : `${id}|${date}` → montant restant à compter de cette occurrence.
 */
export function envelopeAdjustments(ops: FinOp[], from: string, to: string) {
  const adjust = new Map<string, number>();
  const dailyAll = ops.filter((o) => o.kind === "daily");
  for (const t of dailyAll) if (t.txn?.validates) adjust.set(`${t.txn.validates.opId}|${t.txn.validates.date}`, 0);
  // Un paiement qui valide une occurrence précise ne sert pas aussi à consommer les autres.
  const daily = dailyAll.filter((o) => !o.txn?.validates);
  const planned = ops.filter((o) => o.kind === "variable" && o.active);
  if (!daily.length || !planned.length) return adjust;
  const first = new Date(toMs(from));
  const last = new Date(toMs(to));
  const months = (last.getUTCFullYear() - first.getUTCFullYear()) * 12 + last.getUTCMonth() - first.getUTCMonth();
  for (let i = 0; i <= months; i++) {
    const { start, end } = monthBounds(first.getUTCFullYear(), first.getUTCMonth() + i);
    const real = new Map<string, number>();
    for (const op of daily) for (const d of occurrencesOf(op, start, end)) real.set(op.category || "Autre", (real.get(op.category || "Autre") ?? 0) + op.amount);
    if (!real.size) continue;
    const occ: { op: FinOp; date: string }[] = [];
    for (const op of planned) for (const date of occurrencesOf(op, start, end)) occ.push({ op, date });
    occ.sort((a, b) => a.date.localeCompare(b.date));
    for (const o of occ) {
      if (adjust.has(`${o.op.id}|${o.date}`)) continue; // déjà validée
      const cat = o.op.category || "Autre";
      const left = real.get(cat) ?? 0;
      if (left <= 0) continue;
      const take = Math.min(left, o.op.amount);
      real.set(cat, left - take);
      adjust.set(`${o.op.id}|${o.date}`, o.op.amount - take);
    }
  }
  return adjust;
}

/** Dépense payée depuis un compte d'épargne : elle ne touche pas le compte courant (mais l'épargne). */
export const isSavingsAccountExpense = (op: FinOp) => op.kind !== "income" && op.kind !== "savings" && !!op.account && /(é|e)pargne|livret|ldds|\bpel\b/i.test(op.account);
const courantOps = (ops: FinOp[]) => (ops.some(isSavingsAccountExpense) ? ops.filter((o) => !isSavingsAccountExpense(o)) : ops);

export function expand(ops: FinOp[], from: string, to: string): Occurrence[] {
  const out: Occurrence[] = [];
  const adjust = envelopeAdjustments(ops, from, to);
  for (const op of ops) {
    for (const date of occurrencesOf(op, from, to)) {
      const amount = adjust.get(`${op.id}|${date}`) ?? op.amount;
      // Une ligne entièrement remplacée (validée) ou couverte par des paiements n'a plus rien à compter : on ne l'affiche pas.
      if (amount <= 0 && op.amount > 0) continue;
      out.push({ date, op, signed: signOf(op) * amount, amount });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || b.signed - a.signed);
}

/** Continuous treasury: end-of-day balance at `date`, starting from the user's real anchor balance. */
export function getBalanceAtDate(allOps: FinOp[], anchor: BalanceAnchor, date: string) {
  const ops = courantOps(allOps);
  const points = anchor.history?.length ? [...anchor.history].sort((a, b) => a.date.localeCompare(b.date)) : [{ date: anchor.date, balance: anchor.balance }];
  let base: { date: string; balance: number } | null = null;
  for (const p of points) if (p.date <= date) base = p;
  if (base) return base.date === date ? base.balance : base.balance + sum(expand(ops, addDays(base.date, 1), date));
  // Avant le tout premier solde saisi : on remonte depuis lui.
  const first = points[0];
  return first.balance - sum(expand(ops, addDays(date, 1), first.date));
}

export function getDailyBalances(allOps: FinOp[], anchor: BalanceAnchor, from: string, to: string) {
  const ops = courantOps(allOps);
  const byDate = new Map<string, number>();
  for (const o of expand(ops, from, to)) byDate.set(o.date, (byDate.get(o.date) ?? 0) + o.signed);
  const result: { date: string; balance: number }[] = [];
  let running = getBalanceAtDate(ops, anchor, addDays(from, -1));
  const real = new Map((anchor.history ?? []).map((h) => [h.date, h.balance]));
  for (let d = from; d <= to; d = addDays(d, 1)) {
    running += byDate.get(d) ?? 0;
    // Un solde réel saisi ce jour-là remplace le calcul : c'est la vérité du compte.
    if (real.has(d)) running = real.get(d) as number;
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
export function getRemainingBudgetAtDate(allOps: FinOp[], anchor: BalanceAnchor, date: string) {
  const ops = courantOps(allOps);
  const next = getNextIncome(ops, date);
  const until = next ? addDays(next.date, -1) : monthBounds(new Date(toMs(date)).getUTCFullYear(), new Date(toMs(date)).getUTCMonth()).end;
  const days = Math.max(1, diffDays(date, until) + 1);
  const balance = getBalanceAtDate(ops, anchor, date);
  const committed = until > date ? -sum(expand(ops.filter((o) => o.kind !== "income"), addDays(date, 1), until)) : 0;
  const available = balance - committed;
  return { balance, available, days, perDay: available / days, until, nextIncome: next };
}

/**
 * Situation at a clicked date: operations already passed this month (included in the balance),
 * operations still to come until month end, and the projected end-of-month balance ("reste à vivre")
 * which anticipates every upcoming charge (rent, subscriptions…) instead of stopping at today's balance.
 */
export function getDateSituation(allOps: FinOp[], anchor: BalanceAnchor, date: string, minUpcoming = 5) {
  const ops = courantOps(allOps);
  const d = new Date(toMs(date));
  const { start, end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
  const past = expand(ops, start, date);
  let upcoming = expand(ops, addDays(date, 1), end);
  if (upcoming.length < minUpcoming) {
    upcoming = [...upcoming, ...expand(ops, addDays(end, 1), addDays(end, 90)).slice(0, minUpcoming - upcoming.length)];
  }
  const untilEnd = upcoming.filter((o) => o.date <= end);
  const balance = getBalanceAtDate(ops, anchor, date);
  const endBalance = balance + sum(untilEnd);
  const daysRemaining = Math.max(1, diffDays(date, end));

  const byAccount = new Map<string, number>();
  for (const o of untilEnd.filter((o) => o.signed < 0)) {
    const key = o.op.account || "Compte principal";
    byAccount.set(key, (byAccount.get(key) ?? 0) + o.amount);
  }

  return {
    monthEnd: end,
    balance,
    endBalance,
    perDay: endBalance / daysRemaining,
    daysRemaining,
    past,
    pastIn: past.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0),
    pastOut: -past.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0),
    upcoming,
    upcomingIn: untilEnd.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0),
    upcomingOut: -untilEnd.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0),
    outflowByAccount: [...byAccount.entries()].map(([account, amount]) => ({ account, amount })),
  };
}

/** What the user plans to do each month (set manually), compared against real operations. */
export interface BudgetPlan {
  income: number;
  fixed: number;
  variable: number;
  savingsMode: "fixed" | "percent";
  savingsValue: number;
}

export function planSavings(plan: BudgetPlan) {
  return plan.savingsMode === "percent" ? (plan.income * plan.savingsValue) / 100 : plan.savingsValue;
}

export interface MonthlyBudget {
  income: number;
  incomeCount: number;
  fixed: number;
  /** Estimations pas encore consommées par des paiements réels. */
  variable: number;
  /** Consommation quotidienne : paiements réels par carte. */
  daily: number;
  savings: number;
  startBalance: number;
  endBalance: number;
  resteAVivre: number;
  variableByCategory: { label: string; value: number }[];
  dailyByCategory: { label: string; value: number }[];
  fixedByCategory: { label: string; value: number }[];
  savingsByCategory: { label: string; value: number }[];
  occurrences: Occurrence[];
}

export function getMonthlyBudget(
  allOps: FinOp[],
  anchor: BalanceAnchor,
  year: number,
  month: number
): MonthlyBudget {
  const ops = courantOps(allOps);
  const { start, end } = monthBounds(year, month);
  const occ = expand(ops, start, end);
  const total = (k: OpKind) => occ.filter((o) => o.op.kind === k).reduce((s, o) => s + o.amount, 0);
  const income = total("income");
  const fixed = total("fixed");
  const variable = total("variable");
  const daily = total("daily");
  const savings = total("savings");
  const startBalance = getBalanceAtDate(ops, anchor, addDays(start, -1));

  const byCategory = (kind: OpKind) => {
    const map = new Map<string, number>();
    for (const o of occ.filter((o) => o.op.kind === kind)) map.set(o.op.category || "Autre", (map.get(o.op.category || "Autre") ?? 0) + o.amount);
    return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
  };

  return {
    income,
    incomeCount: occ.filter((o) => o.op.kind === "income").length,
    fixed,
    variable,
    daily,
    savings,
    startBalance,
    endBalance: getBalanceAtDate(ops, anchor, end),
    resteAVivre: startBalance + income - fixed - variable - daily - savings,
    occurrences: occ,
    variableByCategory: byCategory("variable"),
    dailyByCategory: byCategory("daily"),
    fixedByCategory: byCategory("fixed"),
    savingsByCategory: byCategory("savings"),
  };
}

/** Splits `amount` per week over the days actually left in the month (never a flat /4). */
export function perWeekRemaining(amount: number, referenceDate: string) {
  const d = new Date(toMs(referenceDate));
  const { end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
  const daysRemaining = diffDays(referenceDate, end);
  if (daysRemaining <= 0) return { daysRemaining: 0, perWeek: amount, isLastDay: true };
  return { daysRemaining, perWeek: amount / (daysRemaining / 7), isLastDay: false };
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
    weekendRule: (["next", "prev"].includes(r.weekend_rule) ? r.weekend_rule : "none") as WeekendRule,
    moved: r.moved_dates && typeof r.moved_dates === "object" ? r.moved_dates : {},
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
    weekendRule: (["next", "prev"].includes(r.weekend_rule) ? r.weekend_rule : "none") as WeekendRule,
    moved: r.moved_dates && typeof r.moved_dates === "object" ? r.moved_dates : {},
    active: r.active ?? true,
    note: r.note ?? null,
    account: r.account ?? null,
  };
}

type Tr = (key: string, vars?: Record<string, string | number>) => string;
const identity: Tr = (key, vars) => (vars ? key.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m)) : key);

/** Texte de récurrence d'une opération ; `tr` traduit les phrases (français par défaut). */
export function describeRecurrence(op: FinOp, tr: Tr = identity) {
  if (op.frequency === "once") return tr("Une fois");
  const every =
    op.interval > 1
      ? tr({ daily: "Tous les {n} jours", weekly: "Toutes les {n} semaines", monthly: "Tous les {n} mois", yearly: "Tous les {n} ans", once: "" }[op.frequency], { n: op.interval })
      : tr({ daily: "Chaque jour", weekly: "Chaque semaine", monthly: "Chaque mois", yearly: "Chaque an", once: "" }[op.frequency]);
  if (op.frequency === "weekly" && op.weekdays.length) return `${every} (${op.weekdays.map((d) => WEEKDAYS_FR[d].toLowerCase()).join(", ")})`;
  if (op.frequency === "monthly") {
    const days = op.monthDays.length ? op.monthDays : [new Date(toMs(op.start)).getUTCDate()];
    return tr("{every}, le {days}", { every, days: days.join(tr(" et ")) });
  }
  return every;
}

/** Approximate monthly weight of an operation (for subtotals in lists). */
export function monthlyAmount(op: FinOp) {
  const every = Math.max(1, op.interval || 1);
  switch (op.frequency) {
    case "daily": return (op.amount * 30.4) / every;
    case "weekly": return (op.amount * 4.33 * Math.max(1, op.weekdays.length)) / every;
    case "monthly": return (op.amount * Math.max(1, op.monthDays.length)) / every;
    case "yearly": return op.amount / 12 / every;
    default: return 0;
  }
}

export const CATEGORIES: Record<OpKind, string[]> = {
  fixed: ["Loyer", "Abonnement", "Électricité / Gaz", "Internet / Téléphone", "Assurance", "Crédit", "Transport", "Impôts", "Autre"],
  variable: ["Alimentation / Courses", "Restaurants / Livraison", "Sorties & loisirs", "Habillement", "Transport", "Santé", "Maison", "Cadeaux", "Autre"],
  income: ["Salaire", "Prime", "Freelance", "Aides / Allocations", "Remboursement", "Dividendes / Intérêts", "Autre"],
  savings: ["Épargne", "Livret A", "PEA", "CTO", "Assurance-vie", "Crypto", "Autre"],
  daily: ["Alimentation / Courses", "Restaurants / Livraison", "Sorties & loisirs", "Habillement", "Transport", "Santé", "Maison", "Cadeaux", "Autre"],
};

export const KIND_LABEL: Record<OpKind, string> = { income: "Revenu", fixed: "Charge fixe", variable: "Dépense variable", daily: "Consommation quotidienne", savings: "Épargne / invest." };
export const KIND_STYLE: Record<OpKind, { chip: string; text: string; dot: string }> = {
  income: { chip: "bg-emerald-50 text-emerald-700", text: "text-emerald-600", dot: "bg-emerald-500" },
  fixed: { chip: "bg-rose-50 text-rose-700", text: "text-rose-600", dot: "bg-rose-500" },
  variable: { chip: "bg-amber-50 text-amber-700", text: "text-amber-600", dot: "bg-amber-500" },
  daily: { chip: "bg-teal-50 text-teal-700", text: "text-teal-600", dot: "bg-teal-500" },
  savings: { chip: "bg-violet-50 text-violet-700", text: "text-violet-600", dot: "bg-violet-500" },
};

export interface Envelope {
  category: string;
  /** Budget estimé du mois (somme des dépenses variables de la catégorie). */
  planned: number;
  /** Consommation quotidienne réelle du mois dans la catégorie. */
  real: number;
  /** Ce qu'il reste dans l'enveloppe (négatif si dépassée). */
  left: number;
}

/** Prévu contre réel, catégorie par catégorie, pour un mois. Les catégories sans estimation mais avec des paiements réels sont incluses. */
export function getEnvelopes(ops: FinOp[], year: number, month: number, upTo?: string): Envelope[] {
  const { start, end: monthEnd } = monthBounds(year, month);
  const end = upTo && upTo < monthEnd ? upTo : monthEnd; // « jusqu'à aujourd'hui » : prévu et réel comparés sur la même période
  const map = new Map<string, Envelope>();
  const row = (category: string) => map.get(category) ?? { category, planned: 0, real: 0, left: 0 };
  for (const op of ops) {
    if (op.kind !== "variable" && op.kind !== "daily") continue;
    const cat = op.category || "Autre";
    const n = occurrencesOf(op, start, end).length;
    if (!n) continue;
    const e = row(cat);
    if (op.kind === "variable") e.planned += n * op.amount;
    else e.real += n * op.amount;
    map.set(cat, e);
  }
  return [...map.values()].map((e) => ({ ...e, left: e.planned - e.real })).sort((a, b) => Math.max(b.planned, b.real) - Math.max(a.planned, a.real));
}

/* ------------------------------------------------------------------ */
/*  Budget : lignes prévues, validation, épargne                       */
/* ------------------------------------------------------------------ */

export type BudgetLineStatus = "validated" | "due" | "upcoming";
export interface BudgetLine {
  op: FinOp;
  /** Date de l'occurrence (après report du week-end / déplacement). */
  date: string;
  status: BudgetLineStatus;
  /** Montant prévu. */
  planned: number;
  /** Montant réellement dépensé si l'occurrence a été validée. */
  actual: number | null;
  /** Part de la ligne déjà couverte par des paiements par carte de la même catégorie (comptée une seule fois). */
  covered: number;
  /** Identifiant du paiement créé à la validation (pour pouvoir l'annuler). */
  txnId: string | null;
}

/**
 * Lignes de budget (dépenses variables prévues) d'une période, avec leur état :
 *  - `validated` : confirmée (montant réel saisi), remplace le prévu ;
 *  - `due` : la date est passée (ou c'est aujourd'hui) et elle n'est pas encore validée → à valider ou ajuster ;
 *  - `upcoming` : à venir.
 */
export function getBudgetLines(ops: FinOp[], from: string, to: string, today: string): BudgetLine[] {
  const validated = new Map<string, FinOp>();
  for (const o of ops) if (o.txn?.validates) validated.set(`${o.txn.validates.opId}|${o.txn.validates.date}`, o);
  const remaining = envelopeAdjustments(ops, from, to); // montant encore compté de chaque ligne (0 si validée ou couverte)
  const out: BudgetLine[] = [];
  for (const op of ops) {
    if (op.kind !== "variable" || op.txn || !op.active) continue;
    for (const date of occurrencesOf(op, from, to)) {
      const key = `${op.id}|${date}`;
      const v = validated.get(key);
      const left = remaining.get(key) ?? op.amount;
      out.push({
        op,
        date,
        status: v ? "validated" : date <= today ? "due" : "upcoming",
        planned: op.amount,
        actual: v ? v.amount : null,
        covered: v ? 0 : Math.max(0, op.amount - left),
        txnId: v?.txn?.id ?? null,
      });
    }
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.op.name.localeCompare(b.op.name));
}

const INVESTMENT = /^(pea|cto|assurance|crypto)/i;

/**
 * Épargne estimée à une date : dernier solde d'épargne saisi, plus les versements prévus depuis (hors investissements),
 * moins les dépenses payées depuis l'épargne. `null` si aucun solde d'épargne n'a été saisi.
 */
export function getSavingsAt(ops: FinOp[], last: { date: string; balance: number } | null, date: string): number | null {
  if (!last) return null;
  if (date <= last.date) return last.balance;
  let v = last.balance;
  for (const o of expand(ops, addDays(last.date, 1), date)) {
    if (o.op.kind === "savings" && !INVESTMENT.test(o.op.category || "")) v += o.amount;
    else if (isSavingsAccountExpense(o.op)) v -= o.amount;
  }
  return v;
}
