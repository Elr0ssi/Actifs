import type { Metadata } from "next";
import Link from "next/link";
import { loadFinanceV2Data } from "@/lib/data/finance-v2";
import { monthActuals, perWeekRemaining, theoreticalMargin, treasuryAt } from "@/lib/finance-v2-engine";
import { monthBounds } from "@/lib/finance-engine";
import { formatEUR, todayISO } from "@/lib/utils";
import { SplitSimulator } from "@/components/app/finance-v2/split-simulator";

export const metadata: Metadata = { title: "Finance — Vue d'ensemble" };

const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export default async function FinanceV2Overview({ searchParams }: { searchParams: { year?: string; month?: string; mode?: string } }) {
  const data = await loadFinanceV2Data();
  if (!data) return null;

  const today = todayISO();
  const now = new Date(`${today}T00:00:00Z`);
  const year = Number(searchParams.year) || now.getUTCFullYear();
  const month = searchParams.month !== undefined ? Number(searchParams.month) : now.getUTCMonth();
  const mode: "month" | "carried" = searchParams.mode === "carried" ? "carried" : data.prefs.defaultMode;

  const { start, end } = monthBounds(year, month);
  const refDate = today >= start && today <= end ? today : end;

  const planned = data.plansByMonth.get(`${year}-${month}`);
  const actuals = monthActuals(data.ops, year, month);
  const plan = planned ?? actuals;
  const margin = theoreticalMargin(plan);

  const treasury = mode === "carried" ? treasuryAt(data.accounts, data.prefs.includedAccounts, data.points, data.transfers, data.ops, refDate) : null;
  const headline = mode === "carried" ? treasury?.total ?? 0 : margin;

  const lastKnown = [...data.points].filter((p) => data.prefs.includedAccounts.includes(p.accountId)).sort((a, b) => b.effectiveDate.localeCompare(a.effectiveDate))[0];
  const perWeek = perWeekRemaining(headline, refDate);

  const monthUrl = (y: number, m: number) => `/app/finance-v2?year=${y}&month=${m}&mode=${mode}`;
  const prevMonth = month === 0 ? { y: year - 1, m: 11 } : { y: year, m: month - 1 };
  const nextMonth = month === 11 ? { y: year + 1, m: 0 } : { y: year, m: month + 1 };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Link href={monthUrl(prevMonth.y, prevMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">‹</Link>
          <span className="text-sm font-semibold capitalize text-slate-800">{MONTHS_FR[month]} {year}</span>
          <Link href={monthUrl(nextMonth.y, nextMonth.m)} className="btn-secondary px-2.5 py-1.5 text-sm">›</Link>
        </div>
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1 text-xs font-medium">
          <Link href={`/app/finance-v2?year=${year}&month=${month}&mode=month`} className={`rounded-lg px-3 py-1.5 ${mode === "month" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>
            Mois seul
          </Link>
          <Link href={`/app/finance-v2?year=${year}&month=${month}&mode=carried`} className={`rounded-lg px-3 py-1.5 ${mode === "carried" ? "bg-white shadow-sm text-slate-900" : "text-slate-500"}`}>
            Avec solde reporté
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {mode === "carried" ? "Trésorerie projetée (estimation)" : "Marge théorique du mois (estimation)"}
          </p>
          <p className={`mt-1 text-4xl font-bold tabular-nums ${headline < 0 ? "text-rose-600" : "text-slate-900"}`}>{formatEUR(headline)}</p>
          <p className="mt-2 text-xs text-slate-400">Référence : {new Date(`${refDate}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "UTC" })}</p>
          {perWeek.isLastDay ? (
            <p className="mt-1 text-xs text-slate-400">Dernier jour du mois.</p>
          ) : (
            <p className="mt-1 text-xs text-slate-400">
              ≈ {formatEUR(perWeek.perWeek)}/semaine sur {perWeek.daysRemaining} jour(s) restant(s)
            </p>
          )}
          {mode === "carried" && treasury?.hasUnknown && <p className="mt-2 text-xs text-amber-600">Solde inconnu pour au moins un compte inclus (aucune saisie).</p>}

          <details className="mt-4 rounded-xl bg-slate-50 p-3 text-sm">
            <summary className="cursor-pointer select-none font-medium text-slate-700">Détail du calcul</summary>
            <div className="mt-2 space-y-1 text-xs text-slate-500">
              <p>Revenus prévus : {formatEUR(plan.income)}</p>
              <p>Charges fixes prévues : − {formatEUR(plan.fixed)}</p>
              <p>Enveloppes variables réservées : − {formatEUR(plan.variable)}</p>
              <p>Épargne / invest. déjà planifiés : − {formatEUR(plan.savings)}</p>
              <p className="pt-1 font-medium text-slate-700">= Marge théorique : {formatEUR(margin)}</p>
              {mode === "carried" && <p className="pt-1">+ Trésorerie réelle datée des comptes inclus, mouvements ultérieurs compris.</p>}
              <p className="pt-1 italic">Les dépenses imprévues ne sont pas incluses.</p>
              <p className="italic">{planned ? "Source : budget saisi manuellement." : "Source : calculé depuis tes opérations récurrentes (aucun budget saisi pour ce mois)."}</p>
            </div>
          </details>
        </div>

        <div className="card p-6">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Dernier solde réel saisi</p>
          {lastKnown ? (
            <>
              <p className="mt-1 text-2xl font-bold text-slate-900">{formatEUR(lastKnown.amount)}</p>
              <p className="mt-1 text-xs text-slate-400">
                {data.accounts.find((a) => a.id === lastKnown.accountId)?.name} · {new Date(`${lastKnown.effectiveDate}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })} · saisie manuelle
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-slate-400">Aucun solde saisi. Ajoute-en un dans « Comptes ».</p>
          )}
          <Link href="/app/finance-v2/accounts" className="btn-secondary mt-4 inline-block py-1.5 text-xs">Gérer les comptes →</Link>
        </div>
      </div>

      <SplitSimulator amount={Math.max(0, headline)} perWeek={perWeek.isLastDay ? 0 : perWeek.perWeek} />
    </div>
  );
}
