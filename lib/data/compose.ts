import type { createClient } from "@/lib/supabase/server";
import { buildMatcher, parseIngredientLine, toCatalogQty } from "@/lib/ingredient-parse";
import { roundToPack } from "@/lib/packs";
import { lineCost, priceMap, type CatalogIngredient, type IngredientUnit, type QtyUnit } from "@/lib/shopping";

type Client = ReturnType<typeof createClient>;

export interface ComposeLine {
  key: string;
  label: string;
  ingredient_id: string | null;
  qty: number | null;
  unit: QtyUnit;
  /** Besoin réel avant arrondi au conditionnement vendu (même unité que qty). */
  need: number | null;
  /** Conditionnement retenu, ex. « filet de 1 kg ». */
  pack: string | null;
  /** Prix de référence de l'ingrédient chez l'enseigne (par kg, L ou pièce), pour recalculer quand on change la quantité. */
  unitPrice: number | null;
  catalogUnit: IngredientUnit | null;
  cost: number | null;
  sources: string[];
}

export interface RecipeMeta {
  id: string;
  name: string;
  base: number;
  servings: number;
}

type ItemRow = { id: string; label: string; qty: number | null; qty_unit: string | null; ingredient_id: string | null; position: number };
type RecipeRow = { id: string; name: string; servings: number | null; recipe_items: ItemRow[] };

async function loadCatalogRows(supabase: Client) {
  const { data } = await supabase.from("ingredients").select("id, name, unit, household_id");
  return (data ?? []).map((i) => ({ id: i.id as string, name: i.name as string, unit: i.unit as IngredientUnit, personal: i.household_id !== null })) as CatalogIngredient[];
}

/**
 * Les recettes importées avant l'analyse des quantités ont des lignes en texte libre ("4 cuisses de poulet", sans quantité ni prix).
 * On les analyse une fois et on enregistre le résultat, pour que les quantités et les prix soient pris en compte.
 */
export async function repairRecipeItems(supabase: Client, rows: RecipeRow[], catalog: CatalogIngredient[]) {
  const match = buildMatcher(catalog);
  const updates: PromiseLike<unknown>[] = [];
  for (const r of rows) {
    for (const it of r.recipe_items) {
      if (it.qty || it.ingredient_id) continue;
      const p = parseIngredientLine(it.label);
      const c = match(p.name);
      if (p.qty === null && !c) continue;
      it.label = p.name;
      it.qty = p.qty;
      it.qty_unit = p.qty === null ? null : p.unit;
      it.ingredient_id = c?.id ?? null;
      updates.push(supabase.from("recipe_items").update({ label: it.label, qty: it.qty, qty_unit: it.qty_unit, ingredient_id: it.ingredient_id }).eq("id", it.id).then());
    }
  }
  await Promise.all(updates);
}

/** Lignes de courses (fusionnées) pour des recettes choisies avec un nombre de personnes chacune. `sign` = -1 pour retirer. */
export async function buildRecipeLines(
  supabase: Client,
  recipes: { id: string; servings: number }[],
  store: string | null,
  sign = 1
): Promise<{ lines: ComposeLine[]; metas: RecipeMeta[] }> {
  if (!recipes.length) return { lines: [], metas: [] };
  const [{ data }, catalog, { data: priceRows }] = await Promise.all([
    supabase.from("recipes").select("id, name, servings, recipe_items(id, label, qty, qty_unit, ingredient_id, position)").in("id", recipes.map((r) => r.id)),
    loadCatalogRows(supabase),
    supabase.from("ingredient_prices").select("ingredient_id, store, price, household_id").eq("store", store ?? ""),
  ]);
  const rows = (data ?? []) as unknown as RecipeRow[];
  await repairRecipeItems(supabase, rows, catalog);
  const byId = new Map(catalog.map((c) => [c.id, c]));
  const prices = priceMap((priceRows ?? []) as Parameters<typeof priceMap>[0], store);

  // Cumul en unités « de base » : g, ml, pièces.
  type Acc = { label: string; ingredient_id: string | null; qty: number | null; unit: QtyUnit; sources: Set<string> };
  const acc = new Map<string, Acc>();
  const metas: RecipeMeta[] = [];
  for (const r of rows) {
    const want = recipes.find((x) => x.id === r.id);
    const base = r.servings && r.servings > 0 ? r.servings : 4;
    const servings = Math.max(1, want?.servings ?? base);
    metas.push({ id: r.id, name: r.name, base, servings });
    const factor = (servings / base) * sign;
    for (const it of [...r.recipe_items].sort((a, b) => a.position - b.position)) {
      let qty = it.qty ? Number(it.qty) : null;
      let unit = ((it.qty_unit as QtyUnit | null) ?? "u") as QtyUnit;
      if (qty !== null) {
        if (unit === "kg") { qty *= 1000; unit = "g"; }
        else if (unit === "l") { qty *= 1000; unit = "ml"; }
        qty *= factor;
      }
      const key = `${it.ingredient_id ?? it.label.trim().toLowerCase()}|${unit}`;
      const cur = acc.get(key) ?? { label: it.label.trim(), ingredient_id: it.ingredient_id, qty: null, unit, sources: new Set<string>() };
      if (qty !== null) cur.qty = (cur.qty ?? 0) + qty;
      cur.sources.add(r.name);
      acc.set(key, cur);
    }
  }

  const lines: ComposeLine[] = [];
  for (const [key, a] of acc) {
    const c = a.ingredient_id ? byId.get(a.ingredient_id) : undefined;
    let qty = a.qty;
    let unit = a.unit;
    if (c && qty !== null) {
      const neg = qty < 0;
      const conv = toCatalogQty(Math.abs(qty), unit, a.label, c);
      qty = neg ? -(conv.qty ?? 0) : conv.qty;
      unit = conv.unit;
    }
    if (qty !== null) qty = unit === "u" ? Math.round(qty * 100) / 100 : Math.round(qty * 100) / 100;
    // Besoin brut, puis arrondi au format vendu en magasin (1 kg d'oignons, paquet de 500 g de pâtes…).
    const need = qty;
    let pack: string | null = null;
    if (qty !== null && c && sign > 0) {
      const r = roundToPack(qty, unit, c.name);
      qty = r.qty;
      pack = r.label;
    }
    const unitPrice = c ? prices.get(c.id) ?? null : null;
    lines.push({
      key,
      label: c && !c.personal && a.label.length < 3 ? c.name : a.label,
      ingredient_id: a.ingredient_id,
      qty,
      unit,
      need,
      pack,
      unitPrice,
      catalogUnit: c?.unit ?? null,
      cost: c ? lineCost(qty, unit, c.unit, unitPrice) : null,
      sources: [...a.sources],
    });
  }
  return { lines, metas };
}
