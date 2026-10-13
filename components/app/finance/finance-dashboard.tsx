"use client";

import { useT } from "@/components/i18n/provider";
import { intlLocale } from "@/lib/i18n";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  addDays,
  describeRecurrence,
  expand,
  getBudgetLines,
  getDailyBalances,
  getEnvelopes,
  getMonthlyBudget,
  getDateSituation,
  getSavingsAt,
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
import { ValidateButton } from "@/components/app/finance/validate-button";
import Link from "next/link";
import { skipOccurrence, restoreOccurrence, deleteOperation } from "@/app/(main)/app/finance/actions";

type View = "month" | "week" | "year";
import { DOW } from "@/components/app/widgets/helpers";

const dayNum = (d: string) => new Date(toMs(d)).getUTCDate();
const monthOf = (d: string) => new Date(toMs(d)).getUTCMonth();
const yearOf = (d: string) => new Date(toMs(d)).getUTCFullYear();
const mondayOf = (d: string) => addDays(d, -((new Date(toMs(d)).getUTCDay() + 6) % 7));
const fmtLong = (d: string) =>
  new Date(toMs(d)).toLocaleDateString(intlLocale(), { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString(intlLocale(), { day: "numeric", month: "short", timeZone: "UTC" });

function tooltip(o: Occurrence, tr: (k: string, v?: Record<string, string | number>) => string) {
  const next = occurrencesOf(o.op, addDays(o.date, 1), addDays(o.date, 400))[0];
  return [
    o.op.name,
    `${o.signed > 0 ? "+" : "-"}${formatEUR(o.amount)}`,
    tr(KIND_LABEL[o.op.kind]),
    describeRecurrence(o.op, tr),
    next ? tr("Prochaine occurrence : {date}", { date: fmtShort(next) }) : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export function FinanceDashboard({
  ops,
  anchor,
  today,
  savingsLast = null,
}: {
  ops: FinOp[];
  anchor: BalanceAnchor;
  today: string;
  /** Dernier solde d'épargne saisi (pour afficher « reste sur l'épargne »). */
  savingsLast?: { date: string; balance: number } | null;
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

  const title = view === "year" ? String(y) : view === "week" ? tr("Semaine du {date}", { date: fmtShort(gridStart) }) : `${MONTHS_FR[m]} ${y}`;

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
                      view === "week" ? "min-h-[120px] sm:min-h-[200px]" : "min-h-[52px] sm:min-h-[72px]",
                      outside && "bg-stone-50/70 text-stone-300",
                      d === selected && "bg-brand-50/70 ring-1 ring-inset ring-brand-300"
                    )}
                  >
                    <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold", d === today ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-600")}>
                      {dayNum(d)}
                    </span>
                    {/* Téléphone : cases trop étroites pour des montants, on garde des pastilles de couleur (le détail est dans le panneau du jour) */}
                    {occ.length > 0 && (
                      <span className="flex flex-wrap gap-0.5 sm:hidden">
                        {occ.slice(0, 6).map((o, i) => <span key={i} className={cx("h-1.5 w-1.5 rounded-full", KIND_STYLE[o.op.kind].dot, outside && "opacity-40")} />)}
                      </span>
                    )}
                    {occ.slice(0, max).map((o, i) => (
                      <span key={i} title={tooltip(o, tr)} className={cx("hidden w-full truncate text-[10px] font-semibold leading-tight sm:block", o.signed > 0 ? "text-emerald-600" : "text-rose-600", outside && "opacity-50")}>
                        {o.signed > 0 ? "+" : "-"}{formatEUR(o.amount)}
                        <span className="block truncate font-normal text-stone-400">{o.op.name}</span>
                      </span>
                    ))}
                    {occ.length > max && <span className="hidden text-[10px] text-stone-400 sm:block">+{occ.length - max}</span>}
                    {(skippedByDate.get(d) ?? []).map((o, i) => (
                      <span key={`s${i}`} title={tr("{name} — occurrence ignorée", { name: o.op.name })} className="w-full truncate text-[10px] text-stone-300 line-through">
                        {formatEUR(o.amount)}
                      </span>
                    ))}
                  </button>
                );
              })}
            </div>
          </>
        )}
        <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-stone-400">
          {(["income", "fixed", "variable", "daily", "savings"] as const).map((k) => (
            <span key={k} className="flex items-center gap-1"><span className={cx("h-1.5 w-1.5 rounded-full", KIND_STYLE[k].dot)} />{tr(KIND_LABEL[k])}</span>
          ))}
          <span className="ml-auto hidden sm:inline">{tr("Astuce : fais glisser le calendrier pour changer de mois.")}</span>
        </div>
      </section>

      <div className="lg:sticky lg:top-6">
        <DayPanel ops={ops} anchor={effectiveAnchor} date={selected} today={today} savingsLast={savingsLast} />
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

function OccList({ items, today, onSkip, onDelete }: { items: Occurrence[]; today?: string; onSkip?: (o: Occurrence) => void; onDelete?: (o: Occurrence) => void }) {
  const tr = useT();
  return (
    <ul className="space-y-1.5">
      {items.map((o, i) => {
        const canValidate = !!today && o.op.kind === "variable" && !o.op.txn && o.date <= today;
        return (
          <li key={i} className="group flex items-center gap-2 text-[12px]" title={tooltip(o, tr)}>
            <span className="w-12 shrink-0 whitespace-nowrap text-[11px] text-stone-400">{fmtShort(o.date)}</span>
            <span className={cx("h-2 w-2 shrink-0 rounded-full", KIND_STYLE[o.op.kind].dot)} />
            <span className="min-w-0 flex-1 truncate text-stone-700">
              {o.op.name}
              {o.op.txn && <span className="text-stone-400"> · {o.op.txn.validates ? tr("validé") : `${o.op.txn.time ?? "carte"}${o.op.txn.card ? ` · ${o.op.txn.card}` : ""}`}</span>}
            </span>
            {canValidate && <ValidateButton opId={o.op.id} date={o.date} planned={o.op.amount} name={o.op.name} />}
            {(onSkip || onDelete) && !canValidate && (
              <button
                onClick={() => (o.op.frequency !== "once" ? onSkip?.(o) : onDelete?.(o))}
                className="hidden text-[11px] text-stone-400 hover:text-rose-600 group-hover:inline"
                title={o.op.frequency !== "once" ? tr("Ignorer cette occurrence") : tr("Supprimer")}
              >
                ✕
              </button>
            )}
            <span className={cx("shrink-0 font-semibold", KIND_STYLE[o.op.kind].text)}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.amount)}</span>
          </li>
        );
      })}
    </ul>
  );
}

/** Courbe du solde du mois, avec la date choisie marquée. */
function BalanceSpark({ ops, anchor, date }: { ops: FinOp[]; anchor: BalanceAnchor; date: string }) {
  const tr = useT();
  const d = new Date(toMs(date));
  const { start, end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
  const pts = useMemo(() => getDailyBalances(ops, anchor, start, end), [ops, anchor, start, end]);
  const vals = pts.map((p) => p.balance);
  const lo = Math.min(...vals, 0);
  const hi = Math.max(...vals, 1);
  const span = hi - lo || 1;
  const x = (i: number) => (i / Math.max(1, pts.length - 1)) * 200;
  const y = (v: number) => 4 + (1 - (v - lo) / span) * 40;
  const path = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.balance).toFixed(1)}`).join(" ");
  const idx = Math.max(0, pts.findIndex((p) => p.date === date));
  const cur = pts[idx];
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between">
        <p className="text-[12px] font-semibold text-stone-800">{tr("Évolution du solde")}</p>
        {cur && <p className="tabular text-[11px] text-stone-500">{fmtShort(cur.date)} · <b className={cur.balance >= 0 ? "text-stone-700" : "text-rose-600"}>{formatEUR(cur.balance)}</b></p>}
      </div>
      <svg viewBox="0 0 200 48" className="h-14 w-full overflow-visible" role="img" aria-label={tr("Évolution du solde")}>
        {lo < 0 && <line x1="0" x2="200" y1={y(0)} y2={y(0)} stroke="rgb(var(--stone-300))" strokeWidth="1" strokeDasharray="3 3" />}
        <path d={path} fill="none" stroke="rgb(var(--brand-500))" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {cur && <circle cx={x(idx)} cy={y(cur.balance)} r="3.5" fill="rgb(var(--brand-600))" stroke="rgb(var(--surface))" strokeWidth="2" />}
      </svg>
      <div className="flex justify-between text-[10px] text-stone-400"><span>{fmtShort(start)}</span><span>{fmtShort(end)}</span></div>
    </div>
  );
}

function DayPanel({ ops, anchor, date, today, savingsLast }: { ops: FinOp[]; anchor: BalanceAnchor; date: string; today: string; savingsLast: { date: string; balance: number } | null }) {
  const tr = useT();
  const s = useMemo(() => getDateSituation(ops, anchor, date), [ops, anchor, date]);
  const [pending, start] = useTransition();
  const skip = (o: Occurrence) => start(() => skipOccurrence(o.op.table, o.op.id, o.date));
  const del = (o: Occurrence) => start(() => deleteOperation(o.op.table, o.op.id));
  const d = new Date(toMs(date));
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth();
  const { start: mFrom, end: mTo } = monthBounds(y, m);
  const skipped = useMemo(() => getSkippedOccurrences(ops, mFrom, mTo), [ops, mFrom, mTo]);
  // Budget prévu et réel, catégorie par catégorie, jusqu'à la date choisie (même période des deux côtés).
  const env = useMemo(() => getEnvelopes(ops, y, m, date), [ops, y, m, date]);
  const toValidate = useMemo(() => getBudgetLines(ops, mFrom, mTo, today).filter((l) => l.status === "due" && l.date <= date).length, [ops, mFrom, mTo, today, date]);
  const savings = useMemo(() => getSavingsAt(ops, savingsLast, date), [ops, savingsLast, date]);
  const savingsEnd = useMemo(() => getSavingsAt(ops, savingsLast, s.monthEnd), [ops, savingsLast, s.monthEnd]);
  const thatDay = useMemo(() => expand(ops, date, date), [ops, date]);
  const planned = env.reduce((t, r) => t + r.planned, 0);
  const real = env.reduce((t, r) => t + r.real, 0);

  return (
    <aside className={cx("card space-y-4 p-4", pending && "opacity-70")}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-[13px] font-semibold capitalize text-stone-900">{fmtLong(date)}</p>
        <NewOperationButton defaultDate={date} label={tr("+ Ajouter")} className="btn-ghost shrink-0" />
      </div>

      <div className="rounded-xl bg-brand-50 p-3">
        <p className="text-xs font-medium text-brand-800">{tr("Reste à vivre au {date}", { date: fmtShort(date) })}</p>
        <p className={cx("tabular mt-0.5 text-2xl font-bold", s.balance >= 0 ? "text-brand-800" : "text-rose-600")}>{formatEUR(s.balance)}</p>
        <p className="mt-2 border-t border-brand-100 pt-2 text-xs text-brand-800">
          {tr("Solde prévu au {date} :", { date: fmtShort(s.monthEnd) })} <b className={s.endBalance >= 0 ? "" : "text-rose-600"}>{formatEUR(s.endBalance)}</b>
        </p>
        <p className="text-[11px] text-brand-700/70">{tr("≈ {amount}/jour jusqu'à la fin du mois ({d} j)", { amount: formatEUR(s.perDay), d: s.daysRemaining })}</p>
        <div className="mt-2 border-t border-brand-100 pt-2">
          <p className="text-xs font-medium text-brand-800">{tr("Reste sur l'épargne")}</p>
          {savings === null ? (
            <p className="text-[11px] text-brand-700/70">{tr("Aucun solde d'épargne saisi.")} <Link href="/app/finance/accounts" className="font-semibold underline">{tr("Le renseigner")}</Link></p>
          ) : (
            <>
              <p className="tabular text-lg font-bold text-brand-800">{formatEUR(savings)}</p>
              {savingsEnd !== null && Math.abs(savingsEnd - savings) >= 0.5 && (
                <p className="text-[11px] text-brand-700/70">{tr("Prévu au {date} :", { date: fmtShort(s.monthEnd) })} <b>{formatEUR(savingsEnd)}</b></p>
              )}
            </>
          )}
        </div>
      </div>

      {thatDay.length > 0 && (
        <div>
          <p className="mb-2 text-[12px] font-semibold text-stone-800">{tr("Ce jour-là")}</p>
          <OccList items={thatDay} today={today} onSkip={skip} onDelete={del} />
        </div>
      )}

      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-[12px] font-semibold text-stone-800">{tr("Budget et réel")} <span className="font-normal text-stone-400">{tr("(jusqu'au {date})", { date: fmtShort(date) })}</span></p>
          <Link href="/app/finance/budgets" className="text-[11px] font-semibold text-brand-600 hover:underline">{tr("Gérer")}</Link>
        </div>
        {env.length === 0 ? (
          <p className="text-sm text-stone-400">{tr("Aucun budget ni dépense sur cette période.")}</p>
        ) : (
          <>
            <ul className="space-y-2.5">
              {env.map((r) => {
                const max = Math.max(r.planned, r.real, 1);
                const over = r.planned > 0 && r.real > r.planned;
                return (
                  <li key={r.category}>
                    <div className="flex items-baseline justify-between gap-2 text-[12px]">
                      <span className="min-w-0 truncate text-stone-700">{tr(r.category)}</span>
                      <span className="tabular shrink-0 text-[11px] text-stone-500"><b className={over ? "text-rose-600" : "text-teal-700"}>{formatEUR(r.real)}</b> / {formatEUR(r.planned)}</span>
                    </div>
                    <div className="mt-1 space-y-1">
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-brand-300" style={{ width: `${(r.planned / max) * 100}%` }} /></div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100"><div className={cx("h-full rounded-full", over ? "bg-rose-400" : "bg-teal-500")} style={{ width: `${(r.real / max) * 100}%` }} /></div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-2.5 flex items-center justify-between rounded-lg bg-stone-50 px-3 py-1.5 text-[11px]">
              <span className="flex items-center gap-1 text-stone-500"><span className="h-2 w-2 rounded-full bg-brand-300" />{tr("Budget")} <b className="text-stone-700">{formatEUR(planned)}</b></span>
              <span className="flex items-center gap-1 text-stone-500"><span className="h-2 w-2 rounded-full bg-teal-500" />{tr("Réel")} <b className={real > planned ? "text-rose-600" : "text-teal-700"}>{formatEUR(real)}</b></span>
            </div>
          </>
        )}
        {toValidate > 0 && (
          <Link href="/app/finance/budgets" className="mt-2 flex items-center justify-between rounded-lg bg-amber-50 px-3 py-2 text-[12px] font-semibold text-amber-800 hover:bg-amber-100">
            <span>{tr("{n} dépense(s) prévue(s) à valider", { n: toValidate })}</span><span aria-hidden>→</span>
          </Link>
        )}
      </div>

      <div>
        <p className="mb-2 text-[12px] font-semibold text-stone-800">{tr("Opérations à venir")} <span className="font-normal text-stone-400">{tr("(jusqu'au {date})", { date: fmtShort(s.monthEnd) })}</span></p>
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

      <BalanceSpark ops={ops} anchor={anchor} date={date} />

      {skipped.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-semibold text-stone-400">{tr("Ignorées ce mois")}</p>
          <SkippedList items={skipped} onRestore={(o) => start(() => restoreOccurrence(o.op.table, o.op.id, o.date))} />
        </div>
      )}
    </aside>
  );
}

type BreakdownMode = "global" | "fixed" | "variable" | "daily" | "savings";
const BREAKDOWN_LABEL: Record<BreakdownMode, string> = { global: "Global", fixed: "Charges fixes", variable: "Dépenses variables", daily: "Quotidien", savings: "Épargne" };

/** Garde les plus grosses catégories et regroupe le reste : la palette catégorielle n'a que 6 teintes distinctes. */
function fold(items: { label: string; value: number }[], tr: (k: string) => string, max = 6) {
  const list = items.filter((i) => i.value > 0).map((i) => ({ ...i, label: tr(i.label) }));
  if (list.length <= max) return list;
  return [...list.slice(0, max - 1), { label: tr("Autres"), value: list.slice(max - 1).reduce((s, i) => s + i.value, 0) }];
}

export function BudgetBreakdown({ budget, size = 150 }: { budget: ReturnType<typeof getMonthlyBudget>; size?: number }) {
  const tr = useT();
  const [mode, setMode] = useState<BreakdownMode>("global");
  const [picked, setPicked] = useState<string | null>(null);
  const spend = budget.fixed + budget.variable + budget.daily + budget.savings;
  const items =
    mode === "global"
      ? [
          { label: tr("Charges fixes"), value: budget.fixed },
          { label: tr("Dépenses variables"), value: budget.variable },
          { label: tr("Consommation quotidienne"), value: budget.daily },
          { label: tr("Épargne"), value: budget.savings },
        ].filter((i) => i.value > 0)
      : fold(mode === "fixed" ? budget.fixedByCategory : mode === "variable" ? budget.variableByCategory : mode === "daily" ? budget.dailyByCategory : budget.savingsByCategory, tr);
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
              {tr(BREAKDOWN_LABEL[v])}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-2 text-xs text-stone-500">{tr("Total dépensé / réservé :")} <b className="text-stone-800">{formatEUR(spend)}</b> {budget.income > 0 && tr("· {n} % des revenus", { n: Math.round((spend / budget.income) * 100) })}</p>
      <div className="mt-2 flex h-2 gap-[2px] overflow-hidden rounded-full bg-stone-100">
        <div className="bg-rose-400" style={{ width: seg(budget.fixed) }} title={tr("Charges fixes")} />
        <div className="bg-amber-400" style={{ width: seg(budget.variable) }} title={tr("Dépenses variables")} />
        <div className="bg-teal-400" style={{ width: seg(budget.daily) }} title={tr("Consommation quotidienne")} />
        <div className="bg-violet-400" style={{ width: seg(budget.savings) }} title={tr("Épargne")} />
      </div>
      <div className="mt-4">
        <DonutChart items={items} size={size} strokeWidth={Math.round(size / 7)} centerCaption={mode === "global" ? tr("budget") : tr(BREAKDOWN_LABEL[mode]).toLowerCase()} selected={picked} onSelect={(l) => setPicked(l === picked ? null : l)} />
        {pickedItem && (
          <p className="mt-3 rounded-lg bg-stone-50 px-3 py-2 text-xs text-stone-600">
            <b>{tr(pickedItem.label)}</b> : {formatEUR(pickedItem.value)} {tr("soit {n} %", { n: total > 0 ? Math.round((pickedItem.value / total) * 100) : 0 })} {mode === "global" ? tr("du budget") : tr("des {what}", { what: tr(BREAKDOWN_LABEL[mode]).toLowerCase() })}
            {budget.income > 0 && ` · ${tr("{n} % des revenus", { n: Math.round((pickedItem.value / budget.income) * 100) })}`}
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
