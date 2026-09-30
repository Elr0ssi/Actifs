"use client";

import { useEffect, useRef, useState } from "react";
import { addDays, monthBounds } from "@/lib/finance-engine";
import { cx, MONTHS_FR } from "@/lib/utils";
import { Icon } from "@/components/app/icons";
import { Segmented } from "@/components/app/widgets/shell";
import { DOW, fmtLong, fmtShort, mondayOf } from "@/components/app/widgets/helpers";

export type CalView = "month" | "week" | "day";

/**
 * Maintenir le clic (ou le doigt) et glisser à gauche / droite pour changer de période, comme un carrousel.
 * `consumeClick` sert à ignorer le clic qui termine un glissement au lieu de sélectionner un jour.
 */
export function useDragNav(onShift: (delta: number) => void) {
  const shift = useRef(onShift);
  shift.current = onShift;
  const drag = useRef({ active: false, startX: 0, moved: false });
  const [grabbing, setGrabbing] = useState(false);

  useEffect(() => {
    const THRESHOLD = 90;
    const onMove = (e: PointerEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > THRESHOLD) {
        drag.current.moved = true;
        shift.current(dx < 0 ? 1 : -1);
        drag.current.startX = e.clientX;
      }
    };
    const onUp = () => {
      drag.current.active = false;
      setGrabbing(false);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return {
    props: {
      onPointerDown: (e: React.PointerEvent) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        drag.current = { active: true, startX: e.clientX, moved: false };
        setGrabbing(true);
      },
      style: { touchAction: "pan-y" } as React.CSSProperties,
      className: cx("select-none", grabbing ? "cursor-grabbing" : "cursor-grab"),
    },
    consumeClick: () => {
      const moved = drag.current.moved;
      drag.current.moved = false;
      return moved;
    },
  };
}

export interface CalItem {
  key: string;
  label: string;
  tone: "task" | "routine" | "in" | "out";
  done?: boolean;
  /** Couleur du projet, pour les tâches. */
  color?: string;
  amount?: string;
  time?: string;
  /** Si présent, une pastille permet de cocher / décocher directement dans la case du calendrier. */
  onToggle?: () => void;
  /** Si présent, la pastille peut être glissée sur un autre jour du mois. */
  dragId?: string;
}

/** Plage de jours réellement affichée pour une vue et une date d'ancrage. */
export function calRange(view: CalView, anchor: string) {
  if (view === "day") return { from: anchor, to: anchor };
  if (view === "week") {
    const from = mondayOf(anchor);
    return { from, to: addDays(from, 6) };
  }
  const y = Number(anchor.slice(0, 4));
  const m = Number(anchor.slice(5, 7)) - 1;
  const { start, end } = monthBounds(y, m);
  return { from: mondayOf(start), to: addDays(mondayOf(end), 6) };
}

export function calTitle(view: CalView, anchor: string) {
  if (view === "day") return fmtLong(anchor);
  if (view === "week") {
    const { from, to } = calRange("week", anchor);
    return `${fmtShort(from)} – ${fmtShort(to)}`;
  }
  return `${MONTHS_FR[Number(anchor.slice(5, 7)) - 1]} ${anchor.slice(0, 4)}`;
}

export function calShift(view: CalView, anchor: string, delta: number) {
  if (view === "day") return addDays(anchor, delta);
  if (view === "week") return addDays(anchor, 7 * delta);
  const d = new Date(Date.UTC(Number(anchor.slice(0, 4)), Number(anchor.slice(5, 7)) - 1 + delta, 1));
  return d.toISOString().slice(0, 10);
}

export function CalendarNav({
  view,
  anchor,
  onView,
  onAnchor,
  onToday,
  views = ["month", "week"],
}: {
  views?: CalView[];
  view: CalView;
  anchor: string;
  onView: (v: CalView) => void;
  onAnchor: (a: string) => void;
  onToday: () => void;
}) {
  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onAnchor(calShift(view, anchor, -1))} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Précédent">
          <Icon name="chevronLeft" />
        </button>
        <p className="min-w-[120px] text-center text-[13px] font-semibold capitalize text-stone-800">{calTitle(view, anchor)}</p>
        <button type="button" onClick={() => onAnchor(calShift(view, anchor, 1))} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label="Suivant">
          <Icon name="chevronRight" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" onClick={onToday} className="btn-secondary px-2.5 py-1 text-[11px]">Aujourd'hui</button>
        <Segmented<CalView> value={view} onChange={onView} options={[{ v: "day" as CalView, l: "Jour" }, { v: "week" as CalView, l: "Semaine" }, { v: "month" as CalView, l: "Mois" }].filter((o) => views.includes(o.v))} />
      </div>
    </div>
  );
}

function Check({ done, onToggle, label }: { done?: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      aria-label={`${done ? "Décocher" : "Cocher"} : ${label}`}
      aria-pressed={!!done}
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cx(
        "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold leading-none transition",
        done ? "border-transparent bg-emerald-500 text-white" : "border-stone-300 bg-surface text-transparent hover:border-emerald-500 hover:text-emerald-500"
      )}
    >
      ✓
    </button>
  );
}

const tint = (color?: string) => (color && color.startsWith("#") ? `${color}1f` : "rgb(var(--brand-500) / 0.1)");

export function Chip({ item }: { item: CalItem }) {
  const base = "flex min-w-0 items-center gap-1 rounded-md px-1 py-px text-[10px] leading-[16px]";
  if (item.tone === "task") {
    return (
      <span
        draggable={!!item.dragId}
        onDragStart={(e) => { if (item.dragId) { e.dataTransfer.setData("text/task-id", item.dragId); e.dataTransfer.effectAllowed = "move"; } }}
        className={cx(base, "border-l-2", item.dragId && "cursor-grab active:cursor-grabbing", item.done && "opacity-60")}
        style={{ borderLeftColor: item.color || "rgb(var(--brand-500))", background: tint(item.color) }}
        title={item.label}
      >
        {item.onToggle && <Check done={item.done} onToggle={item.onToggle} label={item.label} />}
        {item.time && <span className="shrink-0 tabular text-stone-400">{item.time}</span>}
        <span className={cx("truncate", item.done ? "text-stone-400 line-through" : "text-stone-700")}>{item.label}</span>
      </span>
    );
  }
  if (item.tone === "routine") {
    return (
      <span className={cx(base, "bg-emerald-500/10", item.done && "opacity-70")} title={item.label}>
        {item.onToggle ? <Check done={item.done} onToggle={item.onToggle} label={item.label} /> : <span className="shrink-0 text-emerald-600">↻</span>}
        <span className={cx("truncate", item.done ? "text-emerald-600/70 line-through" : "text-emerald-700")}>{item.label}</span>
      </span>
    );
  }
  return (
    <span className={cx(base, "justify-between font-semibold", item.tone === "in" ? "text-emerald-600" : "text-rose-600")} title={item.label}>
      <span className="truncate font-normal text-stone-500">{item.label}</span>
      <span className="tabular shrink-0">{item.amount}</span>
    </span>
  );
}

/** Ligne de détail (panneau du jour) : case à cocher pilotée par le parent pour rester synchronisée avec le calendrier. */
export function CheckRow({ checked, onChange, label, sub, disabled, dot, onOpen }: { checked: boolean; onChange: () => void; label: string; sub?: string; disabled?: boolean; dot?: string; onOpen?: () => void }) {
  const text = (
    <>
      <span className={cx("block truncate text-[13px] font-medium", checked ? "text-stone-400 line-through" : "text-stone-800")}>{label}</span>
      {sub && (
        <span className="flex items-center gap-1.5 truncate text-[11px] text-stone-400">
          {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} />}
          {sub}
        </span>
      )}
    </>
  );
  // Avec onOpen : la case coche, le texte ouvre la fiche.
  if (onOpen) {
    return (
      <div className="flex items-start gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-stone-50">
        <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} aria-label={`Cocher : ${label}`} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left" title="Ouvrir la tâche">{text}</button>
      </div>
    );
  }
  return (
    <label className={cx("flex items-start gap-2.5 rounded-lg px-1.5 py-1 transition", disabled ? "cursor-default opacity-70" : "cursor-pointer hover:bg-stone-50")}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span className="min-w-0 flex-1">{text}</span>
    </label>
  );
}

export function CalendarGrid({
  view,
  anchor,
  today,
  selected,
  wide,
  itemsFor,
  onSelect,
  onShift,
  onDropItem,
}: {
  onDropItem?: (day: string, id: string) => void;
  view: CalView;
  anchor: string;
  today: string;
  selected: string;
  wide: boolean;
  itemsFor: (day: string) => CalItem[];
  onSelect: (day: string) => void;
  onShift: (delta: number) => void;
}) {
  const nav = useDragNav(onShift);
  const { from, to } = calRange(view, anchor);
  const days: string[] = [];
  for (let d = from; d <= to; d = addDays(d, 1)) days.push(d);
  const anchorMonth = anchor.slice(0, 7);
  const max = view === "week" ? 12 : 3;

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400">
        {DOW.map((d) => <div key={d} className="pb-1.5">{wide ? d : d[0]}</div>)}
      </div>
      <div {...{ onPointerDown: nav.props.onPointerDown, style: nav.props.style }} className={cx("grid grid-cols-7 overflow-hidden rounded-xl border border-line", nav.props.className)}>
        {days.map((d) => {
          const items = itemsFor(d);
          const outside = view === "month" && d.slice(0, 7) !== anchorMonth;
          return (
            <div
              key={d}
              role="button"
              tabIndex={0}
              onClick={() => { if (!nav.consumeClick()) onSelect(d); }}
              onDragOver={(e) => { if (onDropItem) e.preventDefault(); }}
              onDrop={(e) => {
                const id = e.dataTransfer.getData("text/task-id");
                if (onDropItem && id) { e.preventDefault(); onDropItem(d, id); }
              }}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onSelect(d); } }}
              className={cx(
                "flex min-w-0 cursor-pointer flex-col gap-0.5 border-b border-r border-line/70 p-1 text-left transition hover:bg-brand-50/50",
                wide ? (view === "week" ? "min-h-[64px] sm:min-h-[240px]" : "min-h-[52px] sm:min-h-[84px]") : "min-h-[44px]",
                wide ? "items-center sm:items-stretch" : "items-center",
                outside && "bg-stone-50/70",
                d === selected && "bg-brand-50 ring-1 ring-inset ring-brand-300"
              )}
            >
              <span className={cx("flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-medium", d === today ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-700")}>
                {Number(d.slice(-2))}
              </span>
              {wide && (
                <div className="hidden min-w-0 flex-col gap-0.5 sm:flex">
                  {items.slice(0, max).map((it) => <Chip key={it.key} item={it} />)}
                  {items.length > max && <span className="px-1 text-[10px] text-stone-400">+{items.length - max}</span>}
                </div>
              )}
              {items.length > 0 && (
                <span className={cx("flex gap-0.5", wide && "sm:hidden")}>
                  {[...new Set(items.map((i) => i.tone))].slice(0, 3).map((tone) => (
                    <span key={tone} className={cx("h-1.5 w-1.5 rounded-full", tone === "task" ? "bg-brand-500" : tone === "routine" ? "bg-emerald-500" : tone === "in" ? "bg-emerald-400" : "bg-rose-400")} />
                  ))}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
