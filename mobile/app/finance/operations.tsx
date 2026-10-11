import React, { useMemo, useState } from "react";
import { Alert, View } from "react-native";
import { Stack } from "expo-router";
import { describeRecurrence } from "@/lib/finance-engine";
import { financeFrom } from "~/core/finance";
import { sel } from "~/core/model";
import { addOperation, deleteOperation, setOperationActive, type OperationInput } from "~/core/mutations";
import { Button, Card, Chip, Empty, Field, H2, Label, Row, Screen, Segmented, Sheet, SyncBanner, T } from "~/ui/kit";
import { DateField } from "~/ui/forms";
import { eur0, fmtShort } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { parseAmount } from "@/lib/wallet";

export default function Operations() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

type Tab = "planned" | "cards";
const KINDS: { value: OperationInput["kind"]; label: string }[] = [
  { value: "income", label: "Revenu" }, { value: "fixed", label: "Charge fixe" }, { value: "variable", label: "Variable" }, { value: "savings", label: "Épargne" },
];
const FREQ: { value: OperationInput["frequency"]; label: string }[] = [
  { value: "once", label: "Une fois" }, { value: "weekly", label: "Chaque semaine" }, { value: "monthly", label: "Chaque mois" }, { value: "yearly", label: "Chaque année" },
];

function Inner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const [tab, setTab] = useState<Tab>("planned");
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState<OperationInput["kind"]>("fixed");
  const [freq, setFreq] = useState<OperationInput["frequency"]>("monthly");
  const [start, setStart] = useState<string | null>(today);

  const state = useMemo(() => financeFrom(data, today), [data, today]);
  const planned = state.ops.filter((o) => !o.txn).sort((a, b) => a.kind.localeCompare(b.kind) || a.name.localeCompare(b.name));
  const cards = state.ops.filter((o) => o.txn).sort((a, b) => b.start.localeCompare(a.start) || (b.txn?.time ?? "").localeCompare(a.txn?.time ?? "")).slice(0, 80);
  const tableOf = (opId: string) => (sel.household(data) && data.tables.incomes.some((r) => r.id === opId) ? "incomes" : "recurring_charges") as "incomes" | "recurring_charges";

  const save = () => {
    const n = parseAmount(amount);
    if (n === null || !start) return;
    run(addOperation(mutCtx, { name, amount: n, kind, start, frequency: freq }));
    setName(""); setAmount(""); setAdding(false);
  };

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Opérations" }} />
      <SyncBanner />
      <Button title="Nouvelle opération" icon="plus" onPress={() => setAdding(true)} />
      <Segmented<Tab> value={tab} onChange={setTab} options={[{ value: "planned", label: "Planifiées" }, { value: "cards", label: "Paiements carte" }]} />

      {tab === "planned" ? (
        <Card>
          {planned.length === 0 ? <Empty title="Aucune opération" /> : null}
          {planned.map((o) => (
            <Row key={o.id} style={{ justifyContent: "space-between", paddingVertical: 6, opacity: o.active ? 1 : 0.45 }} onLongPress={() => Alert.alert(o.name, undefined, [
              { text: o.active ? "Mettre en pause" : "Réactiver", onPress: () => run(setOperationActive(mutCtx, tableOf(o.id), o.id, !o.active)) },
              { text: "Supprimer", style: "destructive", onPress: () => run(deleteOperation(mutCtx, tableOf(o.id), o.id)) },
              { text: "Annuler", style: "cancel" },
            ])}>
              <View style={{ flex: 1 }}>
                <T numberOfLines={1} weight="600">{o.name}</T>
                <T size={12} color="muted">{o.category} · {describeRecurrence(o)}{o.active ? "" : " · en pause"}</T>
              </View>
              <T weight="700" color={o.kind === "income" ? "ok" : "ink"}>{o.kind === "income" ? "+" : "−"} {eur0(o.amount)}</T>
            </Row>
          ))}
          <T size={12} color="muted">Appui long : mettre en pause ou supprimer.</T>
        </Card>
      ) : (
        <Card>
          {cards.length === 0 ? <Empty title="Aucun paiement reçu" hint="Les paiements Apple Pay arrivent via le raccourci configuré sur le site." /> : null}
          {cards.map((o) => (
            <Row key={o.id} style={{ justifyContent: "space-between", paddingVertical: 6 }} onLongPress={() => Alert.alert(o.name, "Supprimer ce paiement ?", [{ text: "Supprimer", style: "destructive", onPress: () => run(deleteOperation(mutCtx, "transactions", o.txn!.id)) }, { text: "Annuler", style: "cancel" }])}>
              <View style={{ flex: 1 }}><T numberOfLines={1}>{o.name}</T><T size={12} color="muted">{fmtShort(o.start)}{o.txn?.time ? ` · ${o.txn.time}` : ""} · {o.category}</T></View>
              <T weight="700" color={o.kind === "income" ? "ok" : "ink"}>{o.kind === "income" ? "+" : "−"} {eur0(o.amount)}</T>
            </Row>
          ))}
        </Card>
      )}

      <Sheet visible={adding} onClose={() => setAdding(false)} title="Nouvelle opération">
        <Segmented value={kind} onChange={setKind} options={KINDS} />
        <Field label="Libellé" value={name} onChangeText={setName} placeholder={kind === "income" ? "Salaire" : "Loyer"} />
        <Field label="Montant (€)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0,00" />
        <Label>Fréquence</Label>
        <Row style={{ flexWrap: "wrap", gap: 8 }}>{FREQ.map((f) => <Chip key={f.value} label={f.label} active={freq === f.value} onPress={() => setFreq(f.value)} />)}</Row>
        <DateField label={freq === "once" ? "Date" : "Première date"} value={start} onChange={setStart} />
        <Button title="Ajouter" disabled={!name.trim() || !amount.trim()} onPress={save} />
      </Sheet>
    </Screen>
  );
}
