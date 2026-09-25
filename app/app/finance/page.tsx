import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { getDailyBalances, monthBounds } from "@/lib/finance-engine";
import { todayISO } from "@/lib/utils";
import { FinanceDashboard } from "@/components/app/finance/finance-dashboard";

export const metadata: Metadata = { title: "Finances" };

export default async function FinancePage() {
  const data = await loadFinanceData();
  if (!data) return null;
  const { supabase, householdId, ops, anchor, plan, snapshots, realBalances } = data;
  const today = todayISO();

  // Freeze this month's forecast the first time it's viewed, so "prévu vs réel" compares against what was planned.
  const [y, m] = today.split("-").map(Number);
  const monthKey = today.slice(0, 7);
  if (!snapshots[monthKey] && householdId) {
    const { start, end } = monthBounds(y, m - 1);
    const balances = getDailyBalances(ops, anchor, start, end).map((p) => Math.round(p.balance * 100) / 100);
    await supabase.from("forecast_snapshots").insert({ household_id: householdId, month: monthKey, balances });
    snapshots[monthKey] = balances;
  }

  return (
    <FinanceDashboard
      ops={ops}
      anchor={anchor}
      plan={plan}
      today={today}
      snapshots={snapshots}
      realBalances={realBalances}
    />
  );
}
