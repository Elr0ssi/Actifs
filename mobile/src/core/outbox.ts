import type { AppData, Row, TableName } from "./model";

/**
 * File d'attente d'écritures (hors-ligne). Chaque opération est IDEMPOTENTE :
 *  - `upsert` : ligne complète avec un identifiant généré côté appareil → un rejeu ne crée jamais de doublon ;
 *  - `patch`  : seuls les champs modifiés sont envoyés (fusion champ par champ avec le site) ;
 *  - `delete` : supprimer deux fois est sans effet.
 * Règle de conflit : dernier écrit gagne, champ par champ ; une suppression l'emporte.
 */
export type Op =
  | { id: string; at: number; kind: "upsert"; table: TableName; row: Row; onConflict?: string }
  | { id: string; at: number; kind: "patch"; table: TableName; match: Row; patch: Row }
  | { id: string; at: number; kind: "delete"; table: TableName; match: Row };

/** Clés qui identifient une ligne pour chaque table (contraintes d'unicité du schéma existant). */
export const KEYS: Partial<Record<TableName, string[]>> = {
  routine_logs: ["routine_id", "log_date", "user_id"],
  balance_entries: ["household_id", "entry_date", "account"],
};
const keysOf = (table: TableName) => KEYS[table] ?? ["id"];

const same = (row: Row, match: Row) => Object.entries(match).every(([k, v]) => row[k] === v);

export const conflictTarget = (table: TableName) => (KEYS[table] ? KEYS[table]!.join(",") : undefined);

/** Applique une opération sur l'état local (affichage immédiat, avant confirmation du serveur). */
export function applyOp(data: AppData, op: Op): AppData {
  const rows = data.tables[op.table];
  let next: Row[];
  if (op.kind === "upsert") {
    const keys = keysOf(op.table);
    const key = Object.fromEntries(keys.map((k) => [k, op.row[k]]));
    const hit = rows.findIndex((r) => same(r, key));
    next = hit >= 0 ? rows.map((r, i) => (i === hit ? { ...r, ...op.row } : r)) : [...rows, op.row];
  } else if (op.kind === "patch") {
    next = rows.map((r) => (same(r, op.match) ? { ...r, ...op.patch } : r));
  } else {
    next = rows.filter((r) => !same(r, op.match));
    // suppression en cascade locale (le serveur le fait par contrainte)
    if (op.table === "lists" && op.match.id) return { ...data, tables: { ...data.tables, lists: next, list_items: data.tables.list_items.filter((i) => i.list_id !== op.match.id), list_recipes: data.tables.list_recipes.filter((i) => i.list_id !== op.match.id) } };
    if (op.table === "routines" && op.match.id) return { ...data, tables: { ...data.tables, routines: next, routine_logs: data.tables.routine_logs.filter((l) => l.routine_id !== op.match.id) } };
    if (op.table === "recipes" && op.match.id) return { ...data, tables: { ...data.tables, recipes: next, recipe_items: data.tables.recipe_items.filter((i) => i.recipe_id !== op.match.id) } };
  }
  return { ...data, tables: { ...data.tables, [op.table]: next } };
}

export const applyOps = (data: AppData, ops: Op[]) => ops.reduce(applyOp, data);

/**
 * Réduit la file sans changer son résultat final :
 *  - des patchs consécutifs de la même ligne sont fusionnés ;
 *  - tout upsert/patch d'une ligne qui est supprimée plus tard est inutile (la suppression est conservée,
 *    car la ligne a pu déjà exister sur le serveur).
 */
export function compact(ops: Op[]): Op[] {
  const merged: Op[] = [];
  for (const op of ops) {
    const last = merged[merged.length - 1];
    if (last && last.kind === "patch" && op.kind === "patch" && last.table === op.table && JSON.stringify(last.match) === JSON.stringify(op.match)) {
      merged[merged.length - 1] = { ...last, at: op.at, patch: { ...last.patch, ...op.patch } };
    } else merged.push(op);
  }
  const deletedLater = (op: Op, i: number) => {
    const id = op.kind === "upsert" ? op.row.id : op.kind === "patch" ? op.match.id : undefined;
    if (!id) return false;
    return merged.slice(i + 1).some((later) => later.kind === "delete" && later.table === op.table && later.match.id === id);
  };
  return merged.filter((op, i) => op.kind === "delete" || !deletedLater(op, i));
}
