"use client";

import { useState } from "react";
import { useLocale, useT } from "@/components/i18n/provider";
import { intlOf } from "@/lib/i18n";
import { cx } from "@/lib/utils";

/** Démo interactive : on change le nombre de personnes, la liste de courses, le budget et l'agenda suivent. */
export function PlanDemo() {
  const tr = useT();
  const locale = useLocale();
  const [people, setPeople] = useState(2);
  const money = (n: number) => new Intl.NumberFormat(intlOf(locale), { style: "currency", currency: "EUR" }).format(n);
  const num = (n: number) => new Intl.NumberFormat(intlOf(locale), { maximumFractionDigits: 1 }).format(n);

  // Besoin par personne, puis arrondi aux formats vendus en magasin.
  const pastaNeed = people * 80;
  const tomatoNeed = people * 150;
  const lines = [
    { icon: "🍝", name: tr("Spaghetti"), need: `${num(pastaNeed)} g`, pack: `${Math.ceil(pastaNeed / 500)} × 500 g`, price: Math.ceil(pastaNeed / 500) * 1.2 },
    { icon: "🍅", name: tr("Tomates concassées"), need: `${num(tomatoNeed)} g`, pack: `${Math.ceil(tomatoNeed / 400)} × 400 g`, price: Math.ceil(tomatoNeed / 400) * 0.85 },
    { icon: "🧀", name: tr("Parmesan"), need: `${num(people * 15)} g`, pack: `1 × 100 g`, price: 2.4 },
  ];
  const total = lines.reduce((a, l) => a + l.price, 0);
  const budget = 320;
  const spent = 148;
  const left = budget - spent - total;
  const pct = Math.min(100, ((spent + total) / budget) * 100);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        {/* La recette et son sélecteur */}
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 text-white shadow-lift backdrop-blur-xl">
          <div className="rounded-2xl bg-gradient-to-br from-amber-200 to-orange-300 p-5 text-stone-900">
            <span className="rounded-full bg-white/70 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900">🌙 {tr("Samedi soir")}</span>
            <p className="mt-3 text-2xl font-extrabold tracking-tight">🍝 {tr("Pâtes tomate basilic")}</p>
            <p className="text-sm text-stone-700">{tr("25 min")} · {tr("Facile")}</p>
          </div>
          <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-white/60">{tr("Pour combien de personnes ?")}</p>
          <div className="mt-3 flex items-center justify-center gap-5">
            <button type="button" onClick={() => setPeople((p) => Math.max(1, p - 1))} disabled={people <= 1} aria-label={tr("Moins de personnes")} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl font-bold transition hover:bg-white/25 disabled:opacity-30">−</button>
            <span className="w-24 text-center">
              <span key={people} className="block animate-fadeUp text-6xl font-extrabold tabular-nums leading-none">{people}</span>
              <span className="mt-1 block text-xs text-white/60">{people > 1 ? tr("personnes") : tr("personne")}</span>
            </span>
            <button type="button" onClick={() => setPeople((p) => Math.min(8, p + 1))} disabled={people >= 8} aria-label={tr("Plus de personnes")} className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-2xl font-bold transition hover:bg-white/25 disabled:opacity-30">+</button>
          </div>
          <div className="mt-5 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <button key={n} type="button" onClick={() => setPeople(n)} aria-label={String(n)} className={cx("h-1.5 rounded-full transition-all", n === people ? "w-6 bg-white" : "w-1.5 bg-white/35 hover:bg-white/60")} />)}
          </div>
          <p className="mt-6 rounded-xl bg-white/10 px-4 py-3 text-center text-sm text-white/80">{tr("Appuie sur + ou − : la liste, le budget et l'agenda suivent en direct.")}</p>
        </div>

        {/* Ce que ça change, en direct */}
        <div className="space-y-5">
          <div className="rounded-[2rem] bg-surface p-5 shadow-lift">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-stone-900">🛒 {tr("Ta liste de courses")}</p>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">{tr("calculée toute seule")}</span>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {lines.map((l) => (
                <li key={l.name} className="flex items-center gap-3 py-2.5 text-sm">
                  <span className="text-lg">{l.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-stone-800">{l.name}</span>
                    <span className="block text-[11px] text-stone-400">{tr("besoin {amount}", { amount: l.need })}</span>
                  </span>
                  <span key={l.pack} className="animate-fadeUp rounded-lg bg-stone-100 px-2 py-1 text-xs font-bold tabular-nums text-stone-700">{l.pack}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-[2rem] bg-surface p-5 shadow-lift">
              <p className="text-sm font-bold text-stone-900">💶 {tr("Budget courses")}</p>
              <p key={total.toFixed(2)} className="mt-2 animate-fadeUp text-3xl font-extrabold tabular-nums text-stone-900">− {money(total)}</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-violet-600 transition-all duration-500" style={{ width: `${pct}%` }} /></div>
              <p className="mt-2 text-xs text-stone-500">{tr("Il te reste {amount} ce mois-ci", { amount: money(left) })}</p>
            </div>
            <div className="rounded-[2rem] bg-surface p-5 shadow-lift">
              <p className="text-sm font-bold text-stone-900">📅 {tr("Ton agenda")}</p>
              <div className="mt-3 rounded-xl border-l-4 border-brand-500 bg-brand-50 px-3 py-2">
                <p className="text-sm font-semibold text-stone-900">{tr("Courses")}</p>
                <p className="text-[11px] text-stone-500">{tr("Samedi · 10:00 – 11:00")}</p>
              </div>
              <div className="mt-2 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-3 py-2">
                <p className="text-sm font-semibold text-stone-900">🍝 {tr("Pâtes tomate basilic")}</p>
                <p className="text-[11px] text-stone-500">{tr("Samedi · 19:30")} · {tr("{n} pers.", { n: people })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
