import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "~/auth/AuthProvider";
import { sel } from "~/core/model";
import { addTask, setRoutineLog, toggleTask } from "~/core/mutations";
import { financeFrom, summarize } from "~/core/finance";
import { isoAddDays } from "~/core/dates";
import { overdueTasks, routinesFor, streakOf, tasksFor } from "~/core/today";
import { Card, Check, Divider, Empty, Field, H2, Icon, Progress, Row, Screen, SyncBanner, T, Button } from "~/ui/kit";
import { eur0, fmtLong, fmtWeekday, PRIORITY_LABEL } from "~/ui/format";
import { Ready } from "~/ui/ready";
import { useTheme } from "~/ui/theme";

export default function Today() {
  return <Ready>{(v) => <TodayInner {...v} />}</Ready>;
}

function TodayInner({ data, today, run, mutCtx, refresh, settings }: import("~/ui/ready").ReadyValue) {
  const t = useTheme();
  const router = useRouter();
  const { session } = useAuth();
  const [quick, setQuick] = useState("");
  const profile = sel.profile(data);
  const name = profile?.display_name || (session?.user.user_metadata?.display_name as string | undefined) || "";

  const r = routinesFor(data, today);
  const tk = tasksFor(data, today);
  const late = overdueTasks(data, today);
  const streak = streakOf(data, today);
  const hasFinance = data.tables.recurring_charges.length + data.tables.incomes.length + data.tables.balance_entries.length > 0;
  const fin = hasFinance ? summarize(financeFrom(data, today), today) : null;

  const items = sel.items(data);
  const shopList = sel.lists(data).filter((l) => !l.archived && l.type !== "recipe").sort((a, b) => b.created_at.localeCompare(a.created_at)).map((l) => ({ l, left: items.filter((i) => i.list_id === l.id && !i.checked) })).find((x) => x.left.length);
  const meals = sel.menu(data).filter((m) => m.day === today).sort((a, b) => (a.slot === "soir" ? 1 : 0) - (b.slot === "soir" ? 1 : 0));
  const tomorrow = isoAddDays(today, 1);
  const upcoming = sel.tasks(data).filter((x) => x.status !== "done" && x.due_date === tomorrow && x.due_time).sort((a, b) => (a.due_time as string).localeCompare(b.due_time as string)).slice(0, 3);

  const hour = new Date().getHours();
  const hello = hour < 5 ? "Bonne nuit" : hour < 18 ? "Bonjour" : "Bonsoir";

  return (
    <Screen onRefresh={refresh}>
      <View style={{ gap: 2 }}>
        <T size={30} weight="800" style={{ letterSpacing: -0.6 }}>{hello}{name ? `, ${name}` : ""}</T>
        <T color="sub">{fmtLong(today)}</T>
      </View>
      <SyncBanner />

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Row><Icon name="arrow.triangle.2.circlepath" color={t.brand} /><H2>Routines</H2></Row>
          {streak > 0 ? <T size={13} weight="700" color="warn">🔥 {streak} j</T> : null}
        </Row>
        {r.total === 0 ? <Empty icon="repeat" title="Aucune routine aujourd'hui" /> : (
          <>
            <Row style={{ justifyContent: "space-between" }}><T color="sub">{r.done}/{r.total} faites</T><T weight="700" color="brand">{Math.round((r.done / r.total) * 100)} %</T></Row>
            <Progress value={r.done / r.total} />
            {r.list.map(({ routine, done }) => (
              <Row key={routine.id} style={{ paddingVertical: 6 }}>
                <Check checked={done} label={routine.title} onPress={() => run(setRoutineLog(mutCtx, routine.id, today, !done))} />
                <T style={{ flex: 1, textDecorationLine: done ? "line-through" : "none", opacity: done ? 0.5 : 1 }}>{routine.title}</T>
              </Row>
            ))}
          </>
        )}
      </Card>

      <Card>
        <Row style={{ justifyContent: "space-between" }}>
          <Row><Icon name="checklist" color={t.brand} /><H2>Tâches du jour</H2></Row>
          <T size={13} color="sub">{tk.remaining} restante{tk.remaining > 1 ? "s" : ""}</T>
        </Row>
        <Row>
          <View style={{ flex: 1 }}><Field value={quick} onChangeText={setQuick} placeholder="Ajouter une tâche…" returnKeyType="done" onSubmitEditing={() => { run(addTask(mutCtx, { title: quick, due_date: today })); setQuick(""); }} /></View>
        </Row>
        {late.length ? <Row onPress={() => router.push("/tasks")}><T size={13} weight="600" color="bad">⚠︎ {late.length} en retard</T></Row> : null}
        {tk.open.length === 0 && tk.done.length === 0 ? <Empty icon="checkmark.circle" title="Rien de prévu aujourd'hui" /> : null}
        {[...tk.open, ...tk.done].map((x) => (
          <Row key={x.id} style={{ paddingVertical: 6 }}>
            <Check checked={x.status === "done"} label={x.title} onPress={() => run(toggleTask(mutCtx, x.id, x.status !== "done"))} color={x.priority === "high" ? t.bad : undefined} />
            <View style={{ flex: 1 }}>
              <T style={{ textDecorationLine: x.status === "done" ? "line-through" : "none", opacity: x.status === "done" ? 0.5 : 1 }}>{x.title}</T>
              {x.due_time ? <T size={12} color="muted">{x.due_time.slice(0, 5)}{x.due_end ? ` – ${x.due_end.slice(0, 5)}` : ""} · {PRIORITY_LABEL[x.priority]}</T> : null}
            </View>
          </Row>
        ))}
      </Card>

      {fin ? (
        <Card onPress={() => router.push("/finance")}>
          <Row style={{ justifyContent: "space-between" }}><Row><Icon name="eurosign.circle" color={t.money} /><H2>Finances</H2></Row><Icon name="chevron.right" size={14} /></Row>
          <T size={12} color="muted">Reste à vivre (fin de mois)</T>
          <T size={32} weight="800" color={fin.resteAVivre >= 0 ? "ink" : "bad"}>{eur0(fin.resteAVivre)}</T>
          <Row style={{ gap: 20 }}>
            <View><T size={12} color="muted">Solde</T><T weight="700">{eur0(fin.balance)}</T></View>
            <View><T size={12} color="muted">Dépensé ce mois</T><T weight="700">{eur0(fin.monthSpent)}</T></View>
            <View><T size={12} color="muted">Par jour</T><T weight="700">{eur0(fin.perDay)}</T></View>
          </Row>
        </Card>
      ) : null}

      {shopList ? (
        <Card onPress={() => router.push({ pathname: "/lists/[id]", params: { id: shopList.l.id } })}>
          <Row style={{ justifyContent: "space-between" }}><Row><Icon name="cart" color={t.meal} /><H2>{shopList.l.name}</H2></Row><T size={13} color="sub">{shopList.left.length} à acheter</T></Row>
          <T color="sub" numberOfLines={2}>{shopList.left.slice(0, 6).map((i) => i.label).join(" · ")}</T>
        </Card>
      ) : null}

      <Card>
        <Row><Icon name="fork.knife" color={t.meal} /><H2>Planning</H2></Row>
        {meals.length ? meals.map((m) => <Row key={m.id}><T>{m.icon ?? "🍽️"}</T><T style={{ flex: 1 }}>{m.name}</T><T size={12} color="muted">{m.slot === "soir" ? "Soir" : m.slot === "midi" ? "Midi" : ""}</T></Row>) : <T color="muted">Aucun repas planifié aujourd'hui</T>}
        {upcoming.length ? <><Divider />{upcoming.map((x) => <Row key={x.id}><T size={12} color="muted">{fmtWeekday(tomorrow)} {x.due_time?.slice(0, 5)}</T><T style={{ flex: 1 }}>{x.title}</T></Row>)}</> : null}
        <Button title="Voir le menu de la semaine" kind="ghost" small onPress={() => router.push("/meals")} />
      </Card>
    </Screen>
  );
}
