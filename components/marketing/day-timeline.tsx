import { FadeIn } from "@/components/marketing/fade-in";
import { getT } from "@/lib/i18n/server";
import { cx } from "@/lib/utils";

/** « Ta journée avec Flozea » : quatre moments, chacun avec un aperçu réel de l'appli. */
export function DayTimeline() {
  const tr = getT();
  const Check = ({ done }: { done?: boolean }) => (
    <span className={cx("flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold", done ? "border-emerald-500 bg-emerald-500 text-white" : "border-stone-300 bg-white")}>{done ? "✓" : ""}</span>
  );
  const steps = [
    {
      time: "07:45",
      icon: "☀️",
      title: tr("Tu sais ce qui t'attend"),
      text: tr("Tâches, rendez-vous et routines du jour sur une même grille."),
      tone: "from-violet-500 to-indigo-600",
      mock: (
        <ul className="space-y-2">
          {[[tr("Appel client"), "09:00", true], [tr("↻ Sport"), "12:15", false], [tr("Envoyer le devis"), "16:00", false]].map(([l, h, d]) => (
            <li key={String(l)} className="flex items-center gap-2 rounded-xl bg-stone-50 px-2.5 py-2 text-xs">
              <Check done={d as boolean} />
              <span className={cx("min-w-0 flex-1 font-medium leading-tight", d ? "text-stone-400 line-through" : "text-stone-800")}>{l}</span>
              <span className="text-[10px] text-stone-400">{h}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      time: "12:30",
      icon: "🍝",
      title: tr("Le repas est déjà choisi"),
      text: tr("Ton menu de la semaine, avec la recette et les bonnes quantités."),
      tone: "from-amber-400 to-orange-500",
      mock: (
        <div className="rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 p-3">
          <span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800">☀️ {tr("Midi")}</span>
          <p className="mt-2 text-sm font-bold text-stone-900">🍝 {tr("Pâtes tomate basilic")}</p>
          <p className="text-[11px] text-stone-600">{tr("25 min · 2 pers.")}</p>
        </div>
      ),
    },
    {
      time: "17:45",
      icon: "🛒",
      title: tr("La liste de courses est prête"),
      text: tr("Calculée à partir de tes repas, classée et partagée à deux."),
      tone: "from-emerald-400 to-teal-500",
      mock: (
        <ul className="space-y-2">
          {[[tr("Spaghetti"), tr("paquet de 500 g"), true], [tr("Tomates concassées"), tr("2 × boîte de 400 g"), true], [tr("Parmesan"), tr("1 pot"), false]].map(([l, q, d]) => (
            <li key={String(l)} className="flex items-center gap-2 rounded-xl bg-stone-50 px-2.5 py-2 text-xs">
              <Check done={d as boolean} />
              <span className={cx("min-w-0 flex-1 font-medium leading-tight", d ? "text-stone-400 line-through" : "text-stone-800")}>{l}</span>
              <span className="text-[10px] text-stone-400">{q}</span>
            </li>
          ))}
        </ul>
      ),
    },
    {
      time: "21:00",
      icon: "💶",
      title: tr("Ton budget suit, sans rien saisir"),
      text: tr("Le paiement Apple Pay arrive tout seul, ton reste à vivre se met à jour."),
      tone: "from-sky-400 to-blue-500",
      mock: (
        <div className="rounded-2xl bg-stone-50 p-3">
          <div className="flex items-center justify-between text-[11px]"><span className="font-medium text-stone-700">{tr("Carrefour City")}</span><span className="font-semibold text-rose-600">− 12,50 €</span></div>
          <p className="mt-2 text-[10px] uppercase tracking-wide text-stone-400">{tr("Reste à vivre")}</p>
          <p className="text-lg font-extrabold text-stone-900">≈ 46 € <span className="text-[11px] font-medium text-stone-400">{tr("par jour")}</span></p>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-stone-200"><div className="h-full w-[62%] rounded-full bg-gradient-to-r from-brand-500 to-violet-600" /></div>
        </div>
      ),
    },
  ];
  return (
    <section className="relative overflow-hidden" aria-labelledby="journee">
      <div className="mx-auto max-w-6xl px-6 py-24">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{tr("Une journée avec Flozea")}</p>
          <h2 id="journee" className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">{tr("Du réveil au dernier euro,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("tout est déjà en place.")}</span></h2>
        </FadeIn>

        <ol className="relative mt-16 grid gap-6 md:grid-cols-4">
          <span className="pointer-events-none absolute left-[7%] right-[7%] top-[1.35rem] hidden h-0.5 bg-gradient-to-r from-violet-300 via-amber-300 via-emerald-300 to-sky-300 md:block" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.time} className="relative">
              <FadeIn delay={i * 110}>
                <div className="flex items-center gap-3 md:justify-center">
                  <span className={cx("relative z-10 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-lg shadow-lift ring-4 ring-surface", s.tone)}>{s.icon}</span>
                  <span className="rounded-full border border-line bg-surface px-3 py-1 text-xs font-bold tabular-nums text-stone-700 md:hidden">{s.time}</span>
                </div>
                <div className="mt-4 rounded-3xl border border-line bg-surface p-5 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <p className="hidden text-center text-xs font-bold tabular-nums tracking-wide text-stone-400 md:block">{s.time}</p>
                  <h3 className="mt-1 text-base font-bold leading-snug text-stone-900 md:text-center">{s.title}</h3>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-stone-500 md:text-center">{s.text}</p>
                  <div className="mt-4">{s.mock}</div>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
