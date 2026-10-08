import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Mentions légales",
  description: "Éditeur, hébergeurs et contact du site Flozea.",
  path: "/mentions-legales",
});

export default function Page() {
  return (
    <LegalPage
      title="Mentions légales"
      path="/mentions-legales"
      updated="8 octobre 2026"
      intro="Informations légales concernant le site flozea.com."
      sections={[
        {
          h2: "Éditeur du site",
          paragraphs: ["Flozea est édité à titre personnel. Nom de l'éditeur : [à compléter]. Directeur de la publication : [à compléter]. Contact : [adresse e-mail à compléter]."],
        },
        {
          h2: "Hébergement",
          list: [
            "Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.",
            "Base de données et authentification : Supabase, hébergement dans l'Union européenne ou au Royaume-Uni selon le projet.",
          ],
        },
        {
          h2: "Propriété intellectuelle",
          paragraphs: ["Le nom Flozea, le logo, les textes et les éléments graphiques du site sont protégés. Toute reproduction sans autorisation est interdite."],
        },
        {
          h2: "Données personnelles",
          paragraphs: ["Voir la politique de confidentialité pour connaître les données utilisées et exercer tes droits."],
        },
      ]}
    />
  );
}
