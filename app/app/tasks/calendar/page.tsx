import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { loadWidgetData } from "@/lib/data/widgets";
import { TasksCalendarPage } from "@/components/app/widgets/standalone";

export function generateMetadata(): Metadata {
  return { title: getT()("Tâches — Calendrier") };
}

export default async function TasksCalendarRoute() {
  const data = await loadWidgetData();
  if (!data) return null;
  return <TasksCalendarPage data={data} />;
}
