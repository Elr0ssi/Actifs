"use client";

import { useT } from "@/components/i18n/provider";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { saveWidgetLayout } from "@/app/app/widget-actions";
import {
  DEFAULT_LAYOUTS,
  PAGE_SECTIONS,
  SECTIONS,
  SIZE_LABEL,
  WIDGETS,
  WIDGET_BY_TYPE,
  WIDGET_UNIT_HEIGHT,
  spanClass,
  type WidgetItem,
  type WidgetOpts,
  type WidgetPage,
  type WidgetSection,
  type WidgetSize,
  type WidgetType,
} from "@/lib/widgets/registry";
import type { WidgetData } from "@/lib/data/widgets";
import { cx, MONTHS_FR } from "@/lib/utils";
import { monthBounds } from "@/lib/finance-engine";
import { sampleWidgetData } from "@/lib/widgets/sample";
import { Icon } from "@/components/app/icons";
import { WidgetPageContext, WidgetSizeContext } from "@/components/app/widgets/shell";
import { Projects, VocabQuiz, VocabStats } from "@/components/app/widgets/sections";
import { CoursesBudget, CoursesLast, ListsOverview, MenuWeek } from "@/components/app/widgets/courses";
import { TasksCalendar, TasksList } from "@/components/app/widgets/tasks";
import { RoutinesCurve } from "@/components/app/widgets/routines";
import type { WidgetProps } from "@/components/app/widgets/types";
import { FinAccounts, FinActions, FinBreakdown, FinBudgets, FinCalendar, FinCharges, FinIncomes, FinReste, FinTrend } from "@/components/app/widgets/finance";
import { CalAgenda, CalWeek, ListsShopping, NotesRecent, NotesVocab, RecipesIdeas, RoutinesToday, TasksStat } from "@/components/app/widgets/life";

const RENDER: Record<WidgetType, (p: WidgetProps) => JSX.Element> = {
  "fin-accounts": FinAccounts,
  "fin-reste": FinReste,
  "fin-calendar": FinCalendar,
  "fin-breakdown": FinBreakdown,
  "fin-budgets": FinBudgets,
  "fin-incomes": FinIncomes,
  "fin-charges": FinCharges,
  "fin-trend": FinTrend,
  "fin-actions": FinActions,
  "tasks-list": TasksList,
  "tasks-stat": TasksStat,
  projects: Projects,
  "lists-overview": ListsOverview,
  "vocab-stats": VocabStats,
  "vocab-quiz": VocabQuiz,
  "routines-today": RoutinesToday,
  "routines-week": RoutinesCurve,
  "tasks-calendar": TasksCalendar,
  "menu-week": MenuWeek,
  "courses-budget": CoursesBudget,
  "courses-last": CoursesLast,
  "cal-agenda": CalAgenda,
  "cal-week": CalWeek,
  "lists-shopping": ListsShopping,
  "recipes-ideas": RecipesIdeas,
  "notes-vocab": NotesVocab,
  "notes-recent": NotesRecent,
};

const SIZE_SHORT: Record<WidgetSize, string> = { s: "S", m: "M", l: "L", xl: "XL" };
const SIZE_COLS: Record<WidgetSize, number> = { s: 1, m: 2, l: 3, xl: 4 };

export function WidgetBoard({ page, initial, data, toolbar }: { page: WidgetPage; initial: WidgetItem[]; data: WidgetData; toolbar?: React.ReactNode }) {
  const tr = useT();
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [saving, start] = useTransition();
  const realMonth = { y: Number(data.today.slice(0, 4)), m: Number(data.today.slice(5, 7)) - 1 };
  const [viewMonth, setViewMonth] = useState(realMonth);
  const isReal = viewMonth.y === realMonth.y && viewMonth.m === realMonth.m;
  // Vue d'ensemble Finance : on peut se déplacer dans le temps ; les widgets lisent alors la date de référence du mois choisi.
  const refDate = page === "finance" && !isReal ? monthBounds(viewMonth.y, viewMonth.m).start : data.today;
  const viewData: WidgetData = refDate === data.today ? data : { ...data, today: refDate, realToday: data.today };
  const shiftMonth = (delta: number) => {
    const d = new Date(Date.UTC(viewMonth.y, viewMonth.m + delta, 1));
    setViewMonth({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const dragId = useRef<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);

  const persist = (next: WidgetItem[]) => {
    setItems(next);
    start(() => saveWidgetLayout(page, next));
  };
  const update = (id: string, patch: Partial<WidgetItem>) => persist(items.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const setOpts = (id: string) => (patch: WidgetOpts) => {
    const cur = items.find((i) => i.id === id);
    update(id, { opts: { ...(cur?.opts ?? {}), ...patch } });
  };
  const move = (id: string, delta: number) => {
    const idx = items.findIndex((i) => i.id === id);
    const to = idx + delta;
    if (idx < 0 || to < 0 || to >= items.length) return;
    const next = [...items];
    const [it] = next.splice(idx, 1);
    next.splice(to, 0, it);
    persist(next);
  };
  const dropOn = (targetId: string) => {
    const from = dragId.current;
    dragId.current = null;
    setOverId(null);
    if (!from || from === targetId) return;
    const next = items.filter((i) => i.id !== from);
    const at = next.findIndex((i) => i.id === targetId);
    next.splice(at, 0, items.find((i) => i.id === from)!);
    persist(next);
  };
  const add = (type: WidgetType, size: WidgetSize) => {
    persist([...items, { id: `${type}-${Date.now().toString(36)}`, type, size }]);
  };

  return (
    <WidgetPageContext.Provider value={page}>
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          {page === "finance" ? (
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => shiftMonth(-1)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois précédent")}><Icon name="chevronLeft" /></button>
              <p className="min-w-[140px] text-center text-[15px] font-bold text-stone-900">{MONTHS_FR[viewMonth.m]} {viewMonth.y}</p>
              <button type="button" onClick={() => shiftMonth(1)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800" aria-label={tr("Mois suivant")}><Icon name="chevronRight" /></button>
              {!isReal && <button type="button" onClick={() => setViewMonth(realMonth)} className="btn-secondary ml-1 px-2.5 py-1 text-[11px]">{tr("Aujourd'hui")}</button>}
            </div>
          ) : (
            toolbar
          )}
        </div>
        <div className="flex items-center gap-2">
          {saving && <span className="text-[11px] text-stone-400">{tr("Enregistrement…")}</span>}
          {editing ? (
            <>
              <button onClick={() => persist(DEFAULT_LAYOUTS[page])} className="btn-secondary px-3 py-1.5 text-xs">{tr("Réinitialiser")}</button>
              <button onClick={() => setDrawer(true)} className="btn-secondary px-3 py-1.5 text-xs"><Icon name="plus" className="h-3.5 w-3.5" />{tr("Ajouter un widget")}</button>
              <button onClick={() => { setEditing(false); setDrawer(false); }} className="btn-primary px-3 py-1.5 text-xs">{tr("Terminé")}</button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="btn-secondary px-3 py-1.5 text-xs"><Icon name="grid" className="h-3.5 w-3.5" />{tr("Personnaliser")}</button>
          )}
        </div>
      </div>

      {items.length === 0 && (
        <button onClick={() => { setEditing(true); setDrawer(true); }} className="flex w-full flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-line py-16 text-sm text-stone-400 hover:border-brand-300 hover:text-brand-700">
          <Icon name="plus" className="h-6 w-6" />
          {tr("Ajoute ton premier widget")}
        </button>
      )}

      <div className="grid grid-flow-row-dense auto-rows-[8px] grid-cols-1 gap-x-4 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((it, idx) => {
          const def = WIDGET_BY_TYPE[it.type];
          const Comp = RENDER[it.type];
          return (
            <MasonryItem
              key={it.id}
              draggable={editing}
              onDragStart={(e) => { dragId.current = it.id; e.dataTransfer.effectAllowed = "move"; }}
              onDragOver={(e) => { if (!editing) return; e.preventDefault(); setOverId(it.id); }}
              onDragLeave={() => setOverId((o) => (o === it.id ? null : o))}
              onDrop={(e) => { e.preventDefault(); dropOn(it.id); }}
              onDragEnd={() => { dragId.current = null; setOverId(null); }}
              style={{ animationDelay: `${Math.min(idx, 10) * 55}ms` }}
              className={cx("min-w-0 animate-rise", spanClass(it.size), editing && "cursor-grab")}
              ringed={overId === it.id}
              fixedHeight={def.auto ? undefined : WIDGET_UNIT_HEIGHT}
            >
              <div className={cx(editing && "pointer-events-none select-none opacity-80")}>
                <WidgetSizeContext.Provider value={it.size}>
                  <Comp key={refDate} data={viewData} size={it.size} opts={it.opts ?? {}} setOpts={setOpts(it.id)} />
                </WidgetSizeContext.Provider>
              </div>
              {editing && (
                <div className="absolute inset-0 z-20 rounded-[20px] border-2 border-dashed border-brand-400/60 bg-surface/30 backdrop-blur-[1px]">
                  <div title={tr("{name} · glisse pour déplacer", { name: tr(def.title) })} className="absolute left-1/2 top-1.5 -translate-x-1/2 rounded-md bg-surface/95 px-2 py-0.5 text-stone-400 shadow-sm">
                    <Icon name="drag" className="h-3.5 w-3.5 rotate-90" />
                  </div>
                  <button onClick={() => persist(items.filter((i) => i.id !== it.id))} title={tr("Retirer")} className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ink text-onink shadow hover:bg-rose-600">
                    <Icon name="close" className="h-3 w-3" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-xl bg-surface/95 p-1 shadow-md">
                    <button onClick={() => move(it.id, -1)} disabled={idx === 0} title={tr("Avancer")} className="rounded-md p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"><Icon name="chevronLeft" className="h-3.5 w-3.5" /></button>
                    {def.sizes.map((s) => (
                      <button key={s} onClick={() => update(it.id, { size: s })} title={tr(SIZE_LABEL[s])} className={cx("min-w-[26px] rounded-md px-1.5 py-0.5 text-[11px] font-bold", it.size === s ? "bg-brand-600 text-white" : "text-stone-500 hover:bg-stone-100")}>
                        {SIZE_SHORT[s]}
                      </button>
                    ))}
                    <button onClick={() => move(it.id, 1)} disabled={idx === items.length - 1} title={tr("Reculer")} className="rounded-md p-1 text-stone-500 hover:bg-stone-100 disabled:opacity-30"><Icon name="chevronRight" className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              )}
            </MasonryItem>
          );
        })}
      </div>

      {drawer && <WidgetDrawer page={page} today={data.realToday ?? data.today} items={items} onAdd={add} onClose={() => setDrawer(false)} />}
    </div>
    </WidgetPageContext.Provider>
  );
}

/**
 * Case de grille « maçonnerie » : la grille a des lignes de 8 px et chaque widget occupe exactement sa hauteur réelle,
 * si bien qu'un widget plus court ne laisse plus de vide et qu'un autre peut se placer juste en dessous.
 */
function MasonryItem({ children, className, style, ringed, fixedHeight, ...rest }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; ringed?: boolean; fixedHeight?: number } & Omit<React.HTMLAttributes<HTMLDivElement>, "className" | "style" | "children">) {
  const inner = useRef<HTMLDivElement>(null);
  const [span, setSpan] = useState(fixedHeight ? Math.ceil((fixedHeight + 16) / 8) : 24);
  useEffect(() => {
    const el = inner.current;
    if (!el || fixedHeight) return;
    const measure = () => setSpan(Math.max(1, Math.ceil((el.offsetHeight + 16) / 8)));
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fixedHeight]);
  return (
    <div {...rest} className={className} style={{ ...style, gridRowEnd: `span ${span}` }}>
      <div
        ref={inner}
        style={fixedHeight ? { height: fixedHeight } : undefined}
        className={cx("relative", fixedHeight ? "[&>div]:h-full [&>div>section]:h-full [&>div>section>div:last-child]:overflow-y-auto [&>div>section>div:last-child]:[scrollbar-width:thin]" : "", ringed && "rounded-2xl ring-2 ring-brand-400 ring-offset-2 ring-offset-canvas")}
      >
        {children}
      </div>
    </div>
  );
}

function SizePreview({ size }: { size: WidgetSize }) {
  return (
    <span className="grid w-10 grid-cols-4 gap-px">
      {[0, 1, 2, 3].map((i) => (
        <span key={i} className={cx("h-2.5 rounded-[2px]", i < SIZE_COLS[size] ? "bg-current" : "bg-current opacity-20")} />
      ))}
    </span>
  );
}

const PREVIEW_COLS: Record<WidgetSize, number> = { s: 1, m: 2, l: 3, xl: 4 };
const PREVIEW_W = 316;

/** Vrai rendu du widget (données d'exemple), réduit et non cliquable, à la largeur qu'il aurait sur la page. */
function WidgetPreview({ type, size, data }: { type: WidgetType; size: WidgetSize; data: WidgetData }) {
  const tr = useT();
  const Comp = RENDER[type];
  const cols = PREVIEW_COLS[size];
  const full = 290 * cols + 16 * (cols - 1);
  const scale = Math.min(1, PREVIEW_W / full);
  const inner = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(200);
  useEffect(() => {
    const el = inner.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-line bg-canvas" style={{ height: Math.min(h * scale + 16, 200) }} aria-hidden>
      <div className="pointer-events-none absolute left-2 top-2 origin-top-left select-none" style={{ width: full, transform: `scale(${scale * 0.96})` }}>
        <div ref={inner}>
          <WidgetSizeContext.Provider value={size}>
            <Comp data={data} size={size} opts={{}} setOpts={() => {}} />
          </WidgetSizeContext.Provider>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-canvas to-transparent" />
      <span className="absolute right-1.5 top-1.5 rounded-full bg-surface/90 px-1.5 py-px text-[9px] font-medium text-stone-400">{tr("exemple")}</span>
    </div>
  );
}

function WidgetDrawer({ page, today, items, onAdd, onClose }: { page: WidgetPage; today: string; items: WidgetItem[]; onAdd: (t: WidgetType, s: WidgetSize) => void; onClose: () => void }) {
  const tr = useT();
  const allowed = PAGE_SECTIONS[page];
  const [section, setSection] = useState<WidgetSection | "all">("all");
  const [sizes, setSizes] = useState<Partial<Record<WidgetType, WidgetSize>>>({});
  const [justAdded, setJustAdded] = useState<WidgetType | null>(null);
  const list = WIDGETS.filter((w) => allowed.includes(w.section) && (section === "all" || w.section === section));
  const sample = useMemo(() => sampleWidgetData(today), [today]);

  return (
    <>
      <div className="fixed inset-0 z-40 animate-fade bg-black/20 lg:bg-transparent" onClick={onClose} aria-hidden />
      <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[380px] animate-slideIn flex-col border-l border-line bg-canvas shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="text-sm font-bold text-stone-900">{tr("Ajouter un widget")}</p>
            <p className="text-[11px] text-stone-500">{tr("Choisis un format, puis ajoute-le à ta page.")}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-stone-400 hover:bg-stone-100"><Icon name="close" /></button>
        </div>
        {allowed.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto border-b border-line px-5 py-3">
            {[{ key: "all" as const, label: tr("Tous") }, ...SECTIONS.filter((s) => allowed.includes(s.key))].map((s) => (
              <button key={s.key} onClick={() => setSection(s.key)} className={cx("shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold transition", section === s.key ? "bg-ink text-onink" : "bg-surface text-stone-500 hover:text-stone-800")}>
                {tr(s.label)}
              </button>
            ))}
          </div>
        )}
        <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
          {list.map((w) => {
            const chosen = sizes[w.type] ?? w.defaultSize;
            const count = items.filter((i) => i.type === w.type).length;
            return (
              <div key={w.type} className="rounded-2xl border border-line bg-surface p-3.5">
                <div className="flex items-start gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon name={w.icon} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-[13px] font-semibold text-stone-900">
                      {tr(w.title)}
                      {count > 0 && <span className="rounded-full bg-stone-100 px-1.5 py-px text-[10px] font-medium text-stone-500">{tr("affiché")}{count > 1 ? ` ×${count}` : ""}</span>}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-snug text-stone-500">{tr(w.description)}</p>
                  </div>
                </div>
                <WidgetPreview type={w.type} size={chosen} data={sample} />
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {w.sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSizes((m) => ({ ...m, [w.type]: s }))}
                        title={tr(SIZE_LABEL[s])}
                        className={cx("flex flex-col items-center gap-1 rounded-lg border px-2 py-1.5 text-[10px] font-semibold transition", chosen === s ? "border-brand-400 bg-brand-50 text-brand-700" : "border-line text-stone-400 hover:text-stone-700")}
                      >
                        <SizePreview size={s} />
                        {tr(SIZE_LABEL[s])}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => { onAdd(w.type, chosen); setJustAdded(w.type); setTimeout(() => setJustAdded((t) => (t === w.type ? null : t)), 1200); }}
                    className={cx("shrink-0 rounded-lg px-3 py-1.5 text-[11px] font-semibold transition", justAdded === w.type ? "bg-emerald-600 text-white" : "bg-brand-600 text-white hover:bg-brand-700")}
                  >
                    {justAdded === w.type ? tr("Ajouté ✓") : tr("Ajouter")}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </aside>
    </>
  );
}
