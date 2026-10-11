import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Stack } from "expo-router";
import type { Routine } from "@/lib/types";
import { isoAddDays } from "~/core/dates";
import { sel } from "~/core/model";
import { addRoutine, deleteRoutine, setRoutineActive, setRoutineLog, updateRoutine } from "~/core/mutations";
import { routinesFor, scheduledOn, streakOf } from "~/core/today";
import { Button, Card, Check, Chip, Empty, Field, H2, Label, Progress, Row, Screen, Segmented, Sheet, SyncBanner, T } from "~/ui/kit";
import { fmtWeekday } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";

const DAYS = [{ d: 1, l: "Lun" }, { d: 2, l: "Mar" }, { d: 3, l: "Mer" }, { d: 4, l: "Jeu" }, { d: 5, l: "Ven" }, { d: 6, l: "Sam" }, { d: 0, l: "Dim" }];

export default function Routines() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Inner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const t = useTheme();
  const [editing, setEditing] = useState<Routine | "new" | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");
  const routines = sel.routines(data).filter((r) => (tab === "active" ? r.active : !r.active)).sort((a, b) => a.title.localeCompare(b.title));
  const logs = sel.logs(data);
  const week = Array.from({ length: 7 }, (_, i) => isoAddDays(today, i - 6));
  const doneSet = new Set(logs.filter((l) => l.done && (!l.user_id || l.user_id === data.userId)).map((l) => `${l.routine_id}_${l.log_date}`));
  const todayStats = routinesFor(data, today);
  const streak = streakOf(data, today);

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Routines" }} />
      <SyncBanner />
      <Card tone="brand">
        <Row style={{ justifyContent: "space-between" }}><T weight="700">Aujourd'hui</T><T weight="700" color="brand">{todayStats.done}/{todayStats.total}</T></Row>
        <Progress value={todayStats.total ? todayStats.done / todayStats.total : 0} />
        <T size={13} color="sub">{streak > 0 ? `🔥 Série de ${streak} jour${streak > 1 ? "s" : ""}` : "Termine toutes tes routines du jour pour lancer une série."}</T>
      </Card>
      <Button title="Nouvelle routine" icon="plus" onPress={() => setEditing("new")} />
      <Segmented value={tab} onChange={setTab} options={[{ value: "active", label: "Actives" }, { value: "archived", label: "Archivées" }]} />

      {routines.length === 0 ? <Empty icon="repeat" title={tab === "active" ? "Aucune routine" : "Aucune routine archivée"} /> : null}
      {routines.map((r) => (
        <Card key={r.id} onPress={() => setEditing(r)}>
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}><H2>{r.title}</H2><T size={12} color="muted">{r.category ?? "Général"} · {r.frequency === "daily" || (r.days_of_week ?? []).length >= 7 ? "Tous les jours" : DAYS.filter((d) => (r.days_of_week ?? []).includes(d.d)).map((d) => d.l).join(" ")}</T></View>
          </Row>
          {r.active ? (
            <Row style={{ justifyContent: "space-between" }}>
              {week.map((d) => {
                const due = scheduledOn(r, d);
                const done = doneSet.has(`${r.id}_${d}`);
                return (
                  <View key={d} style={{ alignItems: "center", gap: 4, opacity: due ? 1 : 0.3 }}>
                    <T size={11} color={d === today ? "brand" : "muted"} weight={d === today ? "700" : "400"}>{fmtWeekday(d).slice(0, 3)}</T>
                    {due ? <Check checked={done} label={`${r.title} ${d}`} onPress={() => run(setRoutineLog(mutCtx, r.id, d, !done))} /> : <View style={{ width: 26, height: 26, alignItems: "center", justifyContent: "center" }}><T color="muted">–</T></View>}
                  </View>
                );
              })}
            </Row>
          ) : null}
        </Card>
      ))}

      {editing ? <RoutineSheet key={editing === "new" ? "new" : editing.id} routine={editing === "new" ? null : editing} onClose={() => setEditing(null)}
        onSave={(v) => run(editing === "new" ? addRoutine(mutCtx, v) : updateRoutine(mutCtx, editing.id, v))}
        onArchive={editing === "new" ? undefined : () => run(setRoutineActive(mutCtx, editing.id, !editing.active))}
        onDelete={editing === "new" || editing.active ? undefined : () => Alert.alert("Supprimer définitivement ?", "L'historique de cette routine sera aussi supprimé, y compris sur le site.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { run(deleteRoutine(mutCtx, editing.id)); setEditing(null); } }])}
      /> : null}
    </Screen>
  );
}

function RoutineSheet({ routine, onClose, onSave, onArchive, onDelete }: { routine: Routine | null; onClose: () => void; onSave: (v: { title: string; category: string; frequency: "daily" | "weekly"; days: number[] }) => void; onArchive?: () => void; onDelete?: () => void }) {
  const [title, setTitle] = useState(routine?.title ?? "");
  const [category, setCategory] = useState(routine?.category ?? "Général");
  const [every, setEvery] = useState(!routine || routine.frequency === "daily" || (routine.days_of_week ?? []).length >= 7);
  const [days, setDays] = useState<number[]>(routine && routine.frequency === "weekly" ? routine.days_of_week ?? [] : [1, 2, 3, 4, 5]);
  const toggle = (d: number) => setDays((c) => (c.includes(d) ? c.filter((x) => x !== d) : [...c, d]));
  return (
    <Sheet visible onClose={onClose} title={routine ? "Modifier la routine" : "Nouvelle routine"}>
      <Field label="Titre" value={title} onChangeText={setTitle} placeholder="Méditer 10 minutes" autoFocus={!routine} />
      <Field label="Catégorie" value={category} onChangeText={setCategory} />
      <Label>Jours</Label>
      <Segmented value={every ? "all" : "some"} onChange={(v) => setEvery(v === "all")} options={[{ value: "all", label: "Tous les jours" }, { value: "some", label: "Certains jours" }]} />
      {!every ? <Row style={{ flexWrap: "wrap", gap: 8 }}>{DAYS.map((d) => <Chip key={d.d} label={d.l} active={days.includes(d.d)} onPress={() => toggle(d.d)} />)}</Row> : null}
      <Button title="Enregistrer" disabled={!title.trim() || (!every && days.length === 0)} onPress={() => { onSave({ title, category, frequency: every ? "daily" : "weekly", days }); onClose(); }} />
      {onArchive ? <Button title={routine?.active ? "Archiver" : "Restaurer"} kind="secondary" onPress={() => { onArchive(); onClose(); }} /> : null}
      {onDelete ? <Button title="Supprimer définitivement" kind="danger" onPress={onDelete} /> : null}
    </Sheet>
  );
}
