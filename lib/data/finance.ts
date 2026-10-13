import { cache } from "react";
import { getAppContext } from "@/lib/data/context";
import { chargeRowToOp, incomeRowToOp, parseValidation, type BalanceAnchor, type FinOp } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";
import { addDays as addDaysISO } from "@/lib/finance-engine";
import { getFinanceOwner } from "@/lib/data/finance-owner";

export const ACCOUNTS = ["Courant", "Épargne", "Investissement"] as const;
export type AccountName = (typeof ACCOUNTS)[number];

/**
 * Cached per request: the Finance layout (soldes) and the page share one set of queries.
 * La finance est personnelle : on charge celle de `ownerId` (toi, ou un membre qui la partage avec toi).
 * `forceOwn` : le tableau de bord montre toujours la tienne.
 */
export const loadFinanceData = cache(async (forceOwn: boolean = false) => {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const owner = await getFinanceOwner(forceOwn);
  if (!owner) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";
  const { ownerId } = owner;

  const today0 = todayISO();
  const [{ data: charges }, { data: incomes }, { data: entries }, { data: txns }, { data: settings }] = await Promise.all([
    supabase.from("recurring_charges").select("*").eq("owner_id", ownerId).order("next_date"),
    supabase.from("incomes").select("*").eq("owner_id", ownerId).order("expected_date"),
    supabase.from("balance_entries").select("entry_date, balance, account").eq("owner_id", ownerId).order("entry_date"),
    supabase.from("transactions").select("id, label, merchant, amount, kind, txn_date, txn_time, card, category, source").eq("owner_id", ownerId).gte("txn_date", addDaysISO(today0, -120)).order("txn_date"),
    supabase.from("finance_settings").select("current_balance, balance_ref_date, savings_goal, investment_goal").eq("owner_id", ownerId).maybeSingle(),
  ]);

  const h = settings as { current_balance?: number; balance_ref_date?: string; savings_goal?: number; investment_goal?: number } | null;
  const walletOps: FinOp[] = (txns ?? []).map((t) => ({
    id: `txn:${t.id}`,
    table: "charge" as const,
    kind: (t.kind === "income" ? "income" : "daily") as FinOp["kind"],
    name: t.merchant || t.label,
    amount: Number(t.amount),
    category: t.category || "Autre",
    frequency: "once" as const,
    interval: 1,
    weekdays: [],
    monthDays: [],
    start: t.txn_date,
    end: null,
    skipped: [],
    weekendRule: "none" as const,
    moved: {},
    active: true,
    note: t.card ? `Carte ${t.card}` : null,
    account: null,
    txn: { id: t.id as string, time: t.txn_time ? String(t.txn_time).slice(0, 5) : null, card: (t.card as string | null) ?? null, validates: parseValidation(t.source as string | null) ?? undefined },
  }));
  const ops: FinOp[] = [...(incomes ?? []).map(incomeRowToOp), ...(charges ?? []).map(chargeRowToOp), ...walletOps];
  const allEntries = (entries ?? []) as { entry_date: string; balance: number; account: AccountName }[];
  const entriesByAccount = (name: AccountName) => allEntries.filter((e) => e.account === name).map((e) => ({ date: e.entry_date, balance: Number(e.balance) }));

  const today = todayISO();
  // A balance entered for a future date is a prediction, not a known fact yet — never use it as
  // "today's" anchor, or every past/current calculation would be thrown off by it.
  const lastKnown = (list: { date: string; balance: number }[]) => [...list].filter((e) => e.date <= today).pop() ?? null;

  const courantEntries = entriesByAccount("Courant");
  const lastCourant = lastKnown(courantEntries);
  // Courant stays the engine's anchor (le dernier solde est aussi gardé dans finance_settings, pour la lecture rapide).
  const anchor: BalanceAnchor = lastCourant
    ? { balance: lastCourant.balance, date: lastCourant.date, history: courantEntries.filter((e) => e.date <= today) }
    : { balance: Number(h?.current_balance ?? 0), date: h?.balance_ref_date ?? today };

  const accounts = Object.fromEntries(
    ACCOUNTS.map((name) => {
      const list = entriesByAccount(name);
      return [name, { history: list, last: lastKnown(list) }];
    })
  ) as Record<AccountName, { history: { date: string; balance: number }[]; last: { date: string; balance: number } | null }>;

  return {
    supabase,
    householdId,
    ownerId,
    readOnly: owner.readOnly,
    ownerName: owner.ownerName,
    ops,
    anchor,
    accounts,
    goals: { savings: Number(h?.savings_goal ?? 0), investment: Number(h?.investment_goal ?? 0) },
  };
});
