"use client";

import { useTransition } from "react";
import { toggleListItem, deleteListItem } from "@/app/app/lists/actions";
import { cx } from "@/lib/utils";
import type { ListItem } from "@/lib/types";

type Item = ListItem & { store?: string };

export function ListItemsChecklist({ listId, items }: { listId: string; items: Item[] }) {
  if (items.length === 0) return <p className="text-sm text-slate-400">Aucun article. Ajoute-en un ci-dessous.</p>;

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <Row key={item.id} listId={listId} item={item} />
      ))}
    </div>
  );
}

function Row({ listId, item }: { listId: string; item: Item }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className={cx("flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50", isPending && "opacity-60")}>
      <input
        type="checkbox"
        defaultChecked={item.checked}
        onChange={(e) => startTransition(() => toggleListItem(listId, item.id, e.target.checked))}
        className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
      />
      <div className="min-w-0 flex-1">
        <p className={cx("truncate text-sm font-medium text-slate-800", item.checked && "text-slate-400 line-through")}>
          {item.label}
          {item.quantity && <span className="ml-2 text-xs font-normal text-slate-400">{item.quantity}</span>}
        </p>
        {(item.note || item.store) && (
          <p className="truncate text-xs text-slate-400">
            {item.store && <span className="mr-2">📍 {item.store}</span>}
            {item.note}
          </p>
        )}
      </div>
      <button
        onClick={() => startTransition(() => deleteListItem(listId, item.id))}
        className="rounded-lg px-2 py-1 text-xs text-slate-300 hover:bg-slate-100 hover:text-rose-600"
      >
        ✕
      </button>
    </div>
  );
}
