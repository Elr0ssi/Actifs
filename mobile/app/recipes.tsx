import React, { useState } from "react";
import { Alert } from "react-native";
import { Stack } from "expo-router";
import type { Recipe } from "@/lib/types";
import { sel } from "~/core/model";
import { addMeal, addRecipe, deleteRecipe, recipeToList, setRecipeFavorite } from "~/core/mutations";
import { DateField } from "~/ui/forms";
import { Button, Card, Chip, Empty, Field, H2, Label, Row, Screen, Segmented, Sheet, SyncBanner, T } from "~/ui/kit";
import { Ready, type ReadyValue } from "~/ui/ready";

export default function Recipes() {
  return <Ready>{(v) => <Inner {...v} />}</Ready>;
}

function Inner({ data, today, run, mutCtx, refresh }: ReadyValue) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const recipes = sel.recipes(data).filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase())).sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite) || a.name.localeCompare(b.name));
  const current = open ? sel.recipes(data).find((r) => r.id === open) ?? null : null;

  return (
    <Screen onRefresh={refresh}>
      <Stack.Screen options={{ title: "Recettes" }} />
      <SyncBanner />
      <Button title="Nouvelle recette" icon="plus" onPress={() => setAdding(true)} />
      <Field value={query} onChangeText={setQuery} placeholder="Rechercher une recette…" />
      {recipes.length === 0 ? <Empty icon="book" title="Aucune recette" hint="Ajoute-en une ici, ou importe des recettes d'inspiration depuis le site." /> : null}
      {recipes.map((r) => {
        const n = sel.recipeItems(data).filter((i) => i.recipe_id === r.id).length;
        return (
          <Card key={r.id} onPress={() => setOpen(r.id)}>
            <Row style={{ justifyContent: "space-between" }}><H2>{r.is_favorite ? "★ " : ""}{r.name}</H2></Row>
            <T size={13} color="muted">{r.category ?? "Sans catégorie"} · {n} ingrédient{n > 1 ? "s" : ""} · {r.servings ?? 4} pers.</T>
          </Card>
        );
      })}
      {current ? <RecipeSheet key={current.id} recipe={current} data={data} today={today} run={run} mutCtx={mutCtx} onClose={() => setOpen(null)} /> : null}
      {adding ? <NewRecipe onClose={() => setAdding(false)} onSave={(v) => run(addRecipe(mutCtx, v))} /> : null}
    </Screen>
  );
}

function RecipeSheet({ recipe, data, today, run, mutCtx, onClose }: { recipe: Recipe; data: ReadyValue["data"]; today: string; run: ReadyValue["run"]; mutCtx: ReadyValue["mutCtx"]; onClose: () => void }) {
  const items = sel.recipeItems(data).filter((i) => i.recipe_id === recipe.id).sort((a, b) => a.position - b.position);
  const lists = sel.lists(data).filter((l) => !l.archived && l.type !== "recipe");
  const [day, setDay] = useState<string | null>(today);
  const [slot, setSlot] = useState<"midi" | "soir">("soir");
  return (
    <Sheet visible onClose={onClose} title={recipe.name}>
      <Label>Ingrédients</Label>
      <Card>
        {items.length === 0 ? <T color="muted">Aucun ingrédient</T> : items.map((i) => <Row key={i.id} style={{ justifyContent: "space-between" }}><T style={{ flex: 1 }}>{i.label}</T><T color="muted">{i.quantity ?? ""}</T></Row>)}
      </Card>
      {recipe.notes ? (<><Label>Préparation</Label><T>{recipe.notes}</T></>) : null}

      <Label>Planifier au menu</Label>
      <DateField label="Jour" value={day} onChange={setDay} />
      <Segmented value={slot} onChange={setSlot} options={[{ value: "midi", label: "Midi" }, { value: "soir", label: "Soir" }]} />
      <Button title="Ajouter au menu" kind="secondary" disabled={!day} onPress={() => { if (day) run(addMeal(mutCtx, data, day, { name: recipe.name, servings: recipe.servings ?? 4 }, slot)); onClose(); }} />

      {lists.length ? (<><Label>Ajouter les ingrédients aux courses</Label><Row style={{ flexWrap: "wrap", gap: 8 }}>{lists.map((l) => <Chip key={l.id} label={l.name} onPress={() => { run(recipeToList(mutCtx, data, recipe.id, l.id)); onClose(); }} />)}</Row></>) : null}

      <Button title={recipe.is_favorite ? "Retirer des favoris" : "Mettre en favori"} kind="secondary" onPress={() => { run(setRecipeFavorite(mutCtx, recipe.id, !recipe.is_favorite)); onClose(); }} />
      <Button title="Supprimer la recette" kind="danger" onPress={() => Alert.alert("Supprimer cette recette ?", "Elle sera aussi supprimée sur le site.", [{ text: "Annuler", style: "cancel" }, { text: "Supprimer", style: "destructive", onPress: () => { run(deleteRecipe(mutCtx, recipe.id)); onClose(); } }])} />
    </Sheet>
  );
}

function NewRecipe({ onClose, onSave }: { onClose: () => void; onSave: (v: { name: string; category?: string; notes?: string; ingredients: { label: string; quantity?: string | null }[] }) => void }) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [ings, setIngs] = useState("");
  const [notes, setNotes] = useState("");
  const parse = () => ings.split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^([\d.,/]+\s*(?:g|kg|ml|cl|l|c\.?\s?à\s?[sc]\.?|cuill[^\s]*)?)\s+(.+)$/i);
    return m ? { quantity: m[1].trim(), label: m[2].trim() } : { label: l };
  });
  return (
    <Sheet visible onClose={onClose} title="Nouvelle recette">
      <Field label="Nom" value={name} onChangeText={setName} placeholder="Gratin dauphinois" autoFocus />
      <Field label="Catégorie" value={category} onChangeText={setCategory} placeholder="Plat, dessert…" />
      <Field label="Ingrédients (un par ligne)" value={ings} onChangeText={setIngs} multiline style={{ minHeight: 110, textAlignVertical: "top" }} placeholder={"200 g farine\n3 œufs\nSel"} />
      <Field label="Préparation" value={notes} onChangeText={setNotes} multiline style={{ minHeight: 80, textAlignVertical: "top" }} />
      <Button title="Enregistrer" disabled={!name.trim()} onPress={() => { onSave({ name, category, notes, ingredients: parse() }); onClose(); }} />
    </Sheet>
  );
}
