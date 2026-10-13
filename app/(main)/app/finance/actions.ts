"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { addDays, diffDays, monthBounds, validationSource, type OpTable } from "@/lib/finance-engine";
import { getFinanceOwner } from "@/lib/data/finance-owner";

/**
 * `householdId` est absent quand on consulte la finance d'un proche (lecture seule) : toutes les actions qui
 * s'arrêtent sans foyer ne font alors rien — la base refuserait de toute façon d'écrire chez lui.
 */
async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  const owner = await getFinanceOwner();
  return { supabase, householdId: (owner?.readOnly ? undefined : profile?.household_id) as string | undefined, userId: user?.id };
}

/** Garde le dernier solde du compte courant dans finance_settings (lecture rapide, repli quand aucun solde n'est saisi). */
async function saveFinanceSettings(supabase: ReturnType<typeof createClient>, userId: string, patch: Record<string, unknown>) {
  await supabase.from("finance_settings").upsert({ owner_id: userId, ...patch, updated_at: new Date().toISOString() }, { onConflict: "owner_id" });
}

function refresh() {
  revalidatePath("/app/finance", "layout");
  revalidatePath("/app/calendar");
  revalidatePath("/app");
}

const tableName = (t: OpTable) => (t === "income" ? "incomes" : "recurring_charges");

function parseOperation(formData: FormData) {
  const kind = String(formData.get("kind") || "fixed");
  const frequency = String(formData.get("frequency") || "once");
  const start = String(formData.get("start") || new Date().toISOString().slice(0, 10));
  const monthDays = String(formData.get("month_days") || "")
    .split(/[,\s]+/)
    .map(Number)
    .filter((n) => n >= 1 && n <= 31);
  const common = {
    name: String(formData.get("name") || "").trim(),
    amount: Math.abs(Number(formData.get("amount") || 0)),
    category: String(formData.get("category") || "").trim() || (kind === "income" ? "Revenu" : "Autre"),
    frequency,
    interval_count: Math.max(1, Number(formData.get("interval") || 1)),
    weekdays: formData.getAll("weekdays").map(Number),
    month_days: monthDays,
    end_date: String(formData.get("end_date") || "") || null,
    note: String(formData.get("note") || "").trim() || null,
    account: String(formData.get("account") || "").trim() || null,
    weekend_rule: ["next", "prev"].includes(String(formData.get("weekend_rule"))) ? String(formData.get("weekend_rule")) : "none",
  };
  if (kind === "income") {
    return { table: "income" as const, row: { ...common, expected_date: start, recurring: frequency !== "once" } };
  }
  return { table: "charge" as const, row: { ...common, next_date: start, kind } };
}

export async function createOperation(formData: FormData) {
  const { table, row } = parseOperation(formData);
  if (!row.name || !row.amount) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from(tableName(table)).insert({ ...row, household_id: householdId, created_by: userId });
  refresh();
}

export async function updateOperation(originalTable: OpTable, id: string, formData: FormData) {
  const { table, row } = parseOperation(formData);
  if (!row.name || !row.amount) return;
  const { supabase, householdId, userId } = await ctx();
  if (table === originalTable) {
    await supabase.from(tableName(table)).update(row).eq("id", id);
  } else {
    // Kind switched between income and expense: move the row to the other table.
    await supabase.from(tableName(originalTable)).delete().eq("id", id);
    await supabase.from(tableName(table)).insert({ ...row, household_id: householdId, created_by: userId });
  }
  refresh();
}

export async function toggleOperationActive(table: OpTable, id: string, active: boolean) {
  const { supabase } = await ctx();
  await supabase.from(tableName(table)).update({ active }).eq("id", id);
  refresh();
}

export async function deleteOperation(table: OpTable, id: string) {
  const { supabase, householdId } = await ctx();
  if (id.startsWith("txn:")) {
    // Paiement reçu du Wallet
    if (householdId) await supabase.from("transactions").delete().eq("id", id.slice(4)).eq("household_id", householdId);
    refresh();
    return;
  }
  await supabase.from(tableName(table)).delete().eq("id", id);
  refresh();
}

async function setSkipped(table: OpTable, id: string, date: string, skip: boolean) {
  const { supabase } = await ctx();
  const { data } = await supabase.from(tableName(table)).select("skipped_dates").eq("id", id).single();
  const current: string[] = data?.skipped_dates ?? [];
  const next = skip ? Array.from(new Set([...current, date])) : current.filter((d) => d !== date);
  await supabase.from(tableName(table)).update({ skipped_dates: next }).eq("id", id);
  refresh();
}

export async function skipOccurrence(table: OpTable, id: string, date: string) {
  await setSkipped(table, id, date, true);
}

export async function restoreOccurrence(table: OpTable, id: string, date: string) {
  await setSkipped(table, id, date, false);
}

/**
 * Records a real balance for one account (Courant / Épargne / Investissement) at a date.
 * Never overwrites earlier points — history stays browsable. Re-entering a value at/after
 * "today" re-anchors that account's forecast there, cancelling any drift accumulated since.
 */
export async function updateBalanceAnchor(account: string, formData: FormData) {
  const raw = String(formData.get("current_balance") ?? "").replace(",", ".");
  const balance = Number(raw);
  if (raw === "" || Number.isNaN(balance)) return;
  const date = String(formData.get("entry_date") || "") || new Date().toISOString().slice(0, 10);
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  await supabase.from("balance_entries").upsert({ household_id: householdId, owner_id: userId, entry_date: date, account, balance }, { onConflict: "owner_id,entry_date,account" });
  if (account === "Courant") await syncCourantCache(supabase, userId);
  refresh();
}

/** Le solde du compte courant le plus récent est aussi gardé dans tes réglages financiers (lecture rapide) : on le remet à jour après chaque changement. */
async function syncCourantCache(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data: latest } = await supabase
    .from("balance_entries")
    .select("entry_date, balance")
    .eq("owner_id", userId)
    .eq("account", "Courant")
    .order("entry_date", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latest) await saveFinanceSettings(supabase, userId, { current_balance: latest.balance, balance_ref_date: latest.entry_date });
}

export async function deleteBalanceEntry(account: string, date: string) {
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  await supabase.from("balance_entries").delete().eq("owner_id", userId).eq("account", account).eq("entry_date", date);
  if (account === "Courant") await syncCourantCache(supabase, userId);
  refresh();
  revalidatePath("/app/finance/accounts");
}

/** Corrige un solde déjà saisi : sa date et/ou son montant. */
export async function editBalanceEntry(account: string, oldDate: string, formData: FormData) {
  const raw = String(formData.get("balance") ?? "").replace(",", ".");
  const balance = Number(raw);
  const date = String(formData.get("entry_date") || "");
  if (raw === "" || Number.isNaN(balance) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  if (date !== oldDate) await supabase.from("balance_entries").delete().eq("owner_id", userId).eq("account", account).eq("entry_date", oldDate);
  await supabase.from("balance_entries").upsert({ household_id: householdId, owner_id: userId, entry_date: date, account, balance }, { onConflict: "owner_id,entry_date,account" });
  if (account === "Courant") await syncCourantCache(supabase, userId);
  refresh();
  revalidatePath("/app/finance/accounts");
}

/** Efface les soldes plus anciens que `before` (on garde toujours le plus récent). */
export async function pruneBalanceHistory(account: string, before: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(before)) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  const { data: latest } = await supabase.from("balance_entries").select("entry_date").eq("owner_id", userId).eq("account", account).order("entry_date", { ascending: false }).limit(1).maybeSingle();
  const cut = latest && latest.entry_date < before ? latest.entry_date : before;
  await supabase.from("balance_entries").delete().eq("owner_id", userId).eq("account", account).lt("entry_date", cut);
  if (account === "Courant") await syncCourantCache(supabase, userId);
  refresh();
  revalidatePath("/app/finance/accounts");
}

export async function updateGoal(type: "savings" | "investment", formData: FormData) {
  const value = Math.max(0, Number(String(formData.get("goal") ?? "0").replace(",", ".")) || 0);
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  await saveFinanceSettings(supabase, userId, { [`${type}_goal`]: value });
  refresh();
}

export async function saveTaxProfile(year: number, formData: FormData) {
  const num = (k: string) => Math.max(0, Number(String(formData.get(k) ?? "0").replace(",", ".")) || 0);
  const periodsRaw = String(formData.get("periods") || "[]");
  let periods: { label: string; activity: string; amount: number }[] = [];
  try {
    periods = JSON.parse(periodsRaw);
  } catch {
    periods = [];
  }
  const inputs = {
    periods,
    withholdingRate: num("withholding_rate") || null,
    alreadyWithheld: num("already_withheld") || null,
    householdParts: Number(String(formData.get("household_parts") || "1").replace(",", ".")) || 1,
  };
  const provisionRaw = String(formData.get("provision_manual") || "").replace(",", ".");
  const provisionManual = provisionRaw === "" ? null : Number(provisionRaw);
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  await supabase.from("tax_profiles").upsert({ household_id: householdId, owner_id: userId, year, inputs, provision_manual: provisionManual, updated_at: new Date().toISOString() }, { onConflict: "owner_id,year" });
  refresh();
}

/** Déplace une seule occurrence à une autre date (newDate) ou la remet à sa place prévue (newDate = null). */
export async function moveOccurrence(table: OpTable, id: string, rawDate: string, newDate: string | null) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(rawDate) || (newDate !== null && !/^\d{4}-\d{2}-\d{2}$/.test(newDate))) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase.from(tableName(table)).select("moved_dates").eq("id", id).eq("household_id", householdId).single();
  const moved: Record<string, string> = { ...(data?.moved_dates ?? {}) };
  if (newDate && newDate !== rawDate) moved[rawDate] = newDate;
  else delete moved[rawDate];
  await supabase.from(tableName(table)).update({ moved_dates: moved }).eq("id", id).eq("household_id", householdId);
  refresh();
}

export async function setTransactionCategory(id: string, category: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("transactions").update({ category: category.slice(0, 60) }).eq("id", id).eq("household_id", householdId);
  refresh();
  revalidatePath("/app/finance/paiements");
}

export async function deleteTransaction(id: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("transactions").delete().eq("id", id).eq("household_id", householdId);
  refresh();
  revalidatePath("/app/finance/paiements");
}

/** Paiement de démonstration pour vérifier que tout est branché. */
export async function addTestPayment() {
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const now = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date());
  const [date, time] = now.split(" ");
  await supabase.from("transactions").insert({ household_id: householdId, label: "Paiement test", merchant: "Paiement test", amount: 1, kind: "expense", txn_date: date, txn_time: time, card: "Test", category: "Autre", source: "wallet", created_by: userId });
  refresh();
  revalidatePath("/app/finance/paiements");
}

export async function regenerateWalletToken() {
  const { supabase, householdId, userId } = await ctx();
  if (!householdId || !userId) return;
  // Le lien Wallet est personnel : les paiements arrivent dans TA finance.
  await supabase.from("user_tokens").update({ wallet_token: crypto.randomUUID() }).eq("user_id", userId);
  revalidatePath("/app/finance/paiements");
}

/* ------------------------------------------------------------------ */
/*  Budget : validation d'une ligne prévue, répartition d'un budget     */
/* ------------------------------------------------------------------ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Valide une ligne de budget (dépense variable prévue) dont la date est arrivée : on saisit ce qui a RÉELLEMENT été dépensé
 * (espèces, virement, autre carte…). Ça crée un paiement réel rattaché à cette occurrence ; le montant prévu n'est alors plus
 * compté en plus (voir `parseValidation` / `envelopeAdjustments` dans le moteur). Re-valider modifie le montant.
 * Aucune migration : un paiement porte `source = "valide:<id de la ligne>:<date>"`.
 */
export async function validateOccurrence(opId: string, date: string, amount: number) {
  if (!DATE_RE.test(date) || !Number.isFinite(amount) || amount < 0) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data: op } = await supabase.from("recurring_charges").select("id, name, category, kind").eq("id", opId).eq("household_id", householdId).maybeSingle();
  if (!op || op.kind !== "variable") return;
  const source = validationSource(op.id, date);
  const value = Math.round(amount * 100) / 100;
  const { data: existing } = await supabase.from("transactions").select("id").eq("owner_id", userId ?? "").eq("source", source).maybeSingle();
  if (existing) await supabase.from("transactions").update({ amount: value }).eq("id", existing.id).eq("household_id", householdId);
  else await supabase.from("transactions").insert({ household_id: householdId, label: op.name, merchant: op.name, amount: value, kind: "expense", txn_date: date, category: op.category ?? "Autre", source, created_by: userId });
  refresh();
  revalidatePath("/app/finance/paiements");
  revalidatePath("/app/finance/budgets");
}

/** Annule une validation : le montant prévu redevient « à valider ». */
export async function cancelValidation(txnId: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("transactions").delete().eq("id", txnId).eq("household_id", householdId).like("source", "valide:%");
  refresh();
  revalidatePath("/app/finance/paiements");
  revalidatePath("/app/finance/budgets");
}

/**
 * Répartit un budget sur un mois : « 280 € d'alimentation, répartis chaque vendredi » crée UNE ligne récurrente de dépense variable
 * (montant = total / nombre d'occurrences restantes dans le mois). Chaque occurrence se valide ensuite, ou s'ajuste, à sa date.
 *  - mode `weekly` : chaque semaine, le jour choisi ; `daily` : tous les jours ; `once` : une seule ligne à la date de départ.
 */
export async function planBudget(formData: FormData) {
  const category = String(formData.get("category") || "").trim().slice(0, 60) || "Autre";
  const total = Math.abs(Number(String(formData.get("total") || "0").replace(",", ".")));
  const mode = String(formData.get("mode") || "weekly");
  const weekday = Number(formData.get("weekday") ?? 5);
  const start = String(formData.get("start") || "");
  const name = String(formData.get("name") || "").trim().slice(0, 80);
  if (!total || !DATE_RE.test(start) || !["weekly", "daily", "once"].includes(mode)) return;
  const d = new Date(`${start}T00:00:00Z`);
  const { end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
  let first = start;
  let count = 1;
  const row: Record<string, unknown> = { name: name || `${category} (budget)`, category, kind: "variable", end_date: end, weekdays: [], month_days: [], interval_count: 1, weekend_rule: "none", account: null, note: null };
  if (mode === "weekly") {
    const wd = weekday >= 0 && weekday <= 6 ? weekday : 5;
    while (new Date(`${first}T00:00:00Z`).getUTCDay() !== wd) first = addDays(first, 1);
    if (first > end) return;
    count = Math.floor(diffDays(first, end) / 7) + 1;
    Object.assign(row, { frequency: "weekly", weekdays: [wd] });
  } else if (mode === "daily") {
    count = diffDays(start, end) + 1;
    Object.assign(row, { frequency: "daily" });
  } else {
    Object.assign(row, { frequency: "once", end_date: null });
  }
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("recurring_charges").insert({ ...row, household_id: householdId, created_by: userId, amount: Math.round((total / count) * 100) / 100, next_date: first });
  refresh();
  revalidatePath("/app/finance/budgets");
}
