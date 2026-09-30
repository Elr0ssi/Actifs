"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "@/lib/utils";
import { DOW } from "@/components/app/widgets/helpers";
import { Chip, type CalItem } from "@/components/app/widgets/calendar-grid";

export interface TimeEvent {
  id: string;
  day: string;
  startMin: number;
  endMin: number;
  title: string;
  color?: string;
  done: boolean;
}

export type Zoom = "compact" | "normal" | "large";
const ZOOM: Record<Zoom, { px: number; from: number; to: number }> = {
  compact: { px: 26, from: 7, to: 22 },
  normal: { px: 40, from: 6, to: 23 },
  large: { px: 56, from: 0, to: 24 },
};
const SNAP = 15;
const MIN_DUR = 15;
const DAY_MIN = 24 * 60;
const snap = (m: number) => Math.round(m / SNAP) * SNAP;
const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));
export const fmtMin = (m: number) => `${String(Math.floor(m / 60) % 24).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;

type Gesture =
  | { kind: "create"; day: string; anchor: number }
  | { kind: "move"; id: string; offset: number; dur: number; x: number; y: number; moved: boolean }
  | { kind: "resize"; id: string; day: string; start: number };

type Preview = { kind: "create" | "move" | "resize"; id?: string; day: string; start: number; end: number };

/** Place les événements qui se chevauchent côte à côte dans un même jour. */
function layout(events: { id: string; start: number; end: number }[]) {
  const sorted = [...events].sort((a, b) => a.start - b.start || b.end - a.end);
  const out = new Map<string, { col: number; cols: number }>();
  let cluster: typeof sorted = [];
  let clusterEnd = -1;
  const flush = () => {
    const colEnds: number[] = [];
    const placed: { id: string; col: number }[] = [];
    for (const e of cluster) {
      let col = colEnds.findIndex((end) => end <= e.start);
      if (col === -1) col = colEnds.length;
      colEnds[col] = e.end;
      placed.push({ id: e.id, col });
    }
    for (const p of placed) out.set(p.id, { col: p.col, cols: colEnds.length });
    cluster = [];
  };
  for (const e of sorted) {
    if (cluster.length && e.start >= clusterEnd) flush();
    cluster.push(e);
    clusterEnd = Math.max(clusterEnd, e.end);
  }
  if (cluster.length) flush();
  return out;
}

export function TimeGrid({
  days,
  today,
  events,
  allDay,
  onCreate,
  onMove,
  onResize,
  onOpen,
  onToggle,
  onPickDay,
  zoom = "normal",
}: {
  zoom?: Zoom;
  days: string[];
  today: string;
  events: TimeEvent[];
  allDay: (day: string) => CalItem[];
  onCreate: (day: string, startMin: number, endMin: number) => void;
  onMove: (id: string, day: string, startMin: number, endMin: number) => void;
  onResize: (id: string, endMin: number) => void;
  onOpen: (id: string) => void;
  onToggle: (id: string) => void;
  onPickDay?: (day: string) => void;
}) {
  const n = days.length;
  const cfg = ZOOM[zoom];
  const HOUR_PX = cfg.px;
  const visible = events.filter((e) => days.includes(e.day));
  const fromH = Math.min(cfg.from, ...visible.map((e) => Math.floor(e.startMin / 60)));
  const toH = Math.max(cfg.to, ...visible.map((e) => Math.ceil(e.endMin / 60)));
  const OFF = fromH * 60;
  const hours = Array.from({ length: toH - fromH }, (_, i) => fromH + i);
  const colsRef = useRef<HTMLDivElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const gesture = useRef<Gesture | null>(null);
  const lastType = useRef("mouse");
  const [preview, setPreview] = useState<Preview | null>(null);
  const previewRef = useRef<Preview | null>(null);
  const cbs = useRef({ onCreate, onMove, onResize, onOpen });
  cbs.current = { onCreate, onMove, onResize, onOpen };
  const eventsRef = useRef(events);
  eventsRef.current = events;
  const daysRef = useRef(days);
  daysRef.current = days;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const d = new Date();
    const compute = () => setNow(new Date().getHours() * 60 + new Date().getMinutes());
    compute();
    const t = setInterval(compute, 60_000);
    if (scroller.current) scroller.current.scrollTop = zoom === "compact" ? 0 : Math.max(0, (Math.max(fromH, d.getHours() - 1) - fromH) * HOUR_PX);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoom]);

  const setPrev = (p: Preview | null) => {
    previewRef.current = p;
    setPreview(p);
  };

  const geo = useRef({ px: HOUR_PX, off: OFF });
  geo.current = { px: HOUR_PX, off: OFF };
  const pointerMin = (clientY: number) => {
    const r = colsRef.current?.getBoundingClientRect();
    return r ? ((clientY - r.top) / geo.current.px) * 60 + geo.current.off : 0;
  };
  const pointerDay = (clientX: number) => {
    const r = colsRef.current?.getBoundingClientRect();
    if (!r) return daysRef.current[0];
    return daysRef.current[clamp(Math.floor(((clientX - r.left) / r.width) * daysRef.current.length), 0, daysRef.current.length - 1)];
  };

  useEffect(() => {
    const onMoveEv = (e: PointerEvent) => {
      const g = gesture.current;
      if (!g) return;
      const m = pointerMin(e.clientY);
      if (g.kind === "create") {
        const a = g.anchor;
        const cur = clamp(snap(m), 0, DAY_MIN);
        const start = Math.min(a, cur);
        const end = Math.max(a, cur);
        setPrev({ kind: "create", day: g.day, start, end: Math.max(end, start + MIN_DUR) });
      } else if (g.kind === "move") {
        if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) < 5) return;
        g.moved = true;
        const start = clamp(snap(m - g.offset), 0, DAY_MIN - g.dur);
        setPrev({ kind: "move", id: g.id, day: pointerDay(e.clientX), start, end: start + g.dur });
      } else {
        const end = clamp(snap(m), g.start + MIN_DUR, DAY_MIN);
        setPrev({ kind: "resize", id: g.id, day: g.day, start: g.start, end });
      }
    };
    const onUp = () => {
      const g = gesture.current;
      const p = previewRef.current;
      gesture.current = null;
      if (!g) return;
      if (g.kind === "create") {
        const len = p ? p.end - p.start : 0;
        const start = p && len >= MIN_DUR ? p.start : g.anchor;
        const end = p && len > MIN_DUR ? p.end : Math.min(DAY_MIN, start + 60);
        cbs.current.onCreate(g.day, start, end);
      } else if (g.kind === "move") {
        if (!g.moved || !p) cbs.current.onOpen(g.id);
        else cbs.current.onMove(g.id, p.day, p.start, p.end);
      } else if (p) cbs.current.onResize(g.id, p.end);
      setPrev(null);
    };
    window.addEventListener("pointermove", onMoveEv);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMoveEv);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Événements avec leur position "en cours de glissement".
  const shown = useMemo(
    () =>
      events.map((e) => {
        if (preview && preview.id === e.id && preview.kind !== "create") return { ...e, day: preview.day, startMin: preview.start, endMin: preview.end };
        return e;
      }),
    [events, preview]
  );

  const timeLabel = (h: number) => `${String(h).padStart(2, "0")}:00`;

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line">
      <div ref={scroller} className="relative max-h-[640px] overflow-y-auto">
        {/* En-tête : jours + éléments sans heure (routines, tâches sans horaire) */}
        <div className="sticky top-0 z-20 flex border-b border-line bg-surface/95 backdrop-blur">
          <div className="w-11 shrink-0" />
          <div className="grid min-w-0 flex-1" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
            {days.map((d) => {
              const items = allDay(d);
              const dow = DOW[(new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7];
              return (
                <div key={d} className="min-w-0 border-l border-line/70 px-1 pb-1.5 pt-1.5">
                  <button type="button" onClick={() => onPickDay?.(d)} className="mx-auto flex flex-col items-center leading-tight">
                    <span className="text-[10px] font-medium text-stone-400">{dow}</span>
                    <span className={cx("mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[12px] font-semibold", d === today ? "bg-brand-600 text-white" : "text-stone-800")}>{Number(d.slice(8))}</span>
                  </button>
                  <div className="mt-1 flex flex-col gap-0.5">
                    {items.slice(0, n === 1 ? 20 : 3).map((it) => <Chip key={it.key} item={it} />)}
                    {items.length > (n === 1 ? 20 : 3) && <span className="px-1 text-[10px] text-stone-400">+{items.length - 3}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grille horaire */}
        <div className="relative flex" style={{ height: (toH - fromH) * HOUR_PX }}>
          <div className="relative w-11 shrink-0">
            {hours.map((h) => (
              <span key={h} className="absolute right-1.5 -translate-y-1/2 text-[10px] tabular-nums text-stone-400" style={{ top: (h - fromH) * HOUR_PX, display: h === fromH ? "none" : undefined }}>{timeLabel(h)}</span>
            ))}
          </div>
          <div
            ref={colsRef}
            className="relative grid min-w-0 flex-1 select-none"
            style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
          >
            {hours.map((h) => (
              <div key={h} className="pointer-events-none absolute inset-x-0 border-t border-line/60" style={{ top: (h - fromH) * HOUR_PX }} />
            ))}
            {zoom !== "compact" && hours.map((h) => (
              <div key={`h${h}`} className="pointer-events-none absolute inset-x-0 border-t border-dashed border-line/30" style={{ top: (h - fromH) * HOUR_PX + HOUR_PX / 2 }} />
            ))}

            {days.map((d) => {
              const dayEvents = shown.filter((e) => e.day === d);
              const lay = layout(dayEvents.map((e) => ({ id: e.id, start: e.startMin, end: e.endMin })));
              return (
                <div
                  key={d}
                  className={cx("relative border-l border-line/70", d === today && "bg-brand-500/[0.04]")}
                  style={{ touchAction: "pan-y" }}
                  onPointerDown={(e) => {
                    lastType.current = e.pointerType;
                    if (e.pointerType !== "mouse" || e.button !== 0 || e.target !== e.currentTarget) return;
                    const a = clamp(Math.floor(pointerMin(e.clientY) / SNAP) * SNAP, 0, DAY_MIN - MIN_DUR);
                    gesture.current = { kind: "create", day: d, anchor: a };
                    setPrev({ kind: "create", day: d, start: a, end: a + 60 });
                  }}
                  onClick={(e) => {
                    // Toucher (doigt) : un simple appui crée un créneau d'une heure.
                    if (lastType.current === "mouse" || e.target !== e.currentTarget) return;
                    const a = clamp(Math.floor(pointerMin(e.clientY) / SNAP) * SNAP, 0, DAY_MIN - 60);
                    cbs.current.onCreate(d, a, a + 60);
                  }}
                >
                  {dayEvents.map((ev) => {
                    const pos = lay.get(ev.id) ?? { col: 0, cols: 1 };
                    const top = ((ev.startMin - OFF) / 60) * HOUR_PX;
                    const height = Math.max(((ev.endMin - ev.startMin) / 60) * HOUR_PX, 18);
                    const active = preview?.id === ev.id;
                    return (
                      <div
                        key={ev.id}
                        className={cx("absolute overflow-hidden rounded-lg border-l-[3px] px-1.5 py-0.5 text-left shadow-sm transition-shadow", ev.done && "opacity-60", active ? "z-30 shadow-lg ring-2 ring-brand-400" : "z-10 hover:shadow-md")}
                        style={{
                          top,
                          height,
                          left: `calc(${(pos.col / pos.cols) * 100}% + 1px)`,
                          width: `calc(${100 / pos.cols}% - 3px)`,
                          borderLeftColor: ev.color || "rgb(var(--brand-500))",
                          background: ev.color?.startsWith("#") ? `${ev.color}26` : "rgb(var(--brand-500) / 0.15)",
                          cursor: active ? "grabbing" : "grab",
                          touchAction: "manipulation",
                        }}
                        onPointerDown={(e) => {
                          lastType.current = e.pointerType;
                          if (e.pointerType !== "mouse" || e.button !== 0) return;
                          e.stopPropagation();
                          const orig = events.find((x) => x.id === ev.id) ?? ev;
                          gesture.current = { kind: "move", id: ev.id, offset: pointerMin(e.clientY) - orig.startMin, dur: orig.endMin - orig.startMin, x: e.clientX, y: e.clientY, moved: false };
                        }}
                        onClick={(e) => {
                          if (lastType.current !== "mouse") {
                            e.stopPropagation();
                            cbs.current.onOpen(ev.id);
                          }
                        }}
                        title={`${ev.title} · ${fmtMin(ev.startMin)}–${fmtMin(ev.endMin)}`}
                      >
                        <div className="flex items-start gap-1">
                          <button
                            type="button"
                            aria-label={ev.done ? "Décocher" : "Cocher"}
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); onToggle(ev.id); }}
                            className={cx("mt-px flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold leading-none", ev.done ? "border-transparent bg-emerald-500 text-white" : "border-stone-400/70 bg-surface text-transparent hover:border-emerald-500 hover:text-emerald-500")}
                          >
                            ✓
                          </button>
                          <div className="min-w-0">
                            <p className={cx("truncate text-[11px] font-semibold leading-tight text-stone-800", ev.done && "line-through")}>{ev.title}</p>
                            {height >= 34 && <p className="truncate text-[10px] leading-tight text-stone-500">{fmtMin(ev.startMin)} – {fmtMin(ev.endMin)}</p>}
                          </div>
                        </div>
                        <div
                          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize"
                          onPointerDown={(e) => {
                            if (e.pointerType !== "mouse" || e.button !== 0) return;
                            e.stopPropagation();
                            const orig = events.find((x) => x.id === ev.id) ?? ev;
                            gesture.current = { kind: "resize", id: ev.id, day: orig.day, start: orig.startMin };
                          }}
                        >
                          <span className="mx-auto mt-1 block h-0.5 w-6 rounded-full bg-stone-400/50" />
                        </div>
                      </div>
                    );
                  })}

                  {preview?.kind === "create" && preview.day === d && (
                    <div className="pointer-events-none absolute inset-x-0.5 z-20 rounded-lg border-l-[3px] border-brand-500 bg-brand-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700" style={{ top: ((preview.start - OFF) / 60) * HOUR_PX, height: ((preview.end - preview.start) / 60) * HOUR_PX }}>
                      {fmtMin(preview.start)} – {fmtMin(preview.end)}
                    </div>
                  )}
                  {d === today && now !== null && (
                    <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: ((now - OFF) / 60) * HOUR_PX, display: now < OFF || now > toH * 60 ? "none" : undefined }}>
                      <span className="-ml-1 h-2 w-2 rounded-full bg-rose-500" />
                      <span className="h-px flex-1 bg-rose-500" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
