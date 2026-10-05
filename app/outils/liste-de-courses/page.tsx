import type { Metadata } from "next";
import { ToolPage } from "@/components/marketing/tool-page";
import { ShoppingTool } from "@/components/marketing/tools/shopping-tool";
import { pageMeta } from "@/lib/marketing/site";

const path = "/outils/liste-de-courses";
const description = "Générateur de liste de courses à partir de recettes : choisis tes recettes et le nombre de personnes, les quantités sont ajustées, fusionnées et arrondies aux formats vendus. Gratuit, sans inscription.";

export const metadata: Metadata = pageMeta({ title: "Générateur de liste de courses à partir de recettes — gratuit", description, path });

export default function Page() {
  return (
    <ToolPage
      path={path}
      name="Générateur de liste de courses"
      h1="Générateur de liste de courses à partir de tes recettes"
      intro="Choisis des recettes, indique pour combien de personnes : la liste de courses est calculée pour toi, classée par rayon, avec les quantités à acheter."
      description={description}
      steps={[
        { title: "Choisis tes recettes", text: "Cherche par nom, ingrédient ou catégorie (pâtes, viande, végétarien, rapide…) et ajoute celles de ta semaine." },
        { title: "Règle le nombre de personnes", text: "Chaque recette s'ajuste : 320 g de pâtes pour quatre deviennent 160 g pour deux. Tu peux changer le nombre de personnes recette par recette." },
        { title: "Récupère la liste fusionnée", text: "Les ingrédients identiques sont additionnés et classés par rayon. Les formats courants sont proposés : filet de 1 kg d'oignons, paquet de 500 g de pâtes." },
        { title: "Copie, imprime ou coche en magasin", text: "Copie la liste dans tes notes, imprime-la ou coche les articles au fur et à mesure de tes courses." },
      ]}
      uses={[
        { title: "Planifier les repas de la semaine", text: "Choisis cinq ou six recettes le dimanche et obtiens la liste complète en quelques secondes." },
        { title: "Éviter le gaspillage", text: "Des quantités ajustées au nombre de personnes et arrondies aux conditionnements réels limitent les surplus." },
        { title: "Gagner du temps en magasin", text: "Une liste classée par rayon permet de faire ses courses en un seul passage." },
      ]}
      faq={[
        { q: "Comment la liste de courses est-elle calculée ?", a: "Chaque ingrédient de chaque recette est mis à l'échelle selon le nombre de personnes, puis les ingrédients identiques sont additionnés et arrondis aux formats habituellement vendus." },
        { q: "Puis-je utiliser mes propres recettes ?", a: "Dans cet outil gratuit, tu choisis parmi les recettes proposées. Avec un espace Flozea, tu peux créer tes propres recettes, avec leurs étapes et leurs photos." },
        { q: "Ma liste est-elle sauvegardée ?", a: "Oui, dans ton navigateur uniquement. Elle n'est pas envoyée sur nos serveurs et ne se synchronise pas entre appareils sans compte." },
        { q: "Les prix sont-ils indiqués ?", a: "Pas dans l'outil gratuit. Dans Flozea, la liste est chiffrée avec les prix de référence de ton enseigne et comparée aux autres magasins." },
      ]}
      guides={["planifier-ses-repas-de-la-semaine", "faire-sa-liste-de-courses-sans-gaspillage", "faire-un-budget-mensuel"]}
    >
      <ShoppingTool />
    </ToolPage>
  );
}
