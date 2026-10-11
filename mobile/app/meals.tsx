import React, { useState } from "react";
import { Alert, View } from "react-native";
import { Stack } from "expo-router";
import { isoAddDays } from "~/core/dates";
import { sel } from "~/core/model";
import { addMeal, mondayOfISO, removeMeal, setMealServings, setMealSlot } from "~/core/mutations";
import { Button, Card, Chip, Empty, Field, H2, IconButton, Label, Row, Screen, Segmented, Sheet, SyncBanner, T } from "~/ui/kit";
import { fmtLong, fmtShort } from "~/ui/format";
import { Ready, type ReadyValue } from "~/ui/ready";
import { useTheme } from "~/ui/theme";

export default function Meals() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Inner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const t = useTheme();
  const [week, setWeek] = useState(mondayOfISO(today));
  const [adding, setAdding] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slot, setSlot] = useState<"midi" | "soir">("midi");
  const days = Array.from({ length: 7 }, (_, i) => isoAddDays(week, i));
  const menu = sel.menu(data);
  const recipes = sel.recipes(data).slice().sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || a.name.localeCompare(b.name));
  const defaultServings = sel.household(data)?.default_servings ?? 2;

  const add = (mealName: string) => {
    if (!adding) return;
    run(addMeal(mutCtx, data, adding, { name: mealName, servings: defaultServings }, slot));
    setName("");
    setAdding(null);
  };

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Menu de la semaine" }} />
      <SyncBanner />
      <Row style={{ justifyContent: "space-between" }}>
        <IconButton name="chevron.left" label="Semaine précédente" onPress={() => setWeek(isoAddDays(week, -7))} />
        <T weight="700">{fmtShort(days[0])} – {fmtShort(days[6])}</T>
        <IconButton name="chevron.right" label="Semaine suivante" onPress={() => setWeek(isoAddDays(week, 7))} />
      </Row>
      {days.map((d) => {
        const meals = menu.filter((m) => m.day === d).sort((a, b) => (a.slot === "soir" ? 1 : 0) - (b.slot === "soir" ? 1 : 0));
        return (
          <Card key={d} tone={d === today ? "brand" : undefined}>
            <Row style={{ justifyContent: "space-between" }}>
              <H2>{fmtLong(d)}</H2>
              <IconButton name="plus.circle.fill" label={`Ajouter un repas le ${d}`} color={t.meal} onPress={() => { setSlot("midi"); setAdding(d); }} />
            </Row>
            {meals.length === 0 ? <T color="muted" size={13}>Aucun repas</T> : null}
            {meals.map((m) => (
              <Row key={m.id} style={{ paddingVertical: 4 }} onLongPress={() => Alert.alert(m.name, undefined, [
                { text: `Passer au ${m.slot === "soir" ? "midi" : "soir"}`, onPress: () => run(setMealSlot(mutCtx, m.id, m.slot === "soir" ? "midi" : "soir")) },
                { text: "Personnes +1", onPress: () => run(setMealServings(mutCtx, m.id, (m.servings ?? defaultServings) + 1)) },
                { text: "Personnes −1", onPress: () => run(setMealServings(mutCtx, m.id, (m.servings ?? defaultServings) - 1)) },
                { text: "Retirer", style: "destructive", onPress: () => run(removeMeal(mutCtx, m.id)) },
                { text: "Annuler", style: "cancel" },
              ])}>
                <T>{m.icon ?? "🍽️"}</T>
                <View style={{ flex: 1 }}><T>{m.name}</T><T size={12} color="muted">{m.slot === "soir" ? "Soir" : m.slot === "midi" ? "Midi" : "Repas"}{m.servings ? ` · ${m.servings} pers.` : ""}</T></View>
              </Row>
            ))}
          </Card>
        );
      })}
      <T size={12} color="muted" style={{ textAlign: "center" }}>Appui long sur un repas : créneau, nombre de personnes, retirer.</T>

      <Sheet visible={adding !== null} onClose={() => setAdding(null)} title={adding ? `Repas · ${fmtLong(adding)}` : "Repas"}>
        <Segmented value={slot} onChange={setSlot} options={[{ value: "midi", label: "Midi" }, { value: "soir", label: "Soir" }]} />
        <Field label="Repas" value={name} onChangeText={setName} placeholder="Gratin de pâtes" autoFocus onSubmitEditing={() => add(name)} />
        <Button title="Ajouter" disabled={!name.trim()} onPress={() => add(name)} />
        {recipes.length ? (<><Label>Ou choisir une de tes recettes</Label><Row style={{ flexWrap: "wrap", gap: 8 }}>{recipes.slice(0, 30).map((r) => <Chip key={r.id} label={`${r.is_favorite ? "★ " : ""}${r.name}`} onPress={() => add(r.name)} />)}</Row></>) : null}
      </Sheet>
    </Screen>
  );
}
