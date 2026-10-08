"use client";

import { useMemo, useState, useTransition } from "react";
import { toggleRoutineLog, toggleTaskStatus } from "@/app/(main)/app/actions";
import { scheduledOn } from "@/components/app/widgets/helpers";
import type { WidgetData } from "@/lib/data/widgets";
import type { Routine, Task } from "@/lib/types";

/**
 * État partagé par les calendriers : coche instantanée des tâches et des routines (avant même le retour du serveur),
 * pour que les pastilles dans les cases et le panneau du jour restent toujours d'accord.
 */
export function useAgendaToggles(data: WidgetData) {
  const [taskOverride, setTaskOverride] = useState<Record<string, boolean>>({});
  const [routineOverride, setRoutineOverride] = useState<Record<string, boolean>>({});
  const [pending, start] = useTransition();
  const logged = useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);

  const taskDone = (t: Task) => taskOverride[t.id] ?? t.status === "done";
  const routineDone = (routineId: string, day: string) => routineOverride[`${routineId}_${day}`] ?? logged.has(`${routineId}_${day}`);

  const toggleTask = (t: Task) => {
    const next = !taskDone(t);
    setTaskOverride((o) => ({ ...o, [t.id]: next }));
    start(() => toggleTaskStatus(t.id, next));
  };
  const toggleRoutine = (routineId: string, day: string) => {
    const next = !routineDone(routineId, day);
    setRoutineOverride((o) => ({ ...o, [`${routineId}_${day}`]: next }));
    start(() => toggleRoutineLog(routineId, day, next));
  };

  /** Routines prévues ce jour-là (une routine créée après ce jour n'y figure que si elle a été cochée). */
  const routinesOn = (day: string): Routine[] =>
    data.routines.filter((r) => scheduledOn(r, day) && (r.created_at.slice(0, 10) <= day || routineDone(r.id, day)));

  return { taskDone, routineDone, toggleTask, toggleRoutine, routinesOn, pending };
}
