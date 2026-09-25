"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  addDays,
  describeRecurrence,
  expand,
  getDailyBalances,
  getMonthlyBudget,
  getOperationsForDate,
  getRemainingBudgetAtDate,
  getUpcomingOperations,
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
import { skipOccurrence, deleteOperation } from "@/app/app/finance/actions";

type View = "month" | "week" | "year";
const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const dayNum = (d: string) => new Date(toMs(d)).getUTCDate();
const monthOf = (d: string) => new Date(toMs(d)).getUTCMonth();
const yearOf = (d: string) => new Date(toMs(d)).getUTCFullYear();
const mondayOf = (d: string) => addDays(d, -((new Date(toMs(d)).getUTCDay() + 6) % 7));
const fmtLong = (d: string) =>
  new Date(toMs(d)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });

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
  budgets,
  savingsRule,
  today,
  snapshots,
}: {
  ops: FinOp[];
  anchor: BalanceAnchor;
  budgets: { name: string; amount: number }[];
  savingsRule: { mode: "fixed" | "percent"; value: number };
  today: string;
  snapshots: Record<string, number[]>;
}) {
  const [view, setView] = useState<View>("month");
  const [selected, setSelected] = useState(today);
  const [cursor, setCursor] = useState({ y: yearOf(today), m: monthOf(today) });
  const { y, m } = cursor;
  const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
  const { start: mStart, end: mEnd } = monthBounds(y, m);

  const budget = useMemo(() => getMonthlyBudget(ops, anchor, y, m, budgets, savingsRule), [ops, anchor, y, m, budgets, savingsRule]);

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
  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);

  const title = view === "year" ? String(y) : view === "week" ? `Semaine du ${fmtShort(gridStart)}` : `${MONTHS_FR[m]} ${y}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finances</h1>
          <p className="mt-1 text-sm text-slate-500">Visualisez et suivez tous vos flux financiers. Cliquez sur une date pour voir le détail.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-white">
            <button onClick={() => nav(-1)} className="px-3 py-2 text-slate-500 hover:text-slate-900">‹</button>
            <span className="min-w-[130px] text-center text-sm font-semibold text-slate-800">{title}</span>
            <button onClick={() => nav(1)} className="px-3 py-2 text-slate-500 hover:text-slate-900">›</button>
          </div>
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-medium">
            {(["month", "week", "year"] as View[]).map((v) => (
              <button key={v} onClick={() => setView(v)} className={cx("rounded-lg px-3 py-1.5 transition", view === v ? "bg-slate-900 text-white" : "text-slate-500")}>
                {v === "month" ? "Mois" : v === "week" ? "Semaine" : "Année"}
              </button>
            ))}
          </div>
          <Link href="/app/finance/operations" className="btn-secondary">Gérer les opérations</Link>
          <NewOperationButton defaultDate={selected} />
        </div>
      </div>

      <SummaryCards budget={budget} days={monthBounds(y, m).days} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="card p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{title}</h2>
              <button onClick={() => { select(today); if (view === "year") setView("month"); }} className="btn-secondary px-3 py-1 text-xs">Aujourd'hui</button>
            </div>
            <div className="flex flex-wrap gap-3 text-xs text-slate-500">
              {(["income", "fixed", "variable", "savings"] as const).map((k) => (
                <span key={k} className="flex items-center gap-1.5"><span className={cx("h-2 w-2 rounded-full", KIND_STYLE[k].dot)} />{KIND_LABEL[k]}</span>
              ))}
            </div>
          </div>

          {view === "year" ? (
            <YearGrid ops={ops} anchor={anchor} year={y} today={today} onPick={(mm) => { setCursor({ y, m: mm }); setView("month"); }} />
          ) : (
            <>
              <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400">
                {DOW.map((d) => <div key={d} className="pb-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-slate-100">
                {days.map((d) => {
                  const occ = occByDate.get(d) ?? [];
                  const outside = view === "month" && monthOf(d) !== m;
                  const max = view === "week" ? 8 : 2;
                  return (
                    <button
                      key={d}
                      onClick={() => select(d)}
                      className={cx(
                        "flex flex-col gap-1 border-b border-r border-slate-100 p-1.5 text-left transition hover:bg-slate-50",
                        view === "week" ? "min-h-[220px]" : "min-h-[92px]",
                        outside && "bg-slate-50/60 text-slate-300",
                        d === selected && "bg-brand-50/70 ring-2 ring-inset ring-brand-400"
                      )}
                    >
                      <span className={cx("flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold", d === today ? "bg-brand-600 text-white" : outside ? "text-slate-300" : "text-slate-600")}>
                        {dayNum(d)}
                      </span>
                      {occ.slice(0, max).map((o, i) => (
                        <span key={i} title={tooltip(o)} className={cx("w-full truncate rounded-md px-1.5 py-0.5 text-[11px] font-semibold", KIND_STYLE[o.op.kind].chip, outside && "opacity-50")}>
                          {o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}
                          <span className="block truncate text-[10px] font-normal opacity-80">{o.op.name}</span>
                        </span>
                      ))}
                      {occ.length > max && <span className="text-[10px] text-slate-400">+{occ.length - max} autre(s)</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </section>

        <DayPanel ops={ops} anchor={anchor} date={selected} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <BudgetBreakdown budget={budget} />
        <ForecastVsActual ops={ops} anchor={anchor} y={y} m={m} today={today} snapshot={snapshots[monthKey]} />
      </div>
    </div>
  );
}

function SummaryCards({ budget, days }: { budget: ReturnType<typeof getMonthlyBudget>; days: number }) {
  const pct = (n: number) => (budget.income > 0 ? `${Math.round((n / budget.income) * 100)} % des revenus` : "—");
  const cards = [
    { label: "Revenus", value: budget.income, sub: `${budget.incomeCount} revenu(s) planifié(s)`, color: "text-emerald-600", icon: "↑", bg: "bg-emerald-50" },
    { label: "Charges fixes", value: budget.fixed, sub: pct(budget.fixed), color: "text-rose-600", icon: "🏠", bg: "bg-rose-50" },
    { label: "Budget variable", value: budget.variable, sub: pct(budget.variable), color: "text-amber-600", icon: "🛒", bg: "bg-amber-50" },
    { label: "Épargne / Invest.", value: budget.savings, sub: pct(budget.savings), color: "text-violet-600", icon: "🌱", bg: "bg-violet-50" },
    { label: "Solde début de mois", value: budget.startBalance, sub: "Report du mois précédent", color: "text-brand-700", icon: "📅", bg: "bg-brand-50" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="card flex items-start gap-3 p-4">
          <span className={cx("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-sm", c.bg, c.color)}>{c.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-xs text-slate-500">{c.label}</p>
            <p className={cx("text-lg font-bold", c.color)}>{formatEUR(c.value)}</p>
            <p className="truncate text-[11px] text-slate-400">{c.sub}</p>
          </div>
        </div>
      ))}
      <div className="card flex items-start gap-3 border-emerald-200 bg-emerald-50/60 p-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-sm">💰</span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-emerald-800">Reste à vivre estimé</p>
          <p className={cx("text-lg font-bold", budget.resteAVivre >= 0 ? "text-emerald-700" : "text-rose-600")}>{formatEUR(budget.resteAVivre)}</p>
          <p className="truncate text-[11px] text-emerald-700/70">≈ {formatEUR(budget.resteAVivre / days)}/jour</p>
        </div>
      </div>
    </div>
  );
}

function DayPanel({ ops, anchor, date }: { ops: FinOp[]; anchor: BalanceAnchor; date: string }) {
  const rav = useMemo(() => getRemainingBudgetAtDate(ops, anchor, date), [ops, anchor, date]);
  const dayOps = useMemo(() => getOperationsForDate(ops, date), [ops, date]);
  const upcoming = useMemo(() => getUpcomingOperations(ops, date, 6), [ops, date]);
  const [pending, start] = useTransition();
  const total = dayOps.reduce((s, o) => s + o.signed, 0);

  return (
    <aside className="card space-y-5 p-5">
      <p className="font-semibold capitalize text-slate-900">{fmtLong(date)}</p>

      <div className="rounded-2xl bg-brand-50 p-4">
        <p className="text-xs font-medium text-brand-800">Reste à vivre jusqu'au {fmtShort(rav.until)}</p>
        <p className={cx("mt-1 text-2xl font-bold", rav.available >= 0 ? "text-brand-700" : "text-rose-600")}>{formatEUR(rav.available)}</p>
        <p className="text-xs text-brand-700/70">
          Soit {formatEUR(rav.perDay)}/jour ({rav.days} jour{rav.days > 1 ? "s" : ""} restant{rav.days > 1 ? "s" : ""})
        </p>
        <p className="mt-2 border-t border-brand-100 pt-2 text-xs text-brand-800">Solde prévu ce jour : <b>{formatEUR(rav.balance)}</b></p>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-800">Opérations du jour</p>
          <NewOperationButton defaultDate={date} label="+ Ajouter" className="text-xs font-medium text-brand-600" />
        </div>
        {dayOps.length === 0 && <p className="text-sm text-slate-400">Aucune opération.</p>}
        <ul className={cx("space-y-2", pending && "opacity-60")}>
          {dayOps.map((o, i) => (
            <li key={i} className="group rounded-xl border border-slate-100 p-2.5">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-800">{o.op.name}</span>
                  <span className="text-xs text-slate-400">{KIND_LABEL[o.op.kind]}</span>
                </span>
                <span className={cx("shrink-0 font-semibold", KIND_STYLE[o.op.kind].text)}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}</span>
              </div>
              <div className="mt-1.5 hidden gap-3 text-[11px] group-hover:flex">
                {o.op.frequency !== "once" ? (
                  <button onClick={() => start(() => skipOccurrence(o.op.table, o.op.id, o.date))} className="text-slate-500 hover:text-rose-600">Ignorer cette occurrence</button>
                ) : (
                  <button onClick={() => start(() => deleteOperation(o.op.table, o.op.id))} className="text-slate-500 hover:text-rose-600">Supprimer</button>
                )}
                <Link href="/app/finance/operations" className="text-slate-500 hover:text-brand-600">Modifier</Link>
              </div>
            </li>
          ))}
        </ul>
        {dayOps.length > 0 && (
          <div className="mt-2 flex justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold">
            <span>Total du jour</span>
            <span className={total >= 0 ? "text-emerald-600" : "text-rose-600"}>{total >= 0 ? "+" : ""}{formatEUR(total)}</span>
          </div>
        )}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-800">À venir</p>
        {upcoming.length === 0 && <p className="text-sm text-slate-400">Rien de prévu.</p>}
        <ul className="space-y-2">
          {upcoming.map((o, i) => (
            <li key={i} className="flex items-center gap-3 text-sm" title={tooltip(o)}>
              <span className="w-14 shrink-0 rounded-lg bg-slate-50 py-1 text-center text-[11px] text-slate-500">{fmtShort(o.date)}</span>
              <span className={cx("h-2 w-2 shrink-0 rounded-full", KIND_STYLE[o.op.kind].dot)} />
              <span className="min-w-0 flex-1 truncate text-slate-700">{o.op.name}</span>
              <span className={cx("shrink-0 font-semibold", KIND_STYLE[o.op.kind].text)}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}

function BudgetBreakdown({ budget }: { budget: ReturnType<typeof getMonthlyBudget> }) {
  const [mode, setMode] = useState<"global" | "variable">("global");
  const [picked, setPicked] = useState<string | null>(null);
  const outflow = budget.fixed + budget.variable + budget.savings;
  const resources = budget.startBalance + budget.income;
  const items =
    mode === "global"
      ? [
          { label: "Charges fixes", value: budget.fixed },
          { label: "Budget variable", value: budget.variable },
          { label: "Épargne / invest.", value: budget.savings },
          { label: "Reste à vivre", value: Math.max(0, budget.resteAVivre) },
        ]
      : budget.variableByCategory;
  const total = items.reduce((s, i) => s + i.value, 0);
  const pickedItem = items.find((i) => i.label === picked);
  const seg = (v: number) => `${resources > 0 ? Math.max(0, (v / resources) * 100) : 0}%`;

  return (
    <section className="card p-5">
      <p className="font-semibold text-slate-900">Récapitulatif du mois</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <div><p className="text-xs text-slate-500">Ressources</p><p className="font-bold text-slate-900">{formatEUR(resources)}</p><p className="text-[11px] text-slate-400">report + revenus</p></div>
        <div><p className="text-xs text-slate-500">Dépenses</p><p className="font-bold text-rose-600">{formatEUR(budget.fixed + budget.variable)}</p><p className="text-[11px] text-slate-400">fixes + variables</p></div>
        <div><p className="text-xs text-slate-500">Épargne</p><p className="font-bold text-violet-600">{formatEUR(budget.savings)}</p></div>
      </div>
      <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className="bg-rose-400" style={{ width: seg(budget.fixed) }} />
        <div className="bg-amber-400" style={{ width: seg(budget.variable) }} />
        <div className="bg-violet-400" style={{ width: seg(budget.savings) }} />
        <div className="bg-emerald-400" style={{ width: seg(Math.max(0, resources - outflow)) }} />
      </div>
      <p className="mt-1.5 text-right text-xs text-slate-500">Reste à vivre : <b className="text-slate-800">{formatEUR(budget.resteAVivre)}</b></p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-800">Répartition du budget</p>
        <div className="flex rounded-lg bg-slate-100 p-0.5 text-[11px] font-medium">
          {(["global", "variable"] as const).map((v) => (
            <button key={v} onClick={() => { setMode(v); setPicked(null); }} className={cx("rounded-md px-2 py-1", mode === v ? "bg-white shadow-sm" : "text-slate-500")}>
              {v === "global" ? "Budget global" : "Dépenses variables"}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3">
        <DonutChart items={items} size={150} strokeWidth={22} centerCaption={mode === "global" ? "budget" : "variable"} selected={picked} onSelect={(l) => setPicked(l === picked ? null : l)} />
        {pickedItem && (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <b>{pickedItem.label}</b> : {formatEUR(pickedItem.value)} soit {total > 0 ? Math.round((pickedItem.value / total) * 100) : 0} % {mode === "global" ? "du budget" : "du budget variable"}
            {budget.income > 0 && ` · ${Math.round((pickedItem.value / budget.income) * 100)} % des revenus`}
          </p>
        )}
      </div>
    </section>
  );
}

function ForecastVsActual({ ops, anchor, y, m, today, snapshot }: { ops: FinOp[]; anchor: BalanceAnchor; y: number; m: number; today: string; snapshot?: number[] }) {
  const { start, end } = monthBounds(y, m);
  const current = useMemo(() => getDailyBalances(ops, anchor, start, end), [ops, anchor, start, end]);
  const forecast = current.map((p, i) => ({ date: p.date, value: snapshot?.[i] ?? p.balance }));
  const actual = current.filter((p) => p.date <= today);
  const [hover, setHover] = useState<number | null>(null);

  const W = 640, H = 220, PX = 44, PT = 16, PB = 26;
  const all = [...forecast.map((p) => p.value), ...actual.map((p) => p.balance), 0];
  const min = Math.min(...all), max = Math.max(...all), span = max - min || 1;
  const x = (i: number) => PX + (i / Math.max(1, forecast.length - 1)) * (W - PX - 8);
  const yv = (v: number) => PT + (1 - (v - min) / span) * (H - PT - PB);
  const path = (vals: number[]) => vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${yv(v).toFixed(1)}`).join(" ");
  const lastIdx = actual.length - 1;
  const gap = lastIdx >= 0 ? actual[lastIdx].balance - forecast[lastIdx].value : null;
  const h = hover !== null ? { f: forecast[hover], a: actual[hover] } : null;

  return (
    <section className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">Solde prévisionnel vs réel</p>
          <p className="text-xs text-slate-500">Prévisionnel figé en début de mois, comparé à la réalité saisie.</p>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-brand-600" />Réel</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 border-t-2 border-dashed border-slate-400" />Prévisionnel</span>
          {gap !== null && (
            <span className={cx("rounded-full px-2 py-0.5 font-semibold", gap >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700")}>
              Écart {gap >= 0 ? "+" : ""}{formatEUR(gap)}
            </span>
          )}
        </div>
      </div>
      <div className="relative mt-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" onMouseLeave={() => setHover(null)}>
          {[0, 0.5, 1].map((f) => {
            const v = min + f * span;
            return (
              <g key={f}>
                <line x1={PX} x2={W - 8} y1={yv(v)} y2={yv(v)} stroke="#e2e8f0" />
                <text x={PX - 6} y={yv(v) + 3} textAnchor="end" className="fill-slate-400 text-[10px]">{Math.round(v)} €</text>
              </g>
            );
          })}
          {min < 0 && <line x1={PX} x2={W - 8} y1={yv(0)} y2={yv(0)} stroke="#fda4af" strokeDasharray="3 3" />}
          <path d={path(forecast.map((p) => p.value))} fill="none" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 4" />
          {actual.length > 0 && <path d={path(actual.map((p) => p.balance))} fill="none" stroke="#3a3ff0" strokeWidth={2.5} />}
          {forecast.map((p, i) =>
            i % 5 === 0 || i === forecast.length - 1 ? (
              <text key={p.date} x={x(i)} y={H - 6} textAnchor="middle" className="fill-slate-400 text-[10px]">{fmtShort(p.date)}</text>
            ) : null
          )}
          {hover !== null && (
            <>
              <line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} stroke="#cbd5e1" />
              {h?.a && <circle cx={x(hover)} cy={yv(h.a.balance)} r={4} fill="#3a3ff0" />}
              <circle cx={x(hover)} cy={yv(forecast[hover].value)} r={3.5} fill="#94a3b8" />
            </>
          )}
          {forecast.map((p, i) => (
            <rect key={p.date} x={x(i) - (W - PX) / forecast.length / 2} y={PT} width={(W - PX) / forecast.length} height={H - PT - PB} fill="transparent" onMouseEnter={() => setHover(i)} />
          ))}
        </svg>
        {h && (
          <div className="pointer-events-none absolute top-0 rounded-xl border border-slate-100 bg-white px-3 py-2 text-xs shadow-lg" style={{ left: `${Math.min(70, (x(hover!) / W) * 100)}%` }}>
            <p className="font-semibold text-slate-800">{fmtShort(h.f.date)}</p>
            {h.a && <p className="text-brand-700">Solde réel : {formatEUR(h.a.balance)}</p>}
            <p className="text-slate-500">Prévisionnel : {formatEUR(h.f.value)}</p>
            {h.a && <p className={h.a.balance - h.f.value >= 0 ? "text-emerald-600" : "text-rose-600"}>Écart : {h.a.balance - h.f.value >= 0 ? "+" : ""}{formatEUR(h.a.balance - h.f.value)}</p>}
          </div>
        )}
      </div>
    </section>
  );
}

function YearGrid({ ops, anchor, year, today, onPick }: { ops: FinOp[]; anchor: BalanceAnchor; year: number; today: string; onPick: (m: number) => void }) {
  const months = useMemo(
    () =>
      Array.from({ length: 12 }, (_, mm) => {
        const { start, end } = monthBounds(year, mm);
        const occ = expand(ops, start, end);
        const inflow = occ.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0);
        const outflow = -occ.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0);
        return { mm, inflow, outflow, endBalance: getDailyBalances(ops, anchor, end, end)[0].balance, current: today >= start && today <= end };
      }),
    [ops, anchor, year, today]
  );
  const maxAbs = Math.max(1, ...months.map((x) => Math.abs(x.endBalance)));
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {months.map((mo) => (
        <button key={mo.mm} onClick={() => onPick(mo.mm)} className={cx("rounded-xl border p-3 text-left transition hover:border-brand-300", mo.current ? "border-brand-400 bg-brand-50/50" : "border-slate-100")}>
          <p className="text-xs font-semibold text-slate-500">{MONTHS_FR[mo.mm]}</p>
          <p className={cx("mt-1 text-lg font-bold", mo.endBalance >= 0 ? "text-slate-900" : "text-rose-600")}>{formatEUR(mo.endBalance)}</p>
          <div className="mt-1 h-1.5 rounded-full bg-slate-100">
            <div className={cx("h-1.5 rounded-full", mo.endBalance >= 0 ? "bg-brand-500" : "bg-rose-500")} style={{ width: `${(Math.abs(mo.endBalance) / maxAbs) * 100}%` }} />
          </div>
          <p className="mt-1.5 text-[11px] text-emerald-600">+{formatEUR(mo.inflow)} <span className="text-rose-500">-{formatEUR(mo.outflow)}</span></p>
        </button>
      ))}
    </div>
  );
}
