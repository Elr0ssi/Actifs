"use client";

import { TasksCalendar } from "@/components/app/widgets/tasks";
import type { WidgetData } from "@/lib/data/widgets";

/** Widgets affichés seuls sur une page dédiée (pas dans une grille personnalisable). */
export function TasksCalendarPage({ data }: { data: WidgetData }) {
  return <TasksCalendar data={data} size="xl" opts={{}} setOpts={() => {}} />;
}
