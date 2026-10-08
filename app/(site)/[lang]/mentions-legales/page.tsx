import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Mentions légales"),
  description: tr("Éditeur, hébergeurs et contact du site Flozea."),
  path: "/mentions-legales",
});
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <LegalPage
      title={tr("Mentions légales")}
      path="/mentions-legales"
      updated="8 octobre 2026"
      intro={tr("Informations légales concernant le site flozea.com.")}
      sections={[
        {
          h2: tr("Éditeur du site"),
          paragraphs: [tr("Flozea est édité à titre personnel. Nom de l'éditeur : [à compléter]. Directeur de la publication : [à compléter]. Contact : [adresse e-mail à compléter].")],
        },
        {
          h2: tr("Hébergement"),
          list: [
            tr("Site : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis."),
            tr("Base de données et authentification : Supabase, hébergement dans l'Union européenne ou au Royaume-Uni selon le projet."),
          ],
        },
        {
          h2: tr("Propriété intellectuelle"),
          paragraphs: [tr("Le nom Flozea, le logo, les textes et les éléments graphiques du site sont protégés. Toute reproduction sans autorisation est interdite.")],
        },
        {
          h2: tr("Données personnelles"),
          paragraphs: [tr("Voir la politique de confidentialité pour connaître les données utilisées et exercer tes droits.")],
        },
      ]}
    />
  );
}
