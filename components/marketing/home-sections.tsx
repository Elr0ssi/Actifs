import { FadeIn } from "@/components/marketing/fade-in";
import { getT } from "@/lib/i18n/server";
import { ConvergeStage, TimelinePath, type ConvergeChip, type TimelineLabels, type TimelineStep } from "@/components/marketing/wow-sections";

/** « Tout au même endroit » : les applis qu'on utilise déjà convergent vers Flozea. */
export function AllInOne() {
  const tr = getT();
  const chips: ConvergeChip[] = [
    { icon: "📝", name: tr("Notes"), replaces: tr("remplace Notion et Apple Notes"), group: "planning" },
    { icon: "📅", name: tr("Agenda"), replaces: tr("remplace Google Agenda"), group: "planning" },
    { icon: "✅", name: tr("Tâches et routines"), replaces: tr("remplace Todoist"), group: "planning" },
    { icon: "🛒", name: tr("Courses"), replaces: tr("remplace tes listes papier"), group: "recettes" },
    { icon: "🍽️", name: tr("Recettes et menus"), replaces: tr("remplace Jow"), group: "recettes" },
    { icon: "💶", name: tr("Budget"), replaces: tr("remplace Excel et Splitwise"), group: "budget" },
  ];
  return (
    <section className="px-6 py-24 lg:mb-32 lg:py-28" aria-labelledby="tout-en-un">
      <FadeIn>
        <ConvergeStage chips={chips}>
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-300">{tr("Une seule appli")}</p>
            <h2 id="tout-en-un" className="mt-3 text-3xl font-extrabold tracking-tight sm:text-5xl">
              {tr("Toutes les applis que tu utilises déjà,")} <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-orange-300 bg-clip-text text-transparent">{tr("au même endroit.")}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-white/65">{tr("Notes, agenda, tâches, courses, recettes, budget : Flozea réunit tout dans un seul espace, seul ou à deux.")}</p>
          </div>
        </ConvergeStage>
      </FadeIn>
    </section>
  );
}

/** Frise du quotidien : un chemin qui se dessine au défilement, avec une petite maquette vivante par étape. */
export function WeekTimeline() {
  const tr = getT();
  const step = tr("Étape");
  const steps: TimelineStep[] = [
    { key: "week", step, title: tr("Organise ta semaine"), text: tr("Agenda horaire, tâches et routines au même endroit."), tone: "#8b5cf6, #6d28d9", glow: "rgba(124,58,237,0.35)" },
    { key: "meals", step, title: tr("Choisis tes repas"), text: tr("Des recettes et un menu pour la semaine, au bon nombre de personnes."), tone: "#fbbf24, #f97316", glow: "rgba(249,115,22,0.35)" },
    { key: "shop", step, title: tr("Prépare tes courses"), text: tr("La liste se calcule toute seule, avec les bonnes quantités."), tone: "#34d399, #0d9488", glow: "rgba(13,148,136,0.35)" },
    { key: "budget", step, title: tr("Budgétise"), text: tr("Tu vois ce que coûtent tes courses avant d'y aller."), tone: "#38bdf8, #2563eb", glow: "rgba(37,99,235,0.35)" },
    { key: "track", step, title: tr("Suis ton budget de la semaine"), text: tr("Tes paiements arrivent seuls, ton reste à vivre est à jour."), tone: "#e879f9, #db2777", glow: "rgba(219,39,119,0.35)" },
    { key: "notes", step, title: tr("Garde tes idées"), text: tr("Notes en pages, pour ne rien oublier."), tone: "#fb7185, #dc2626", glow: "rgba(220,38,38,0.3)" },
  ];
  const labels: TimelineLabels = {
    days: [tr("Lun"), tr("Mar"), tr("Mer"), tr("Jeu"), tr("Ven")],
    meals: [tr("Poulet basquaise"), tr("Pâtes tomate"), tr("Chili sin carne")],
    items: [tr("Tomates"), tr("Pâtes"), tr("Oignons"), tr("Poulet")],
    shopBudget: tr("Courses de la semaine"),
    remaining: tr("Reste à vivre"),
    noteTitle: tr("Idées cadeaux"),
  };
  return (
    <section className="relative overflow-hidden" aria-labelledby="quotidien">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-[-8rem] top-24 h-[34rem] w-[34rem] rounded-full glow from-violet-300/40 to-transparent" />
        <div className="absolute right-[-6rem] top-1/2 h-[34rem] w-[34rem] rounded-full glow from-sky-300/40 to-transparent" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full glow from-amber-200/45 to-transparent" />
      </div>
      <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-28">
        <FadeIn className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">{tr("Au quotidien")}</p>
          <h2 id="quotidien" className="mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl">
            {tr("Tout ton quotidien,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("étape par étape.")}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-stone-600">{tr("De ton emploi du temps à ton budget, chaque étape de ta semaine se gère dans Flozea.")}</p>
        </FadeIn>
        <div className="mt-16">
          <TimelinePath steps={steps} labels={labels} />
        </div>
      </div>
    </section>
  );
}
