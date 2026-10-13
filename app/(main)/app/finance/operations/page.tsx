import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { loadFinanceData } from "@/lib/data/finance";
import { todayISO } from "@/lib/utils";
import { OperationsBoard } from "@/components/app/finance/operations-board";

export function generateMetadata(): Metadata {
  return { title: getT()("Finance — Opérations") };
}

export default async function OperationsPage({ searchParams }: { searchParams: { tri?: string } }) {
  const data = await loadFinanceData();
  if (!data) return null;
  return <OperationsBoard ops={data.ops.filter((o) => !o.txn)} today={todayISO()} byDate={searchParams.tri === "date"} basePath="/app/finance/operations" />;
}
