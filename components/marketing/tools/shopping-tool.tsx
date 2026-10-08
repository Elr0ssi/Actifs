"use client";

import { useT } from "@/components/i18n/provider";
import Link from "@/components/marketing/link";
import { useMemo, useState } from "react";
import { CATEGORIES, RECIPES } from "@/lib/marketing/recipes";
import { foldText, formatScaled, parseIngredientLine } from "@/lib/ingredient-parse";
import { roundToPack } from "@/lib/packs";
import type { QtyUnit } from "@/lib/shopping";
import { cx } from "@/lib/utils";
import { useLocalStorage } from "@/components/marketing/tools/use-local-storage";

interface State {
  picked: Record<string, number>;
  checked: Record<string, boolean>;
  people: number;
}

interface Line {
  key: string;
  name: string;
  qty: number | null;
  unit: QtyUnit;
  sources: string[];
  aisle: string;
}

const AISLES: [string, RegExp][] = [
  ["Fruits & légumes", /(tomate|oignon|ail\b|carotte|courgette|aubergine|poivron|pomme|citron|banane|orange|salade|concombre|avocat|champignon|epinard|persil|basilic|coriandre|aneth|ciboulette|echalote|poireau|brocoli|haricot vert|pomme de terre|patate|kiwi|menthe|gingembre)/],
  ["Viandes & poissons", /(poulet|boeuf|porc|veau|agneau|dinde|saumon|thon|cabillaud|crevette|lardon|jambon|saucisse|steak|filet|cuisse|guanciale|bacon|merguez|chorizo)/],
  ["Frais & crémerie", /(lait|creme|beurre|yaourt|fromage|mozzarella|emmental|parmesan|cheddar|feta|oeuf|chevre|ricotta|mascarpone|skyr)/],
  ["Épicerie", /(pate|riz|farine|sucre|huile|vinaigre|sel\b|poivre|epice|cumin|paprika|curry|moutarde|sauce|bouillon|lentille|pois chiche|haricot|ble|semoule|couscous|boulgour|quinoa|miel|chocolat|levure|coulis|conserve|mais|olive|noix|amande|cannelle|origan|thym|laurier|herbe|pesto|tortilla|pain)/],
];
const aisleOf = (name: string) => {
  const f = foldText(name);
  return AISLES.find(([, re]) => re.test(f))?.[0] ?? "Autres";
};
const AISLE_ORDER = ["Fruits & légumes", "Viandes & poissons", "Frais & crémerie", "Épicerie", "Autres"];

const singular = (name: string) =>
  foldText(name)
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((w) => (w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w))
    .join(" ");

function buildLines(picked: Record<string, number>): Line[] {
  const map = new Map<string, Line>();
  for (const [slug, persons] of Object.entries(picked)) {
    const r = RECIPES.find((x) => x.slug === slug);
    if (!r || persons <= 0) continue;
    const factor = persons / (r.servings || 4);
    for (const text of r.ingredients) {
      const p = parseIngredientLine(text);
      let qty = p.qty === null ? null : p.qty * factor;
      let unit = p.unit;
      if (qty !== null && unit === "kg") { qty *= 1000; unit = "g"; }
      if (qty !== null && unit === "l") { qty *= 1000; unit = "ml"; }
      const key = `${singular(p.name)}|${qty === null ? "-" : unit}`;
      const cur = map.get(key) ?? { key, name: p.name, qty: null, unit, sources: [], aisle: aisleOf(p.name) };
      if (qty !== null) cur.qty = (cur.qty ?? 0) + qty;
      if (!cur.sources.includes(r.name)) cur.sources.push(r.name);
      map.set(key, cur);
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "fr"));
}

function describe(l: Line) {
  if (l.qty === null) return { buy: "", need: null as string | null, pack: null as string | null };
  if (l.unit === "u") return { buy: formatScaled(Math.ceil(l.qty - 1e-9), "u"), need: null, pack: null };
  const r = roundToPack(l.qty, l.unit, l.name);
  const need = formatScaled(l.qty, l.unit);
  const buy = formatScaled(r.qty, l.unit);
  return { buy, need: need !== buy ? need : null, pack: r.label };
}

export function ShoppingTool() {
  const tr = useT();
  const [s, setS] = useLocalStorage<State>("allin-courses-v1", { picked: {}, checked: {}, people: 2 });
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const shown = useMemo(() => {
    const q = foldText(query.trim());
    return RECIPES.filter((r) => (!category || r.category === category) && (!q || foldText(`${r.name} ${r.ingredients.join(" ")}`).includes(q))).slice(0, 24);
  }, [query, category]);

  const lines = useMemo(() => buildLines(s.picked), [s.picked]);
  const pickedCount = Object.values(s.picked).filter((n) => n > 0).length;
  const toggle = (slug: string) => setS({ ...s, picked: { ...s.picked, [slug]: s.picked[slug] ? 0 : s.people } });
  const setPeople = (slug: string, n: number) => setS({ ...s, picked: { ...s.picked, [slug]: Math.min(20, Math.max(0, n)) } });
  const check = (key: string) => setS({ ...s, checked: { ...s.checked, [key]: !s.checked[key] } });

  const text = useMemo(() => {
    const out: string[] = [tr("Liste de courses")];
    for (const aisle of AISLE_ORDER) {
      const items = lines.filter((l) => l.aisle === aisle);
      if (!items.length) continue;
      out.push("", aisle.toUpperCase());
      for (const l of items) {
        const d = describe(l);
        out.push(`- ${d.buy ? `${d.buy} ` : ""}${l.name}${d.pack ? ` (${d.pack})` : ""}`);
      }
    }
    return out.join("\n");
  }, [lines]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const chip = (on: boolean) => cx("shrink-0 rounded-full px-3 py-1 text-xs font-medium transition", on ? "bg-ink text-onink" : "bg-stone-100 text-stone-600 hover:bg-stone-200");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
      <section aria-label={tr("Choisir des recettes")}>
        <div className="flex flex-wrap items-center gap-2">
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tr("Chercher une recette ou un ingrédient…")} className="input min-w-[12rem] flex-1" />
          <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs text-stone-500">
            {tr("Nous sommes")}
            <button type="button" onClick={() => setS({ ...s, people: Math.max(1, s.people - 1) })} className="h-6 w-6 rounded-md border border-line" aria-label={tr("Moins")}>−</button>
            <b className="w-4 text-center text-stone-800">{s.people}</b>
            <button type="button" onClick={() => setS({ ...s, people: Math.min(20, s.people + 1) })} className="h-6 w-6 rounded-md border border-line" aria-label={tr("Plus")}>+</button>
          </div>
        </div>
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button type="button" onClick={() => setCategory(null)} className={chip(category === null)}>{tr("Toutes")}</button>
          {CATEGORIES.map((c) => <button key={c} type="button" onClick={() => setCategory(c === category ? null : c)} className={chip(category === c)}>{tr(c)}</button>)}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          {shown.map((r) => {
            const n = s.picked[r.slug] ?? 0;
            return (
              <article key={r.slug} className={cx("flex flex-col overflow-hidden rounded-2xl border bg-surface transition", n > 0 ? "border-brand-400 ring-2 ring-brand-200" : "border-line")}>
                <button type="button" onClick={() => toggle(r.slug)} className="flex h-16 items-center justify-center bg-stone-100 text-3xl" aria-label={n > 0 ? `Retirer ${r.name}` : `Ajouter ${r.name}`}>{tr(r.icon)}</button>
                <div className="flex flex-1 flex-col gap-1 p-2.5">
                  <p className="line-clamp-2 min-h-[2.4em] text-[13px] font-semibold leading-tight text-stone-900">{tr(r.name)}</p>
                  <p className="text-[11px] text-stone-500">{tr(r.time)} · {tr(r.category)}</p>
                  {n > 0 ? (
                    <div className="mt-1 flex items-center justify-between rounded-lg bg-brand-50 px-1.5 py-1">
                      <button type="button" onClick={() => setPeople(r.slug, n - 1)} className="h-6 w-6 rounded-md bg-surface shadow-sm" aria-label={tr("Moins de personnes")}>−</button>
                      <span className="text-xs font-semibold text-brand-800">{n} {tr("pers.")}</span>
                      <button type="button" onClick={() => setPeople(r.slug, n + 1)} className="h-6 w-6 rounded-md bg-surface shadow-sm" aria-label={tr("Plus de personnes")}>+</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => toggle(r.slug)} className="mt-1 rounded-lg bg-stone-100 py-1.5 text-xs font-semibold text-stone-700 hover:bg-brand-50 hover:text-brand-700">{tr("+ Ajouter")}</button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
        {shown.length === 0 && <p className="mt-6 text-center text-sm text-stone-500">{tr("Aucune recette ne correspond.")}</p>}
      </section>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="rounded-3xl border border-line bg-surface p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-stone-900">{tr("Ta liste de courses")}</h2>
            <span className="text-xs text-stone-500">{pickedCount} {tr("recette")}{pickedCount > 1 ? "s" : ""}</span>
          </div>
          {lines.length === 0 ? (
            <p className="mt-4 rounded-xl bg-stone-50 px-4 py-8 text-center text-sm text-stone-500">{tr("Ajoute des recettes : la liste se calcule toute seule, avec les quantités fusionnées.")}</p>
          ) : (
            <>
              <div className="mt-3 max-h-[60vh] space-y-4 overflow-y-auto pr-1">
                {AISLE_ORDER.map((aisle) => {
                  const items = lines.filter((l) => l.aisle === aisle);
                  if (!items.length) return null;
                  return (
                    <div key={aisle}>
                      <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-stone-500">{tr(aisle)}</p>
                      <ul className="space-y-0.5">
                        {items.map((l) => {
                          const d = describe(l);
                          const done = !!s.checked[l.key];
                          return (
                            <li key={l.key}>
                              <label className="flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1 hover:bg-stone-50">
                                <input type="checkbox" checked={done} onChange={() => check(l.key)} className="mt-1 h-3.5 w-3.5 shrink-0" />
                                <span className="min-w-0 flex-1">
                                  <span className={cx("block text-[13px] font-medium", done ? "text-stone-300 line-through" : "text-stone-800")}>
                                    {d.buy && <b className="mr-1 font-semibold">{tr(d.buy)}</b>}{tr(l.name)}
                                  </span>
                                  {(d.pack || d.need) && <span className="block text-[11px] text-stone-500">{[d.pack, d.need ? `besoin ${d.need}` : null].filter(Boolean).join(" · ")}</span>}
                                </span>
                              </label>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-3">
                <button type="button" onClick={copy} className="btn-primary px-3.5 py-2 text-xs">{copied ? tr("Copié ✓") : tr("Copier la liste")}</button>
                <button type="button" onClick={() => window.print()} className="btn-secondary px-3.5 py-2 text-xs">{tr("Imprimer")}</button>
                <button type="button" onClick={() => setS({ ...s, picked: {}, checked: {} })} className="ml-auto text-xs text-stone-500 hover:text-rose-600">{tr("Tout effacer")}</button>
              </div>
            </>
          )}
        </div>
        <div className="mt-4 rounded-2xl bg-stone-900 p-5 text-white">
          <p className="font-semibold">{tr("Dans Flozea, c'est encore plus complet")}</p>
          <p className="mt-1 text-sm text-stone-300">{tr("Prix par enseigne, liste partagée à deux en direct, menu de la semaine, vos propres recettes et historique de courses.")}</p>
          <Link href="/signup" className="mt-3 inline-block rounded-xl bg-white px-4 py-2 text-sm font-semibold text-stone-900 hover:bg-stone-100">{tr("Créer mon espace")}</Link>
        </div>
        <p className="mt-3 text-[11px] text-stone-500">{tr("Les recettes cochées restent dans ton navigateur uniquement.")}</p>
      </aside>
    </div>
  );
}
