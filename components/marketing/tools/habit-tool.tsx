"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { cx } from "@/lib/utils";
import { useLocalStorage } from "@/components/marketing/tools/use-local-storage";

interface Habit {
  id: string;
  name: string;
  /** Jours prévus (0 = dimanche … 6 = samedi). */
  days: number[];
}
interface State {
  habits: Habit[];
  done: Record<string, boolean>;
}

const ALL = [0, 1, 2, 3, 4, 5, 6];
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const WEEK_DAYS = [1, 2, 3, 4, 5, 6, 0]; // lundi → dimanche
const uid = () => Math.random().toString(36).slice(2, 8);

const iso = (d: Date) => d.toLocaleDateString("sv-SE");
const addDays = (s: string, n: number) => {
  const d = new Date(`${s}T12:00:00`);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const mondayOf = (s: string) => {
  const d = new Date(`${s}T12:00:00`);
  return addDays(s, -((d.getDay() + 6) % 7));
};
const dayOf = (s: string) => new Date(`${s}T12:00:00`).getDay();
const fmt = (s: string) => new Date(`${s}T12:00:00`).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

const INITIAL: State = {
  habits: [
    { id: "h1", name: "Lecture 20 minutes", days: ALL },
    { id: "h2", name: "Séance de sport", days: [1, 3, 5] },
    { id: "h3", name: "Revue du budget", days: [0] },
  ],
  done: {},
};

export function HabitTool() {
  const [s, setS, ready] = useLocalStorage<State>("allin-habitudes-v1", INITIAL);
  const [today, setToday] = useState<string | null>(null);
  const [anchor, setAnchor] = useState<string | null>(null);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const t = iso(new Date());
    setToday(t);
    setAnchor(mondayOf(t));
  }, []);

  const days = useMemo(() => (anchor ? Array.from({ length: 7 }, (_, i) => addDays(anchor, i)) : []), [anchor]);
  const key = (h: Habit, d: string) => `${h.id}_${d}`;
  const scheduled = (h: Habit, d: string) => h.days.includes(dayOf(d));

  const stats = useMemo(() => {
    if (!today) return { perHabit: new Map<string, { done: number; total: number; streak: number }>(), perDay: [] as (number | null)[], pct: null as number | null };
    const perHabit = new Map<string, { done: number; total: number; streak: number }>();
    let allDone = 0;
    let allTotal = 0;
    for (const h of s.habits) {
      let done = 0;
      let total = 0;
      for (const d of days) {
        if (!scheduled(h, d) || d > today) continue;
        total++;
        if (s.done[key(h, d)]) done++;
      }
      // Série : jours prévus consécutifs réussis, en remontant depuis aujourd'hui (la journée en cours ne casse pas la série).
      let streak = 0;
      for (let i = 0, d: string = today; i < 400; i++, d = addDays(d, -1)) {
        if (!scheduled(h, d)) continue;
        if (s.done[key(h, d)]) streak++;
        else if (d === today) continue;
        else break;
      }
      perHabit.set(h.id, { done, total, streak });
      allDone += done;
      allTotal += total;
    }
    const perDay = days.map((d) => {
      if (d > today) return null;
      const due = s.habits.filter((h) => scheduled(h, d));
      if (!due.length) return null;
      return Math.round((due.filter((h) => s.done[key(h, d)]).length / due.length) * 100);
    });
    return { perHabit, perDay, pct: allTotal ? Math.round((allDone / allTotal) * 100) : null };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, days, today]);

  const add = () => {
    const name = draft.trim();
    if (!name) return;
    setS({ ...s, habits: [...s.habits, { id: uid(), name, days: ALL }] });
    setDraft("");
  };
  const toggleDay = (h: Habit, dow: number) => {
    const next = h.days.includes(dow) ? h.days.filter((x) => x !== dow) : [...h.days, dow];
    if (!next.length) return;
    setS({ ...s, habits: s.habits.map((x) => (x.id === h.id ? { ...x, days: next } : x)) });
  };

  if (!ready || !anchor || !today) return <div className="card h-64 animate-pulse" aria-hidden />;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
      <section className="rounded-3xl border border-line bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setAnchor(addDays(anchor, -7))} className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100" aria-label="Semaine précédente">‹</button>
            <p className="min-w-[10rem] text-center text-sm font-semibold text-stone-800">{fmt(days[0])} – {fmt(days[6])}</p>
            <button type="button" onClick={() => setAnchor(addDays(anchor, 7))} className="rounded-md px-2 py-1 text-stone-500 hover:bg-stone-100" aria-label="Semaine suivante">›</button>
          </div>
          <button type="button" onClick={() => setAnchor(mondayOf(today))} className="btn-secondary px-2.5 py-1 text-[11px]">Cette semaine</button>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] border-separate border-spacing-y-1.5 text-sm">
            <thead>
              <tr className="text-[11px] text-stone-400">
                <th className="w-[38%] text-left font-medium">Habitude</th>
                {days.map((d, i) => (
                  <th key={d} className="font-medium">
                    <span className={cx("flex flex-col items-center leading-tight", d === today && "text-brand-700")}>{DOW[i]}<b className="text-[12px]">{Number(d.slice(8))}</b></span>
                  </th>
                ))}
                <th className="w-10 font-medium">%</th>
              </tr>
            </thead>
            <tbody>
              {s.habits.map((h) => {
                const st = stats.perHabit.get(h.id);
                return (
                  <tr key={h.id}>
                    <td className="pr-2">
                      <p className="truncate text-[13px] font-medium text-stone-800">{h.name}</p>
                      <p className="text-[10px] text-stone-400">{st && st.streak > 1 ? `🔥 ${st.streak} de suite` : h.days.length === 7 ? "Tous les jours" : `${h.days.length} jours / semaine`}</p>
                    </td>
                    {days.map((d) => {
                      const on = scheduled(h, d);
                      const checked = !!s.done[key(h, d)];
                      return (
                        <td key={d} className="text-center">
                          {on ? (
                            <button
                              type="button"
                              onClick={() => setS({ ...s, done: { ...s.done, [key(h, d)]: !checked } })}
                              aria-pressed={checked}
                              aria-label={`${h.name} le ${fmt(d)}`}
                              className={cx("mx-auto flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition", checked ? "border-transparent bg-emerald-500 text-white" : d > today ? "border-dashed border-stone-200 text-transparent" : "border-stone-300 text-transparent hover:border-emerald-500 hover:text-emerald-500")}
                            >
                              ✓
                            </button>
                          ) : (
                            <span className="text-stone-200">·</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="text-center text-[11px] font-semibold text-stone-600">{st && st.total ? `${Math.round((st.done / st.total) * 100)}` : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); add(); }} className="mt-4 flex gap-2">
          <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Nouvelle habitude (ex. Méditation 10 min)" className="input flex-1" />
          <button className="btn-primary px-4" disabled={!draft.trim()}>Ajouter</button>
        </form>

        <details className="mt-4 text-xs text-stone-500">
          <summary className="cursor-pointer font-medium text-stone-600">Choisir les jours de chaque habitude</summary>
          <ul className="mt-3 space-y-2">
            {s.habits.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-2">
                <span className="min-w-[8rem] flex-1 truncate text-stone-700">{h.name}</span>
                <div className="flex gap-1">
                  {WEEK_DAYS.map((dow, i) => (
                    <button key={dow} type="button" onClick={() => toggleDay(h, dow)} className={cx("h-7 w-9 rounded-md text-[11px] font-medium", h.days.includes(dow) ? "bg-brand-600 text-white" : "bg-stone-100 text-stone-500")}>{DOW[i]}</button>
                  ))}
                </div>
                <button type="button" onClick={() => setS({ ...s, habits: s.habits.filter((x) => x.id !== h.id) })} className="text-stone-300 hover:text-rose-600" aria-label={`Supprimer ${h.name}`}>✕</button>
              </li>
            ))}
          </ul>
        </details>
      </section>

      <aside className="space-y-4">
        <div className="rounded-3xl border border-brand-200 bg-brand-50 p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Régularité de la semaine</p>
          <p className="tabular mt-1 text-5xl font-bold text-stone-900">{stats.pct === null ? "—" : `${stats.pct} %`}</p>
          <div className="mt-4 flex h-24 items-end gap-1.5" aria-label="Réussite par jour">
            {stats.perDay.map((v, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-20 w-full items-end overflow-hidden rounded-md bg-white/70">
                  <div className="w-full rounded-md bg-brand-500 transition-all" style={{ height: `${v ?? 0}%` }} />
                </div>
                <span className="text-[10px] text-stone-500">{DOW[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-stone-900 p-5 text-white">
          <p className="font-semibold">Tes routines dans ton agenda</p>
          <p className="mt-1 text-sm text-stone-300">Avec Flozea, tes routines apparaissent à côté de tes tâches dans l'agenda, avec une courbe de régularité par semaine, mois et année.</p>
          <Link href="/signup" className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100">Créer mon espace</Link>
        </div>
        <p className="text-[11px] text-stone-400">Tes habitudes restent dans ce navigateur : rien n'est envoyé.</p>
      </aside>
    </div>
  );
}
