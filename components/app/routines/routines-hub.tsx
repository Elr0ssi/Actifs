"use client";

import { useT } from "@/components/i18n/provider";
import { useMemo, useState, useTransition } from "react";
import { addDays } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import { toggleRoutineLog } from "@/app/app/actions";
import { archiveRoutine, createRoutine, deleteRoutineForever, restoreRoutine, updateRoutine } from "@/app/app/calendar/actions";
import { DOW, fmtShort, mondayOf, scheduledOn } from "@/components/app/widgets/helpers";
import type { Routine } from "@/lib/types";

const CATEGORY_CHIPS = [
  { name: "Sport", icon: "🏃" },
  { name: "Santé", icon: "💧" },
  { name: "Maison", icon: "🏠" },
  { name: "Travail", icon: "💼" },
  { name: "Apprentissage", icon: "📚" },
  { name: "Bien-être", icon: "🧘" },
];
const ICON_BY_CAT = new Map(CATEGORY_CHIPS.map((c) => [c.name.toLowerCase(), c.icon]));
const TONES = ["from-brand-500 to-violet-600", "from-emerald-500 to-teal-600", "from-amber-500 to-orange-600", "from-rose-500 to-pink-600", "from-sky-500 to-blue-600"];
const iconOf = (r: Routine) => ICON_BY_CAT.get((r.category ?? "").toLowerCase()) ?? "🔁";
const toneOf = (r: Routine) => TONES[[...r.id].reduce((a, c) => a + c.charCodeAt(0), 0) % TONES.length];
// Lundi d'abord ; les valeurs suivent getUTCDay (0 = dimanche).
const PICK_DAYS = [
  { v: 1, l: "L" }, { v: 2, l: "M" }, { v: 3, l: "M" }, { v: 4, l: "J" }, { v: 5, l: "V" }, { v: 6, l: "S" }, { v: 0, l: "D" },
];
const DAY_NAMES = ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"];

const summary = (r: Routine) => {
  const days = r.days_of_week ?? [];
  if (r.frequency === "daily" || days.length >= 7) return "Tous les jours";
  return PICK_DAYS.filter((d) => days.includes(d.v)).map((d) => DAY_NAMES[d.v]).join(" · ") || "Aucun jour";
};

export function RoutinesHub({ routines, archived, doneKeys, today, minDate, curve }: { routines: Routine[]; archived: Routine[]; doneKeys: string[]; today: string; minDate: string; curve?: React.ReactNode }) {
  const tr = useT();
  const [done, setDone] = useState(() => new Set(doneKeys));
  const [pending, start] = useTransition();
  const [week, setWeek] = useState(mondayOf(today));
  const [editing, setEditing] = useState<Routine | "new" | null>(null);
  const [menu, setMenu] = useState<string | null>(null);
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const isCurrent = week === mondayOf(today);
  const canPrev = addDays(week, -7) >= mondayOf(minDate);

  const toggle = (id: string, d: string) => {
    const key = `${id}_${d}`;
    const next = !done.has(key);
    setDone((s) => {
      const n = new Set(s);
      if (next) n.add(key);
      else n.delete(key);
      return n;
    });
    start(() => toggleRoutineLog(id, d, next));
  };

  const stats = useMemo(() => {
    const map = new Map<string, { done: number; due: number; streak: number }>();
    for (const r of routines) {
      let dn = 0;
      let due = 0;
      for (const d of days) {
        if (d > today || !scheduledOn(r, d) || r.created_at.slice(0, 10) > d) continue;
        due++;
        if (done.has(`${r.id}_${d}`)) dn++;
      }
      // Série : jours prévus consécutifs réussis jusqu'à aujourd'hui (aujourd'hui non fait ne casse pas la série).
      let streak = 0;
      let d = today;
      for (let i = 0; i < 200; i++) {
        if (scheduledOn(r, d) && r.created_at.slice(0, 10) <= d) {
          if (done.has(`${r.id}_${d}`)) streak++;
          else if (d !== today) break;
        }
        d = addDays(d, -1);
      }
      map.set(r.id, { done: dn, due, streak });
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routines, done, week, today]);

  const total = [...stats.values()].reduce((a, s) => ({ done: a.done + s.done, due: a.due + s.due }), { done: 0, due: 0 });
  const pct = total.due ? Math.round((total.done / total.due) * 100) : 0;
  const label = isCurrent ? tr("Cette semaine") : `Semaine du ${fmtShort(week)} au ${fmtShort(addDays(week, 6))}`;

  return (
    <div className={cx("space-y-5", pending && "opacity-90")}>
      {/* Barre : navigation par semaine + création */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button type="button" disabled={!canPrev} onClick={() => setWeek(addDays(week, -7))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-stone-600 hover:bg-stone-50 disabled:opacity-30" aria-label={tr("Semaine précédente")}>‹</button>
          <p className="min-w-[10.5rem] px-2 text-center text-sm font-bold text-stone-900">{label}</p>
          <button type="button" disabled={isCurrent} onClick={() => setWeek(addDays(week, 7))} className="flex h-9 w-9 items-center justify-center rounded-xl border border-line bg-surface text-stone-600 hover:bg-stone-50 disabled:opacity-30" aria-label={tr("Semaine suivante")}>›</button>
          {!isCurrent && <button type="button" onClick={() => setWeek(mondayOf(today))} className="rounded-xl bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">{tr("Aujourd'hui")}</button>}
          <input
            type="date"
            min={minDate}
            max={today}
            value=""
            onChange={(e) => e.target.value && setWeek(mondayOf(e.target.value))}
            className="h-9 w-9 cursor-pointer rounded-xl border border-line bg-surface px-0 text-transparent [&::-webkit-calendar-picker-indicator]:m-0 [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60"
            aria-label={tr("Aller à une date")}
            title={tr("Aller à une date")}
          />
        </div>
        <button type="button" onClick={() => setEditing("new")} className="btn-primary px-4 py-2.5 text-sm">{tr("+ Nouvelle routine")}</button>
      </div>

      {/* Bilan de la semaine */}
      {routines.length > 0 && (
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-5 py-4">
          <div className="relative flex h-14 w-14 shrink-0 items-center justify-center">
            <svg viewBox="0 0 36 36" className="h-14 w-14 -rotate-90"><circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" className="stroke-stone-100" /><circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 97.4} 97.4`} className="stroke-brand-600 transition-all duration-500" /></svg>
            <span className="absolute text-[13px] font-bold text-stone-900">{pct}%</span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-stone-900">{total.done} sur {total.due} faites</p>
            <p className="text-xs text-stone-500">{isCurrent ? tr("Coche au fil de la semaine, un jour oublié se rattrape.") : tr("Tu peux corriger une journée passée : la courbe se met à jour.")}</p>
          </div>
        </div>
      )}

      {/* Routines */}
      {routines.length === 0 ? (
        <button type="button" onClick={() => setEditing("new")} className="flex w-full flex-col items-center gap-2 rounded-3xl border-2 border-dashed border-line py-14 text-sm text-stone-400 hover:border-brand-300 hover:text-brand-700">
          <span className="text-3xl">🔁</span>
          Crée ta première routine
        </button>
      ) : (
        <ul className="grid gap-3 lg:grid-cols-2">
          {routines.map((r) => {
            const s = stats.get(r.id)!;
            return (
              <li key={r.id} className="relative rounded-2xl border border-line bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white shadow-soft", toneOf(r))}>{iconOf(r)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold text-stone-900">{r.title}</p>
                    <p className="truncate text-xs text-stone-500">{r.category ? `${r.category} · ` : ""}{summary(r)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {s.streak > 1 && <span className="rounded-full bg-orange-50 px-2 py-0.5 text-[11px] font-bold text-orange-600" title={tr("Série en cours")}>🔥 {s.streak}</span>}
                    <span className="tabular rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-600">{s.done}/{s.due}</span>
                    <button type="button" onClick={() => setMenu(menu === r.id ? null : r.id)} className="rounded-lg px-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-700" aria-label={tr("Options")}>⋯</button>
                  </div>
                </div>
                {menu === r.id && (
                  <div className="absolute right-3 top-14 z-10 w-40 rounded-xl border border-line bg-surface p-1 shadow-lift">
                    <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-stone-50" onClick={() => { setMenu(null); setEditing(r); }}>{tr("Modifier")}</button>
                    <button type="button" className="block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50" onClick={() => { setMenu(null); start(() => archiveRoutine(r.id)); }}>{tr("Archiver")}</button>
                  </div>
                )}
                <div className="mt-3 grid grid-cols-7 gap-1.5">
                  {days.map((d, i) => {
                    const scheduled = scheduledOn(r, d) && r.created_at.slice(0, 10) <= d;
                    const future = d > today;
                    const on = done.has(`${r.id}_${d}`);
                    return (
                      <div key={d} className="flex flex-col items-center gap-1">
                        <span className={cx("text-[10px] font-medium", d === today ? "text-brand-700" : "text-stone-400")}>{DOW[i]}</span>
                        {scheduled || on ? (
                          <button
                            type="button"
                            disabled={future}
                            onClick={() => toggle(r.id, d)}
                            aria-pressed={on}
                            aria-label={`${r.title}, ${d}`}
                            className={cx("flex h-9 w-full max-w-[2.75rem] items-center justify-center rounded-xl border text-[13px] font-bold transition", on ? "border-transparent bg-gradient-to-br text-white shadow-soft " + toneOf(r) : d === today ? "border-brand-300 bg-brand-50 text-brand-700 hover:bg-brand-100" : "border-line bg-surface text-stone-500 hover:border-brand-300", future && "cursor-not-allowed opacity-40")}
                          >
                            {on ? "✓" : Number(d.slice(-2))}
                          </button>
                        ) : (
                          <span className="flex h-9 w-full max-w-[2.75rem] items-center justify-center rounded-xl text-stone-200">·</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {curve && <div>{curve}</div>}

      {archived.length > 0 && (
        <details className="rounded-2xl border border-line bg-surface">
          <summary className="cursor-pointer list-none px-5 py-3.5 text-sm font-semibold text-stone-600">Archivées ({archived.length})</summary>
          <ul className="space-y-1 border-t border-line p-3">
            {archived.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-stone-500 hover:bg-stone-50">
                <span className="truncate"><span className="mr-2">{iconOf(r)}</span>{r.title}</span>
                <span className="flex shrink-0 items-center gap-3">
                  <button type="button" onClick={() => start(() => restoreRoutine(r.id))} className="text-xs font-semibold text-brand-600 hover:underline">{tr("Restaurer")}</button>
                  <button type="button" onClick={() => { if (confirm(`Supprimer définitivement « ${r.title} » ?`)) start(() => deleteRoutineForever(r.id)); }} className="text-xs text-stone-400 hover:text-rose-600">{tr("Supprimer")}</button>
                </span>
              </li>
            ))}
          </ul>
        </details>
      )}

      {editing && <RoutineSheet routine={editing === "new" ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function RoutineSheet({ routine, onClose }: { routine: Routine | null; onClose: () => void }) {
  const tr = useT();
  const [title, setTitle] = useState(routine?.title ?? "");
  const [category, setCategory] = useState(routine?.category && routine.category !== "Général" ? routine.category : "");
  const [every, setEvery] = useState(!routine || routine.frequency === "daily" || (routine.days_of_week ?? []).length >= 7);
  const [picked, setPicked] = useState<number[]>(routine && routine.frequency === "weekly" ? routine.days_of_week ?? [] : [1, 2, 3, 4, 5]);
  const [saving, setSaving] = useState(false);
  const valid = title.trim().length > 0 && (every || picked.length > 0);

  const submit = async (fd: FormData) => {
    setSaving(true);
    if (routine) await updateRoutine(routine.id, fd);
    else await createRoutine(fd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <form action={submit} onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-t-3xl bg-surface p-6 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold tracking-tight text-stone-900">{routine ? tr("Modifier la routine") : tr("Nouvelle routine")}</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label={tr("Fermer")}>✕</button>
        </div>

        <input name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder={tr("Ex. Séance de sport")} className="input mt-4 text-base" autoFocus required />

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Quand ?")}</p>
        <div className="segmented mt-2">
          <button type="button" data-active={every} onClick={() => setEvery(true)}>{tr("Tous les jours")}</button>
          <button type="button" data-active={!every} onClick={() => setEvery(false)}>{tr("Certains jours")}</button>
        </div>
        <input type="hidden" name="frequency" value={every ? "daily" : "weekly"} />
        {!every && (
          <div className="mt-3 flex justify-between gap-1">
            {PICK_DAYS.map((d) => {
              const on = picked.includes(d.v);
              return (
                <button key={d.v} type="button" onClick={() => setPicked((p) => (on ? p.filter((x) => x !== d.v) : [...p, d.v]))} className={cx("h-10 flex-1 rounded-xl border text-sm font-bold transition", on ? "border-transparent bg-brand-600 text-white" : "border-line text-stone-500 hover:border-brand-300")}>{d.l}</button>
              );
            })}
          </div>
        )}
        {!every && picked.map((v) => <input key={v} type="hidden" name="days" value={v} />)}

        <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Catégorie")}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {CATEGORY_CHIPS.map((c) => (
            <button key={c.name} type="button" onClick={() => setCategory(category === c.name ? "" : c.name)} className={cx("rounded-full border px-3 py-1.5 text-xs font-semibold transition", category === c.name ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line text-stone-600 hover:border-brand-300")}>{c.icon} {c.name}</button>
          ))}
        </div>
        <input name="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder={tr("Autre catégorie…")} className="input mt-2 !h-9 text-[13px]" />

        <button type="submit" disabled={!valid || saving} className="btn-primary mt-6 w-full justify-center py-3 disabled:opacity-50">{saving ? tr("Enregistrement…") : routine ? tr("Enregistrer") : tr("Créer la routine")}</button>
      </form>
    </div>
  );
}
