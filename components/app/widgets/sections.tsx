"use client";

import { useMemo, useState } from "react";
import { addDays } from "@/lib/finance-engine";
import { cx } from "@/lib/utils";
import { CountUp } from "@/components/app/count-up";
import { WidgetShell, Empty } from "@/components/app/widgets/shell";
import type { WidgetProps } from "@/components/app/widgets/types";

/* ---------- Projets ---------- */

export function Projects({ data, size }: WidgetProps) {
  const list = data.projects;
  return (
    <WidgetShell icon="target" title="Projets" subtitle={`${list.length} en cours`} href="/app/tasks/list">
      {list.length === 0 ? (
        <Empty>Crée un projet pour regrouper tes tâches.</Empty>
      ) : (
        <ul className={cx("grid gap-x-5 gap-y-2.5", size === "l" && "sm:grid-cols-2")}>
          {list.slice(0, size === "s" ? 4 : 8).map((p) => {
            const pct = p.total ? Math.round((p.done / p.total) * 100) : 0;
            return (
              <li key={p.id}>
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="truncate font-medium text-stone-800">{p.name}</span>
                  </span>
                  <span className="tabular shrink-0 text-[11px] text-stone-500">{p.done}/{p.total} · <b className="text-stone-800">{pct} %</b></span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="fill-grow h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Vocabulaire ---------- */

export function VocabStats({ data }: WidgetProps) {
  const weekAgo = addDays(data.today, -6);
  const week = data.words.filter((w) => w.created_at.slice(0, 10) >= weekAgo).length;
  return (
    <WidgetShell icon="chart" title="Compteur de mots" href="/app/notes/vocabulaire">
      <p className="tabular text-3xl font-bold text-stone-900"><CountUp value={data.wordsTotal} kind="int" /></p>
      <p className="text-[11px] text-stone-500">mots enregistrés</p>
      <span className="mt-2 inline-block rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">+{week} cette semaine</span>
    </WidgetShell>
  );
}

export function VocabQuiz({ data }: WidgetProps) {
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [reverse, setReverse] = useState(false);
  const order = useMemo(() => {
    const seed = Number(data.today.replace(/-/g, "")) % 9973;
    return data.words.map((w, i) => ({ w, k: (i * 7919 + seed) % 10007 })).sort((a, b) => a.k - b.k).map((x) => x.w);
  }, [data.words, data.today]);

  if (order.length === 0) {
    return (
      <WidgetShell icon="book" title="Révision éclair">
        <Empty>Ajoute quelques mots pour commencer à réviser.</Empty>
      </WidgetShell>
    );
  }
  const card = order[index % order.length];
  const [front, back] = reverse ? [card.english, card.french] : [card.french, card.english];
  const next = () => {
    setRevealed(false);
    setIndex((i) => i + 1);
  };

  return (
    <WidgetShell
      icon="book"
      title="Révision éclair"
      subtitle={`Carte ${(index % order.length) + 1} / ${order.length}`}
      right={
        <button onClick={() => { setReverse((r) => !r); setRevealed(false); }} className="rounded-md border border-line px-2 py-1 text-[11px] font-medium text-stone-500 hover:text-stone-800">
          {reverse ? "EN → FR" : "FR → EN"}
        </button>
      }
    >
      <button
        onClick={() => setRevealed((v) => !v)}
        className="flex w-full flex-col items-center justify-center rounded-xl border border-line bg-stone-50/70 px-3 py-6 text-center transition hover:border-brand-200"
      >
        <span className="text-lg font-bold text-stone-900">{front}</span>
        <span className={cx("mt-1 text-sm", revealed ? "font-semibold text-brand-700" : "text-stone-300")}>{revealed ? back : "Touche pour voir la traduction"}</span>
      </button>
      <div className="mt-2 flex gap-2">
        <button onClick={next} className="btn-secondary flex-1 py-1.5 text-xs">À revoir</button>
        <button onClick={next} className="btn-primary flex-1 py-1.5 text-xs">Je savais</button>
      </div>
    </WidgetShell>
  );
}
