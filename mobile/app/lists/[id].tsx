import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { sel } from "~/core/model";
import { addListItem, clearCheckedItems, deleteList, deleteListItem, setListArchived, toggleListItem } from "~/core/mutations";
import { Button, Card, Check, Empty, Field, IconButton, Row, Screen, SyncBanner, T } from "~/ui/kit";
import { Ready, type ReadyValue } from "~/ui/ready";

export default function ListScreen() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Inner({ data, run, mutCtx, refresh }: ReadyValue) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [label, setLabel] = useState("");
  const [qty, setQty] = useState("");
  const list = sel.lists(data).find((l) => l.id === id);
  const items = sel.items(data).filter((i) => i.list_id === id).sort((a, b) => Number(a.checked) - Number(b.checked) || a.position - b.position);
  if (!list) return <Screen><Stack.Screen options={{ title: "Liste" }} /><Empty title="Liste introuvable" hint="Elle a peut-être été supprimée sur un autre appareil." /></Screen>;
  const checked = items.filter((i) => i.checked).length;

  const add = () => {
    run(addListItem(mutCtx, data, list.id, label, qty));
    setLabel("");
    setQty("");
  };

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: list.name, headerRight: () => <IconButton name="ellipsis.circle" label="Options" onPress={() => Alert.alert(list.name, undefined, [
        { text: list.archived ? "Désarchiver" : "Archiver", onPress: () => run(setListArchived(mutCtx, list.id, !list.archived)) },
        { text: "Supprimer la liste", style: "destructive", onPress: () => Alert.alert("Supprimer cette liste ?", "Elle sera aussi supprimée sur le site.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { run(deleteList(mutCtx, list.id)); router.back(); } }]) },
        { text: "Annuler", style: "cancel" },
      ])} /> }} />
      <SyncBanner />
      <Row>
        <View style={{ flex: 1 }}><Field value={label} onChangeText={setLabel} placeholder="Ajouter un article…" returnKeyType="done" onSubmitEditing={add} /></View>
        <View style={{ width: 90 }}><Field value={qty} onChangeText={setQty} placeholder="Qté" onSubmitEditing={add} /></View>
      </Row>
      <Card>
        {items.length === 0 ? <Empty icon="cart" title="Liste vide" /> : null}
        {items.map((i) => (
          <Row key={i.id} style={{ paddingVertical: 7 }} onLongPress={() => Alert.alert(i.label, undefined, [{ text: "Supprimer", style: "destructive", onPress: () => run(deleteListItem(mutCtx, i.id)) }, { text: "Annuler", style: "cancel" }])}>
            <Check checked={i.checked} label={i.label} onPress={() => run(toggleListItem(mutCtx, i.id, !i.checked))} />
            <T style={{ flex: 1, textDecorationLine: i.checked ? "line-through" : "none", opacity: i.checked ? 0.5 : 1 }}>{i.label}</T>
            {i.quantity ? <T size={13} color="muted">{i.quantity}</T> : null}
          </Row>
        ))}
      </Card>
      {checked > 0 ? <Button title={`Retirer les ${checked} article${checked > 1 ? "s" : ""} cochés`} kind="secondary" onPress={() => run(clearCheckedItems(mutCtx, data, list.id))} /> : null}
      <T size={12} color="muted" style={{ textAlign: "center" }}>Appui long sur un article pour le supprimer.</T>
    </Screen>
  );
}
