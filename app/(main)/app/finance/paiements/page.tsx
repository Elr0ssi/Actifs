import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { WalletSetup } from "@/components/app/finance/wallet-setup";
import { TransactionList, type Txn } from "@/components/app/finance/transaction-list";
import Link from "next/link";
import { formatEUR, todayISO } from "@/lib/utils";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Paiements") };
}

export default async function PaymentsPage() {
  const tr = getT();
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household } = ctx;
  const { data } = await supabase
    .from("transactions")
    .select("id, label, merchant, amount, kind, txn_date, txn_time, card, category")
    .eq("household_id", profile?.household_id ?? "")
    .eq("source", "wallet")
    .order("txn_date", { ascending: false })
    .order("txn_time", { ascending: false, nullsFirst: false })
    .limit(300);
  const txns: Txn[] = (data ?? []).map((t) => ({
    id: t.id,
    merchant: t.merchant || t.label,
    amount: Number(t.amount),
    income: t.kind === "income",
    date: t.txn_date,
    time: t.txn_time ? String(t.txn_time).slice(0, 5) : null,
    card: t.card,
    category: t.category || "Autre",
  }));
  const month = todayISO().slice(0, 7);
  const monthTxns = txns.filter((t) => !t.income && t.date.slice(0, 7) === month);
  const monthTotal = monthTxns.reduce((s, t) => s + t.amount, 0);
  const token = (household as { wallet_token?: string } | null)?.wallet_token ?? "";

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-500">{tr("Tes paiements quotidiens par carte. Ils sont retirés de ton solde à leur date et comptés dans tes budgets.")}</p>
      <div className="card flex flex-wrap items-center justify-between gap-3 border-teal-100 bg-teal-50/40 p-4">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-teal-100 text-lg">💳</span>
          <div>
            <p className="text-[13px] font-semibold text-stone-900">{tr("Consommation quotidienne ce mois-ci")}</p>
            <p className="text-[11px] text-stone-500">{tr("{n} paiements par carte", { n: monthTxns.length })}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <p className="tabular text-xl font-bold text-teal-700">{formatEUR(monthTotal)}</p>
          <Link href="/app/finance/budgets" className="btn-secondary px-3 py-1.5 text-xs">{tr("Voir prévu et réel")}</Link>
        </div>
      </div>
      <WalletSetup token={token} defaultOpen={txns.length === 0} />
      <TransactionList txns={txns} />
    </div>
  );
}
