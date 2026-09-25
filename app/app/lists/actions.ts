"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ensureIngredients, parsePicked } from "@/lib/data/ingredients";
import { formatQty, lineCost, priceMap, type IngredientUnit } from "@/lib/shopping";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function parseBulkLines(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.replace(/^[\s]*[-*•▪️✓☐☑]+\s*/, "").trim())
    .filter(Boolean);
}

export async function createList(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const shopping = String(formData.get("type") || "shopping") === "shopping";
  if (!name) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase
    .from("lists")
    .insert({
      household_id: householdId,
      name,
      type: shopping ? "shopping" : "generic",
      category: shopping ? "Courses" : "Général",
      week_start: shopping ? String(formData.get("week_start") || "") || null : null,
      store: shopping ? String(formData.get("store") || "") || null : null,
      created_by: userId,
    })
    .select("id")
    .single();
  revalidatePath("/app/lists");
  if (data?.id) redirect(`/app/lists/${data.id}${shopping ? "?compose=1" : ""}`);
}

async function storePrices(supabase: ReturnType<typeof createClient>, store: string | null) {
  const { data } = await supabase.from("ingredient_prices").select("ingredient_id, store, price, household_id").eq("store", store ?? "");
  return priceMap((data ?? []) as Parameters<typeof priceMap>[0], store);
}

type Line = { key: string; label: string; ingredient_id: string | null; unit: IngredientUnit; qty: number | null; qtyUnit: string | null; sources: Set<string> };

/** Adds chosen recipes (× count) and extras, merging same ingredient + unit and pricing each line for the list's store. */
export async function composeList(listId: string, formData: FormData) {
  const recipes: { id: string; count: number }[] = JSON.parse(String(formData.get("recipes") || "[]"));
  const extras = parsePicked(formData.get("extras"));
  const { supabase, householdId } = await ctx();
  if (!householdId) return;

  const { data: list } = await supabase.from("lists").select("store").eq("id", listId).single();
  const store = list?.store ?? null;
  const ids = await ensureIngredients(supabase, householdId, extras);

  // New personal ingredients may come with a personal price for the current store.
  const personalPrices = extras
    .filter((e) => !e.id && e.price !== null && e.price !== undefined && store)
    .map((e) => ({ household_id: householdId, ingredient_id: ids.get(e.name.trim().toLowerCase())!.id, store: store!, price: Number(e.price) }));
  if (personalPrices.length) await supabase.from("ingredient_prices").upsert(personalPrices, { onConflict: "ingredient_id,store,household_id" });

  const [{ data: existing }, { data: recipeRows }, prices] = await Promise.all([
    supabase.from("list_items").select("*").eq("list_id", listId),
    recipes.length
      ? supabase.from("recipes").select("id, name, recipe_items(label, qty, qty_unit, ingredient_id)").in("id", recipes.map((r) => r.id))
      : Promise.resolve({ data: [] }),
    storePrices(supabase, store),
  ]);
  const unitOf = new Map([...ids.values()].map((v) => [v.id, v.unit]));

  const lines = new Map<string, Line>();
  const add = (label: string, ingredientId: string | null, qty: number | null, qtyUnit: string | null, count: number, source: string) => {
    const key = `${ingredientId ?? label.trim().toLowerCase()}|${qtyUnit ?? ""}`;
    const line = lines.get(key) ?? { key, label: label.trim(), ingredient_id: ingredientId, unit: unitOf.get(ingredientId ?? "") ?? "unit", qty: null, qtyUnit, sources: new Set<string>() };
    line.qty = (line.qty ?? 0) + (qty && qty > 0 ? qty : 1) * count;
    line.sources.add(source);
    lines.set(key, line);
  };
  type RecipeRow = { id: string; name: string; recipe_items: { label: string; qty: number | null; qty_unit: string | null; ingredient_id: string | null }[] };
  for (const r of (recipeRows ?? []) as RecipeRow[]) {
    const count = Math.max(1, recipes.find((x) => x.id === r.id)?.count ?? 1);
    for (const it of r.recipe_items) add(it.label, it.ingredient_id, it.qty ? Number(it.qty) : null, it.qty_unit, count, r.name);
  }
  for (const e of extras) {
    const found = ids.get(e.name.trim().toLowerCase());
    add(e.name, found?.id ?? null, e.qty ?? null, e.qtyUnit ?? null, 1, "Extra");
  }

  let position = existing?.length ?? 0;
  for (const line of lines.values()) {
    const source = [...line.sources].join(", ");
    const match = (existing ?? []).find(
      (i) => (i.ingredient_id ? i.ingredient_id === line.ingredient_id : String(i.label).toLowerCase() === line.label.toLowerCase()) && (i.qty_unit ?? null) === (line.qtyUnit ?? null)
    );
    const qty = (match?.qty ? Number(match.qty) : 0) + (line.qty ?? 0);
    const price = line.ingredient_id ? lineCost(qty, line.qtyUnit, line.unit, prices.get(line.ingredient_id)) : null;
    const row = { qty, qty_unit: line.qtyUnit, quantity: formatQty(qty, line.qtyUnit), price, count: 1 };
    if (match) {
      await supabase.from("list_items").update({ ...row, checked: false, source: [match.source, source].filter(Boolean).join(", ") }).eq("id", match.id);
    } else {
      await supabase.from("list_items").insert({ ...row, list_id: listId, label: line.label, ingredient_id: line.ingredient_id, source, position: position++ });
    }
  }
  revalidatePath(`/app/lists/${listId}`);
  redirect(`/app/lists/${listId}`);
}

export async function setListStore(listId: string, formData: FormData) {
  const store = String(formData.get("store") || "") || null;
  const { supabase } = await ctx();
  await supabase.from("lists").update({ store }).eq("id", listId);
  const [{ data: items }, prices, { data: units }] = await Promise.all([
    supabase.from("list_items").select("id, ingredient_id, qty, qty_unit").eq("list_id", listId),
    storePrices(supabase, store),
    supabase.from("ingredients").select("id, unit"),
  ]);
  const unitOf = new Map((units ?? []).map((u) => [u.id as string, u.unit as IngredientUnit]));
  for (const it of items ?? []) {
    const price = it.ingredient_id ? lineCost(it.qty ? Number(it.qty) : null, it.qty_unit, unitOf.get(it.ingredient_id) ?? "unit", prices.get(it.ingredient_id)) : null;
    await supabase.from("list_items").update({ price }).eq("id", it.id);
  }
  revalidatePath(`/app/lists/${listId}`);
}

export async function setListArchived(listId: string, archived: boolean) {
  const { supabase } = await ctx();
  await supabase.from("lists").update({ archived }).eq("id", listId);
  revalidatePath("/app/lists");
  revalidatePath(`/app/lists/${listId}`);
}

export async function createPersonalIngredient(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const unit = (String(formData.get("unit") || "unit") === "kg" ? "kg" : "unit") as IngredientUnit;
  const store = String(formData.get("store") || "");
  const price = String(formData.get("price") ?? "").replace(",", ".").trim();
  const { supabase, householdId } = await ctx();
  if (!householdId || !name) return;
  const ids = await ensureIngredients(supabase, householdId, [{ name, qtyUnit: unit === "kg" ? "g" : "u" }]);
  const id = ids.get(name.toLowerCase())?.id;
  if (id && store && price && !Number.isNaN(Number(price))) {
    await supabase
      .from("ingredient_prices")
      .upsert({ household_id: householdId, ingredient_id: id, store, price: Number(price) }, { onConflict: "ingredient_id,store,household_id" });
  }
  revalidatePath("/app/lists/ingredients");
}

export async function deleteIngredient(id: string) {
  const { supabase } = await ctx();
  await supabase.from("ingredients").delete().eq("id", id);
  revalidatePath("/app/lists/ingredients");
}

/** Sets (or clears, with an empty value) the household's personal price, overriding the global one. */
export async function setIngredientPrice(ingredientId: string, store: string, value: string) {
  const raw = value.replace(",", ".").replace("€", "").trim();
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  if (raw === "") {
    await supabase.from("ingredient_prices").delete().eq("ingredient_id", ingredientId).eq("store", store).eq("household_id", householdId);
  } else if (!Number.isNaN(Number(raw))) {
    await supabase
      .from("ingredient_prices")
      .upsert({ household_id: householdId, ingredient_id: ingredientId, store, price: Number(raw) }, { onConflict: "ingredient_id,store,household_id" });
  }
  revalidatePath("/app/lists/ingredients");
}

export async function deleteList(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("lists").delete().eq("id", listId);
  revalidatePath("/app/lists");
  redirect("/app/lists");
}

export async function addListItem(listId: string, formData: FormData) {
  const label = String(formData.get("label") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  if (!label) return;
  const { supabase } = await ctx();
  const { count } = await supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", listId);
  await supabase.from("list_items").insert({ list_id: listId, label, quantity, note, position: count ?? 0 });
  revalidatePath(`/app/lists/${listId}`);
}

export async function bulkImportItems(listId: string, formData: FormData) {
  const raw = String(formData.get("bulk") || "");
  const lines = parseBulkLines(raw);
  if (lines.length === 0) return;
  const { supabase } = await ctx();
  const { count } = await supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", listId);
  const start = count ?? 0;
  await supabase.from("list_items").insert(lines.map((label, i) => ({ list_id: listId, label, position: start + i })));
  revalidatePath(`/app/lists/${listId}`);
}

export async function toggleListItem(listId: string, itemId: string, checked: boolean) {
  const { supabase } = await ctx();
  await supabase.from("list_items").update({ checked }).eq("id", itemId);
  revalidatePath(`/app/lists/${listId}`);
}

export async function deleteListItem(listId: string, itemId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("id", itemId);
  revalidatePath(`/app/lists/${listId}`);
}

export async function clearCheckedItems(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("list_id", listId).eq("checked", true);
  revalidatePath(`/app/lists/${listId}`);
}

export async function addItemLocation(formData: FormData) {
  const itemLabel = String(formData.get("item_label") || "").trim();
  const storeName = String(formData.get("store_name") || "").trim();
  const note = String(formData.get("note") || "").trim() || null;
  if (!itemLabel || !storeName) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("item_locations").insert({ household_id: householdId, item_label: itemLabel, store_name: storeName, note });
  revalidatePath("/app/lists");
}

export async function deleteItemLocation(id: string) {
  const { supabase } = await ctx();
  await supabase.from("item_locations").delete().eq("id", id);
  revalidatePath("/app/lists");
}
