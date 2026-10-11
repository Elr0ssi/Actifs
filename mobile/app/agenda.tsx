import React, { useMemo, useState } from "react";
import { View } from "react-native";
import { Stack } from "expo-router";
import type { Task } from "@/lib/types";
import { isoAddDays } from "~/core/dates";
import { sel } from "~/core/model";
import { addTask, deleteTask, saveTask, setRoutineLog, toggleTask } from "~/core/mutations";
import { mondayOfISO } from "~/core/mutations";
import { activeProjects, byTimeThenPriority, routinesFor } from "~/core/today";
import { Button, Card, Check, Empty, Icon, IconButton, Row, Screen, SyncBanner, T } from "~/ui/kit";
import { TaskSheet } from "~/ui/forms";
import { fmtLong, fmtShort, fmtWeekday } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";
import { Pressable } from "react-native";

export default function Agenda() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Inner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const t = useTheme();
  const [selected, setSelected] = useState(today);
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const monday = mondayOfISO(selected);
  const days = Array.from({ length: 7 }, (_, i) => isoAddDays(monday, i));

  const tasksByDay = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of sel.tasks(data)) if (x.due_date && x.status !== "done") m.set(x.due_date, (m.get(x.due_date) ?? 0) + 1);
    return m;
  }, [data]);

  const day = sel.tasks(data).filter((x) => x.due_date === selected).sort(byTimeThenPriority);
  const timed = day.filter((x) => x.due_time);
  const untimed = day.filter((x) => !x.due_time);
  const routines = routinesFor(data, selected);
  const meals = sel.menu(data).filter((m) => m.day === selected).sort((a, b) => (a.slot === "soir" ? 1 : 0) - (b.slot === "soir" ? 1 : 0));

  const taskRow = (x: Task) => (
    <Row key={x.id} style={{ paddingVertical: 7 }} onPress={() => setEditing(x)}>
      <View style={{ width: 52 }}>{x.due_time ? <><T weight="700" size={13}>{x.due_time.slice(0, 5)}</T>{x.due_end ? <T size={11} color="muted">{x.due_end.slice(0, 5)}</T> : null}</> : <T size={12} color="muted">Journée</T>}</View>
      <Check checked={x.status === "done"} label={x.title} color={x.priority === "high" ? t.bad : undefined} onPress={() => run(toggleTask(mutCtx, x.id, x.status !== "done"))} />
      <T style={{ flex: 1, textDecorationLine: x.status === "done" ? "line-through" : "none", opacity: x.status === "done" ? 0.5 : 1 }}>{x.title}</T>
    </Row>
  );

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Agenda" }} />
      <SyncBanner />
      <Row style={{ justifyContent: "space-between" }}>
        <IconButton name="chevron.left" label="Semaine précédente" onPress={() => setSelected(isoAddDays(selected, -7))} />
        <Pressable onPress={() => setSelected(today)}><T weight="700">{fmtShort(days[0])} – {fmtShort(days[6])}</T></Pressable>
        <IconButton name="chevron.right" label="Semaine suivante" onPress={() => setSelected(isoAddDays(selected, 7))} />
      </Row>
      <Row style={{ justifyContent: "space-between" }}>
        {days.map((d) => {
          const active = d === selected;
          const n = tasksByDay.get(d) ?? 0;
          return (
            <Pressable key={d} onPress={() => setSelected(d)} style={{ alignItems: "center", gap: 4, paddingVertical: 8, width: 44, borderRadius: 14, backgroundColor: active ? t.brand : "transparent" }}>
              <T size={11} weight="600" color={active ? t.onBrand : "muted"}>{fmtWeekday(d).slice(0, 3)}</T>
              <T size={17} weight="700" color={active ? t.onBrand : d === today ? "brand" : "ink"}>{Number(d.slice(8))}</T>
              <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: n ? (active ? t.onBrand : t.brand) : "transparent" }} />
            </Pressable>
          );
        })}
      </Row>
      <T size={18} weight="700">{fmtLong(selected)}</T>
      <Button title="Ajouter une tâche ce jour-là" icon="plus" small kind="secondary" onPress={() => setEditing("new")} />

      <Card>
        {timed.length + untimed.length === 0 ? <Empty icon="calendar" title="Rien de prévu" /> : null}
        {timed.map(taskRow)}
        {untimed.map(taskRow)}
      </Card>

      {routines.total ? (
        <Card>
          <Row><Icon name="arrow.triangle.2.circlepath" color={t.brand} /><T weight="700">Routines</T><T size={12} color="muted">{routines.done}/{routines.total}</T></Row>
          {routines.list.map(({ routine, done }) => (
            <Row key={routine.id} style={{ paddingVertical: 4 }}>
              <Check checked={done} label={routine.title} onPress={() => run(setRoutineLog(mutCtx, routine.id, selected, !done))} />
              <T style={{ flex: 1, opacity: done ? 0.5 : 1 }}>{routine.title}</T>
            </Row>
          ))}
        </Card>
      ) : null}

      {meals.length ? (
        <Card>
          <Row><Icon name="fork.knife" color={t.meal} /><T weight="700">Repas</T></Row>
          {meals.map((m) => <Row key={m.id}><T>{m.icon ?? "🍽️"}</T><T style={{ flex: 1 }}>{m.name}</T><T size={12} color="muted">{m.slot === "soir" ? "Soir" : m.slot === "midi" ? "Midi" : ""}</T></Row>)}
        </Card>
      ) : null}

      {editing ? (
        <TaskSheet key={editing === "new" ? `new-${selected}` : editing.id} visible task={editing === "new" ? null : editing} projects={activeProjects(data)} defaultDate={selected} onClose={() => setEditing(null)}
          onSave={(v) => run(editing === "new" ? addTask(mutCtx, v) : saveTask(mutCtx, editing.id, v))}
          onDelete={editing === "new" ? undefined : () => run(deleteTask(mutCtx, editing.id))} />
      ) : null}
    </Screen>
  );
}
