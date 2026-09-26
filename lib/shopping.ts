// Pure shopping helpers shared by server actions and client components.

export const STORES = ["Leclerc", "Lidl", "Carrefour City", "Monoprix", "Franprix"] as const;

export type IngredientUnit = "unit" | "kg" | "l";
export type QtyUnit = "g" | "kg" | "ml" | "l" | "u";

export interface CatalogIngredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  personal: boolean;
}

export const QTY_UNITS: { v: QtyUnit; l: string }[] = [
  { v: "u", l: "unité(s)" },
  { v: "g", l: "g" },
  { v: "kg", l: "kg" },
  { v: "ml", l: "ml" },
  { v: "l", l: "L" },
];

export const defaultQtyUnit = (unit: IngredientUnit | undefined): QtyUnit => (unit === "kg" ? "g" : unit === "l" ? "ml" : "u");
export const priceSuffix = (unit: IngredientUnit) => (unit === "kg" ? "€/kg" : unit === "l" ? "€/L" : "€/u");
export const unitForQty = (u: string | null | undefined): IngredientUnit => (u === "g" || u === "kg" ? "kg" : u === "ml" || u === "l" ? "l" : "unit");

/** Indicative cost of a quantity given the ingredient's reference price (per kg or per unit). */
export function lineCost(qty: number | null | undefined, qtyUnit: string | null | undefined, unit: IngredientUnit, price: number | null | undefined) {
  if (price === null || price === undefined) return null;
  const q = qty && qty > 0 ? qty : 1;
  const u = qtyUnit || defaultQtyUnit(unit);
  if (unit === "kg") {
    if (u === "g") return (q / 1000) * price;
    if (u === "kg") return q * price;
    return null;
  }
  if (unit === "l") {
    if (u === "ml") return (q / 1000) * price;
    if (u === "l") return q * price;
    return null;
  }
  return u === "u" ? q * price : price;
}

export function formatQty(qty: number | null | undefined, qtyUnit: string | null | undefined) {
  if (!qty) return null;
  const n = Number(qty);
  if (qtyUnit === "g" && n >= 1000) return `${+(n / 1000).toFixed(2)} kg`;
  if (qtyUnit === "ml" && n >= 1000) return `${+(n / 1000).toFixed(2)} L`;
  if (qtyUnit === "l") return `${+n.toFixed(2)} L`;
  return `${+n.toFixed(2)} ${qtyUnit === "u" ? (n > 1 ? "unités" : "unité") : qtyUnit ?? ""}`.trim();
}

/** Personal (household) price overrides the global reference price. */
export function priceMap(rows: { ingredient_id: string; store: string; price: number; household_id: string | null }[], store: string | null) {
  const map = new Map<string, number>();
  if (!store) return map;
  for (const r of rows.filter((r) => r.store === store && r.household_id === null)) map.set(r.ingredient_id, Number(r.price));
  for (const r of rows.filter((r) => r.store === store && r.household_id !== null)) map.set(r.ingredient_id, Number(r.price));
  return map;
}

export interface CompareLine { ingredient_id: string | null; qty: number | null; qty_unit: string | null; count: number | null }

/** Total of the given lines at every store (lines without ingredient are ignored; unpriced ones are counted as missing). */
export function compareStores(
  lines: CompareLine[],
  rows: { ingredient_id: string; store: string; price: number; household_id: string | null }[],
  unitOf: Map<string, IngredientUnit>,
) {
  return STORES.map((store) => {
    const pm = priceMap(rows, store);
    let total = 0;
    let missing = 0;
    for (const l of lines) {
      if (!l.ingredient_id) continue;
      const c = l.ingredient_id ? lineCost(l.qty, l.qty_unit, unitOf.get(l.ingredient_id) ?? "unit", pm.get(l.ingredient_id)) : null;
      if (c === null) missing++;
      else total += c * (l.count || 1);
    }
    return { store, total, missing };
  }).sort((a, b) => a.missing - b.missing || a.total - b.total);
}
