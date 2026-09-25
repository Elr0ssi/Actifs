// Pure shopping helpers shared by server actions and client components.

export const STORES = ["Leclerc", "Lidl", "Carrefour", "Carrefour City", "Monoprix", "Franprix"] as const;

export type IngredientUnit = "unit" | "kg";
export type QtyUnit = "g" | "kg" | "u";

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
];

export const defaultQtyUnit = (unit: IngredientUnit | undefined): QtyUnit => (unit === "kg" ? "g" : "u");
export const priceSuffix = (unit: IngredientUnit) => (unit === "kg" ? "€/kg" : "€/u");

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
  return u === "u" ? q * price : price;
}

export function formatQty(qty: number | null | undefined, qtyUnit: string | null | undefined) {
  if (!qty) return null;
  const n = Number(qty);
  if (qtyUnit === "g" && n >= 1000) return `${+(n / 1000).toFixed(2)} kg`;
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
