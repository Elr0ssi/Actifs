import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { WalletSetup } from "@/components/app/finance/wallet-setup";
import { TransactionList, type Txn } from "@/components/app/finance/transaction-list";

export const metadata: Metadata = { title: "Finance — Paiements" };

export default async function PaymentsPage() {
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
  const token = (household as { wallet_token?: string } | null)?.wallet_token ?? "";

  return (
    <div className="space-y-4">
      <p className="text-xs text-stone-500">Tes paiements quotidiens par carte. Ils sont retirés de ton solde à leur date et comptés dans tes budgets.</p>
      <WalletSetup token={token} defaultOpen={txns.length === 0} />
      <TransactionList txns={txns} />
    </div>
  );
}
