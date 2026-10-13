"use client";

import { useState, useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { LevelPicker } from "@/components/app/settings/sharing-panel";
import { setProjectMember } from "@/app/(main)/app/settings/actions";
import type { ShareLevel } from "@/lib/sharing";

export type ProjectPerson = { id: string; name: string; level: ShareLevel };

/** Partager UN projet (et ses tâches) avec un membre du foyer, sans partager le reste de tes tâches. */
export function ProjectShare({ projectId, people }: { projectId: string; people: ProjectPerson[] }) {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const [levels, setLevels] = useState<Record<string, ShareLevel>>(() => Object.fromEntries(people.map((p) => [p.id, p.level])));
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const sharedCount = Object.values(levels).filter((l) => l !== "none").length;

  function change(personId: string, level: ShareLevel) {
    const before = levels[personId];
    setError(null);
    setLevels((l) => ({ ...l, [personId]: level }));
    start(async () => {
      try {
        await setProjectMember(projectId, personId, level);
      } catch {
        setLevels((l) => ({ ...l, [personId]: before }));
        setError(tr("Le réglage n'a pas pu être enregistré. Réessaie."));
      }
    });
  }

  return (
    <div className="relative">
      <button type="button" aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-lg px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50">
        {sharedCount > 0 ? tr("Partagé ({n})", { n: sharedCount }) : tr("Partager")}
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-1 w-72 rounded-2xl border border-line bg-surface p-3 shadow-lift">
          <p className="mb-2 text-xs text-stone-500">{tr("Seules les tâches de ce projet sont partagées, pas le reste de tes tâches.")}</p>
          <ul className="space-y-2">
            {people.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2">
                <span className="truncate text-[13px] font-medium text-stone-800">{p.name}</span>
                <LevelPicker value={levels[p.id] ?? "none"} canEdit disabled={pending} label={`${p.name} — ${tr("Projet")}`} onChange={(v) => change(p.id, v)} />
              </li>
            ))}
          </ul>
          {error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}
        </div>
      )}
    </div>
  );
}
