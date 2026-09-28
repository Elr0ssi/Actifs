"use client";

import { useMemo, useState, useTransition } from "react";
import { deleteWord } from "@/app/app/notes/actions";
import { cx } from "@/lib/utils";

export interface VocabWord {
  id: string;
  french: string;
  english: string;
  created_at: string;
}

export function VocabList({ words }: { words: VocabWord[] }) {
  const [query, setQuery] = useState("");
  const [pending, start] = useTransition();

  const q = query.trim().toLowerCase();
  const rows = useMemo(
    () => words.filter((w) => !q || w.french.toLowerCase().includes(q) || w.english.toLowerCase().includes(q)),
    [words, q]
  );

  return (
    <div className={cx("card overflow-hidden p-0", pending && "opacity-70")}>
      <div className="flex items-center gap-3 border-b border-slate-100 p-4">
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un mot…" className="input max-w-xs" />
        <p className="ml-auto text-xs text-slate-400">{rows.length} mot(s)</p>
      </div>
      {rows.length === 0 ? (
        <p className="p-4 text-sm text-slate-400">Aucun mot pour l'instant.</p>
      ) : (
        <ul className="divide-y divide-slate-100">
          {rows.map((w) => (
            <li key={w.id} className="group flex items-center gap-4 px-4 py-2.5 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium text-slate-800">{w.french}</span>
              <span className="text-slate-300">→</span>
              <span className="min-w-0 flex-1 truncate text-slate-600">{w.english}</span>
              <span className="hidden shrink-0 text-[11px] text-slate-400 sm:block">
                {new Date(w.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
              </span>
              <button
                onClick={() => start(() => deleteWord(w.id))}
                className="shrink-0 text-xs text-slate-300 hover:text-rose-600 group-hover:text-slate-400"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
