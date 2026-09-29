import type { Metadata } from "next";
import { loadWidgetData } from "@/lib/data/widgets";
import { TasksCalendarPage } from "@/components/app/widgets/standalone";

export const metadata: Metadata = { title: "Tâches — Calendrier" };

export default async function TasksCalendarRoute() {
  const data = await loadWidgetData();
  if (!data) return null;
  return <TasksCalendarPage data={data} />;
}
