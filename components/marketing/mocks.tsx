import { getT } from "@/lib/i18n/server";
import { cx } from "@/lib/utils";
import { Bubble, Float, InView } from "@/components/marketing/fx";

/** Fenêtre d'appli stylisée, commune à toutes les maquettes. */
function Window({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  const tr = getT();
  return (
    <div className={cx("overflow-hidden rounded-3xl border border-line bg-surface shadow-lift", className)}>
      <div className="flex items-center gap-1.5 border-b border-line bg-stone-50/70 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
        <span className="ml-3 text-[11px] font-medium text-stone-500">{tr(title)}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

const D = (n: number) => ({ "--d": `${n}s` }) as React.CSSProperties;

export function AgendaMock({ className }: { className?: string }) {
  const tr = getT();
  const days = [tr("Lun"), tr("Mar"), tr("Mer"), tr("Jeu"), tr("Ven")];
  const events: { d: number; top: number; h: number; label: string; tone: string }[] = [
    { d: 0, top: 18, h: 40, label: tr("Réunion équipe"), tone: "bg-brand-500/15 border-brand-500 text-brand-800" },
    { d: 1, top: 62, h: 52, label: tr("Appel client"), tone: "bg-amber-500/15 border-amber-500 text-amber-800" },
    { d: 2, top: 30, h: 34, label: tr("Dentiste"), tone: "bg-sky-500/15 border-sky-500 text-sky-800" },
    { d: 3, top: 78, h: 44, label: tr("Focus mémoire"), tone: "bg-emerald-500/15 border-emerald-500 text-emerald-800" },
    { d: 4, top: 14, h: 50, label: tr("Devis"), tone: "bg-brand-500/15 border-brand-500 text-brand-800" },
  ];
  return (
    <InView className={className}>
      <Window title={tr("Agenda · semaine du 28 sept.")}>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px] font-medium text-stone-500">{days.map((d) => <span key={d}>{tr(d)}</span>)}</div>
        <div className="relative mt-2 grid h-44 grid-cols-5 gap-2 rounded-2xl bg-[repeating-linear-gradient(to_bottom,transparent,transparent_21px,rgb(var(--line)/0.8)_22px)] p-0">
          {days.map((_, i) => (
            <div key={i} className="relative">
              {events.filter((e) => e.d === i).map((e, k) => (
                <div key={k} className={cx("fx-in absolute inset-x-0 rounded-lg border-l-[3px] px-1.5 py-1 text-[10px] font-semibold leading-tight", e.tone)} style={{ top: e.top, height: e.h, ...D(0.15 * (i + 1)) }}>{tr(e.label)}</div>
              ))}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-x-0 top-[70px] flex items-center"><span className="h-2 w-2 rounded-full bg-rose-500" /><span className="h-px flex-1 bg-rose-500/70" /></div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <span className="fx-in rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-semibold text-emerald-700" style={D(0.9)}>{tr("↻ Sport · lun, mer, ven")}</span>
          <span className="fx-in rounded-full bg-rose-500/10 px-2.5 py-1 text-[10px] font-semibold text-rose-700" style={D(1.05)}>{tr("+ 1 845 € · salaire")}</span>
        </div>
      </Window>
    </InView>
  );
}

export function TasksMock({ className }: { className?: string }) {
  const tr = getT();
  const items = [[tr("Envoyer le devis"), tr("Travail"), true], [tr("Réserver le week-end"), tr("Vacances"), false], [tr("Appeler la banque"), tr("Perso"), false], [tr("Ranger le bureau"), tr("Maison"), false]] as const;
  return (
    <InView className={className}>
      <Window title={tr("Tâches & routines")}>
        <ul className="space-y-2">
          {items.map(([t, p, done], i) => (
            <li key={t} className="fx-slide flex items-center gap-3 rounded-xl border border-line px-3 py-2" style={D(0.12 * i)}>
              <span className={cx("fx-check flex h-5 w-5 items-center justify-center rounded-full border", done ? "border-transparent bg-emerald-500" : "border-stone-300")}>
                {done && <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" style={D(0.6)} /></svg>}
              </span>
              <span className="min-w-0 flex-1"><span className={cx("block truncate text-[12px] font-medium", done ? "text-stone-500 line-through" : "text-stone-800")}>{tr(t)}</span><span className="block text-[10px] text-stone-500">{tr(p)}</span></span>
              {i === 1 && <span className="rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600">{tr("Demain")}</span>}
            </li>
          ))}
        </ul>
        <div className="fx-in mt-3 flex items-center justify-between rounded-2xl bg-gradient-to-r from-brand-500/10 to-emerald-500/10 px-4 py-3" style={D(0.7)}>
          <div><p className="text-[11px] text-stone-500">{tr("Régularité de la semaine")}</p><p className="text-xl font-bold text-stone-900">86 %</p></div>
          <div className="flex items-end gap-1">{[40, 70, 100, 60, 90, 100, 0].map((h, i) => <span key={i} className="fx-bar w-2.5 origin-bottom rounded-sm bg-brand-500" style={{ height: Math.max(6, h * 0.34), transformOrigin: "bottom", ...D(0.9 + i * 0.07) }} />)}</div>
        </div>
      </Window>
    </InView>
  );
}

export function MealsMock({ className }: { className?: string }) {
  const tr = getT();
  const meals = [[tr("Lun"), "🍗", tr("Poulet basquaise"), "45 min"], [tr("Mar"), "🍝", tr("Pâtes tomate basilic"), "25 min"], [tr("Mer"), "🌶️", tr("Chili sin carne"), "35 min"], [tr("Jeu"), "🥗", tr("Salade chèvre miel"), "10 min"]];
  return (
    <InView className={className}>
      <Window title={tr("Repas de la semaine")}>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {meals.map(([d, e, n, t], i) => (
            <div key={d} className="fx-in rounded-2xl border border-line p-2.5" style={D(0.12 * i)}>
              <p className="text-[11px] font-bold text-stone-800">{tr(d)}</p>
              <p className="my-2 flex h-14 items-center justify-center rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 text-3xl">{tr(e)}</p>
              <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-stone-900">{tr(n)}</p>
              <p className="mt-1 text-[10px] text-stone-500">⏱ {tr(t)} {tr("· 2 pers.")}</p>
            </div>
          ))}
        </div>
        <div className="fx-in mt-3 flex items-center justify-between rounded-xl bg-brand-50 px-3 py-2 text-[11px] text-brand-800" style={D(0.7)}><span>{tr("Nous sommes")} <b>2</b> {tr("· quantités ajustées")}</span><span className="font-semibold">{tr("Voir la liste →")}</span></div>
      </Window>
    </InView>
  );
}

export function ShoppingMock({ className }: { className?: string }) {
  const tr = getT();
  const rows = [[tr("Oignons"), "1 kg", tr("filet de 1 kg · besoin 300 g"), "1,90 €"], [tr("Spaghetti"), "500 g", tr("paquet de 500 g"), "1,20 €"], [tr("Tomates concassées"), "800 g", tr("2 × boîte de 400 g"), "2,00 €"], [tr("Cuisses de poulet"), "1 kg", "", "5,50 €"]];
  return (
    <InView className={className}>
      <Window title={tr("Liste de courses · Leclerc")}>
        <ul className="divide-y divide-line/70">
          {rows.map(([n, q, note, p], i) => (
            <li key={n} className="fx-slide flex items-center gap-3 py-2" style={D(0.12 * i)}>
              <span className="h-4 w-4 rounded border border-stone-300" />
              <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-stone-800"><b className="mr-1">{tr(q)}</b>{tr(n)}</span>{note && <span className="block text-[10px] text-stone-500">{tr(note)}</span>}</span>
              <span className="text-[12px] font-semibold text-stone-700">{tr(p)}</span>
            </li>
          ))}
        </ul>
        <div className="fx-in mt-3 flex items-center justify-between rounded-xl bg-stone-900 px-4 py-3 text-white" style={D(0.7)}>
          <span className="text-[11px] text-stone-300">{tr("Total estimé")}</span><span className="text-lg font-bold">10,60 €</span>
        </div>
        <p className="fx-in mt-2 text-center text-[10px] text-emerald-600" style={D(0.9)}>{tr("🏆 3,40 € d'économie possible chez Lidl")}</p>
      </Window>
    </InView>
  );
}

export function BudgetMock({ className }: { className?: string }) {
  const tr = getT();
  return (
    <InView className={className}>
      <Window title={tr("Finance · octobre")}>
        <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 p-4 text-white">
          <p className="text-[11px] text-white/70">{tr("Reste à vivre jusqu'au 15 oct.")}</p>
          <p className="fx-in text-3xl font-bold tracking-tight" style={D(0.1)}>642,00 €</p>
          <p className="text-[11px] text-white/70">{tr("≈ 46 € par jour")}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/20"><div className="fx-bar h-full w-2/3 rounded-full bg-white" style={D(0.4)} /></div>
        </div>
        <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[10px]">
          {Array.from({ length: 14 }, (_, i) => (
            <div key={i} className="fx-in rounded-lg border border-line py-1.5" style={D(0.04 * i)}>
              <span className="text-stone-500">{i + 1}</span>
              {i === 4 && <span className="block text-[9px] font-bold text-rose-600">−1050</span>}
              {i === 14 - 1 && <span className="block text-[9px] font-bold text-emerald-600">+810</span>}
              {i === 8 && <span className="block text-[9px] font-bold text-rose-500">−23</span>}
            </div>
          ))}
        </div>
        <div className="fx-in mt-3 flex items-center gap-2.5 rounded-xl border border-line px-3 py-2" style={D(0.8)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-base">💳</span>
          <span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-stone-800">{tr("Carrefour City")}</span><span className="block text-[10px] text-stone-500">{tr("12:31 · Carte • Apple Pay")}</span></span>
          <span className="text-[12px] font-semibold text-rose-600">−12,50 €</span>
        </div>
      </Window>
    </InView>
  );
}

export function NotesMock({ className }: { className?: string }) {
  const tr = getT();
  return (
    <InView className={className}>
      <Window title={tr("Notes · Idées de voyage")}>
        <p className="text-2xl">✈️</p>
        <p className="text-xl font-bold tracking-tight text-stone-900">{tr("Idées de voyage")}</p>
        <div className="mt-3 space-y-1.5 text-[12px] text-stone-700">
          <p className="fx-slide" style={D(0.1)}>{tr("Un texte avec")} <b>{tr("gras")}</b>, <i>{tr("italique")}</i> {tr("et")} <code className="rounded bg-stone-100 px-1 text-brand-700">{tr("code")}</code>.</p>
          <p className="fx-slide flex items-center gap-2" style={D(0.25)}><span className="flex h-4 w-4 items-center justify-center rounded bg-brand-600 text-[9px] text-white">✓</span><span className="text-stone-500 line-through">{tr("Réserver le vol")}</span></p>
          <p className="fx-slide flex items-center gap-2" style={D(0.4)}><span className="text-stone-500">•</span>{tr("Lisbonne")}</p>
          <p className="fx-slide flex items-center gap-2" style={D(0.55)}><span className="text-stone-500">•</span>{tr("Porto")}</p>
          <p className="fx-slide text-stone-500" style={D(0.7)}>{tr("/titre")}</p>
        </div>
        <div className="fx-in mt-1 w-44 rounded-xl border border-line bg-surface p-1 shadow-lift" style={D(0.9)}>
          {[tr("Titre 1"), tr("Titre 2"), tr("À cocher")].map((t, i) => <p key={t} className={cx("rounded-lg px-2.5 py-1 text-[11px]", i === 0 ? "bg-brand-50 font-semibold text-brand-700" : "text-stone-600")}>{tr(t)}</p>)}
        </div>
      </Window>
    </InView>
  );
}

export const MOCKS = { agenda: AgendaMock, tasks: TasksMock, meals: MealsMock, shopping: ShoppingMock, budget: BudgetMock, notes: NotesMock } as const;
export type MockKey = keyof typeof MOCKS;

export { Float, Bubble };
