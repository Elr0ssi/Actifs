"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import {
  addDays,
  expand,
  getBalanceAtDate,
  getDailyBalances,
  getDateSituation,
  getMonthlyBudget,
  KIND_LABEL,
  KIND_STYLE,
  monthBounds,
  toMs,
  type Occurrence,
} from "@/lib/finance-engine";
import { cx, formatEUR, MONTHS_FR } from "@/lib/utils";
import { updateBalanceAnchor, skipOccurrence, deleteOperation } from "@/app/app/finance/actions";
import { NewOperationButton } from "@/components/app/finance/operation-form";
import { DonutChart } from "@/components/app/charts/donut-chart";
import { Icon, type IconName } from "@/components/app/icons";
import { WidgetShell, Empty, Segmented } from "@/components/app/widgets/shell";
import { CountUp } from "@/components/app/count-up";
import { useDragNav } from "@/components/app/widgets/calendar-grid";
import type { WidgetProps } from "@/components/app/widgets/types";

const DOW = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const fmtShort = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
const fmtLong = (d: string) => new Date(toMs(d)).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });
const eur0 = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const ym = (d: string) => ({ y: Number(d.slice(0, 4)), m: Number(d.slice(5, 7)) - 1 });

function NoFinance() {
  return <Empty>Ajoute tes premières opérations dans Finance pour voir ce widget s'animer.</Empty>;
}

/* ---------- Situation des comptes ---------- */

const ACCOUNT_META: { name: "Courant" | "Épargne" | "Investissement"; icon: IconName; tint: string }[] = [
  { name: "Courant", icon: "card", tint: "bg-sky-50 text-sky-600" },
  { name: "Épargne", icon: "piggy", tint: "bg-rose-50 text-rose-500" },
  { name: "Investissement", icon: "trend", tint: "bg-violet-50 text-violet-600" },
];

function AccountTile({ name, icon, tint, value, today, editable }: { name: string; icon: IconName; tint: string; value: { date: string; balance: number } | null; today: string; editable: boolean }) {
  const [editing, setEditing] = useState(false);
  const [pending, start] = useTransition();
  return (
    <div className={cx("group relative min-w-0 rounded-xl border border-line p-3", pending && "opacity-60")}>
      <div className="flex items-center gap-2.5">
        <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", tint)}>
          <Icon name={icon} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[11px] text-stone-500">{name}</p>
          {editing ? (
            <form
              action={(fd) => start(async () => { await updateBalanceAnchor(name, fd); setEditing(false); })}
              className="mt-0.5 flex gap-1"
            >
              <input type="hidden" name="entry_date" value={today} />
              <input name="current_balance" type="number" step="0.01" autoFocus defaultValue={value?.balance} className="input min-w-0 px-2 py-1 text-xs" />
              <button className="btn-primary px-2 py-1 text-xs">OK</button>
            </form>
          ) : (
            <p className="tabular truncate text-base font-bold text-stone-900">{value ? <CountUp value={value.balance} /> : "—"}</p>
          )}
        </div>
      </div>
      {!editing && editable && (
        <button onClick={() => setEditing(true)} title="Mettre à jour le solde" className="absolute right-2 top-2 rounded-md p-1 text-stone-300 transition hover:bg-stone-100 hover:text-stone-600">
          <Icon name="pencil" className="h-3.5 w-3.5" />
        </button>
      )}
      {value && !editing && <p className="mt-1.5 text-[10px] text-stone-400">au {fmtShort(value.date)}</p>}
    </div>
  );
}

export function FinAccounts({ data, size }: WidgetProps) {
  const f = data.finance;
  if (!f) return <WidgetShell icon="bank" title="Situation des comptes"><NoFinance /></WidgetShell>;
  const realToday = data.realToday ?? data.today;
  const viewing = realToday !== data.today;
  // Autre mois : le compte courant est projeté à la date consultée, l'épargne garde son dernier solde connu.
  const valueOf = (name: "Courant" | "Épargne" | "Investissement") =>
    name === "Courant" && viewing ? { date: data.today, balance: getBalanceAtDate(f.ops, f.anchor, data.today) } : f.accounts[name];
  const shown = ACCOUNT_META.filter((a) => a.name !== "Investissement" || f.accounts.Investissement);
  const total = shown.reduce((s, a) => s + (valueOf(a.name)?.balance ?? 0), 0);
  return (
    <WidgetShell icon="bank" title={`${viewing ? "Prévision au" : "Situation au"} ${fmtShort(data.today)}`} href="/app/finance/accounts" hrefLabel="Comptes">
      <div className={cx("grid gap-2.5", size === "m" ? "grid-cols-2" : "grid-cols-2 lg:grid-cols-4")}>
        {shown.map((a) => (
          <AccountTile key={a.name} name={a.name} icon={a.icon} tint={a.tint} value={valueOf(a.name)} today={realToday} editable={!viewing} />
        ))}
        <div className={cx("flex min-w-0 flex-col justify-center rounded-xl bg-brand-50 p-3", size === "m" && "col-span-2")}>
          <p className="text-[11px] font-medium text-brand-800">Solde total</p>
          <p className="tabular text-xl font-bold text-brand-800"><CountUp value={total} /></p>
        </div>
      </div>
    </WidgetShell>
  );
}

/* ---------- Reste à vivre ---------- */

export function FinReste({ data }: WidgetProps) {
  const f = data.finance;
  const s = useMemo(() => (f ? getDateSituation(f.ops, f.anchor, data.today) : null), [f, data.today]);
  if (!f || !s) return <WidgetShell icon="target" title="Reste à vivre"><NoFinance /></WidgetShell>;
  const planned = s.pastOut + s.upcomingOut;
  const leftPct = planned > 0 ? Math.round((s.upcomingOut / planned) * 100) : 0;
  return (
    <WidgetShell icon="target" title="Reste à vivre" href="/app/finance/calendar" hrefLabel="Détail">
      <p className={cx("tabular text-3xl font-bold tracking-tight", s.endBalance >= 0 ? "text-stone-900" : "text-rose-600")}><CountUp value={s.endBalance} /></p>
      <p className="mt-0.5 text-[11px] text-stone-500">
        ≈ <b className="text-stone-700">{eur0(s.perDay)}</b> / jour · {s.daysRemaining} j jusqu'au {fmtShort(s.monthEnd)}
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-brand-100">
        <div className="fill-grow h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600" style={{ width: `${100 - leftPct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-stone-400">
        {eur0(s.pastOut)} déjà sortis · {eur0(s.upcomingOut)} encore prévus
      </p>
    </WidgetShell>
  );
}

/* ---------- Calendrier financier ---------- */

type Flow = "all" | "in" | "out";

export function FinCalendar({ data, size, opts, setOpts }: WidgetProps) {
  const f = data.finance;
  const flow = (opts.flow as Flow) ?? "all";
  const [selected, setSelected] = useState(data.today);
  const [cursor, setCursor] = useState(ym(data.today));
  const drag = useDragNav((delta) =>
    setCursor((c) => {
      const d = new Date(Date.UTC(c.y, c.m + delta, 1));
      return { y: d.getUTCFullYear(), m: d.getUTCMonth() };
    })
  );
  const { start, end } = monthBounds(cursor.y, cursor.m);
  const gridStart = addDays(start, -((new Date(toMs(start)).getUTCDay() + 6) % 7));
  const gridEnd = addDays(end, (7 - new Date(toMs(end)).getUTCDay()) % 7);

  const byDate = useMemo(() => {
    const map = new Map<string, Occurrence[]>();
    if (!f) return map;
    for (const o of expand(f.ops, gridStart, gridEnd)) {
      if (flow === "in" && o.signed < 0) continue;
      if (flow === "out" && o.signed > 0) continue;
      map.set(o.date, [...(map.get(o.date) ?? []), o]);
    }
    return map;
  }, [f, gridStart, gridEnd, flow]);

  if (!f) return <WidgetShell icon="calendar" title="Calendrier financier"><NoFinance /></WidgetShell>;

  const days: string[] = [];
  for (let d = gridStart; d <= gridEnd; d = addDays(d, 1)) days.push(d);
  const nav = (delta: number) => {
    const d = new Date(Date.UTC(cursor.y, cursor.m + delta, 1));
    setCursor({ y: d.getUTCFullYear(), m: d.getUTCMonth() });
  };
  const wide = size !== "m";

  return (
    <WidgetShell
      icon="calendar"
      title="Calendrier financier"
      subtitle={wide ? "Revenus, dépenses et solde jour par jour" : undefined}
      right={<Segmented<Flow> value={flow} onChange={(v) => setOpts({ flow: v })} options={[{ v: "all", l: "Tout" }, { v: "in", l: "Entrées" }, { v: "out", l: "Sorties" }]} />}
    >
      <div className={cx("grid h-full gap-4", wide && "lg:grid-cols-[minmax(0,1fr)_240px]")}>
        <div className="flex min-w-0 flex-col">
          <div className="mb-2 flex items-center justify-between">
            <button onClick={() => nav(-1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronLeft" /></button>
            <p className="text-[13px] font-semibold capitalize text-stone-800">{MONTHS_FR[cursor.m]} {cursor.y}</p>
            <button onClick={() => nav(1)} className="rounded-md p-1 text-stone-400 hover:bg-stone-100 hover:text-stone-800"><Icon name="chevronRight" /></button>
          </div>
          <div className="grid grid-cols-7 text-center text-[10px] font-medium text-stone-400">
            {DOW.map((d) => <div key={d} className="pb-1.5">{wide ? d : d[0]}</div>)}
          </div>
          <div {...{ onPointerDown: drag.props.onPointerDown, style: drag.props.style }} className={cx("grid flex-1 auto-rows-fr grid-cols-7 overflow-hidden rounded-xl border border-line", drag.props.className)}>
            {days.map((d) => {
              const occ = byDate.get(d) ?? [];
              const inflow = occ.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0);
              const outflow = -occ.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0);
              const outside = d < start || d > end;
              return (
                <button
                  key={d}
                  onClick={() => { if (drag.consumeClick()) return; setSelected(d); if (outside) setCursor(ym(d)); }}
                  className={cx(
                    "flex min-w-0 flex-col items-center gap-0.5 border-b border-r border-line/70 px-0.5 py-1.5 transition hover:bg-brand-50/50",
                    wide ? "min-h-[58px]" : "min-h-[40px]",
                    outside && "bg-stone-50/70",
                    d === selected && "bg-brand-50 ring-1 ring-inset ring-brand-300"
                  )}
                >
                  <span className={cx("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium", d === (data.realToday ?? data.today) ? "bg-brand-600 text-white" : outside ? "text-stone-300" : "text-stone-700")}>
                    {Number(d.slice(-2))}
                  </span>
                  {wide && inflow > 0 && <span className="tabular hidden max-w-full truncate text-[10px] font-semibold text-emerald-600 sm:block">+{eur0(inflow)}</span>}
                  {wide && outflow > 0 && <span className="tabular hidden max-w-full truncate text-[10px] font-semibold text-rose-600 sm:block">-{eur0(outflow)}</span>}
                  {(inflow > 0 || outflow > 0) && <span className={cx("h-1.5 w-1.5 rounded-full", wide && "sm:hidden", inflow >= outflow ? "bg-emerald-500" : "bg-rose-500")} />}
                </button>
              );
            })}
          </div>
        </div>
        <DayDetail date={selected} ops={f.ops} anchor={f.anchor} flow={flow} />
      </div>
    </WidgetShell>
  );
}

function DayDetail({ date, ops, anchor, flow }: { date: string; ops: NonNullable<WidgetProps["data"]["finance"]>["ops"]; anchor: NonNullable<WidgetProps["data"]["finance"]>["anchor"]; flow: Flow }) {
  const [pending, start] = useTransition();
  const occ = useMemo(() => expand(ops, date, date).filter((o) => (flow === "in" ? o.signed > 0 : flow === "out" ? o.signed < 0 : true)), [ops, date, flow]);
  const all = useMemo(() => expand(ops, date, date), [ops, date]);
  const startBal = getBalanceAtDate(ops, anchor, addDays(date, -1));
  const endBal = getBalanceAtDate(ops, anchor, date);
  const inflow = all.filter((o) => o.signed > 0).reduce((s, o) => s + o.signed, 0);
  const outflow = -all.filter((o) => o.signed < 0).reduce((s, o) => s + o.signed, 0) || 0;
  const remove = (o: Occurrence) =>
    start(() => (o.op.frequency === "once" ? deleteOperation(o.op.table, o.op.id) : skipOccurrence(o.op.table, o.op.id, o.date)));

  return (
    <div className={cx("min-w-0 rounded-xl border border-line bg-stone-50/50 p-3", pending && "opacity-60")}>
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-[12px] font-semibold capitalize text-stone-800">{fmtLong(date)}</p>
        <NewOperationButton defaultDate={date} label="+ Ajouter" className="btn-ghost shrink-0" />
      </div>
      <dl className="tabular mt-2 space-y-1 text-[11px]">
        <div className="flex justify-between"><dt className="text-stone-500">Solde début de journée</dt><dd className="font-medium text-stone-700">{formatEUR(startBal)}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Dépenses</dt><dd className="font-medium text-rose-600">{outflow ? `-${formatEUR(outflow)}` : formatEUR(0)}</dd></div>
        <div className="flex justify-between"><dt className="text-stone-500">Revenus</dt><dd className="font-medium text-emerald-600">+{formatEUR(inflow)}</dd></div>
        <div className="flex justify-between rounded-lg bg-brand-50 px-2 py-1.5 text-[12px]"><dt className="font-semibold text-brand-800">Solde fin de journée</dt><dd className={cx("font-bold", endBal >= 0 ? "text-brand-800" : "text-rose-600")}>{formatEUR(endBal)}</dd></div>
      </dl>
      <p className="mb-1 mt-3 text-[11px] font-semibold text-stone-500">Opérations du jour ({occ.length})</p>
      {occ.length === 0 ? (
        <p className="text-[11px] text-stone-400">Rien ce jour-là.</p>
      ) : (
        <ul className="space-y-1">
          {occ.map((o, i) => (
            <li key={i} className="group flex items-center gap-2 text-[12px]" title={KIND_LABEL[o.op.kind]}>
              <span className={cx("h-1.5 w-1.5 shrink-0 rounded-full", KIND_STYLE[o.op.kind].dot)} />
              <span className="min-w-0 flex-1 truncate text-stone-700">{o.op.name}</span>
              <button onClick={() => remove(o)} title={o.op.frequency === "once" ? "Supprimer" : "Ignorer cette occurrence"} className="hidden text-stone-300 hover:text-rose-600 group-hover:block">
                <Icon name="close" className="h-3 w-3" />
              </button>
              <span className={cx("tabular shrink-0 font-semibold", o.signed > 0 ? "text-emerald-600" : "text-rose-600")}>{o.signed > 0 ? "+" : "-"}{formatEUR(o.op.amount)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---------- Répartition du mois ---------- */

export function FinBreakdown({ data }: WidgetProps) {
  const f = data.finance;
  const { y, m } = ym(data.today);
  const budget = useMemo(() => (f ? getMonthlyBudget(f.ops, f.anchor, y, m) : null), [f, y, m]);
  const [picked, setPicked] = useState<string | null>(null);
  if (!f || !budget) return <WidgetShell icon="pie" title="Répartition du mois"><NoFinance /></WidgetShell>;
  const items = [
    { label: "Charges fixes", value: budget.fixed },
    ...budget.variableByCategory.slice(0, 4),
    ...(budget.variableByCategory.length > 4 ? [{ label: "Autres dépenses", value: budget.variableByCategory.slice(4).reduce((s, i) => s + i.value, 0) }] : []),
    { label: "Épargne", value: budget.savings },
  ].filter((i) => i.value > 0);
  return (
    <WidgetShell icon="pie" title="Répartition du mois" subtitle={`${MONTHS_FR[m]} · revenus ${eur0(budget.income)}`} href="/app/finance/budgets" hrefLabel="Budgets">
      <DonutChart items={items} size={132} strokeWidth={18} centerCaption="dépensé" selected={picked} onSelect={(l) => setPicked(l === picked ? null : l)} />
    </WidgetShell>
  );
}

/* ---------- Budgets par catégorie ---------- */

export function FinBudgets({ data }: WidgetProps) {
  const f = data.finance;
  const { y, m } = ym(data.today);
  const rows = useMemo(() => {
    if (!f) return [];
    const { start, end } = monthBounds(y, m);
    const occ = expand(f.ops.filter((o) => o.kind === "variable"), start, end);
    const byCat = new Map<string, { planned: number; spent: number }>();
    for (const o of occ) {
      const k = o.op.category || "Autre";
      const e = byCat.get(k) ?? { planned: 0, spent: 0 };
      e.planned += o.op.amount;
      if (o.date <= (data.realToday ?? data.today)) e.spent += o.op.amount;
      byCat.set(k, e);
    }
    return [...byCat.entries()].map(([label, v]) => ({ label, ...v })).sort((a, b) => b.planned - a.planned);
  }, [f, y, m, data.today, data.realToday]);
  return (
    <WidgetShell icon="chart" title="Budgets" subtitle="Dépenses variables du mois" href="/app/finance/budgets">
      {!f || rows.length === 0 ? (
        <Empty>Aucune dépense variable prévue ce mois-ci.</Empty>
      ) : (
        <ul className="space-y-2.5">
          {rows.slice(0, 5).map((r) => {
            const pct = r.planned > 0 ? Math.min(100, (r.spent / r.planned) * 100) : 0;
            return (
              <li key={r.label}>
                <div className="flex items-baseline justify-between gap-2 text-[12px]">
                  <span className="truncate text-stone-700">{r.label}</span>
                  <span className="tabular shrink-0 text-[11px] text-stone-500"><b className="text-stone-800">{eur0(r.spent)}</b> / {eur0(r.planned)}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className={cx("fill-grow h-full rounded-full", pct >= 100 ? "bg-rose-400" : "bg-brand-400")} style={{ width: `${pct}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </WidgetShell>
  );
}

/* ---------- Revenus / charges à venir ---------- */

function UpcomingList({ data, size, income }: WidgetProps & { income: boolean }) {
  const f = data.finance;
  const items = useMemo(
    () => (f ? expand(f.ops.filter((o) => (income ? o.kind === "income" : o.kind !== "income")), data.today, addDays(data.today, 120)).slice(0, size === "s" ? 4 : 7) : []),
    [f, data.today, income, size]
  );
  return (
    <WidgetShell icon={income ? "arrowIn" : "arrowOut"} title={income ? "Revenus à venir" : "Charges à venir"} href="/app/finance/operations">
      {items.length === 0 ? (
        <Empty>{income ? "Aucun revenu prévu." : "Aucune charge prévue."}</Empty>
      ) : (
        <ul className="divide-y divide-line/70">
          {items.map((o, i) => (
            <li key={i} className="flex items-center gap-2.5 py-1.5 text-[12px]">
              <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-md", income ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500")}>
                <Icon name={income ? "arrowIn" : "arrowOut"} className="h-3 w-3" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-stone-800">{o.op.name}</span>
                <span className="block text-[10px] text-stone-400">{fmtShort(o.date)}</span>
              </span>
              <span className={cx("tabular shrink-0 font-semibold", income ? "text-emerald-600" : "text-rose-600")}>{income ? "+" : "-"}{formatEUR(o.op.amount)}</span>
            </li>
          ))}
        </ul>
      )}
      <NewOperationButton defaultDate={data.today} defaultKind={income ? "income" : "fixed"} label={income ? "+ Ajouter un revenu" : "+ Ajouter une charge"} className="mt-2 w-full rounded-lg bg-brand-50 py-1.5 text-[11px] font-semibold text-brand-700 hover:bg-brand-100" />
    </WidgetShell>
  );
}

export const FinIncomes = (p: WidgetProps) => <UpcomingList {...p} income />;
export const FinCharges = (p: WidgetProps) => <UpcomingList {...p} income={false} />;

/* ---------- Évolution du solde ---------- */

export function FinTrend({ data, size }: WidgetProps) {
  const f = data.finance;
  const { y, m } = ym(data.today);
  const { start, end } = monthBounds(y, m);
  const points = useMemo(() => (f ? getDailyBalances(f.ops, f.anchor, start, end) : []), [f, start, end]);
  const [hover, setHover] = useState<number | null>(null);
  const ref = useRef<SVGSVGElement>(null);
  if (!f || points.length === 0) return <WidgetShell icon="trend" title="Évolution du solde"><NoFinance /></WidgetShell>;

  const W = 320;
  const H = size === "s" ? 90 : 120;
  const vals = points.map((p) => p.balance);
  const lo = Math.min(0, ...vals);
  const hi = Math.max(0, ...vals);
  const span = hi - lo || 1;
  const x = (i: number) => (i / (points.length - 1)) * W;
  const yv = (v: number) => 6 + (1 - (v - lo) / span) * (H - 12);
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${yv(p.balance).toFixed(1)}`).join("");
  const area = `${line}L${W},${yv(lo)}L0,${yv(lo)}Z`;
  const todayIdx = points.findIndex((p) => p.date === data.today);
  const shown = hover ?? (todayIdx >= 0 ? todayIdx : points.length - 1);
  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setHover(Math.max(0, Math.min(points.length - 1, Math.round(((e.clientX - r.left) / r.width) * (points.length - 1)))));
  };

  return (
    <WidgetShell icon="trend" title="Évolution du solde" subtitle={`${MONTHS_FR[m]} ${y}`}>
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] text-stone-500">{fmtShort(points[shown].date)}</p>
        <p className={cx("tabular text-lg font-bold", points[shown].balance >= 0 ? "text-stone-900" : "text-rose-600")}>{formatEUR(points[shown].balance)}</p>
      </div>
      <svg ref={ref} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="mt-1 h-auto w-full touch-none" onPointerMove={onMove} onPointerLeave={() => setHover(null)} role="img" aria-label="Solde prévu jour par jour">
        {lo < 0 && <line x1={0} x2={W} y1={yv(0)} y2={yv(0)} stroke="rgb(var(--stone-300))" strokeDasharray="3 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />}
        <path d={area} fill="rgb(var(--brand-500))" fillOpacity={0.12} className="animate-fade" />
        <path d={line} pathLength={1} className="stroke-draw" fill="none" stroke="rgb(var(--brand-600))" strokeWidth={2.25} vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
        <line x1={x(shown)} x2={x(shown)} y1={0} y2={H} stroke="rgb(var(--brand-600))" strokeOpacity={0.35} strokeWidth={1} vectorEffect="non-scaling-stroke" />
        <circle cx={x(shown)} cy={yv(points[shown].balance)} r={3.5} fill="rgb(var(--brand-600))" stroke="rgb(var(--surface))" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-stone-400">
        <span>1 {MONTHS_FR[m].slice(0, 3).toLowerCase()}.</span>
        <span>fin : <b className="text-stone-600">{eur0(points[points.length - 1].balance)}</b></span>
      </div>
    </WidgetShell>
  );
}

/* ---------- Actions rapides ---------- */

export function FinActions({ data }: WidgetProps) {
  const tile = "flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-left text-[12px] font-semibold text-stone-700 transition hover:border-brand-200 hover:bg-brand-50/50";
  return (
    <WidgetShell icon="bolt" title="Actions rapides">
      <div className="grid grid-cols-2 gap-2">
        <NewOperationButton defaultDate={data.today} defaultKind="variable" label="+ Dépense" className={tile} />
        <NewOperationButton defaultDate={data.today} defaultKind="income" label="+ Revenu" className={tile} />
        <Link href="/app/finance/accounts" className={tile}><Icon name="bank" className="text-brand-600" />Soldes</Link>
        <Link href="/app/finance/operations" className={tile}><Icon name="list" className="text-brand-600" />Opérations</Link>
      </div>
    </WidgetShell>
  );
}
