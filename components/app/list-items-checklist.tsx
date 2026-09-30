"use client";

import { useState, useTransition } from "react";
import { toggleListItem, deleteListItem, updateListItemQty } from "@/app/app/lists/actions";
import { cx, formatEUR } from "@/lib/utils";
import type { ListItem } from "@/lib/types";

type Item = ListItem & { store?: string };

export function ListItemsChecklist({ listId, items }: { listId: string; items: Item[] }) {
  if (items.length === 0) return <p className="text-sm text-stone-400">Aucun article. Ajoute-en un ci-dessous.</p>;

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <Row key={item.id} listId={listId} item={item} />
      ))}
    </div>
  );
}

function unitsFor(u: string | null) {
  if (u === "g" || u === "kg") return [{ v: "g", l: "g" }, { v: "kg", l: "kg" }];
  if (u === "ml" || u === "l") return [{ v: "ml", l: "ml" }, { v: "l", l: "L" }];
  return [{ v: "u", l: "pièce(s)" }];
}

function Row({ listId, item }: { listId: string; item: Item }) {
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [qty, setQty] = useState(item.qty ? String(item.qty).replace(".", ",") : "");
  const [unit, setUnit] = useState(item.qty_unit ?? "u");
  const save = () => {
    const n = Number(qty.replace(",", "."));
    setEditing(false);
    if (!Number.isFinite(n) || n <= 0) return;
    startTransition(() => updateListItemQty(listId, item.id, n, unit));
  };

  return (
    <div className={cx("flex items-center gap-3 rounded-xl p-2 transition hover:bg-stone-50", isPending && "opacity-60")}>
      <input
        type="checkbox"
        defaultChecked={item.checked}
        onChange={(e) => startTransition(() => toggleListItem(listId, item.id, e.target.checked))}
        className="h-4 w-4 shrink-0 rounded border-stone-300 text-brand-600 focus:ring-brand-400"
      />
      <div className="min-w-0 flex-1">
        <p className={cx("truncate text-sm font-medium text-stone-800", item.checked && "text-stone-400 line-through")}>
          {item.label}
          {item.count > 1 && <span className="ml-1.5 rounded-md bg-stone-100 px-1.5 text-xs font-semibold text-stone-600">×{item.count}</span>}
          {item.qty && !editing && (
            <button type="button" onClick={() => setEditing(true)} title="Modifier la quantité" className="ml-2 rounded-md px-1.5 text-xs font-normal text-stone-400 underline decoration-dotted underline-offset-2 hover:bg-stone-100 hover:text-stone-700">
              {item.quantity}
            </button>
          )}
          {!item.qty && item.quantity && <span className="ml-2 text-xs font-normal text-stone-400">{item.quantity}</span>}
        </p>
        {editing && (
          <div className="mt-1 flex items-center gap-1.5">
            <input value={qty} onChange={(e) => setQty(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); save(); } if (e.key === "Escape") setEditing(false); }} inputMode="decimal" className="input w-20 py-1 text-right text-xs" autoFocus aria-label="Quantité" />
            <select value={unit} onChange={(e) => setUnit(e.target.value)} className="input w-24 py-1 text-xs">
              {unitsFor(item.qty_unit).map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <button type="button" onClick={save} className="btn-primary px-2.5 py-1 text-xs">OK</button>
            <button type="button" onClick={() => setEditing(false)} className="text-xs text-stone-400">Annuler</button>
          </div>
        )}
        {(item.note || item.store || item.source) && (
          <p className="truncate text-xs text-stone-400">
            {item.store && <span className="mr-2">📍 {item.store}</span>}
            {item.source && <span className="mr-2">🍽️ {item.source}</span>}
            {item.note}
          </p>
        )}
      </div>
      {item.price !== null && item.price !== undefined && (
        <span className={cx("shrink-0 text-sm font-medium", item.checked ? "text-stone-300" : "text-stone-600")}>{formatEUR(Number(item.price) * (item.count || 1))}</span>
      )}
      <button
        onClick={() => startTransition(() => deleteListItem(listId, item.id))}
        className="rounded-lg px-2 py-1 text-xs text-stone-300 hover:bg-stone-100 hover:text-rose-600"
      >
        ✕
      </button>
    </div>
  );
}
