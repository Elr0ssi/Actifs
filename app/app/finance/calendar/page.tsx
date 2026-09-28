import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { todayISO } from "@/lib/utils";
import { FinanceDashboard } from "@/components/app/finance/finance-dashboard";

export const metadata: Metadata = { title: "Finance — Calendrier" };

export default async function FinanceCalendarPage() {
  const data = await loadFinanceData();
  if (!data) return null;
  const { ops, anchor } = data;
  const today = todayISO();

  return <FinanceDashboard ops={ops} anchor={anchor} today={today} />;
}
