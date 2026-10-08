import { TOOL_FAQ_EXTRA } from "@/lib/marketing/faq-extra";
import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { ShoppingTool } from "@/components/marketing/tools/shopping-tool";
import { pageMeta } from "@/lib/marketing/site";

const path = "/outils/liste-de-courses";
const description = "Générateur de liste de courses à partir de recettes : choisis tes recettes et le nombre de personnes, les quantités sont ajustées, fusionnées et arrondies aux formats vendus. Gratuit, sans inscription.";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({ title: tr("Générateur de liste de courses à partir de recettes — gratuit"), description: tr(description), path });
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <ToolPage
      path={path}
      name="Générateur de liste de courses"
      h1={tr("Générateur de liste de courses à partir de tes recettes")}
      intro={tr("Choisis des recettes, indique pour combien de personnes : la liste de courses est calculée pour toi, classée par rayon, avec les quantités à acheter.")}
      description={description}
      steps={[
        { title: tr("Choisis tes recettes"), text: tr("Cherche par nom, ingrédient ou catégorie (pâtes, viande, végétarien, rapide…) et ajoute celles de ta semaine.") },
        { title: tr("Règle le nombre de personnes"), text: tr("Chaque recette s'ajuste : 320 g de pâtes pour quatre deviennent 160 g pour deux. Tu peux changer le nombre de personnes recette par recette.") },
        { title: tr("Récupère la liste fusionnée"), text: tr("Les ingrédients identiques sont additionnés et classés par rayon. Les formats courants sont proposés : filet de 1 kg d'oignons, paquet de 500 g de pâtes.") },
        { title: tr("Copie, imprime ou coche en magasin"), text: tr("Copie la liste dans tes notes, imprime-la ou coche les articles au fur et à mesure de tes courses.") },
      ]}
      uses={[
        { title: tr("Planifier les repas de la semaine"), text: tr("Choisis cinq ou six recettes le dimanche et obtiens la liste complète en quelques secondes.") },
        { title: tr("Éviter le gaspillage"), text: tr("Des quantités ajustées au nombre de personnes et arrondies aux conditionnements réels limitent les surplus.") },
        { title: tr("Gagner du temps en magasin"), text: tr("Une liste classée par rayon permet de faire ses courses en un seul passage.") },
      ]}
      faq={[
        { q: tr("Comment la liste de courses est-elle calculée ?"), a: tr("Chaque ingrédient de chaque recette est mis à l'échelle selon le nombre de personnes, puis les ingrédients identiques sont additionnés et arrondis aux formats habituellement vendus.") },
        { q: tr("Puis-je utiliser mes propres recettes ?"), a: tr("Dans cet outil gratuit, tu choisis parmi les recettes proposées. Avec un espace Flozea, tu peux créer tes propres recettes, avec leurs étapes et leurs photos.") },
        { q: tr("Ma liste est-elle sauvegardée ?"), a: tr("Oui, dans ton navigateur uniquement. Elle n'est pas envoyée sur nos serveurs et ne se synchronise pas entre appareils sans compte.") },
        { q: tr("Les prix sont-ils indiqués ?"), a: tr("Pas dans l'outil gratuit. Dans Flozea, la liste est chiffrée avec les prix de référence de ton enseigne et comparée aux autres magasins.") },
        ...TOOL_FAQ_EXTRA["liste-de-courses"],
      ]}
      guides={["planifier-ses-repas-de-la-semaine", "faire-sa-liste-de-courses-sans-gaspillage", "faire-un-budget-mensuel"]}
    >
      <ShoppingTool />
    </ToolPage>
  );
}
