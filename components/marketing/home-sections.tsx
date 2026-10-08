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
    <section className="mx-auto flex max-w-5xl flex-col justify-center px-6 py-24 lg:min-h-[calc(100svh-69px)] lg:py-16" aria-labelledby="tout-en-un">
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

const I = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const ICONS: Record<string, React.ReactNode> = {
  agenda: <><rect x="3.5" y="5" width="17" height="15" rx="3" /><path d="M8 3v4M16 3v4M3.5 10h17" /></>,
  meal: <><path d="M7 3v8M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 11v10" /><path d="M17 21V3c-2.2 1.2-3.5 3.7-3.5 7v2.5H17" /></>,
  cart: <><path d="M3 4h2.2l2.1 10.2a1.5 1.5 0 0 0 1.5 1.2h7.6a1.5 1.5 0 0 0 1.5-1.1L19.5 8H6.2" /><circle cx="9.5" cy="19.5" r="1.3" /><circle cx="16.5" cy="19.5" r="1.3" /></>,
  wallet: <><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v14H6.5A2.5 2.5 0 0 1 4 16.5z" /><path d="M18 9h2v6h-2a3 3 0 0 1 0-6z" /></>,
  chart: <><path d="M4 20V4M4 20h16" /><path d="M8 15l3.5-4 3 2.5L19 7" /></>,
  note: <><path d="M6 3.5h9l3.5 3.5v13.5H6z" /><path d="M14.5 3.5V7.5h4M9 12h6M9 16h6" /></>,
};
function StepIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" aria-hidden {...I}>{ICONS[name]}</svg>;
}

/** Frise chronologique : tout ce qu'on gère au quotidien, dans l'ordre (horizontale sur grand écran, verticale sinon). */
export function WeekTimeline() {
  const tr = getT();
  const steps = [
    { icon: "agenda", title: tr("Organise ta semaine"), text: tr("Agenda horaire, tâches et routines au même endroit."), tone: "from-brand-500 to-violet-600" },
    { icon: "meal", title: tr("Choisis tes repas"), text: tr("Des recettes et un menu pour la semaine, au bon nombre de personnes."), tone: "from-amber-400 to-orange-500" },
    { icon: "cart", title: tr("Prépare tes courses"), text: tr("La liste se calcule toute seule, avec les bonnes quantités."), tone: "from-emerald-400 to-teal-500" },
    { icon: "wallet", title: tr("Budgétise"), text: tr("Tu vois ce que coûtent tes courses avant d'y aller."), tone: "from-sky-400 to-blue-500" },
    { icon: "chart", title: tr("Suis ton budget de la semaine"), text: tr("Tes paiements arrivent seuls, ton reste à vivre est à jour."), tone: "from-fuchsia-500 to-pink-600" },
    { icon: "note", title: tr("Garde tes idées"), text: tr("Notes en pages, pour ne rien oublier."), tone: "from-rose-400 to-red-500" },
  ];
  return (
    <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-transparent via-sky-50/60 to-transparent lg:min-h-[calc(100svh-69px)]" aria-labelledby="quotidien">
      <div className="mx-auto w-full max-w-6xl px-6 py-24 lg:py-16">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{tr("Au quotidien")}</p>
          <h2 id="quotidien" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {tr("Tout ton quotidien,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("étape par étape.")}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">{tr("De ton emploi du temps à ton budget, chaque étape de ta semaine se gère dans Flozea.")}</p>
        </FadeIn>

        <ol className="relative mt-14 lg:grid lg:grid-cols-6 lg:gap-4">
          {/* trait : vertical (mobile) / horizontal (bureau) */}
          <span className="absolute bottom-4 left-5 top-4 w-0.5 bg-gradient-to-b from-brand-300 via-amber-300 to-rose-300 lg:bottom-auto lg:left-[8%] lg:right-[8%] lg:top-5 lg:h-0.5 lg:w-auto lg:bg-gradient-to-r" aria-hidden />
          {steps.map((s, i) => (
            <li key={s.title} className="relative pb-8 pl-14 last:pb-0 lg:pb-0 lg:pl-0 lg:pt-14">
              <span className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lift ring-4 ring-surface lg:left-1/2 lg:-translate-x-1/2">
                <span className={cx("absolute inset-0 rounded-full bg-gradient-to-br", s.tone)} aria-hidden />
                <span className="relative"><StepIcon name={s.icon} /></span>
              </span>
              <FadeIn delay={i * 80} className="lg:h-full">
                <div className="rounded-2xl border border-line bg-surface px-4 py-3.5 shadow-soft lg:h-full lg:text-center">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{tr("Étape")} {i + 1}</p>
                  <h3 className="mt-0.5 text-[15px] font-bold leading-snug text-stone-900">{s.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-stone-500">{s.text}</p>
                </div>
              </FadeIn>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
