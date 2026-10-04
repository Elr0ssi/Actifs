import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { HabitTool } from "@/components/marketing/tools/habit-tool";
import { pageMeta } from "@/lib/marketing/site";

const path = "/outils/suivi-habitudes";
const description = "Suivi d'habitudes gratuit : crée tes routines quotidiennes ou hebdomadaires, coche chaque jour et suis ta régularité et tes séries. Sans inscription, directement dans ton navigateur.";

export const metadata: Metadata = pageMeta({ title: "Suivi d'habitudes et de routines (habit tracker) — gratuit, sans inscription", description, path });

export default function Page() {
  return (
    <ToolPage
      path={path}
      name="Suivi d'habitudes"
      h1="Suivi d'habitudes : ton habit tracker gratuit"
      intro="Ajoute tes habitudes, choisis les jours prévus, coche chaque jour et vois ta régularité de la semaine. Pas de compte, pas d'abonnement."
      description={description}
      steps={[
        { title: "Ajoute tes habitudes", text: "Sport, lecture, méditation, revue du budget : écris-les en quelques mots. Elles sont quotidiennes par défaut." },
        { title: "Choisis les jours prévus", text: "Une séance de sport trois fois par semaine ? Sélectionne simplement lundi, mercredi et vendredi : les autres jours ne comptent pas." },
        { title: "Coche chaque jour", text: "Un clic suffit. Tu peux aussi rattraper un jour oublié dans la semaine en cours ou naviguer vers les semaines passées." },
        { title: "Suis ta régularité", text: "Un pourcentage par habitude, une série de jours réussis et un graphique de la semaine te montrent où tu en es." },
      ]}
      uses={[
        { title: "Installer une routine durablement", text: "Voir sa régularité jour après jour aide à tenir sur plusieurs semaines." },
        { title: "Séparer habitudes quotidiennes et hebdomadaires", text: "Chaque habitude a ses propres jours, sans fausser le pourcentage global." },
        { title: "Repérer les jours difficiles", text: "Le graphique par jour montre quels jours de la semaine tu rates le plus." },
      ]}
      faq={[
        { q: "Combien d'habitudes puis-je suivre ?", a: "Autant que tu veux, mais commencer par deux ou trois habitudes augmente nettement les chances de les tenir." },
        { q: "Mes habitudes sont-elles sauvegardées ?", a: "Oui, dans ton navigateur. Elles restent sur cet appareil et ne sont pas envoyées sur nos serveurs." },
        { q: "La journée en cours compte-t-elle dans mon pourcentage ?", a: "Les jours à venir ne comptent pas, et une habitude pas encore cochée aujourd'hui ne casse pas ta série." },
        { q: "Puis-je retrouver mes routines dans un agenda ?", a: "Avec un espace All In, tes routines s'affichent dans l'agenda avec tes tâches, et une courbe suit ta régularité par semaine, mois et année." },
      ]}
      guides={["creer-une-routine-quotidienne-qui-tient", "remplacer-notion-excel-jow"]}
    >
      <HabitTool />
    </ToolPage>
  );
}
