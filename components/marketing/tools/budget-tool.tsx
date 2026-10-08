"use client";

import { useT } from "@/components/i18n/provider";
import Link from "@/components/marketing/link";
import { useMemo } from "react";
import { cx } from "@/lib/utils";
import { useLocalStorage } from "@/components/marketing/tools/use-local-storage";

interface Row {
  id: string;
  label: string;
  amount: number;
}
interface State {
  income: Row[];
  fixed: Row[];
  variable: Row[];
  savings: number;
  days: number;
}

const uid = () => Math.random().toString(36).slice(2, 8);
const row = (label: string, amount: number): Row => ({ id: uid(), label, amount });

const INITIAL: State = {
  income: [row("Salaire net", 2100)],
  fixed: [row("Loyer", 720), row("Énergie, internet, mobile", 120), row("Assurances", 80), row("Abonnements", 60), row("Transport", 100)],
  variable: [row("Courses", 300), row("Sorties & restaurants", 120), row("Divers", 100)],
  savings: 200,
  days: 30,
};

const eur = (n: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n || 0);
const sum = (rows: Row[]) => rows.reduce((s, r) => s + (Number.isFinite(r.amount) ? r.amount : 0), 0);

function Group({ title, hint, rows, onChange, tone }: { title: string; hint: string; rows: Row[]; onChange: (rows: Row[]) => void; tone: string }) {
  const tr = useT();
  const update = (id: string, patch: Partial<Row>) => onChange(rows.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  return (
    <section className="rounded-2xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-stone-900">{tr(title)}</h3>
          <p className="text-[11px] text-stone-500">{tr(hint)}</p>
        </div>
        <p className={cx("tabular text-sm font-bold", tone)}>{eur(sum(rows))}</p>
      </div>
      <ul className="space-y-1.5">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2">
            <input value={r.label} onChange={(e) => update(r.id, { label: e.target.value })} aria-label={tr("Intitulé")} className="input min-w-0 flex-1 py-1.5 text-sm" />
            <div className="relative w-28 shrink-0">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                value={r.amount || ""}
                onChange={(e) => update(r.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                aria-label={`Montant : ${r.label}`}
                className="input w-full py-1.5 pr-6 text-right text-sm"
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-stone-500">€</span>
            </div>
            <button type="button" onClick={() => onChange(rows.filter((x) => x.id !== r.id))} className="px-1 text-stone-300 hover:text-rose-600" aria-label={`Supprimer ${r.label}`}>✕</button>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => onChange([...rows, row("", 0)])} className="mt-2 text-xs font-medium text-brand-600 hover:underline">{tr("+ Ajouter une ligne")}</button>
    </section>
  );
}

export function BudgetTool() {
  const tr = useT();
  const [s, setS] = useLocalStorage<State>("allin-budget-v1", INITIAL);
  const calc = useMemo(() => {
    const income = sum(s.income);
    const fixed = sum(s.fixed);
    const variable = sum(s.variable);
    const rav = income - fixed;
    const left = rav - variable - s.savings;
    const days = Math.max(1, s.days || 30);
    const pct = (n: number) => (income > 0 ? Math.round((n / income) * 100) : 0);
    return { income, fixed, variable, rav, left, perDay: rav / days, perDayAfter: (rav - s.savings) / days, needs: pct(fixed + variable * 0.6), wants: pct(variable * 0.4), saving: pct(s.savings), pct };
  }, [s]);

  const negative = calc.left < 0;

  return (
    <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr]">
      <div className="space-y-4">
        <Group title={tr("Revenus nets du mois")} hint={tr("Ce qui arrive vraiment sur ton compte")} rows={s.income} onChange={(income) => setS({ ...s, income })} tone="text-emerald-600" />
        <Group title={tr("Charges fixes")} hint={tr("Loyer, factures, assurances, abonnements, crédits")} rows={s.fixed} onChange={(fixed) => setS({ ...s, fixed })} tone="text-rose-600" />
        <Group title={tr("Dépenses variables")} hint={tr("Courses, sorties, vêtements, imprévus")} rows={s.variable} onChange={(variable) => setS({ ...s, variable })} tone="text-amber-600" />
        <section className="grid gap-3 rounded-2xl border border-line bg-surface p-4 sm:grid-cols-2">
          <label className="text-xs text-stone-500">
            {tr("Épargne visée par mois")}
            <div className="relative mt-1">
              <input type="number" inputMode="decimal" min={0} value={s.savings || ""} onChange={(e) => setS({ ...s, savings: Math.max(0, Number(e.target.value) || 0) })} className="input w-full pr-6 text-right" />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-500">€</span>
            </div>
          </label>
          <label className="text-xs text-stone-500">
            {tr("Jours jusqu'à la prochaine rentrée d'argent")}
            <input type="number" min={1} max={62} value={s.days} onChange={(e) => setS({ ...s, days: Math.min(62, Math.max(1, Number(e.target.value) || 30)) })} className="input mt-1 w-full text-right" />
          </label>
        </section>
        <p className="text-[11px] text-stone-500">{tr("Tes saisies restent dans ton navigateur : rien n'est envoyé ni enregistré sur nos serveurs.")}</p>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <div className={cx("rounded-3xl border p-6", negative ? "border-rose-200 bg-rose-50" : "border-brand-200 bg-brand-50")}>
          <p className={cx("text-xs font-semibold uppercase tracking-wide", negative ? "text-rose-700" : "text-brand-700")}>{tr("Ton reste à vivre")}</p>
          <p className="tabular mt-1 text-5xl font-bold tracking-tight text-stone-900">{eur(calc.rav)}</p>
          <p className="mt-1 text-sm text-stone-600">{tr("revenus − charges fixes =")} <b>{eur(calc.perDay)}</b> {tr("par jour sur")} {s.days} {tr("jours")}</p>
          <dl className="mt-5 space-y-2 border-t border-black/10 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-stone-600">{tr("Dépenses variables")}</dt><dd className="tabular font-medium">− {eur(calc.variable)}</dd></div>
            <div className="flex justify-between"><dt className="text-stone-600">{tr("Épargne")}</dt><dd className="tabular font-medium">− {eur(s.savings)}</dd></div>
            <div className="flex justify-between border-t border-black/10 pt-2 text-base"><dt className="font-semibold text-stone-900">{tr("Il reste en fin de mois")}</dt><dd className={cx("tabular font-bold", negative ? "text-rose-600" : "text-emerald-700")}>{eur(calc.left)}</dd></div>
          </dl>
          {negative ? (
            <p className="mt-4 rounded-xl bg-rose-100 px-3 py-2 text-xs text-rose-800">{tr("Le budget est déficitaire de")} {eur(-calc.left)} {tr(": réduis une dépense variable, l'épargne du mois, ou renégocie une charge fixe.")}</p>
          ) : (
            <p className="mt-4 rounded-xl bg-emerald-100 px-3 py-2 text-xs text-emerald-800">{tr("Budget équilibré : tu peux dépenser environ")} {eur(calc.perDayAfter)} {tr("par jour tout en épargnant")} {eur(s.savings)}.</p>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-surface p-5">
          <h3 className="text-sm font-semibold text-stone-900">{tr("Répartition vs règle 50 / 30 / 20")}</h3>
          <p className="text-[11px] text-stone-500">{tr("Besoins ≈ charges fixes + 60 % des variables · Envies ≈ 40 % des variables · Épargne")}</p>
          <div className="mt-4 space-y-3">
            {[
              { l: tr("Besoins"), v: calc.needs, target: 50, color: "bg-sky-500" },
              { l: tr("Envies"), v: calc.wants, target: 30, color: "bg-amber-500" },
              { l: tr("Épargne"), v: calc.saving, target: 20, color: "bg-emerald-500" },
            ].map((b) => (
              <div key={b.l}>
                <div className="flex justify-between text-xs"><span className="font-medium text-stone-700">{tr(b.l)}</span><span className="tabular text-stone-500">{b.v} % <span className="text-stone-300">{tr("/ repère")} {b.target} %</span></span></div>
                <div className="relative mt-1 h-2.5 overflow-hidden rounded-full bg-stone-100">
                  <div className={cx("h-full rounded-full", b.color)} style={{ width: `${Math.min(100, b.v)}%` }} />
                  <span className="absolute inset-y-0 w-0.5 bg-stone-800/50" style={{ left: `${b.target}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-stone-900 p-5 text-white">
          <p className="font-semibold">{tr("Aller plus loin avec Flozea")}</p>
          <p className="mt-1 text-sm text-stone-300">{tr("Un budget qui vit : opérations récurrentes dans un calendrier, solde réel, paiements par carte ajoutés automatiquement, reste à vivre jusqu'à ta prochaine paie.")}</p>
          <Link href="/signup" className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100">{tr("Créer mon espace")}</Link>
        </div>
      </aside>
    </div>
  );
}
