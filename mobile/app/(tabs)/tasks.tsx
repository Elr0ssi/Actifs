import React, { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import type { Task } from "@/lib/types";
import { sel } from "~/core/model";
import { addTask, deleteTask, saveTask, toggleTask } from "~/core/mutations";
import { activeProjects, byTimeThenPriority, inboxTasks, overdueTasks } from "~/core/today";
import { Button, Card, Check, Chip, Empty, Label, Row, Screen, Segmented, SyncBanner, T } from "~/ui/kit";
import { TaskSheet } from "~/ui/forms";
import { PRIORITY_LABEL, relativeDay } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";

type Tab = "today" | "soon" | "inbox" | "done";

export default function Tasks() {
  return <Ready>{(v) => <TasksInner {...v} />}</Ready>;
}

function TasksInner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const t = useTheme();
  const [tab, setTab] = useState<Tab>("today");
  const [project, setProject] = useState<string | "all">("all");
  const [editing, setEditing] = useState<Task | "new" | null>(null);
  const projects = activeProjects(data);

  const all = sel.tasks(data).filter((x) => project === "all" || x.project_id === project);
  const groups = useMemo(() => {
    const open = all.filter((x) => x.status !== "done");
    const todayList = open.filter((x) => x.due_date === today).sort(byTimeThenPriority);
    const late = overdueTasks({ ...data, tables: { ...data.tables, tasks: open as never } }, today);
    const soon = open.filter((x) => x.due_date && x.due_date > today).sort((a, b) => `${a.due_date}${a.due_time ?? ""}`.localeCompare(`${b.due_date}${b.due_time ?? ""}`));
    const inbox = inboxTasks({ ...data, tables: { ...data.tables, tasks: open as never } });
    const done = all.filter((x) => x.status === "done").sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? "")).slice(0, 50);
    return { todayList, late, soon, inbox, done };
  }, [all, data, today]);

  const list = tab === "today" ? [...groups.late, ...groups.todayList] : tab === "soon" ? groups.soon : tab === "inbox" ? groups.inbox : groups.done;
  const projectOf = (id: string | null) => projects.find((p) => p.id === id);

  return (
    <Screen onRefresh={refresh}>
      <SyncBanner />
      <Button title="Nouvelle tâche" icon="plus" onPress={() => setEditing("new")} />
      <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: "today", label: `Aujourd'hui` }, { value: "soon", label: "À venir" }, { value: "inbox", label: "Sans date" }, { value: "done", label: "Faites" }]} />
      {projects.length ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <Chip label="Tous les projets" active={project === "all"} onPress={() => setProject("all")} />
          {projects.map((p) => <Chip key={p.id} label={`${p.icon ?? ""} ${p.name}`.trim()} active={project === p.id} color={p.color} onPress={() => setProject(p.id)} />)}
        </ScrollView>
      ) : null}

      <Card>
        {list.length === 0 ? <Empty icon="checkmark.circle" title={tab === "done" ? "Aucune tâche terminée" : "Rien ici"} hint={tab === "today" ? "Profite de ta journée ou ajoute une tâche." : undefined} /> : null}
        {list.map((x) => {
          const late = !!x.due_date && x.due_date < today && x.status !== "done";
          const proj = projectOf(x.project_id);
          return (
            <Row key={x.id} style={{ paddingVertical: 7 }} onPress={() => setEditing(x)}>
              <Check checked={x.status === "done"} label={x.title} color={x.priority === "high" ? t.bad : undefined} onPress={() => run(toggleTask(mutCtx, x.id, x.status !== "done"))} />
              <View style={{ flex: 1, gap: 2 }}>
                <T style={{ textDecorationLine: x.status === "done" ? "line-through" : "none", opacity: x.status === "done" ? 0.5 : 1 }}>{x.title}</T>
                <T size={12} color={late ? "bad" : "muted"}>
                  {x.due_date ? relativeDay(x.due_date, today) : "Sans date"}{x.due_time ? ` · ${x.due_time.slice(0, 5)}${x.due_end ? `–${x.due_end.slice(0, 5)}` : ""}` : ""} · {PRIORITY_LABEL[x.priority]}{proj ? ` · ${proj.name}` : ""}
                </T>
              </View>
            </Row>
          );
        })}
      </Card>

      {tab === "today" && groups.late.length ? <Label>{groups.late.length} en retard incluse{groups.late.length > 1 ? "s" : ""} ci-dessus</Label> : null}

      {editing ? (
        <TaskSheet
          key={editing === "new" ? "new" : editing.id}
          visible
          task={editing === "new" ? null : editing}
          projects={projects}
          defaultDate={tab === "today" ? today : null}
          onClose={() => setEditing(null)}
          onSave={(v) => run(editing === "new" ? addTask(mutCtx, v) : saveTask(mutCtx, editing.id, v))}
          onDelete={editing === "new" ? undefined : () => run(deleteTask(mutCtx, editing.id))}
        />
      ) : null}
    </Screen>
  );
}
