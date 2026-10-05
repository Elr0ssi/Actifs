"use client";

import { useMemo, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { addDays } from "@/lib/finance-engine";
import { addMenuItems, removeMenuItem, setMenuServings, setMenuSlot } from "@/app/app/menu-actions";
import { setDefaultServings } from "@/app/app/lists/actions";
import { RECIPES } from "@/lib/marketing/recipes";
import { cx } from "@/lib/utils";
import { DOW } from "@/components/app/widgets/helpers";
import { DragScroller } from "@/components/marketing/drag-scroller";
import type { WidgetData } from "@/lib/data/widgets";

type Slot = "midi" | "soir";
const SLOTS: { key: Slot; label: string; icon: string }[] = [
  { key: "midi", label: "Midi", icon: "☀️" },
  { key: "soir", label: "Soir", icon: "🌙" },
];

const fold = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const known = (name: string) => RECIPES.find((r) => r.name.toLowerCase() === name.toLowerCase());

interface Card {
  name: string;
  icon: string | null;
  image: string | null;
  gradient: string;
  sub: string;
}

export function MenuEditor({ data, weekStart, initialDay, onClose }: { data: WidgetData; weekStart: string; initialDay: string; onClose: () => void }) {
  const [pending, start] = useTransition();
  const [day, setDay] = useState(initialDay);
  const [slot, setSlot] = useState<Slot>("soir");
  const [tab, setTab] = useState<"course" | "mine" | "ideas">("course");
  const [q, setQ] = useState("");
  const [showUsed, setShowUsed] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);
  const [optimistic, setOptimistic] = useState<{ name: string; icon: string | null; day: string; slot: Slot }[]>([]);
  const [removed, setRemoved] = useState<string[]>([]);
  const [slotOf, setSlotOf] = useState<Record<string, Slot>>({});
  const [people, setPeople] = useState(data.defaultServings);
  const [sv, setSv] = useState<Record<string, number>>({});
  const days = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));

  // Une ligne « en attente » disparaît dès que le serveur a renvoyé le repas (sinon il apparaîtrait en double).
  const saved = new Set(data.menu.map((m) => `${m.day}|${m.name.toLowerCase()}`));
  const pendingNow = optimistic.filter((o) => !saved.has(`${o.day}|${o.name.toLowerCase()}`));
  const items = data.menu.filter((m) => !removed.includes(m.id)).map((m) => ({ ...m, slot: slotOf[m.id] ?? m.slot ?? null }));
  const dayItems = items.filter((m) => m.day === day);
  const dayPending = pendingNow.filter((o) => o.day === day);
  const countOn = (d: string) => items.filter((m) => m.day === d).length + pendingNow.filter((o) => o.day === d).length;

  // Un repas déjà planifié sur ces deux semaines n'est plus proposé (sauf si on le demande).
  const usedNames = useMemo(() => {
    const inWindow = new Set(days);
    return new Set([...items.filter((m) => inWindow.has(m.day)).map((m) => m.name.toLowerCase()), ...pendingNow.map((o) => o.name.toLowerCase())]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.menu, removed, optimistic, weekStart]);

  const lastCourse = useMemo(
    () => data.lists.filter((l) => l.type === "shopping" && l.recipes.length > 0).sort((a, b) => b.date.localeCompare(a.date))[0] ?? null,
    [data.lists]
  );

  const add = (c: Card) => {
    setOptimistic((o) => [...o, { name: c.name, icon: c.icon, day, slot }]);
    setFlash(`${c.name} ajouté · ${label(day)} ${slot === "midi" ? "midi" : "soir"}`);
    setTimeout(() => setFlash(null), 2200);
    start(() => addMenuItems(day, [{ name: c.name, icon: c.icon, servings: people }], slot));
  };
  const changePeople = (n: number) => {
    const v = Math.min(20, Math.max(1, n));
    setPeople(v);
    void setDefaultServings(v);
  };
  const changeMeal = (id: string, n: number) => {
    const v = Math.min(100, Math.max(1, n));
    setSv((m) => ({ ...m, [id]: v }));
    start(() => setMenuServings(id, v));
  };
  const moveSlot = (id: string, to: Slot) => {
    setSlotOf((m) => ({ ...m, [id]: to }));
    start(() => setMenuSlot(id, to));
  };

  const query = fold(q.trim());
  const fromMine = (r: WidgetData["myRecipes"][number]): Card => ({ name: r.name, icon: known(r.name)?.icon ?? null, image: r.image_url, gradient: known(r.name)?.gradient ?? "from-stone-100 to-stone-200", sub: `${r.servings} pers.` });
  const fromIdea = (r: (typeof RECIPES)[number]): Card => ({ name: r.name, icon: r.icon, image: r.image, gradient: r.gradient, sub: r.time });
  const cards: Card[] = useMemo(() => {
    let list: Card[];
    if (query) {
      list = [...data.myRecipes.filter((r) => fold(r.name).includes(query)).map(fromMine), ...RECIPES.filter((r) => fold(`${r.name} ${r.category}`).includes(query)).map(fromIdea)];
    } else if (tab === "course") {
      list = (lastCourse?.recipes ?? []).map((r) => {
        const k = known(r.name);
        const mine = data.myRecipes.find((m) => m.name.toLowerCase() === r.name.toLowerCase());
        return { name: r.name, icon: r.icon ?? k?.icon ?? null, image: mine?.image_url ?? k?.image ?? null, gradient: k?.gradient ?? "from-stone-100 to-stone-200", sub: k?.time ?? "" };
      });
    } else if (tab === "mine") {
      list = data.myRecipes.map(fromMine);
    } else {
      list = RECIPES.slice(0, 40).map(fromIdea);
    }
    const seen = new Set<string>();
    return list.filter((c) => (seen.has(c.name.toLowerCase()) ? false : (seen.add(c.name.toLowerCase()), true)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, query, lastCourse, data.myRecipes]);
  const visible = showUsed ? cards : cards.filter((c) => !usedNames.has(c.name.toLowerCase()));
  const hiddenCount = cards.length - cards.filter((c) => !usedNames.has(c.name.toLowerCase())).length;

  const label = (d: string) => `${DOW[(new Date(`${d}T00:00:00Z`).getUTCDay() + 6) % 7]} ${Number(d.slice(8))}`;
  const tabs = [
    { key: "course" as const, label: "Ma dernière course" },
    { key: "mine" as const, label: "Mes recettes" },
    { key: "ideas" as const, label: "Idées" },
  ];

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-6" onClick={onClose}>
      <div className={cx("max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl sm:p-6", pending && "opacity-90")} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-stone-900">Planifier les repas</h2>
            <p className="text-xs text-stone-500">Choisis un jour et un moment, puis ajoute un repas. Tes listes de courses ne changent pas.</p>
          </div>
          <button onClick={onClose} className="rounded-lg px-2 py-1 text-stone-400 hover:bg-stone-100" aria-label="Fermer">✕</button>
        </div>

        {/* Jour */}
        <div className="-mx-1 mt-4 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {days.map((d) => (
            <button key={d} onClick={() => setDay(d)} className={cx("relative shrink-0 rounded-xl border px-3 py-1.5 text-[12px] font-semibold transition", d === day ? "border-brand-500 bg-brand-600 text-white" : "border-line text-stone-600 hover:bg-stone-100")}>
              {label(d)}
              {countOn(d) > 0 && <span className={cx("absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[9px]", d === day ? "bg-white text-brand-700" : "bg-brand-600 text-white")}>{countOn(d)}</span>}
            </button>
          ))}
        </div>

        {/* Midi / Soir : on clique sur un moment pour y ajouter */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SLOTS.map((s) => {
            const mine = dayItems.filter((m) => m.slot === s.key);
            const opt = dayPending.filter((o) => o.slot === s.key);
            const on = slot === s.key;
            return (
              <div key={s.key} onClick={() => setSlot(s.key)} className={cx("cursor-pointer rounded-2xl border p-3 transition", on ? "border-brand-400 bg-brand-50/60 ring-2 ring-brand-200" : "border-line hover:bg-stone-50")}>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold text-stone-900">{s.icon} {s.label}</p>
                  {on && <span className="rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold text-white">j'ajoute ici</span>}
                </div>
                <ul className="mt-2 space-y-1.5">
                  {mine.map((m) => {
                    const n = sv[m.id] ?? m.servings ?? data.defaultServings;
                    return (
                      <li key={m.id} className="flex items-center gap-1.5 rounded-xl bg-surface px-2 py-1.5 text-[12px] shadow-soft">
                        <span>{m.icon ?? "🍽️"}</span>
                        <span className="min-w-0 flex-1 truncate font-medium text-stone-800">{m.name}</span>
                        <span className="flex items-center gap-0.5 text-stone-500">
                          <button type="button" aria-label="Moins de personnes" onClick={(e) => { e.stopPropagation(); changeMeal(m.id, n - 1); }} className="px-1">−</button>
                          <span className="tabular text-[11px]">{n}</span>
                          <button type="button" aria-label="Plus de personnes" onClick={(e) => { e.stopPropagation(); changeMeal(m.id, n + 1); }} className="px-1">+</button>
                        </span>
                        <button type="button" title={s.key === "midi" ? "Passer au soir" : "Passer au midi"} onClick={(e) => { e.stopPropagation(); moveSlot(m.id, s.key === "midi" ? "soir" : "midi"); }} className="text-[13px] opacity-60 hover:opacity-100">{s.key === "midi" ? "🌙" : "☀️"}</button>
                        <button aria-label={`Retirer ${m.name}`} onClick={(e) => { e.stopPropagation(); setRemoved((r) => [...r, m.id]); start(() => removeMenuItem(m.id)); }} className="text-stone-400 hover:text-rose-600">✕</button>
                      </li>
                    );
                  })}
                  {opt.map((o) => <li key={`o${o.name}`} className="rounded-xl bg-surface px-2 py-1.5 text-[12px] text-stone-500 shadow-soft">{o.icon ?? "🍽️"} {o.name}…</li>)}
                  {mine.length + opt.length === 0 && <li className="px-1 py-2 text-[12px] text-stone-400">Rien de prévu</li>}
                </ul>
              </div>
            );
          })}
        </div>
        {dayItems.some((m) => !m.slot) && (
          <p className="mt-2 text-[11px] text-stone-400">Repas sans moment précisé : {dayItems.filter((m) => !m.slot).map((m) => m.name).join(", ")}. Passe-les au midi ou au soir depuis la fiche du jour.</p>
        )}

        {/* Personnes */}
        <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3.5 py-2">
          <p className="text-[12px] font-medium text-stone-700">Pour combien de personnes ?</p>
          <div className="flex items-center gap-1">
            <button type="button" onClick={() => changePeople(people - 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-600" aria-label="Moins de personnes">−</button>
            <span className="min-w-[3rem] text-center text-sm font-bold text-stone-900">{people}<span className="ml-0.5 text-[10px] font-medium text-stone-400">pers.</span></span>
            <button type="button" onClick={() => changePeople(people + 1)} className="h-7 w-7 rounded-lg border border-line bg-surface text-stone-600" aria-label="Plus de personnes">+</button>
          </div>
        </div>

        {/* Où piocher : carrousel */}
        <div className="mt-5">
          <div className="flex flex-wrap items-center gap-2">
            <div className="segmented">
              {tabs.map((t) => (
                <button key={t.key} type="button" data-active={!query && tab === t.key} onClick={() => { setQ(""); setTab(t.key); }}>{t.label}</button>
              ))}
            </div>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Rechercher…" className="input !h-8 min-w-[8rem] flex-1 !py-0 text-[12px]" />
          </div>

          {flash && <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-[12px] font-medium text-emerald-700">✓ {flash}</p>}

          {tab === "course" && !query && !lastCourse ? (
            <p className="mt-3 text-xs text-stone-400">Les recettes que tu choisis en créant une liste de courses apparaîtront ici.</p>
          ) : visible.length === 0 ? (
            <p className="mt-3 rounded-xl bg-stone-50 px-3 py-4 text-center text-xs text-stone-500">
              {cards.length === 0 ? (tab === "mine" && !query ? "Tu n'as pas encore de recette. " : "Aucune recette trouvée. ") : "Tout est déjà planifié 🎉 "}
              {tab === "mine" && !query && <a href="/app/lists/recipes" className="font-medium text-brand-600 hover:underline">Créer une recette</a>}
            </p>
          ) : (
            <DragScroller className="mt-3 -mx-1 px-1">
              {visible.map((c) => {
                const used = usedNames.has(c.name.toLowerCase());
                return (
                  <button
                    key={c.name}
                    type="button"
                    draggable={false}
                    onClick={() => add(c)}
                    className={cx("group w-[8.5rem] shrink-0 overflow-hidden rounded-2xl border border-line bg-surface text-left transition hover:-translate-y-0.5 hover:shadow-soft", used && "opacity-50")}
                  >
                    <div className={cx("relative aspect-[4/3] overflow-hidden bg-gradient-to-br", c.gradient)}>
                      {c.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.image} alt="" draggable={false} loading="lazy" className="h-full w-full object-cover" />
                      ) : (
                        <span className="flex h-full items-center justify-center text-4xl transition group-hover:scale-110">{c.icon ?? "🍽️"}</span>
                      )}
                      <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-base font-bold text-white shadow-md">{used ? "✓" : "+"}</span>
                    </div>
                    <div className="p-2">
                      <p className="line-clamp-2 min-h-[2.25rem] text-[12px] font-semibold leading-tight text-stone-900">{c.name}</p>
                      {c.sub && <p className="mt-0.5 text-[10.5px] text-stone-400">{c.sub}</p>}
                    </div>
                  </button>
                );
              })}
            </DragScroller>
          )}

          {hiddenCount > 0 && (
            <p className="mt-1 text-[11px] text-stone-400">
              {hiddenCount} repas déjà planifié{hiddenCount > 1 ? "s" : ""} {showUsed ? "affiché" + (hiddenCount > 1 ? "s" : "") : "masqué" + (hiddenCount > 1 ? "s" : "")} ·{" "}
              <button type="button" onClick={() => setShowUsed((v) => !v)} className="font-medium text-brand-600 hover:underline">{showUsed ? "Les masquer" : "Les afficher"}</button>
            </p>
          )}
          <a href="/app/lists/recipes" className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline">+ Créer une nouvelle recette</a>
        </div>

        <button onClick={onClose} className="btn-primary mt-6 w-full justify-center">Terminé</button>
      </div>
    </div>,
    document.body
  );
}
