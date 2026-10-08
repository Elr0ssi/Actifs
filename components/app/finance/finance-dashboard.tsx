"use client";

import { useT } from "@/components/i18n/provider";
import { intlLocale } from "@/lib/i18n";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addDays,
  describeRecurrence,
  expand,
  getDailyBalances,
  getMonthlyBudget,
  getDateSituation,
  getSkippedOccurrences,
  type OpKind,
  KIND_LABEL,
  KIND_STYLE,
  monthBounds,
  occurrencesOf,
  toMs,
  type BalanceAnchor,
  type FinOp,
  type Occurrence,
} from "@/lib/finance-engine";
import { formatEUR, MONTHS_FR, cx } from "@/lib/utils";
import { DonutChart } from "@/components/app/charts/donut-chart";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { skipOccurrence, restoreOccurrence, deleteOperation } from "@/app/app/finance/actions";

type View = "month" | "week" | "year";
import { DOW } from "@/components/app/widgets/helpers";

const dayNum = (d: string) => new Date(toMs(d)).getUTCDate();
const monthOf = (d: string) => new Date(toMs(d)).getUTCMonth();
const yearOf = (d: string) => new Date(toMs(d)).getUTCFullYear();
const mondayOf = (d: string) => addDays(d, -((new Date(toMs(d)).getUTCDay() + 6) % 7));
const fmtLong = (d: string) =>
  new Date(toMs(d)).toLocaleDateString(intlLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString(intlLocale(), { day: "numeric", month: "short", timeZone: "UTC" });

function tooltip(o: Occurrence) {
  const next = occurrencesOf(o.op, addDays(o.date, 1), addDays(o.date, 400))[0];
  return [
    o.op.name,
    `${o.signed > 0 ? "+" : "-"}${formatEUR(o.op.amount)}`,
    KIND_LABEL[o.op.kind],
    describeRecurrence(o.op),
    next ? `Prochaine occurrence : ${fmtShort(next)}` : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function FinanceDashboard({
  ops,
  anchor,
  today,
}: {
  ops: FinOp[];
  anchor: BalanceAnchor;
  today: string;
}) {
  const tr = useT();
  const [view, setView] = useState<View>("month");
  const [mode, setMode] = useState<"month" | "carried">("carried");
  const [selected, setSelected] = useState(today);
  const [cursor, setCursor] = useState({ y: yearOf(today), m: monthOf(today) });
  const { y, m } = cursor;
  const { start: mStart, end: mEnd } = monthBounds(y, m);

  // "Mois seul" repartis à 0 le mois choisi ; "Avec solde reporté" part du vrai solde du compte courant.
  const effectiveAnchor: BalanceAnchor = useMemo(
    () => (mode === "carried" ? anchor : { balance: 0, date: addDays(mStart, -1) }),
    [mode, anchor, mStart]
  );

  const select = (d: string) => {
    setSelected(d);
    setCursor({ y: yearOf(d), m: monthOf(d) });
  };
  const nav = (delta: number) => {
    if (view === "year") return setCursor({ y: y + delta, m });
    if (view === "week") return select(addDays(selected, 7 * delta));
    const d = new Date(Date.UTC(y, m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };

  const gridStart = view === "week" ? mondayOf(selected) : mondayOf(mStart);
  const gridEnd = view === "week" ? addDays(gridStart, 6) : addDays(mondayOf(mEnd), 6);
  const occByDate = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of expand(ops, gridStart, gridEnd)) map.set(o.date, [...(map.get(o.date) ?? []), o]);
    return map;
  }, [ops, gridStart, gridEnd]);
  const skippedByDate = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    for (const o of getSkippedOccurrences(ops, gridStart, gridEnd)) map.set(o.date, [...(map.get(o.date) ?? []), o]);
    return map;
  }, [ops, gridStart, gridEnd]);
  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  // Drag the calendar left/right with the mouse held to navigate months, like a carousel.
  const [grabbing, setGrabbing] = useState(false);
  const drag = useRef({ active: false, startX: 0, moved: false });
  useEffect(() => {
    const THRESHOLD = 60;
    const onMove = (e: MouseEvent) => {
      if (!drag.current.active) return;
      const dx = e.clientX - drag.current.startX;
      if (Math.abs(dx) > THRESHOLD) {
        drag.current.moved = true;
        nav(dx < 0 ? 1 : -1);
        drag.current.startX = e.clientX;
      }
    };
    const onUp = () => {
      drag.current.active = false;
      setGrabbing(false);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  });
  const onGridMouseDown = (e: React.MouseEvent) => {
    drag.current = { active: true, startX: e.clientX, moved: false };
    setGrabbing(true);
  };
  const onDaySelect = (d: string) => {
    if (drag.current.moved) return; // this click ended a drag, not a tap on a day
    select(d);
  };

  const title = view === "year" ? String(y) : view === "week" ? `Semaine du ${fmtShort(gridStart)}` : `${MONTHS_FR[m]} ${y}`;

  return (
    <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
      <section className="card min-w-0 p-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button onClick={() => nav(-1)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800">‹</button>
            <h2 className="min-w-[140px] text-center text-[15px] font-bold capitalize text-stone-900">{title}</h2>
            <button onClick={() => nav(1)} className="rounded-md p-1.5 text-stone-400 hover:bg-stone-100 hover:text-stone-800">›</button>
            <button onClick={() => { select(today); if (view === "year") setView("month"); }} className="btn-secondary ml-1 px-2.5 py-1 text-[11px]">{tr("Aujourd'hui")}</button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="segmented" title={mode === "carried" ? tr("Part du solde réel du compte courant") : tr("Repart de 0 au début du mois")}>
              <button data-active={mode === "carried"} onClick={() => setMode("carried")}>{tr("Solde reporté")}</button>
              <button data-active={mode === "month"} onClick={() => setMode("month")}>{tr("Mois seul")}</button>
            </div>
            <div className="segmented">
              {(["month", "week", "year"] as View[]).map((v) => (
                <button key={v} data-active={view === v} onClick={() => setView(v)}>
                  {v === "month" ? tr("Mois") : v === "week" ? tr("Semaine") : tr("Année")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {view === "year" ? (
          <YearGrid ops={ops} anchor={anchor} mode={mode} year={y} today={today} onPick={(mm) => { setCursor({ y, m: mm }); setView("month"); }} />
        ) : (
          <>
            <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400">
              {DOW.map((d) => <div key={d} className="pb-1.5">{d}</div>)}
            </div>
            <div
              onMouseDown={onGridMouseDown}
              className={cx("grid grid-cols-7 overflow-hidden rounded-xl border border-line select-none", grabbing ? "cursor-grabbing" : "cursor-grab")}
            >
              {days.map((d) => {
                const occ = occByDate.get(d) ?? [];
                const outside = view === "month" && monthOf(d) !== m;
                const max = view === "week" ? 8 : 2;
                return (
                  <button
                    key={d}
                    onClick={() => onDaySelect(d)}
                    className={cx(
                      "flex min-w-0 flex-col gap-0.5 border-b border-r border-line/70 p-1 text-left transition hover:bg-brand-50/40",
                      view === "week" ? "min-h-[200px]" : "min-h-[72px]",
                      outside && "bg-stone-50/70 text-stone-300",
                      d === selected && "bg-brand-50/70 ring-1 ring-inset ring-brand-300"
                    )}
                  >
                    <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold", d === today ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-600")}>
                      {dayNum(d)}
                    </span>
                    {occ.slice(0, max).map((o, i) => (
                      <span key={i} title={tooltip(o)} className={cx("w-full truncate text-[10px] font-semibold leading-tight", o.signed > 0 ? "text-emerald-600" : "text-rose-600", outside && "opacity-50")}>
                        {o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}
                        <span className="block truncate font-normal text-stone-400">{o.op.name}</span>
                      </span>
                    ))}
                    {occ.length > max && <span className="text-[10px] text-stone-400">+{occ.length - max}</span>}
                    {(skippedByDate.get(d) ?? []).map((o, i) => (
                      <span key={`s${i}`} title={`${o.op.name} — occurrence ignorée`} className="w-full truncate text-[10px] text-stone-300 line-through">
                        {formatEUR(o.op.amount)}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-stone-400">
          {(["income", "fixed", "variable", "savings"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1"><span className={cx("h-1.5 w-1.5 rounded-full", KIND_STYLE[k].dot)} />{KIND_LABEL[k]}</span>
          ))}
          <span className="ml-auto hidden sm:inline">{tr("Astuce : fais glisser le calendrier pour changer de mois.")}</span>
        </div>
      </section>

      <div className="lg:sticky lg:top-6">
        <DayPanel ops={ops} anchor={effectiveAnchor} date={selected} />
      </div>
    </div>
  );
}

function SkippedList({ items, onRestore }: { items: Occurrence[]; onRestore: (o: Occurrence) => void }) {
  const tr = useT();
  return (
    <ul className="space-y-1">
      {items.map((o, i) => (
        <li key={i} className="flex items-center gap-2 text-sm text-stone-400">
          <span className="w-12 shrink-0 whitespace-nowrap text-[11px]">{fmtShort(o.date)}</span>
          <span className="min-w-0 flex-1 truncate line-through">{o.op.name}</span>
          <span className="shrink-0 line-through">{formatEUR(o.op.amount)}</span>
          <button onClick={() => onRestore(o)} className="shrink-0 text-[11px] font-medium text-brand-600 hover:underline">{tr("Rétablir")}</button>
        </li>
      ))}
    </ul>
  );
}

function OccList({ items, onSkip, onDelete }: { items: Occurrence[]; onSkip?: (o: Occurrence) => void; onDelete?: (o: Occurrence) => void }) {
  const tr = useT();
  return (
    <ul className="space-y-1.5">
      {items.map((o, i) => (
        <li key={i} className="group flex items-center gap-2 text-[12px]" title={tooltip(o)}>
          <span className="w-12 shrink-0 whitespace-nowrap text-[11px] text-stone-400">{fmtShort(o.date)}</span>
          <span className={cx("h-2 w-2 shrink-0 rounded-full", KIND_STYLE[o.op.kind].dot)} />
          <span className="min-w-0 flex-1 truncate text-stone-700">{o.op.name}{o.op.txn && <span className="text-stone-400"> · {o.op.txn.time ?? "carte"}{o.op.txn.card ? ` · ${o.op.txn.card}` : ""}</span>}</span>
          {(onSkip || onDelete) && (
            <button
              onClick={() => (o.op.frequency !== "once" ? onSkip?.(o) : onDelete?.(o))}
              className="hidden text-[11px] text-stone-400 hover:text-rose-600 group-hover:inline"
              title={o.op.frequency !== "once" ? tr("Ignorer cette occurrence") : tr("Supprimer")}
            >
              ✕
            </button>
          )}
          <span className={cx("shrink-0 font-semibold", KIND_STYLE[o.op.kind].text)}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}</span>
        </li>
      ))}
    </ul>
  );
}

function DayPanel({ ops, anchor, date }: { ops: FinOp[]; anchor: BalanceAnchor; date: string }) {
  const tr = useT();
  const s = useMemo(() => getDateSituation(ops, anchor, date), [ops, anchor, date]);
  const [pending, start] = useTransition();
  const skip = (o: Occurrence) => start(() => skipOccurrence(o.op.table, o.op.id, o.date));
  const del = (o: Occurrence) => start(() => deleteOperation(o.op.table, o.op.id));
  const skipped = useMemo(() => {
    const d = new Date(toMs(date));
    const { start: from, end: to } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
    return getSkippedOccurrences(ops, from, to);
  }, [ops, date]);

  return (
    <aside className={cx("card space-y-4 p-4", pending && "opacity-70")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold capitalize text-stone-900">{fmtLong(date)}</p>
        <NewOperationButton defaultDate={date} label={tr("+ Ajouter")} className="btn-ghost shrink-0" />
      </div>

      <div className="rounded-xl bg-brand-50 p-3">
        <p className="text-xs font-medium text-brand-800">Reste à vivre au {fmtShort(date)}</p>
        <p className={cx("tabular mt-0.5 text-2xl font-bold", s.balance >= 0 ? "text-brand-800" : "text-rose-600")}>{formatEUR(s.balance)}</p>
        <p className="mt-2 border-t border-brand-100 pt-2 text-xs text-brand-800">
          Solde prévu au {fmtShort(s.monthEnd)} : <b className={s.endBalance >= 0 ? "" : "text-rose-600"}>{formatEUR(s.endBalance)}</b>
        </p>
        <p className="text-[11px] text-brand-700/70">≈ {formatEUR(s.perDay)}/jour jusqu'à la fin du mois ({s.daysRemaining} j)</p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-[12px] font-semibold text-stone-800">Opérations passées <span className="font-normal text-stone-400">{tr("(ce mois)")}</span></p>
        </div>
        {s.past.length === 0 ? <p className="text-sm text-stone-400">{tr("Aucune.")}</p> : <OccList items={s.past} onSkip={skip} onDelete={del} />}
        {s.past.length > 0 && (
          <div className="mt-2 flex justify-between rounded-lg bg-stone-50 px-3 py-1.5 text-xs">
            <span className="text-emerald-600">+{formatEUR(s.pastIn)}</span>
            <span className="text-rose-600">-{formatEUR(s.pastOut)}</span>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold text-stone-800">Opérations à venir <span className="font-normal text-stone-400">(jusqu'au {fmtShort(s.monthEnd)})</span></p>
        {s.upcoming.length === 0 ? <p className="text-sm text-stone-400">{tr("Rien de prévu.")}</p> : <OccList items={s.upcoming} onSkip={skip} onDelete={del} />}
        {(s.upcomingIn > 0 || s.upcomingOut > 0) && (
          <div className="mt-2 space-y-1 rounded-lg bg-stone-50 px-3 py-2 text-xs">
            <div className="flex justify-between"><span className="text-stone-500">{tr("Entrées à venir")}</span><span className="font-semibold text-emerald-600">+{formatEUR(s.upcomingIn)}</span></div>
            <div className="flex justify-between"><span className="text-stone-500">{tr("Sorties à venir")}</span><span className="font-semibold text-rose-600">-{formatEUR(s.upcomingOut)}</span></div>
            {s.outflowByAccount.length > 0 && (
              <div className="border-t border-stone-200 pt-1">
                <p className="mb-0.5 text-stone-400">{tr("À provisionner par compte")}</p>
                {s.outflowByAccount.map((a) => (
                  <div key={a.account} className="flex justify-between"><span className="text-stone-600">{a.account}</span><span className="font-semibold text-stone-800">{formatEUR(a.amount)}</span></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {skipped.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-stone-400">{tr("Ignorées ce mois")}</p>
          <SkippedList items={skipped} onRestore={(o) => start(() => restoreOccurrence(o.op.table, o.op.id, o.date))} />
        </div>
      )}
    </aside>
  );
}

type BreakdownMode = "global" | "fixed" | "variable" | "savings";
const BREAKDOWN_LABEL: Record<BreakdownMode, string> = { global: "Global", fixed: "Charges fixes", variable: "Dépenses variables", savings: "Épargne" };

/** Garde les plus grosses catégories et regroupe le reste : la palette catégorielle n'a que 6 teintes distinctes. */
function fold(items: { label: string; value: number }[], max = 6) {
  const list = items.filter((i) => i.value > 0);
  if (list.length <= max) return list;
  return [...list.slice(0, max - 1), { label: "Autres", value: list.slice(max - 1).reduce((s, i) => s + i.value, 0) }];
}

export function BudgetBreakdown({ budget, size = 150 }: { budget: ReturnType<typeof getMonthlyBudget>; size?: number }) {
  const tr = useT();
  const [mode, setMode] = useState<BreakdownMode>("global");
  const [picked, setPicked] = useState<string | null>(null);
  const spend = budget.fixed + budget.variable + budget.savings;
  const items =
    mode === "global"
      ? [
          { label: tr("Charges fixes"), value: budget.fixed },
          { label: tr("Dépenses variables"), value: budget.variable },
          { label: tr("Épargne"), value: budget.savings },
        ].filter((i) => i.value > 0)
      : fold(mode === "fixed" ? budget.fixedByCategory : mode === "variable" ? budget.variableByCategory : budget.savingsByCategory);
  const total = items.reduce((s, i) => s + i.value, 0);
  const pickedItem = items.find((i) => i.label === picked);
  const seg = (v: number) => `${spend > 0 ? (v / spend) * 100 : 0}%`;

  return (
    <section className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-stone-900">{tr("Répartition du budget")}</p>
        <div className="segmented">
          {(Object.keys(BREAKDOWN_LABEL) as BreakdownMode[]).map((v) => (
            <button key={v} type="button" data-active={mode === v} onClick={() => { setMode(v); setPicked(null); }}>
              {BREAKDOWN_LABEL[v]}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-stone-500">Total dépensé / réservé : <b className="text-stone-800">{formatEUR(spend)}</b> {budget.income > 0 && `· ${Math.round((spend / budget.income) * 100)} % des revenus`}</p>
      <div className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full bg-stone-100">
        <div className="bg-rose-400" style={{ width: seg(budget.fixed) }} title={tr("Charges fixes")} />
        <div className="bg-amber-400" style={{ width: seg(budget.variable) }} title={tr("Dépenses variables")} />
        <div className="bg-violet-400" style={{ width: seg(budget.savings) }} title={tr("Épargne")} />
      </div>
      <div className="mt-4">
        <DonutChart items={items} size={size} strokeWidth={Math.round(size / 7)} centerCaption={mode === "global" ? "budget" : BREAKDOWN_LABEL[mode].toLowerCase()} selected={picked} onSelect={(l) => setPicked(l === picked ? null : l)} />
        {pickedItem && (
          <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
            <b>{pickedItem.label}</b> : {formatEUR(pickedItem.value)} soit {total > 0 ? Math.round((pickedItem.value / total) * 100) : 0} % {mode === "global" ? tr("du budget") : `des ${BREAKDOWN_LABEL[mode].toLowerCase()}`}
            {budget.income > 0 && ` · ${Math.round((pickedItem.value / budget.income) * 100)} % des revenus`}
          </p>
        )}
      </div>
    </section>
  );
}

function YearGrid({ ops, anchor, mode, year, today, onPick }: { ops: FinOp[]; anchor: BalanceAnchor; mode: "month" | "carried"; year: number; today: string; onPick: (m: number) => void }) {
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, mm) => {
        const { start, end } = monthBounds(year, mm);
        const occ = expand(ops, start, end);
        const inflow = occ.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0);
        const outflow = -occ.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0);
        // "Mois seul" : chaque mois reprojette depuis 0, sans les gains/pertes accumulés avant lui.
        const monthAnchor: BalanceAnchor = mode === "carried" ? anchor : { balance: 0, date: addDays(start, -1) };
        return { mm, inflow, outflow, endBalance: getDailyBalances(ops, monthAnchor, end, end)[0].balance, current: today >= start && today <= end };
      }),
    [ops, anchor, mode, year, today]
  );
  const maxAbs = Math.max(1, ...months.map((x) => Math.abs(x.endBalance)));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((mo) => (
        <button key={mo.mm} onClick={() => onPick(mo.mm)} className={cx("rounded-xl border p-3 text-left transition hover:border-brand-300", mo.current ? "border-brand-400 bg-brand-50/50" : "border-stone-100")}>
          <p className="text-xs font-semibold text-stone-500">{MONTHS_FR[mo.mm]}</p>
          <p className={cx("mt-1 text-lg font-bold", mo.endBalance >= 0 ? "text-stone-900" : "text-rose-600")}>{formatEUR(mo.endBalance)}</p>
          <div className="mt-1 h-1.5 rounded-full bg-stone-100">
            <div className={cx("h-1.5 rounded-full", mo.endBalance >= 0 ? "bg-brand-500" : "bg-rose-500")} style={{ width: `${(Math.abs(mo.endBalance) / maxAbs) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-emerald-600">+{formatEUR(mo.inflow)} <span className="text-rose-500">-{formatEUR(mo.outflow)}</span></p>
        </button>
      ))}
    </div>
  );
}
