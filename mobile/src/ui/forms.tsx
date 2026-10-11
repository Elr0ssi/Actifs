import React, { useState } from "react";
import { View } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import type { Project, Task, TaskPriority } from "@/lib/types";
import { dateFromISO, localISO } from "~/core/dates";
import type { TaskInput } from "~/core/mutations";
import { Button, Chip, Field, Label, Row, Sheet, T } from "./kit";
import { PRIORITY_LABEL } from "./format";
import { useTheme } from "./theme";

const pad = (n: number) => String(n).padStart(2, "0");

/** Sélecteur de date natif iOS (valeur AAAA-MM-JJ, ou null = sans date). */
export function DateField({ label, value, onChange, optional }: { label: string; value: string | null; onChange: (v: string | null) => void; optional?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Row>
        {value ? <DateTimePicker value={dateFromISO(value)} mode="date" display="compact" locale="fr-FR" onChange={(_e, d) => d && onChange(localISO(d))} /> : <T color="muted">Aucune</T>}
        {optional ? <Chip label={value ? "Retirer" : "Choisir"} onPress={() => onChange(value ? null : localISO())} /> : null}
      </Row>
    </View>
  );
}

export function TimeField({ label, value, onChange }: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const base = new Date();
  if (value) {
    const [h, m] = value.split(":").map(Number);
    base.setHours(h, m, 0, 0);
  }
  return (
    <View style={{ gap: 6 }}>
      <Label>{label}</Label>
      <Row>
        {value ? <DateTimePicker value={base} mode="time" display="compact" locale="fr-FR" minuteInterval={5} onChange={(_e, d) => d && onChange(`${pad(d.getHours())}:${pad(d.getMinutes())}`)} /> : <T color="muted">Aucune</T>}
        <Chip label={value ? "Retirer" : "Choisir"} onPress={() => onChange(value ? null : "09:00")} />
      </Row>
    </View>
  );
}

export function PriorityPicker({ value, onChange }: { value: TaskPriority; onChange: (v: TaskPriority) => void }) {
  const t = useTheme();
  const colors: Record<TaskPriority, string> = { high: t.bad, medium: t.warn, low: t.ok };
  return (
    <View style={{ gap: 6 }}>
      <Label>Priorité</Label>
      <Row style={{ flexWrap: "wrap", gap: 8 }}>
        {(["high", "medium", "low"] as const).map((p) => <Chip key={p} label={PRIORITY_LABEL[p]} active={value === p} color={colors[p]} onPress={() => onChange(p)} />)}
      </Row>
    </View>
  );
}

/** Création / modification d'une tâche (mêmes champs que le site : titre, priorité, projet, jour, heure de début/fin, description). */
export function TaskSheet({ visible, onClose, task, projects, defaultDate, onSave, onDelete }: { visible: boolean; onClose: () => void; task?: Task | null; projects: Project[]; defaultDate?: string | null; onSave: (v: TaskInput) => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(task?.title ?? "");
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? "medium");
  const [date, setDate] = useState<string | null>(task ? task.due_date : defaultDate ?? null);
  const [start, setStart] = useState<string | null>(task?.due_time ? task.due_time.slice(0, 5) : null);
  const [end, setEnd] = useState<string | null>(task?.due_end ? task.due_end.slice(0, 5) : null);
  const [projectId, setProjectId] = useState<string | null>(task?.project_id ?? null);
  const [desc, setDesc] = useState(task?.description ?? "");

  return (
    <Sheet visible={visible} onClose={onClose} title={task ? "Modifier la tâche" : "Nouvelle tâche"}>
      <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Que dois-tu faire ?" autoFocus={!task} />
      <PriorityPicker value={priority} onChange={setPriority} />
      <DateField label="Jour" value={date} onChange={(d) => { setDate(d); if (!d) { setStart(null); setEnd(null); } }} optional />
      {date ? <TimeField label="Heure de début" value={start} onChange={(v) => { setStart(v); if (!v) setEnd(null); }} /> : null}
      {date && start ? <TimeField label="Heure de fin" value={end} onChange={setEnd} /> : null}
      {projects.length ? (
        <View style={{ gap: 6 }}>
          <Label>Projet</Label>
          <Row style={{ flexWrap: "wrap", gap: 8 }}>
            <Chip label="Aucun" active={projectId === null} onPress={() => setProjectId(null)} />
            {projects.map((p) => <Chip key={p.id} label={`${p.icon ?? ""} ${p.name}`.trim()} active={projectId === p.id} color={p.color} onPress={() => setProjectId(p.id)} />)}
          </Row>
        </View>
      ) : null}
      <Field label="Description" value={desc} onChangeText={setDesc} multiline style={{ minHeight: 80, textAlignVertical: "top" }} />
      <Button title="Enregistrer" disabled={!title.trim()} onPress={() => { onSave({ title, priority, due_date: date, due_time: start, due_end: end, project_id: projectId, description: desc }); onClose(); }} />
      {onDelete ? <Button title="Supprimer la tâche" kind="danger" onPress={() => { onDelete(); onClose(); }} /> : null}
    </Sheet>
  );
}
