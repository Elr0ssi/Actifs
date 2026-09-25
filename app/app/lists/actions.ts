"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { ensureIngredients, parsePicked } from "@/lib/data/ingredients";

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
      store: shopping ? String(formData.get("store") || "").trim() || null : null,
      created_by: userId,
    })
    .select("id")
    .single();
  revalidatePath("/app/lists");
  if (data?.id) redirect(`/app/lists/${data.id}${shopping ? "?compose=1" : ""}`);
}

async function pricesFor(supabase: ReturnType<typeof createClient>, store: string | null, ingredientIds: string[]) {
  if (!store || !ingredientIds.length) return new Map<string, number>();
  const { data } = await supabase.from("ingredient_prices").select("ingredient_id, price").eq("store", store).in("ingredient_id", ingredientIds);
  return new Map((data ?? []).map((p) => [p.ingredient_id as string, Number(p.price)]));
}

/** Adds the chosen recipes (× servings count) and extra ingredients, merging duplicates with what the list already holds. */
export async function composeList(listId: string, formData: FormData) {
  const recipes: { id: string; count: number }[] = JSON.parse(String(formData.get("recipes") || "[]"));
  const extras = parsePicked(formData.get("extras"));
  const { supabase, householdId } = await ctx();
  if (!householdId) return;

  const [{ data: list }, { data: existing }, { data: recipeRows }, { data: catalog }] = await Promise.all([
    supabase.from("lists").select("store").eq("id", listId).single(),
    supabase.from("list_items").select("*").eq("list_id", listId),
    recipes.length
      ? supabase.from("recipes").select("id, name, recipe_items(label, quantity, ingredient_id)").in("id", recipes.map((r) => r.id))
      : Promise.resolve({ data: [] as { id: string; name: string; recipe_items: { label: string; quantity: string | null; ingredient_id: string | null }[] }[] }),
    supabase.from("ingredients").select("id, name").eq("household_id", householdId),
  ]);
  const catalogByName = new Map((catalog ?? []).map((c) => [c.name.toLowerCase(), c.id as string]));

  type Line = { label: string; ingredient_id: string | null; quantity: string | null; count: number; sources: Set<string> };
  const lines = new Map<string, Line>();
  const add = (label: string, ingredientId: string | null, quantity: string | null, count: number, source: string) => {
    const key = label.trim().toLowerCase();
    const line = lines.get(key) ?? { label: label.trim(), ingredient_id: ingredientId, quantity, count: 0, sources: new Set<string>() };
    line.count += count;
    line.ingredient_id ??= ingredientId;
    line.sources.add(source);
    lines.set(key, line);
  };
  for (const r of (recipeRows ?? []) as { id: string; name: string; recipe_items: { label: string; quantity: string | null; ingredient_id: string | null }[] }[]) {
    const count = Math.max(1, recipes.find((x) => x.id === r.id)?.count ?? 1);
    for (const it of r.recipe_items) add(it.label, it.ingredient_id, it.quantity, count, r.name);
  }
  for (const e of extras) add(e.name, e.id ?? catalogByName.get(e.name.trim().toLowerCase()) ?? null, e.quantity ?? null, 1, "Extra");

  const prices = await pricesFor(supabase, list?.store ?? null, [...lines.values()].map((l) => l.ingredient_id).filter(Boolean) as string[]);
  const current = new Map((existing ?? []).map((i) => [String(i.label).toLowerCase(), i]));
  let position = existing?.length ?? 0;

  for (const [key, line] of lines) {
    const price = line.ingredient_id ? prices.get(line.ingredient_id) ?? null : null;
    const source = [...line.sources].join(", ");
    const found = current.get(key);
    if (found) {
      await supabase
        .from("list_items")
        .update({ count: (found.count ?? 1) + line.count, checked: false, price: price ?? found.price, source: [found.source, source].filter(Boolean).join(", ") })
        .eq("id", found.id);
    } else {
      await supabase.from("list_items").insert({
        list_id: listId,
        label: line.label,
        ingredient_id: line.ingredient_id,
        quantity: line.quantity,
        count: line.count,
        price,
        source,
        position: position++,
      });
    }
  }
  revalidatePath(`/app/lists/${listId}`);
  redirect(`/app/lists/${listId}`);
}

export async function setListStore(listId: string, formData: FormData) {
  const store = String(formData.get("store") || "").trim() || null;
  const { supabase } = await ctx();
  await supabase.from("lists").update({ store }).eq("id", listId);
  const { data: items } = await supabase.from("list_items").select("id, ingredient_id").eq("list_id", listId);
  const prices = await pricesFor(supabase, store, (items ?? []).map((i) => i.ingredient_id).filter(Boolean) as string[]);
  for (const it of items ?? []) {
    await supabase.from("list_items").update({ price: it.ingredient_id ? prices.get(it.ingredient_id) ?? null : null }).eq("id", it.id);
  }
  revalidatePath(`/app/lists/${listId}`);
}

export async function setListArchived(listId: string, archived: boolean) {
  const { supabase } = await ctx();
  await supabase.from("lists").update({ archived }).eq("id", listId);
  revalidatePath("/app/lists");
  revalidatePath(`/app/lists/${listId}`);
}

export async function createIngredients(formData: FormData) {
  const names = parseBulkLines(String(formData.get("names") || "").replace(/,/g, "\n"));
  const { supabase, householdId } = await ctx();
  if (!householdId || !names.length) return;
  await ensureIngredients(supabase, householdId, names);
  revalidatePath("/app/lists/ingredients");
}

export async function deleteIngredient(id: string) {
  const { supabase } = await ctx();
  await supabase.from("ingredients").delete().eq("id", id);
  revalidatePath("/app/lists/ingredients");
}

export async function setIngredientPrice(ingredientId: string, store: string, formData: FormData) {
  const raw = String(formData.get("price") ?? "").replace(",", ".").trim();
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  if (raw === "") {
    await supabase.from("ingredient_prices").delete().eq("ingredient_id", ingredientId).eq("store", store);
  } else if (!Number.isNaN(Number(raw))) {
    await supabase
      .from("ingredient_prices")
      .upsert({ household_id: householdId, ingredient_id: ingredientId, store, price: Number(raw) }, { onConflict: "ingredient_id,store" });
  }
  revalidatePath("/app/lists/ingredients");
}

/** Lines "Ingrédient ; Enseigne ; Prix" (or tab/comma separated) — creates missing ingredients too. */
export async function importIngredientPrices(formData: FormData) {
  const rows = String(formData.get("rows") || "")
    .split("\n")
    .map((l) => l.split(/[;\t]/).map((c) => c.trim()))
    .filter((c) => c.length >= 3 && c[0] && c[1] && !Number.isNaN(Number(c[2].replace(",", ".").replace("€", ""))));
  const { supabase, householdId } = await ctx();
  if (!householdId || !rows.length) return;
  const ids = await ensureIngredients(supabase, householdId, rows.map((r) => r[0]));
  const unique = new Map(
    rows.map((r) => {
      const ingredient_id = ids.get(r[0].toLowerCase())!;
      return [`${ingredient_id}|${r[1]}`, { household_id: householdId, ingredient_id, store: r[1], price: Number(r[2].replace(",", ".").replace("€", "")) }];
    })
  );
  await supabase.from("ingredient_prices").upsert([...unique.values()], { onConflict: "ingredient_id,store" });
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
