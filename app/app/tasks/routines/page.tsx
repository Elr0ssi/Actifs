import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Routine } from "@/lib/types";
import { RoutinesHub } from "@/components/app/routines/routines-hub";
import { addDays } from "@/lib/finance-engine";
import { loadWidgetData } from "@/lib/data/widgets";
import { RoutinesCurvePage } from "@/components/app/widgets/standalone";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Gérer mes routines" };

export default async function RoutinesPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const { data: routines } = await supabase.from("routines").select("*").eq("household_id", householdId).order("created_at", { ascending: false }).returns<Routine[]>();
  const today = todayISO();
  const widgetData = await loadWidgetData();
  const minDate = addDays(today, -182);
  const { data: recent } = await supabase.from("routine_logs").select("routine_id, log_date").eq("done", true).gte("log_date", minDate).lte("log_date", today);
  const doneKeys = (recent ?? []).map((l) => `${l.routine_id}_${l.log_date}`);
  const active = (routines ?? []).filter((r) => r.active);
  const archived = (routines ?? []).filter((r) => !r.active);

  return (
    <RoutinesHub
      routines={active}
      archived={archived}
      doneKeys={doneKeys}
      today={today}
      minDate={minDate}
      curve={widgetData ? <RoutinesCurvePage data={widgetData} /> : undefined}
    />
  );
}
