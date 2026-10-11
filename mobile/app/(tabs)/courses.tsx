import React, { useState } from "react";
import { View } from "react-native";
import { useRouter } from "expo-router";
import { sel } from "~/core/model";
import { addList } from "~/core/mutations";
import { Button, Card, Empty, Field, H2, Icon, Progress, Row, Screen, Sheet, SyncBanner, T } from "~/ui/kit";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";
import { eur0 } from "~/ui/format";

export default function Courses() {
  return <Ready>{(v) => <CoursesInner {...v} />}</Ready>;
}

function CoursesInner({ data, run, mutCtx, refresh }: ReadyValue) {
  const t = useTheme();
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const items = sel.items(data);
  const lists = sel.lists(data).filter((l) => l.type !== "recipe").sort((a, b) => Number(a.archived) - Number(b.archived) || b.created_at.localeCompare(a.created_at));
  const active = lists.filter((l) => !l.archived);
  const archived = lists.filter((l) => l.archived);

  const row = (l: (typeof lists)[number]) => {
    const own = items.filter((i) => i.list_id === l.id);
    const left = own.filter((i) => !i.checked).length;
    const total = own.reduce((s, i) => s + (i.price !== null ? Number(i.price) * (i.count || 1) : 0), 0);
    return (
      <Card key={l.id} onPress={() => router.push({ pathname: "/lists/[id]", params: { id: l.id } })}>
        <Row style={{ justifyContent: "space-between" }}>
          <H2>{l.name}</H2>
          <T size={13} color="sub">{left} / {own.length}</T>
        </Row>
        <Progress value={own.length ? (own.length - left) / own.length : 0} color={t.meal} />
        <Row style={{ justifyContent: "space-between" }}>
          <T size={12} color="muted">{l.store ? `${l.store} · ` : ""}{left} à acheter</T>
          {total > 0 ? <T size={12} color="muted">≈ {eur0(total)}</T> : null}
        </Row>
      </Card>
    );
  };

  return (
    <Screen onRefresh={refresh}>
      <SyncBanner />
      <Button title="Nouvelle liste de courses" icon="plus" onPress={() => setAdding(true)} />
      {active.length === 0 ? <Empty icon="cart" title="Aucune liste" hint="Crée une liste pour tes prochaines courses." /> : null}
      {active.map(row)}
      {archived.length ? (<View style={{ gap: 12 }}><T size={12} weight="700" color="muted">ARCHIVÉES</T>{archived.slice(0, 10).map(row)}</View>) : null}
      <Sheet visible={adding} onClose={() => setAdding(false)} title="Nouvelle liste">
        <Field label="Nom" value={name} onChangeText={setName} placeholder="Courses de la semaine" autoFocus />
        <Button title="Créer" disabled={!name.trim()} onPress={() => { run(addList(mutCtx, name)); setName(""); setAdding(false); }} />
      </Sheet>
    </Screen>
  );
}
