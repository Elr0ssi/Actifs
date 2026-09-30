"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ensureIngredients, parsePicked } from "@/lib/data/ingredients";
import { defaultQtyUnit, formatQty, lineCost, priceMap, type IngredientUnit } from "@/lib/shopping";
import { RECIPES } from "@/lib/marketing/recipes";
import { buildRecipeLines, type ComposeLine } from "@/lib/data/compose";

const ICON_BY_NAME = new Map(RECIPES.map((r) => [r.name.toLowerCase(), r.icon]));

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

/** Les listes alimentent aussi les widgets du tableau de bord : on rafraîchit les deux. */
function refresh() {
  revalidatePath("/app/lists", "layout");
  revalidatePath("/app");
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
  refresh();
  if (data?.id) redirect(`/app/lists/${data.id}${shopping ? "?compose=1" : ""}`);
}

async function storePrices(supabase: ReturnType<typeof createClient>, store: string | null) {
  const { data } = await supabase.from("ingredient_prices").select("ingredient_id, store, price, household_id").eq("store", store ?? "");
  return priceMap((data ?? []) as Parameters<typeof priceMap>[0], store);
}

type FinalLine = { label: string; ingredient_id: string | null; qty: number | null; unit: string | null; source: string };

/** Fusionne des lignes dans une liste (même ingrédient + même unité). `sign` = -1 pour retirer une quantité. */
async function applyLines(supabase: ReturnType<typeof createClient>, listId: string, lines: FinalLine[], store: string | null, sign = 1) {
  const [{ data: existing }, prices, { data: units }] = await Promise.all([
    supabase.from("list_items").select("*").eq("list_id", listId),
    storePrices(supabase, store),
    supabase.from("ingredients").select("id, unit").in("id", [...new Set(lines.map((l) => l.ingredient_id).filter((x): x is string => !!x))]),
  ]);
  const unitOf = new Map((units ?? []).map((u) => [u.id as string, u.unit as IngredientUnit]));
  const items = [...(existing ?? [])];
  let position = items.length;
  for (const line of lines) {
    const match = items.find(
      (i) => (i.ingredient_id ? i.ingredient_id === line.ingredient_id : String(i.label).toLowerCase() === line.label.trim().toLowerCase()) && (i.qty_unit ?? null) === (line.unit ?? null)
    );
    const add = line.qty === null || line.qty === undefined ? (sign > 0 ? 1 : 0) : line.qty * sign;
    const qty = (match?.qty ? Number(match.qty) : 0) + add;
    if (match && qty <= 0.0001) {
      await supabase.from("list_items").delete().eq("id", match.id);
      items.splice(items.indexOf(match), 1);
      continue;
    }
    if (qty <= 0) continue;
    const unit = unitOf.get(line.ingredient_id ?? "") ?? "unit";
    const price = line.ingredient_id ? lineCost(qty, line.unit, unit, prices.get(line.ingredient_id)) : null;
    const row = { qty, qty_unit: line.unit, quantity: formatQty(qty, line.unit), price, count: 1 };
    if (match) {
      const source = sign > 0 ? [...new Set([...(match.source ? String(match.source).split(", ") : []), line.source].filter(Boolean))].join(", ") : match.source;
      await supabase.from("list_items").update({ ...row, ...(sign > 0 ? { checked: false } : {}), source }).eq("id", match.id);
      Object.assign(match, row, { source });
    } else {
      const { data: inserted } = await supabase.from("list_items").insert({ ...row, list_id: listId, label: line.label.trim(), ingredient_id: line.ingredient_id, source: line.source, position: position++ }).select("*").single();
      if (inserted) items.push(inserted);
    }
  }
}

/** Aperçu éditable : quantités calculées pour le nombre de personnes choisi, avant d'ajouter quoi que ce soit à la liste. */
export async function previewCompose(listId: string, recipes: { id: string; servings: number }[]) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return { lines: [] as ComposeLine[] };
  const { data: list } = await supabase.from("lists").select("store").eq("id", listId).single();
  const { lines } = await buildRecipeLines(supabase, recipes, list?.store ?? null);
  return { lines };
}

/** Ajoute les recettes choisies (pour N personnes chacune, quantités éventuellement corrigées à la main) et les produits en plus. */
export async function composeList(listId: string, formData: FormData) {
  const recipes: { id: string; servings: number }[] = (JSON.parse(String(formData.get("recipes") || "[]")) as { id: string; servings?: number; count?: number }[]).map((r) => ({ id: r.id, servings: Math.max(1, Math.round(r.servings ?? r.count ?? 1)) }));
  let reviewed: { label: string; ingredient_id: string | null; qty: number | null; unit: string | null; sources: string[] }[] | null = null;
  try {
    const raw = JSON.parse(String(formData.get("lines") || "null"));
    if (Array.isArray(raw)) reviewed = raw;
  } catch {
    reviewed = null;
  }
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

  const built = await buildRecipeLines(supabase, recipes, store);
  const recipeLines: FinalLine[] = (reviewed ?? built.lines).map((l) => ({
    label: l.label,
    ingredient_id: l.ingredient_id,
    qty: l.qty === null || l.qty === undefined ? null : Number(l.qty),
    unit: ("unit" in l ? (l as ComposeLine).unit : (l as { unit: string | null }).unit) ?? null,
    source: (l.sources ?? []).join(", "),
  }));
  const extraLines: FinalLine[] = extras.map((e) => ({ label: e.name, ingredient_id: ids.get(e.name.trim().toLowerCase())?.id ?? null, qty: e.qty ?? 1, unit: e.qtyUnit ?? null, source: "Extra" }));
  await applyLines(supabase, listId, [...recipeLines, ...extraLines], store);

  if (built.metas.length) {
    const { data: known } = await supabase.from("list_recipes").select("id, recipe_id, count, servings").eq("list_id", listId);
    for (const m of built.metas) {
      const prev = (known ?? []).find((k) => k.recipe_id === m.id);
      if (prev) await supabase.from("list_recipes").update({ servings: (prev.servings ?? prev.count * m.base) + m.servings, count: 1 }).eq("id", prev.id);
      else await supabase.from("list_recipes").insert({ list_id: listId, recipe_id: m.id, name: m.name, icon: ICON_BY_NAME.get(m.name.toLowerCase()) ?? null, count: 1, servings: m.servings });
    }
  }
  refresh();
  redirect(`/app/lists/${listId}`);
}

/** Change le nombre de personnes d'une recette déjà dans la liste : les quantités de ses ingrédients sont ajustées d'autant. */
export async function setListRecipePeople(listId: string, listRecipeId: string, people: number) {
  const target = Math.min(100, Math.max(1, Math.round(people)));
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const [{ data: row }, { data: list }] = await Promise.all([
    supabase.from("list_recipes").select("id, recipe_id, count, servings").eq("id", listRecipeId).eq("list_id", listId).single(),
    supabase.from("lists").select("store").eq("id", listId).single(),
  ]);
  if (!row?.recipe_id) return;
  const { data: recipe } = await supabase.from("recipes").select("servings").eq("id", row.recipe_id).single();
  const base = recipe?.servings && recipe.servings > 0 ? recipe.servings : 4;
  const old = row.servings ?? row.count * base;
  if (target === old) return;
  const { lines } = await buildRecipeLines(supabase, [{ id: row.recipe_id, servings: Math.abs(target - old) }], list?.store ?? null, target > old ? 1 : -1);
  await applyLines(supabase, listId, lines.map((l) => ({ label: l.label, ingredient_id: l.ingredient_id, qty: l.qty, unit: l.unit, source: l.sources.join(", ") })), list?.store ?? null, 1);
  await supabase.from("list_recipes").update({ servings: target, count: 1 }).eq("id", row.id);
  refresh();
}

/** Corrige à la main la quantité d'un article de la liste (le prix est recalculé). */
export async function updateListItemQty(listId: string, itemId: string, qty: number, unit: string) {
  const q = Number(qty);
  if (!Number.isFinite(q) || q <= 0) return;
  const { supabase } = await ctx();
  const [{ data: item }, { data: list }] = await Promise.all([
    supabase.from("list_items").select("ingredient_id").eq("id", itemId).eq("list_id", listId).single(),
    supabase.from("lists").select("store").eq("id", listId).single(),
  ]);
  if (!item) return;
  let price: number | null = null;
  if (item.ingredient_id) {
    const [{ data: ing }, prices] = await Promise.all([supabase.from("ingredients").select("unit").eq("id", item.ingredient_id).single(), storePrices(supabase, list?.store ?? null)]);
    price = lineCost(q, unit, (ing?.unit as IngredientUnit) ?? "unit", prices.get(item.ingredient_id));
  }
  await supabase.from("list_items").update({ qty: q, qty_unit: unit, quantity: formatQty(q, unit), price }).eq("id", itemId);
  refresh();
}

/** Nombre de personnes proposé par défaut pour toutes les recettes du foyer. */
export async function setDefaultServings(n: number) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("households").update({ default_servings: Math.min(20, Math.max(1, Math.round(n))) }).eq("id", householdId);
  revalidatePath("/app", "layout");
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
  refresh();
}

export async function setListArchived(listId: string, archived: boolean) {
  const { supabase } = await ctx();
  await supabase.from("lists").update({ archived }).eq("id", listId);
  refresh();
}

export async function finishShopping(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("lists").update({ archived: true }).eq("id", listId);
  refresh();
  redirect(`/app/lists/${listId}?done=1#comparatif`);
}

export async function createPersonalIngredient(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const rawUnit = String(formData.get("unit") || "unit");
  const unit = (rawUnit === "kg" || rawUnit === "l" ? rawUnit : "unit") as IngredientUnit;
  const store = String(formData.get("store") || "");
  const price = String(formData.get("price") ?? "").replace(",", ".").trim();
  const { supabase, householdId } = await ctx();
  if (!householdId || !name) return;
  const ids = await ensureIngredients(supabase, householdId, [{ name, qtyUnit: defaultQtyUnit(unit) }]);
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
  refresh();
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
  refresh();
}

export async function toggleListItem(listId: string, itemId: string, checked: boolean) {
  const { supabase } = await ctx();
  await supabase.from("list_items").update({ checked }).eq("id", itemId);
  refresh();
}

export async function deleteListItem(listId: string, itemId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("id", itemId);
  refresh();
}

export async function clearCheckedItems(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("list_id", listId).eq("checked", true);
  refresh();
}

export async function addItemLocation(formData: FormData) {
  const itemLabel = String(formData.get("item_label") || "").trim();
  const storeName = String(formData.get("store_name") || "").trim();
  const note = String(formData.get("note") || "").trim() || null;
  if (!itemLabel || !storeName) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("item_locations").insert({ household_id: householdId, item_label: itemLabel, store_name: storeName, note });
  refresh();
}

export async function deleteItemLocation(id: string) {
  const { supabase } = await ctx();
  await supabase.from("item_locations").delete().eq("id", id);
  refresh();
}
