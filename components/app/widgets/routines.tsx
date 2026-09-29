"use client";

import { useMemo, useRef, useState } from "react";
import { addDays } from "@/lib/finance-engine";
import { cx, MONTHS_FR } from "@/lib/utils";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { fmtShort, mondayOf, scheduledOn } from "@/components/app/widgets/helpers";
import type { WidgetProps } from "@/components/app/widgets/types";

type Gran = "day" | "week" | "month" | "year";
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
  { v: "year", l: "Année" },
];

function buckets(gran: Gran, today: string) {
  const out: { key: string; label: string; tick: string; from: string; to: string }[] = [];
  const y = Number(today.slice(0, 4));
  const m = Number(today.slice(5, 7)) - 1;
  if (gran === "day") {
    for (let i = 29; i >= 0; i--) {
      const d = addDays(today, -i);
      out.push({ key: d, label: fmtShort(d), tick: fmtShort(d), from: d, to: d });
    }
  } else if (gran === "week") {
    const monday = mondayOf(today);
    for (let i = 11; i >= 0; i--) {
      const from = addDays(monday, -7 * i);
      out.push({ key: from, label: `Semaine du ${fmtShort(from)}`, tick: fmtShort(from), from, to: addDays(from, 6) });
    }
  } else if (gran === "month") {
    for (let i = 11; i >= 0; i--) {
      const first = new Date(Date.UTC(y, m - i, 1));
      const from = first.toISOString().slice(0, 10);
      const to = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0)).toISOString().slice(0, 10);
      const name = MONTHS_FR[first.getUTCMonth()];
      out.push({ key: from, label: `${name} ${first.getUTCFullYear()}`, tick: name.slice(0, 3).toLowerCase() + ".", from, to });
    }
  } else {
    for (let i = 2; i >= 0; i--) {
      const yr = y - i;
      out.push({ key: String(yr), label: String(yr), tick: String(yr), from: `${yr}-01-01`, to: `${yr}-12-31` });
    }
  }
  return out;
}

export function RoutinesCurve({ data, size, opts, setOpts }: WidgetProps) {
  const gran = (opts.g as Gran) ?? "day";
  const [hover, setHover] = useState<number | null>(null);
  const plot = useRef<HTMLDivElement>(null);

  const done = useMemo(() => new Set(data.logs.filter((l) => l.done).map((l) => `${l.routine_id}_${l.log_date}`)), [data.logs]);
  const points: Point[] = useMemo(
    () =>
      buckets(gran, data.today).map((b) => {
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
    [gran, data.today, data.routines, done]
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
  const tickEvery = n > 12 ? Math.ceil(n / 6) : 1;
  const tall = size === "m" ? "min-h-[10rem]" : "min-h-[13rem]";

  return (
    <WidgetShell
      icon="trend"
      title="Courbe des routines"
      subtitle="Part de routines réalisées sur la période"
      href="/app/tasks/routines"
      right={<Segmented<Gran> value={gran} onChange={(v) => setOpts({ g: v })} options={GRANS} />}
    >
      {data.routines.length === 0 ? (
        <Empty>Crée une routine pour suivre ta régularité.</Empty>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex items-end justify-between gap-3">
            <p className="tabular text-3xl font-bold tracking-tight text-stone-900">
              {avg === null ? "—" : `${avg} %`}
              <span className="ml-2 text-[11px] font-normal tracking-normal text-stone-400">moyenne · {totalDone}/{totalDue} réalisées</span>
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
                {segments.filter((s) => s.length > 1).map((s, k) => <path key={`a${k}`} d={area(s)} fill="#c4673f" fillOpacity={0.1} />)}
                {segments.filter((s) => s.length > 1).map((s, k) => (
                  <path key={`l${k}`} d={path(s)} fill="none" stroke="#b05538" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                ))}
                {hover !== null && <line x1={xPct(hover)} x2={xPct(hover)} y1={0} y2={100} stroke="#b05538" strokeOpacity={0.3} strokeWidth={1} vectorEffect="non-scaling-stroke" />}
              </svg>
              {points.map((p, i) =>
                p.pct === null ? null : (
                  <span
                    key={p.key}
                    className={cx("absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-brand-600 transition-all", hover === i ? "h-3 w-3" : n > 14 ? "h-1.5 w-1.5 border" : "h-2 w-2")}
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
