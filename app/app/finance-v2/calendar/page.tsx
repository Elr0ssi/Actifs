import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceV2Data } from "@/lib/data/finance-v2";
import { expand, monthBounds, addDays } from "@/lib/finance-engine";
import { treasuryAt } from "@/lib/finance-v2-engine";
import { formatEUR, todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Finance — Calendrier" };
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const WEEKDAYS_FR = ["L", "M", "M", "J", "V", "S", "D"];

export default async function FinanceCalendarPage({ searchParams }: { searchParams: { year?: string; month?: string; day?: string; mode?: string } }) {
  const data = await loadFinanceV2Data();
  if (!data) return null;

  const today = todayISO();
  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const mode: "month" | "carried" = searchParams.mode === "carried" ? "carried" : "month";
  const day = searchParams.day || today;

  const { start, end, days } = monthBounds(year, month);
  const occ = expand(data.ops, start, end);
  const byDate = new Map<string, { in: number; out: number }>();
  for (const o of occ) {
    const e = byDate.get(o.date) ?? { in: 0, out: 0 };
    if (o.signed > 0) e.in += o.signed;
    else e.out += -o.signed;
    byDate.set(o.date, e);
  }

  const firstWeekday = (new Date(`${start}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday-first
  const cells: (string | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: days }, (_, i) => addDays(start, i))];

  const dayOps = occ.filter((o) => o.date === day);
  const measureLabel = mode === "carried" ? "Trésorerie projetée à cette date" : "Cumul du mois depuis zéro à cette date";
  let measure: number;
  if (mode === "carried") {
    measure = treasuryAt(data.accounts, data.prefs.includedAccounts, data.points, data.transfers, data.ops, day).total;
  } else {
    measure = expand(data.ops, start, day).reduce((s, o) => s + o.signed, 0);
  }

  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };
  const monthUrl = (y: number, m: number) => `/app/finance-v2/calendar?year=${y}&month=${m}&mode=${mode}`;
  const dayUrl = (d: string) => `/app/finance-v2/calendar?year=${year}&month=${month}&mode=${mode}&day=${d}`;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href={monthUrl(prevMonth.y, prevMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
            <span className="text-sm font-semibold capitalize text-slate-800">{MONTHS_FR[month]} {year}</span>
            <Link href={monthUrl(nextMonth.y, nextMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
          </div>
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
            <Link href={`/app/finance-v2/calendar?year=${year}&month=${month}&mode=month&day=${day}`} className={`rounded-lg px-3 py-1.5 ${mode === "month" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Mois seul</Link>
            <Link href={`/app/finance-v2/calendar?year=${year}&month=${month}&mode=carried&day=${day}`} className={`rounded-lg px-3 py-1.5 ${mode === "carried" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>Avec solde reporté</Link>
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-slate-400">
          {WEEKDAYS_FR.map((w, i) => <div key={i}>{w}</div>)}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const e = byDate.get(d);
            const selected = d === day;
            return (
              <Link
                key={d}
                href={dayUrl(d)}
                className={`flex h-16 flex-col justify-between rounded-lg border p-1.5 text-left text-[11px] ${selected ? "border-brand-400 bg-brand-50" : "border-slate-100 hover:bg-slate-50"} ${d === today ? "ring-1 ring-brand-300" : ""}`}
              >
                <span className="font-medium text-slate-600">{Number(d.slice(-2))}</span>
                {e && (
                  <span className="space-y-0.5">
                    {e.in > 0 && <span className="block text-emerald-600">+{Math.round(e.in)}</span>}
                    {e.out > 0 && <span className="block text-rose-600">−{Math.round(e.out)}</span>}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="card p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{measureLabel}</p>
        <p className={`mt-1 text-3xl font-bold ${measure < 0 ? "text-rose-600" : "text-slate-900"}`}>{formatEUR(measure)}</p>
        <p className="mt-1 text-xs text-slate-400">{new Date(`${day}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}</p>

        <h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">Opérations du jour</h3>
        {dayOps.length === 0 && <p className="mt-2 text-sm text-slate-400">Aucune opération.</p>}
        <ul className="mt-2 space-y-1.5">
          {dayOps.map((o, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{o.op.name}</span>
              <span className={o.signed > 0 ? "font-medium text-emerald-600" : "font-medium text-rose-600"}>{o.signed > 0 ? "+" : ""}{formatEUR(o.signed)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
