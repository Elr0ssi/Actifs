import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { BudgetTool } from "@/components/marketing/tools/budget-tool";
import { pageMeta } from "@/lib/marketing/site";

const path = "/outils/budget-mensuel";
const description = "Calculateur de budget mensuel gratuit : saisis tes revenus et tes charges, obtiens ton reste à vivre, ton budget par jour et ta répartition selon la règle 50/30/20. Sans inscription.";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({ title: tr("Calculateur de budget mensuel et reste à vivre — gratuit, sans inscription"), description: tr(description), path });
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <ToolPage
      path={path}
      name="Calculateur de budget mensuel"
      h1={tr("Calculateur de budget mensuel et de reste à vivre")}
      intro={tr("Saisis tes revenus nets et tes charges : tu vois tout de suite ton reste à vivre, ce que tu peux dépenser par jour et si ta répartition respecte la règle 50/30/20.")}
      description={description}
      steps={[
        { title: tr("Renseigne tes revenus nets"), text: tr("Ce qui arrive réellement sur ton compte chaque mois : salaire net, allocations, revenus d'appoint. Ajoute autant de lignes que nécessaire.") },
        { title: tr("Liste tes charges fixes et variables"), text: tr("Loyer, factures, assurances et abonnements d'un côté ; courses, sorties et imprévus de l'autre. Les montants sont modifiables à tout moment.") },
        { title: tr("Lis ton reste à vivre"), text: tr("Le calculateur affiche ce qu'il reste après les charges fixes, le montant par jour jusqu'à ta prochaine paie, et ce qu'il reste en fin de mois après épargne.") },
        { title: tr("Compare avec la règle 50/30/20"), text: tr("Trois barres montrent la part des besoins, des envies et de l'épargne par rapport au repère classique 50 / 30 / 20.") },
      ]}
      uses={[
        { title: tr("Savoir si ton budget est tenable"), text: tr("Un reste à vivre négatif te prévient avant la fin du mois : tu sais quel poste réduire.") },
        { title: tr("Préparer un déménagement ou un achat"), text: tr("Teste un nouveau loyer ou une nouvelle mensualité pour voir son effet sur ton quotidien avant de t'engager.") },
        { title: tr("Budgéter à deux"), text: tr("Additionne les revenus et les charges du foyer pour décider ensemble d'un objectif d'épargne réaliste.") },
      ]}
      faq={[
        { q: tr("Mes données financières sont-elles enregistrées ?"), a: tr("Non. Les montants restent dans ton navigateur (stockage local de ta machine) et ne sont jamais envoyés à nos serveurs.") },
        { q: tr("Quelle est la différence entre reste à vivre et reste à dépenser ?"), a: tr("Le reste à vivre est calculé après les charges fixes uniquement. Le montant « il reste en fin de mois » retire en plus les dépenses variables et l'épargne.") },
        { q: tr("Que signifie la règle 50/30/20 ?"), a: tr("Un repère budgétaire : environ 50 % du revenu net pour les besoins, 30 % pour les envies et 20 % pour l'épargne. C'est un point de départ à adapter à ta situation.") },
        { q: tr("Faut-il compter les courses dans les charges fixes ?"), a: tr("Non, les courses varient d'un mois à l'autre : on les place dans les dépenses variables.") },
      ]}
      guides={["faire-un-budget-mensuel", "calculer-son-reste-a-vivre", "gerer-son-budget-en-couple"]}
    >
      <BudgetTool />
    </ToolPage>
  );
}
