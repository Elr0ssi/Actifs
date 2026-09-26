import type { createClient } from "@/lib/supabase/server";
import { unitForQty, type CatalogIngredient, type IngredientUnit, type QtyUnit } from "@/lib/shopping";

type Client = ReturnType<typeof createClient>;

export interface PickedIngredient {
  id?: string | null;
  name: string;
  qty?: number | null;
  qtyUnit?: QtyUnit;
  /** Personal price (for the current store) entered when creating a new ingredient. */
  price?: number | null;
}

export function parsePicked(raw: FormDataEntryValue | null): PickedIngredient[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((p) => p && String(p.name ?? "").trim()) : [];
  } catch {
    return [];
  }
}

type PriceRow = { ingredient_id: string; store: string; price: number; household_id: string | null };
const PAGE = 1000;

/** PostgREST caps responses at 1000 rows: fetch pages in parallel until one comes back short. */
async function loadAllPrices(supabase: Client) {
  const rows: PriceRow[] = [];
  for (let start = 0; ; start += 4 * PAGE) {
    const pages = await Promise.all(
      [0, 1, 2, 3].map((k) =>
        supabase
          .from("ingredient_prices")
          .select("ingredient_id, store, price, household_id")
          .order("id")
          .range(start + k * PAGE, start + (k + 1) * PAGE - 1),
      ),
    );
    for (const p of pages) rows.push(...((p.data ?? []) as PriceRow[]));
    if (pages.some((p) => (p.data?.length ?? 0) < PAGE)) return { data: rows };
  }
}

/** Global catalog + the household's personal ingredients (RLS returns both). */
export async function loadCatalog(supabase: Client) {
  const [{ data: ingredients }, { data: prices }] = await Promise.all([
    supabase.from("ingredients").select("id, name, unit, household_id").order("name"),
    loadAllPrices(supabase),
  ]);
  const catalog: CatalogIngredient[] = (ingredients ?? []).map((i) => ({
    id: i.id,
    name: i.name,
    unit: i.unit as IngredientUnit,
    personal: i.household_id !== null,
  }));
  return {
    catalog,
    prices: (prices ?? []) as { ingredient_id: string; store: string; price: number; household_id: string | null }[],
  };
}

/** Resolves names to catalog entries (global first), creating missing ones as personal ingredients. */
export async function ensureIngredients(supabase: Client, householdId: string, items: { name: string; qtyUnit?: QtyUnit }[]) {
  const { data: existing } = await supabase.from("ingredients").select("id, name, unit, household_id");
  const byName = new Map<string, { id: string; unit: IngredientUnit }>();
  for (const i of [...(existing ?? [])].sort((a) => (a.household_id === null ? 1 : -1))) {
    byName.set(i.name.toLowerCase(), { id: i.id, unit: i.unit as IngredientUnit });
  }
  const missing = new Map<string, { household_id: string; name: string; unit: IngredientUnit }>();
  for (const it of items) {
    const key = it.name.trim().toLowerCase();
    if (!key || byName.has(key) || missing.has(key)) continue;
    missing.set(key, { household_id: householdId, name: it.name.trim(), unit: unitForQty(it.qtyUnit) });
  }
  if (missing.size) {
    const { data: created } = await supabase.from("ingredients").insert([...missing.values()]).select("id, name, unit");
    for (const c of created ?? []) byName.set(c.name.toLowerCase(), { id: c.id, unit: c.unit as IngredientUnit });
  }
  return byName;
}
