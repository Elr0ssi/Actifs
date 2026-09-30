"use client";

import { useState } from "react";
import type { WidgetOpts } from "@/lib/widgets/registry";
import { TasksCalendar } from "@/components/app/widgets/tasks";
import { RoutinesCurve } from "@/components/app/widgets/routines";
import type { WidgetData } from "@/lib/data/widgets";

/** Widgets affichés seuls sur une page dédiée (pas dans une grille personnalisable). */
export function TasksCalendarPage({ data }: { data: WidgetData }) {
  return <TasksCalendar data={data} size="xl" opts={{}} setOpts={() => {}} />;
}

export function RoutinesCurvePage({ data }: { data: WidgetData }) {
  const [opts, setOpts] = useState<WidgetOpts>({});
  return <RoutinesCurve data={data} size="l" opts={opts} setOpts={(p) => setOpts((o) => ({ ...o, ...p }))} />;
}
