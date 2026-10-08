import { FadeIn } from "@/components/marketing/fade-in";
import { LogoWordmark } from "@/components/logo";
import { getT } from "@/lib/i18n/server";
import { cx } from "@/lib/utils";

/** « Tout au même endroit » : les outils qu'on utilise déjà, réunis dans Flozea. */
export function AllInOne() {
  const tr = getT();
  const tools = [
    { icon: "📝", name: tr("Notes"), replaces: tr("remplace Notion et Apple Notes"), tone: "bg-amber-50 text-amber-700" },
    { icon: "📅", name: tr("Agenda"), replaces: tr("remplace Google Agenda"), tone: "bg-sky-50 text-sky-700" },
    { icon: "✅", name: tr("Tâches et routines"), replaces: tr("remplace Todoist"), tone: "bg-emerald-50 text-emerald-700" },
    { icon: "🛒", name: tr("Courses"), replaces: tr("remplace tes listes papier"), tone: "bg-rose-50 text-rose-700" },
    { icon: "🍽️", name: tr("Recettes et menus"), replaces: tr("remplace Jow"), tone: "bg-orange-50 text-orange-700" },
    { icon: "💶", name: tr("Budget"), replaces: tr("remplace Excel et Splitwise"), tone: "bg-violet-50 text-violet-700" },
  ];
  return (
    <section className="mx-auto max-w-5xl px-6 py-20" aria-labelledby="tout-en-un">
      <FadeIn className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{tr("Une seule appli")}</p>
        <h2 id="tout-en-un" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          {tr("Toutes les applis que tu utilises déjà,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("au même endroit.")}</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-stone-600">{tr("Notes, agenda, tâches, courses, recettes, budget : Flozea réunit tout dans un seul espace, seul ou à deux.")}</p>
      </FadeIn>

      <FadeIn delay={120}>
        <div className="mt-10 overflow-hidden rounded-[2rem] border border-line bg-surface shadow-lift">
          <div className="flex items-center gap-2 border-b border-line bg-stone-50/80 px-5 py-3">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-300" /><span className="h-2.5 w-2.5 rounded-full bg-amber-300" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
            <span className="ml-3"><LogoWordmark className="text-sm" /></span>
          </div>
          <div className="grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((t) => (
              <div key={t.name} className="flex items-center gap-3.5 bg-surface px-5 py-5 transition hover:bg-brand-50/40">
                <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl", t.tone)}>{t.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[15px] font-bold text-stone-900">{t.name}</span>
                  <span className="block text-xs text-stone-500">{t.replaces}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </FadeIn>
    </section>
  );
}

/** Frise chronologique : tout ce qu'on gère au quotidien, dans l'ordre. */
export function WeekTimeline() {
  const tr = getT();
  const steps = [
    { icon: "🍽️", title: tr("Choisis tes repas"), text: tr("Des recettes et un menu pour la semaine, au bon nombre de personnes."), tone: "from-amber-400 to-orange-500" },
    { icon: "🛒", title: tr("Prépare tes courses"), text: tr("La liste se calcule toute seule, avec les bonnes quantités."), tone: "from-emerald-400 to-teal-500" },
    { icon: "💶", title: tr("Budgétise"), text: tr("Tu vois ce que coûtent tes courses avant d'y aller."), tone: "from-sky-400 to-blue-500" },
    { icon: "📅", title: tr("Programme tout dans le temps"), text: tr("Courses, repas, tâches et routines sur la même grille horaire."), tone: "from-brand-500 to-violet-600" },
    { icon: "📊", title: tr("Suis ton budget de la semaine"), text: tr("Tes paiements arrivent seuls, ton reste à vivre est à jour."), tone: "from-fuchsia-500 to-pink-600" },
    { icon: "📝", title: tr("Garde tes idées"), text: tr("Notes en pages, pour ne rien oublier."), tone: "from-rose-400 to-red-500" },
  ];
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-transparent via-sky-50/60 to-transparent" aria-labelledby="quotidien">
      <div className="mx-auto max-w-4xl px-6 py-20">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{tr("Au quotidien")}</p>
          <h2 id="quotidien" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {tr("Tout ton quotidien,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("étape par étape.")}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">{tr("Du choix de tes repas au suivi de ton budget, chaque étape de ta semaine se gère dans Flozea.")}</p>
        </FadeIn>

        <ol className="relative mt-14">
          <span className="absolute bottom-4 left-5 top-4 w-0.5 bg-gradient-to-b from-amber-300 via-brand-300 to-rose-300 md:left-1/2 md:-translate-x-1/2" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.title} className="relative pb-8 last:pb-0">
              <FadeIn delay={i * 70}>
                <div className={cx("flex items-start gap-4 pl-14 md:w-1/2 md:pl-0", i % 2 === 0 ? "md:pr-12" : "md:ml-auto md:pl-12")}>
                  <span className={cx("absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br text-base text-white shadow-lift ring-4 ring-surface md:left-1/2 md:-translate-x-1/2")} style={undefined}>
                    <span className={cx("absolute inset-0 rounded-full bg-gradient-to-br", s.tone)} aria-hidden />
                    <span className="relative">{s.icon}</span>
                  </span>
                  <div className={cx("rounded-2xl border border-line bg-surface px-5 py-4 shadow-soft", i % 2 === 0 ? "md:text-right" : "")}>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{tr("Étape")} {i + 1}</p>
                    <h3 className="mt-0.5 text-[15px] font-bold text-stone-900">{s.title}</h3>
                    <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{s.text}</p>
                  </div>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
