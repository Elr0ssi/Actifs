import { TOOL_FAQ_EXTRA } from "@/lib/marketing/faq-extra";
import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { HabitTool } from "@/components/marketing/tools/habit-tool";
import { pageMeta } from "@/lib/marketing/site";

const path = "/outils/suivi-habitudes";
const description = "Suivi d'habitudes gratuit : crée tes routines quotidiennes ou hebdomadaires, coche chaque jour et suis ta régularité et tes séries. Sans inscription, directement dans ton navigateur.";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({ title: tr("Suivi d'habitudes et de routines (habit tracker) — gratuit, sans inscription"), description: tr(description), path });
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <ToolPage
      path={path}
      name="Suivi d'habitudes"
      h1={tr("Suivi d'habitudes : ton habit tracker gratuit")}
      intro={tr("Ajoute tes habitudes, choisis les jours prévus, coche chaque jour et vois ta régularité de la semaine. Pas de compte, pas d'abonnement.")}
      description={description}
      steps={[
        { title: tr("Ajoute tes habitudes"), text: tr("Sport, lecture, méditation, revue du budget : écris-les en quelques mots. Elles sont quotidiennes par défaut.") },
        { title: tr("Choisis les jours prévus"), text: tr("Une séance de sport trois fois par semaine ? Sélectionne simplement lundi, mercredi et vendredi : les autres jours ne comptent pas.") },
        { title: tr("Coche chaque jour"), text: tr("Un clic suffit. Tu peux aussi rattraper un jour oublié dans la semaine en cours ou naviguer vers les semaines passées.") },
        { title: tr("Suis ta régularité"), text: tr("Un pourcentage par habitude, une série de jours réussis et un graphique de la semaine te montrent où tu en es.") },
      ]}
      uses={[
        { title: tr("Installer une routine durablement"), text: tr("Voir sa régularité jour après jour aide à tenir sur plusieurs semaines.") },
        { title: tr("Séparer habitudes quotidiennes et hebdomadaires"), text: tr("Chaque habitude a ses propres jours, sans fausser le pourcentage global.") },
        { title: tr("Repérer les jours difficiles"), text: tr("Le graphique par jour montre quels jours de la semaine tu rates le plus.") },
      ]}
      faq={[
        { q: tr("Combien d'habitudes puis-je suivre ?"), a: tr("Autant que tu veux, mais commencer par deux ou trois habitudes augmente nettement les chances de les tenir.") },
        { q: tr("Mes habitudes sont-elles sauvegardées ?"), a: tr("Oui, dans ton navigateur. Elles restent sur cet appareil et ne sont pas envoyées sur nos serveurs.") },
        { q: tr("La journée en cours compte-t-elle dans mon pourcentage ?"), a: tr("Les jours à venir ne comptent pas, et une habitude pas encore cochée aujourd'hui ne casse pas ta série.") },
        { q: tr("Puis-je retrouver mes routines dans un agenda ?"), a: tr("Avec un espace Flozea, tes routines s'affichent dans l'agenda avec tes tâches, et une courbe suit ta régularité par semaine, mois et année.") },
        ...TOOL_FAQ_EXTRA["suivi-habitudes"],
      ]}
      guides={["creer-une-routine-quotidienne-qui-tient", "remplacer-notion-excel-jow"]}
    >
      <HabitTool />
    </ToolPage>
  );
}
