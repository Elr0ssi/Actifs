"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createNote } from "@/app/app/notes/pages/actions";
import { Icon } from "@/components/app/icons";
import { cx } from "@/lib/utils";
import type { NoteMeta } from "@/lib/notes";

function fold(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function NotesShell({ notes, children }: { notes: NoteMeta[]; children: React.ReactNode }) {
  const tr = useT();
  const pathname = usePathname();
  const activeId = pathname.split("/")[4] ?? null;
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const byParent = useMemo(() => {
    const m = new Map<string | null, NoteMeta[]>();
    for (const n of notes) {
      const key = n.parent_id && notes.some((p) => p.id === n.parent_id) ? n.parent_id : null;
      m.set(key, [...(m.get(key) ?? []), n]);
    }
    for (const list of m.values()) list.sort((a, b) => a.title.localeCompare(b.title, "fr"));
    return m;
  }, [notes]);

  // Le chemin jusqu'à la note ouverte reste déplié.
  const ancestors = useMemo(() => {
    const set = new Set<string>();
    let cur = notes.find((n) => n.id === activeId);
    while (cur?.parent_id) {
      set.add(cur.parent_id);
      cur = notes.find((n) => n.id === cur!.parent_id);
    }
    return set;
  }, [notes, activeId]);

  const query = fold(q.trim());
  const results = query ? notes.filter((n) => fold(`${n.title} ${n.search}`).includes(query)) : [];
  const pinned = notes.filter((n) => n.pinned);

  const Row = ({ n, depth }: { n: NoteMeta; depth: number }) => {
    const kids = byParent.get(n.id) ?? [];
    const expanded = open[n.id] ?? ancestors.has(n.id);
    return (
      <li>
        <div className={cx("group flex items-center gap-1 rounded-lg pr-1 transition", n.id === activeId ? "bg-brand-50 text-brand-700" : "text-stone-600 hover:bg-stone-100")} style={{ paddingLeft: 4 + depth * 14 }}>
          <button type="button" onClick={() => setOpen((o) => ({ ...o, [n.id]: !expanded }))} className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded text-stone-400 hover:bg-stone-200/60", kids.length === 0 && "invisible")} aria-label={expanded ? tr("Replier") : tr("Déplier")}>
            <Icon name="chevronRight" className={cx("h-3 w-3 transition-transform", expanded && "rotate-90")} />
          </button>
          <Link href={`/app/notes/pages/${n.id}`} className="flex min-w-0 flex-1 items-center gap-1.5 py-1.5 text-[13px]">
            <span className="w-4 shrink-0 text-center">{n.icon || "📄"}</span>
            <span className="truncate">{n.title || tr("Sans titre")}</span>
          </Link>
          <form action={createNote.bind(null, n.id)} className="opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
            <button title={tr("Nouvelle sous-page")} className="rounded p-1 text-stone-400 hover:bg-stone-200/60 hover:text-stone-700"><Icon name="plus" className="h-3 w-3" /></button>
          </form>
        </div>
        {expanded && kids.length > 0 && <ul>{kids.map((k) => <Row key={k.id} n={k} depth={depth + 1} />)}</ul>}
      </li>
    );
  };

  const roots = byParent.get(null) ?? [];
  const onIndex = !activeId;

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className={cx("min-w-0 lg:block", onIndex ? "block" : "hidden")}>
        <div className="card p-2.5 lg:sticky lg:top-4">
          <div className="relative">
            <Icon name="search" className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr("Rechercher une note…")} className="input pl-8 text-[13px]" />
          </div>
          <form action={createNote.bind(null, null)} className="mt-2">
            <button className="btn-primary w-full justify-center py-1.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" />{tr("Nouvelle page")}</button>
          </form>
          <div className="mt-2 max-h-[60vh] overflow-y-auto">
            {query ? (
              results.length === 0 ? (
                <p className="px-2 py-3 text-xs text-stone-400">{tr("Aucune note trouvée.")}</p>
              ) : (
                <ul>
                  {results.map((n) => (
                    <li key={n.id}>
                      <Link href={`/app/notes/pages/${n.id}`} className={cx("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-stone-100", n.id === activeId && "bg-brand-50 text-brand-700")}>
                        <span className="w-4 text-center">{n.icon || "📄"}</span>
                        <span className="truncate">{n.title || tr("Sans titre")}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )
            ) : (
              <>
                {pinned.length > 0 && (
                  <div className="mb-2">
                    <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Épinglées")}</p>
                    <ul>
                      {pinned.map((n) => (
                        <li key={n.id}>
                          <Link href={`/app/notes/pages/${n.id}`} className={cx("flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[13px] hover:bg-stone-100", n.id === activeId ? "bg-brand-50 text-brand-700" : "text-stone-600")}>
                            <span className="w-4 text-center">{n.icon || "📄"}</span>
                            <span className="truncate">{n.title || tr("Sans titre")}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-wide text-stone-400">{tr("Pages")}</p>
                {roots.length === 0 ? <p className="px-2 py-3 text-xs text-stone-400">{tr("Aucune page pour l'instant.")}</p> : <ul>{roots.map((n) => <Row key={n.id} n={n} depth={0} />)}</ul>}
              </>
            )}
          </div>
        </div>
      </aside>
      <div className={cx("min-w-0", onIndex && "hidden lg:block")}>{children}</div>
    </div>
  );
}
