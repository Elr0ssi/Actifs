"use client";

import { useMemo, useRef, useState } from "react";
import { addDays } from "@/lib/finance-engine";
import { cx, MONTHS_FR } from "@/lib/utils";
import { Icon } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { DOW, fmtShort, mondayOf, scheduledOn } from "@/components/app/widgets/helpers";
import type { WidgetProps } from "@/components/app/widgets/types";

type Gran = "day" | "week" | "month";
interface Point {
  key: string;
  label: string;
  tick: string;
  done: number;
  due: number;
  pct: number | null;
}

const GRANS: { v: Gran; l: string }[] = [
  { v: "day", l: "Jour" },
  { v: "week", l: "Semaine" },
  { v: "month", l: "Mois" },
];

const HELP: Record<Gran, string> = {
  day: "Chaque jour de la semaine",
  week: "Chaque semaine du mois",
  month: "Chaque mois de l'année",
};

/** Jour → les 7 jours d'une semaine · Semaine → toutes les semaines d'un mois · Mois → les 12 mois d'une année. `off` décale la période. */
function buckets(gran: Gran, today: string, off: number) {
  const out: { key: string; label: string; tick: string; from: string; to: string }[] = [];
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7)) - 1;
  let title = "";
  if (gran === "day") {
    const monday = addDays(mondayOf(today), 7 * off);
    for (let i = 0; i < 7; i++) {
      const d = addDays(monday, i);
      out.push({ key: d, label: `${DOW[i]} ${fmtShort(d)}`, tick: `${DOW[i]} ${Number(d.slice(8))}`, from: d, to: d });
    }
    title = `${fmtShort(monday)} – ${fmtShort(addDays(monday, 6))}`;
  } else if (gran === "week") {
    const first = new Date(Date.UTC(y, m + off, 1));
    const firstIso = first.toISOString().slice(0, 10);
    const lastIso = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
    for (let monday = mondayOf(firstIso); monday <= lastIso; monday = addDays(monday, 7)) {
      const from = monday < firstIso ? firstIso : monday;
      const sunday = addDays(monday, 6);
      const to = sunday > lastIso ? lastIso : sunday;
      out.push({ key: monday, label: `Semaine du ${fmtShort(from)} au ${fmtShort(to)}`, tick: `${Number(from.slice(8))}–${Number(to.slice(8))}`, from, to });
    }
    title = `${MONTHS_FR[first.getUTCMonth()]} ${first.getUTCFullYear()}`;
  } else {
    const yr = y + off;
    for (let k = 0; k < 12; k++) {
      const from = new Date(Date.UTC(yr, k, 1)).toISOString().slice(0, 10);
      const to = new Date(Date.UTC(yr, k + 1, 0)).toISOString().slice(0, 10);
      out.push({ key: from, label: `${MONTHS_FR[k]} ${yr}`, tick: MONTHS_FR[k].slice(0, 3).toLowerCase() + ".", from, to });
    }
    title = String(yr);
  }
  return { list: out, title };
}

export function RoutinesCurve({ data, size, opts, setOpts }: WidgetProps) {
  const gran: Gran = opts.g === "week" || opts.g === "month" ? opts.g : "day";
  const [hover, setHover] = useState<number | null>(null);
  const [off, setOff] = useState(0);
  const changeGran = (v: Gran) => {
    setOff(0);
    setOpts({ g: v });
  };
  const plot = useRef<HTMLDivElement>(null);

  const done = useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);
  const period = useMemo(() => buckets(gran, data.today, off), [gran, data.today, off]);
  const points: Point[] = useMemo(
    () =>
      period.list.map((b) => {
        let due = 0;
        let ok = 0;
        for (let d = b.from; d <= b.to && d <= data.today; d = addDays(d, 1)) {
          for (const r of data.routines) {
            const logged = done.has(`${r.id}_${d}`);
            if (!scheduledOn(r, d) || (r.created_at.slice(0, 10) > d && !logged)) continue;
            due++;
            if (logged) ok++;
          }
        }
        return { key: b.key, label: b.label, tick: b.tick, done: ok, due, pct: due ? Math.round((ok / due) * 100) : null };
      }),
    [period, data.today, data.routines, done]
  );

  const totalDue = points.reduce((s, p) => s + p.due, 0);
  const totalDone = points.reduce((s, p) => s + p.done, 0);
  const avg = totalDue ? Math.round((totalDone / totalDue) * 100) : null;
  const n = points.length;
  const xPct = (i: number) => (n === 1 ? 50 : (i / (n - 1)) * 100);

  const segments: number[][] = [];
  points.forEach((p, i) => {
    if (p.pct === null) return;
    const last = segments[segments.length - 1];
    if (last && last[last.length - 1] === i - 1) last.push(i);
    else segments.push([i]);
  });
  const path = (seg: number[]) => seg.map((i, k) => `${k ? "L" : "M"}${xPct(i).toFixed(2)},${(100 - (points[i].pct as number)).toFixed(2)}`).join("");
  const area = (seg: number[]) => `${path(seg)}L${xPct(seg[seg.length - 1]).toFixed(2)},100L${xPct(seg[0]).toFixed(2)},100Z`;

  const onMove = (e: React.PointerEvent) => {
    const r = plot.current?.getBoundingClientRect();
    if (!r || n < 2) return;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1)))));
  };
  const shown = hover !== null ? points[hover] : null;
  const tickEvery = 1;
  const tall = size === "m" ? "min-h-[10rem]" : "min-h-[13rem]";

  return (
    <WidgetShell
      icon="trend"
      title="Courbe des routines"
      subtitle={HELP[gran]}
      href="/app/tasks/routines"
      right={<Segmented<Gran> value={gran} onChange={changeGran} options={GRANS} />}
    >
      {data.routines.length === 0 ? (
        <Empty>Crée une routine pour suivre ta régularité.</Empty>
      ) : (
        <div className="flex h-full flex-col">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setOff(off - 1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Période précédente"><Icon name="chevronLeft" /></button>
              <p className="min-w-[110px] text-center text-[13px] font-semibold capitalize text-stone-800">{period.title}</p>
              <button type="button" onClick={() => setOff(off + 1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Période suivante"><Icon name="chevronRight" /></button>
            </div>
            {off !== 0 && <button type="button" onClick={() => setOff(0)} className="btn-secondary px-2.5 py-1 text-[11px]">Aujourd'hui</button>}
          </div>
          <div className="flex items-end justify-between gap-3">
            <p className="tabular text-3xl font-bold tracking-tight text-stone-900">
              {avg === null ? "—" : `${avg} %`}
              <span className="ml-2 text-[11px] font-normal tracking-normal text-stone-400">moyenne de la période · {totalDone}/{totalDue} réalisées</span>
            </p>
            <p className="tabular text-right text-[12px] text-stone-500">
              {shown ? (
                <>
                  <span className="block font-medium capitalize text-stone-700">{shown.label}</span>
                  <b className="text-stone-900">{shown.pct === null ? "Aucune routine" : `${shown.pct} %`}</b>
                  {shown.pct !== null && <span className="text-stone-400"> · {shown.done}/{shown.due}</span>}
                </>
              ) : (
                <span className="text-stone-400">Survole la courbe pour le détail</span>
              )}
            </p>
          </div>

          <div className={cx("relative mt-3 flex-1 pl-9", tall)}>
            {[100, 50, 0].map((v) => (
              <span key={v} className="tabular absolute left-0 -translate-y-1/2 text-[10px] text-stone-400" style={{ top: `${100 - v}%` }}>{v} %</span>
            ))}
            <div
              ref={plot}
              className="relative mx-2 h-full touch-none"
              onPointerMove={onMove}
              onPointerDown={onMove}
              onPointerLeave={() => setHover(null)}
              role="img"
              aria-label={`Courbe de réussite des routines par ${GRANS.find((g) => g.v === gran)?.l.toLowerCase()}`}
            >
              {[100, 50, 0].map((v) => (
                <div key={v} className={cx("absolute inset-x-0 border-t", v === 0 ? "border-stone-300" : "border-dashed border-line")} style={{ top: `${100 - v}%` }} />
              ))}
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
                {segments.filter((s) => s.length > 1).map((s, k) => <path key={`a${k}`} d={area(s)} fill="rgb(var(--brand-500))" fillOpacity={0.12} className="animate-fade" />)}
                {segments.filter((s) => s.length > 1).map((s, k) => (
                  <path key={`l${k}`} d={path(s)} pathLength={1} className="stroke-draw" fill="none" stroke="rgb(var(--brand-600))" strokeWidth={2.25} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                ))}
                {hover !== null && <line x1={xPct(hover)} x2={xPct(hover)} y1={0} y2={100} stroke="rgb(var(--brand-600))" strokeOpacity={0.3} strokeWidth={1} vectorEffect="non-scaling-stroke" />}
              </svg>
              {points.map((p, i) =>
                p.pct === null ? null : (
                  <span
                    key={p.key}
                    className={cx("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-surface bg-brand-600 transition-all", hover === i ? "h-3 w-3" : n > 14 ? "h-1.5 w-1.5 border" : "h-2 w-2")}
                    style={{ left: `${xPct(i)}%`, top: `${100 - p.pct}%` }}
                  />
                )
              )}
            </div>
          </div>
          <div className="relative mx-2 ml-11 mt-1.5 h-4">
            {points.map((p, i) =>
              (n - 1 - i) % tickEvery === 0 ? (
                <span key={p.key} className="absolute -translate-x-1/2 whitespace-nowrap text-[10px] text-stone-400" style={{ left: `${xPct(i)}%` }}>{p.tick}</span>
              ) : null
            )}
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
