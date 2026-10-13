"use client";

import { useMemo, useState, useTransition } from "react";
import { useT } from "@/components/i18n/provider";
import { planBudget } from "@/app/(main)/app/finance/actions";
import { CATEGORIES, addDays, diffDays, monthBounds } from "@/lib/finance-engine";
import { formatEUR } from "@/lib/utils";
import { SpaceChoice } from "@/components/app/space-badge";
import { useHousehold } from "@/components/app/household-context";

const DAYS = [
  { v: 1, l: "Lundi" }, { v: 2, l: "Mardi" }, { v: 3, l: "Mercredi" }, { v: 4, l: "Jeudi" }, { v: 5, l: "Vendredi" }, { v: 6, l: "Samedi" }, { v: 0, l: "Dimanche" },
];
type Mode = "weekly" | "daily" | "once";

/**
 * « Je me donne 280 € pour l'alimentation ce mois-ci » → Flozea le répartit (chaque vendredi, tous les jours ou en une fois).
 * Ce sont des BUDGETS : à leur date, on les valide ou on les ajuste ; les paiements par carte de la même catégorie les consomment.
 */
export function BudgetPlanner({ defaultStart, defaultMonthLabel }: { defaultStart: string; defaultMonthLabel: string }) {
  const tr = useT();
  const { multi } = useHousehold();
  const [category, setCategory] = useState(CATEGORIES.variable[0]);
  const [total, setTotal] = useState("");
  const [mode, setMode] = useState<Mode>("weekly");
  const [weekday, setWeekday] = useState(5);
  const [start, setStart] = useState(defaultStart);
  const [pending, startT] = useTransition();
  const [done, setDone] = useState(false);

  const amount = Number(total.replace(",", "."));
  const preview = useMemo(() => {
    if (!amount || !/^\d{4}-\d{2}-\d{2}$/.test(start)) return null;
    const d = new Date(`${start}T00:00:00Z`);
    const { end } = monthBounds(d.getUTCFullYear(), d.getUTCMonth());
    if (mode === "once") return { count: 1, each: amount, until: start };
    let first = start;
    if (mode === "weekly") {
      for (let i = 0; i < 7 && new Date(`${first}T00:00:00Z`).getUTCDay() !== weekday; i++) first = addDays(first, 1);
      if (first > end) return null;
      const count = Math.floor(diffDays(first, end) / 7) + 1;
      return { count, each: Math.round((amount / count) * 100) / 100, until: end };
    }
    const count = diffDays(start, end) + 1;
    return { count, each: Math.round((amount / count) * 100) / 100, until: end };
  }, [amount, mode, weekday, start]);

  return (
    <form
      action={(fd) =>
        startT(async () => {
          await planBudget(fd);
          setTotal("");
          setDone(true);
          setTimeout(() => setDone(false), 3000);
        })
      }
      className="space-y-3"
    >
      <input type="hidden" name="mode" value={mode} />
      <input type="hidden" name="weekday" value={weekday} />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="text-xs text-stone-500">
          {tr("Catégorie")}
          <select name="category" value={category} onChange={(e) => setCategory(e.target.value)} className="input mt-1">
            {CATEGORIES.variable.map((c) => <option key={c} value={c}>{tr(c)}</option>)}
          </select>
        </label>
        <label className="text-xs text-stone-500">
          {tr("Budget à répartir (€)")}
          <input name="total" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value)} placeholder="280" className="input mt-1" required />
        </label>
      </div>

      <div className="segmented w-full" role="group" aria-label={tr("Répartition")}>
        {([["weekly", "Chaque semaine"], ["daily", "Chaque jour"], ["once", "En une fois"]] as [Mode, string][]).map(([v, l]) => (
          <button key={v} type="button" data-active={mode === v} onClick={() => setMode(v)} className="flex-1">{tr(l)}</button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {mode === "weekly" && (
          <label className="text-xs text-stone-500">
            {tr("Quel jour ?")}
            <select value={weekday} onChange={(e) => setWeekday(Number(e.target.value))} className="input mt-1">
              {DAYS.map((d) => <option key={d.v} value={d.v}>{tr(d.l)}</option>)}
            </select>
          </label>
        )}
        <label className="text-xs text-stone-500">
          {mode === "once" ? tr("Date") : tr("À partir du (jusqu'à la fin du mois)")}
          <input name="start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="input mt-1" required />
        </label>
      </div>

      {multi && (
        <div className="flex flex-wrap items-center gap-2">
          <SpaceChoice />
          <p className="text-[11px] text-stone-500">{tr("Partagé : ce budget apparaît dans le budget partagé du foyer (dépenses communes).")}</p>
        </div>
      )}

      <p className="rounded-xl bg-brand-50 px-3 py-2 text-[12px] text-brand-800" aria-live="polite">
        {preview
          ? mode === "once"
            ? tr("{amount} le {date}.", { amount: formatEUR(preview.each), date: start })
            : tr("{count} lignes de {amount} jusqu'au {date} — à valider ou ajuster à chaque date.", { count: preview.count, amount: formatEUR(preview.each), date: preview.until })
          : tr("Indique un montant pour voir la répartition.")}
      </p>
      <div className="flex items-center gap-3">
        <button disabled={pending || !preview} className="btn-primary">{pending ? tr("Création…") : tr("Répartir ce budget")}</button>
        {done && <span className="text-xs font-medium text-emerald-600">✓ {tr("Budget ajouté pour {month}", { month: defaultMonthLabel })}</span>}
      </div>
    </form>
  );
}
