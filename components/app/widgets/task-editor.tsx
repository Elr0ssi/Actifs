"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import { cx } from "@/lib/utils";

export interface EditorValues {
  title: string;
  date: string;
  start: string;
  end: string;
  projectId: string;
}

/** Fenêtre de création / modification d'un rendez-vous ou d'une tâche placée dans l'agenda. */
export function TaskEditor({
  mode,
  initial,
  projects,
  saving,
  onSave,
  onDelete,
  onClose,
}: {
  mode: "create" | "edit";
  initial: EditorValues;
  projects: { id: string; name: string; color: string }[];
  saving?: boolean;
  onSave: (v: EditorValues) => void;
  onDelete?: () => void;
  onClose: () => void;
}) {
  const [v, setV] = useState(initial);
  const set = (p: Partial<EditorValues>) => setV((x) => ({ ...x, ...p }));
  const badRange = !!v.start && !!v.end && v.end <= v.start;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <form
        className={cx("w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl", saving && "opacity-80")}
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (!v.title.trim() || badRange) return;
          onSave(v);
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-stone-900">{mode === "create" ? "Nouvelle tâche" : "Modifier la tâche"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label="Fermer">✕</button>
        </div>
        <input value={v.title} onChange={(e) => set({ title: e.target.value })} placeholder="Titre (ex. Salle de sport, Appel client…)" className="input mt-4 py-2.5 text-base font-medium" autoFocus required />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <label className="col-span-3 text-xs text-stone-500 sm:col-span-1">
            Jour
            <input type="date" value={v.date} onChange={(e) => set({ date: e.target.value })} className="input mt-1" required />
          </label>
          <label className="text-xs text-stone-500">
            Début
            <input type="time" value={v.start} onChange={(e) => set({ start: e.target.value, end: v.end && v.end <= e.target.value ? "" : v.end })} className="input mt-1" />
          </label>
          <label className="text-xs text-stone-500">
            Fin
            <input type="time" value={v.end} onChange={(e) => set({ end: e.target.value })} disabled={!v.start} className="input mt-1" />
          </label>
        </div>
        {badRange && <p className="mt-1 text-xs text-rose-600">L'heure de fin doit être après le début.</p>}
        {!v.start && <p className="mt-1 text-[11px] text-stone-400">Sans heure, la tâche apparaît en haut de la journée.</p>}
        {projects.length > 0 && (
          <label className="mt-3 block text-xs text-stone-500">
            Projet
            <select value={v.projectId} onChange={(e) => set({ projectId: e.target.value })} className="input mt-1">
              <option value="">Sans projet</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </label>
        )}
        <div className="mt-5 flex items-center gap-2">
          <button className="btn-primary" disabled={saving || badRange}>{mode === "create" ? "Ajouter" : "Enregistrer"}</button>
          <button type="button" onClick={onClose} className="btn-secondary">Annuler</button>
          {onDelete && <button type="button" onClick={onDelete} className="ml-auto text-xs text-stone-400 hover:text-rose-600">Supprimer</button>}
        </div>
      </form>
    </div>,
    document.body
  );
}
