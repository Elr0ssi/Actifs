"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useState, useTransition } from "react";
import { createTask } from "@/app/(main)/app/tasks/actions";
import { Icon } from "@/components/app/icons";
import { cx } from "@/lib/utils";

const localISO = (d: Date) => d.toLocaleDateString("sv-SE");
const shift = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localISO(d);
};
const PRIORITIES = [
  { v: "low", l: "Basse" },
  { v: "medium", l: "Normale" },
  { v: "high", l: "Haute" },
] as const;

/** Bouton flottant + fenêtre d'ajout rapide d'une tâche, ouvrable aussi depuis la recherche (Ctrl/Cmd + K). */
export function QuickAdd() {
  const tr = useT();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [date, setDate] = useState(() => localISO(new Date()));
  const [priority, setPriority] = useState<(typeof PRIORITIES)[number]["v"]>("medium");
  const [pending, start] = useTransition();

  useEffect(() => {
    const onOpen = () => {
      setDate(localISO(new Date()));
      setPriority("medium");
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("allin:quickadd", onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("allin:quickadd", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const chips = [
    { l: tr("Aujourd'hui"), v: shift(0) },
    { l: tr("Demain"), v: shift(1) },
    { l: tr("Dans 1 semaine"), v: shift(7) },
  ];

  return (
    <>
      <button
        type="button"
        onClick={() => window.dispatchEvent(new Event("allin:quickadd"))}
        aria-label={tr("Ajouter une tâche")}
        title={tr("Ajouter une tâche")}
        className="group fixed bottom-28 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow transition duration-300 hover:-translate-y-0.5 hover:scale-105 active:scale-95 lg:bottom-7 lg:right-7"
      >
        <Icon name="plus" className="h-5 w-5 transition-transform duration-300 group-hover:rotate-90" />
      </button>

      {open && (
        <div className="fixed inset-0 z-[65] flex animate-fade items-end justify-center bg-black/40 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => setOpen(false)}>
          <form
            onClick={(e) => e.stopPropagation()}
            action={(fd) =>
              start(async () => {
                await createTask(fd);
                setOpen(false);
                setToast(tr("Tâche ajoutée"));
              })
            }
            className="w-full max-w-md animate-modal space-y-4 rounded-t-3xl border border-line bg-surface p-5 shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-center justify-between">
              <p className="text-base font-bold text-stone-900">{tr("Nouvelle tâche")}</p>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100" aria-label={tr("Fermer")}>
                <Icon name="close" />
              </button>
            </div>
            <input name="title" autoFocus required placeholder={tr("Que faut-il faire ?")} className="input py-3 text-[15px]" />
            <input type="hidden" name="due_date" value={date} />
            <input type="hidden" name="priority" value={priority} />
            <div>
              <p className="label mb-1.5">{tr("Pour quand ?")}</p>
              <div className="flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <button key={c.l} type="button" onClick={() => setDate(c.v)} className={cx("rounded-full px-3 py-1 text-xs font-medium transition", date === c.v ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200")}>
                    {c.l}
                  </button>
                ))}
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-stone-600" aria-label={tr("Date précise")} />
              </div>
            </div>
            <div>
              <p className="label mb-1.5">{tr("Priorité")}</p>
              <div className="segmented">
                {PRIORITIES.map((p) => (
                  <button key={p.v} type="button" data-active={priority === p.v} onClick={() => setPriority(p.v)}>{tr(p.l)}</button>
                ))}
              </div>
            </div>
            <button disabled={pending} className="btn-primary w-full py-2.5">{pending ? tr("Ajout…") : tr("Ajouter la tâche")}</button>
          </form>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 animate-modal rounded-full bg-ink px-4 py-2 text-[13px] font-medium text-onink shadow-lift lg:bottom-8">
          ✓ {toast}
        </div>
      )}
    </>
  );
}
