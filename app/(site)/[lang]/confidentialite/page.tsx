import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Politique de confidentialité (RGPD)"),
  description: tr("Quelles données Flozea collecte, pourquoi, où elles sont hébergées, combien de temps elles sont conservées et comment exercer tes droits."),
  path: "/confidentialite",
});
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <LegalPage
      title={tr("Politique de confidentialité")}
      path="/confidentialite"
      updated="8 octobre 2026"
      intro={tr("Flozea respecte ta vie privée. Cette page explique, simplement, quelles données sont utilisées, pourquoi, et comment tu gardes la main dessus (règlement européen RGPD).")}
      sections={[
        {
          h2: tr("Les données que nous utilisons"),
          list: [
            tr("Ton compte : adresse e-mail, prénom et mot de passe (stocké chiffré, nous ne pouvons pas le lire). Si tu te connectes avec Google, nous recevons ton e-mail et ton nom."),
            tr("Ce que tu saisis dans Flozea : tâches, routines, agenda, listes de courses, recettes, menus, notes, opérations et soldes financiers."),
            tr("Les paiements que tu choisis d'envoyer depuis ton iPhone (commerçant, montant, date) si tu actives l'automatisation Apple Pay."),
            tr("Des statistiques de visites anonymes sur le site (pages vues, pays, type d'appareil), sans cookie et sans pouvoir t'identifier."),
          ],
        },
        {
          h2: tr("Pourquoi ces données"),
          paragraphs: [tr("Uniquement pour faire fonctionner Flozea : te connecter, afficher et enregistrer tes informations, les partager avec les personnes de ton foyer que tu invites, et améliorer le site grâce aux statistiques de visite. Nous ne vendons pas tes données et nous n'affichons pas de publicité.")],
        },
        {
          h2: tr("Qui y a accès"),
          paragraphs: [tr("Toi, et les personnes que tu invites dans ton foyer (elles voient ce que vous partagez : listes, menu, agenda, budget). Nous faisons appel à des prestataires techniques pour faire tourner le service :")],
          list: [
            tr("Supabase : base de données et authentification (hébergement des données de ton compte)."),
            tr("Vercel : hébergement du site et statistiques de visite anonymes."),
            tr("Google : uniquement si tu choisis « Continuer avec Google »."),
          ],
        },
        {
          h2: tr("Cookies et stockage"),
          paragraphs: [tr("Flozea n'utilise que des cookies nécessaires au fonctionnement du site : ta session de connexion et tes préférences d'apparence (thème, couleur). Les statistiques de visite ne déposent aucun cookie. Ces cookies ne demandent donc pas de consentement, mais nous t'en informons par une courte bannière. Certaines préférences peuvent aussi être gardées dans le navigateur (stockage local), par exemple tes saisies dans les anciens outils sans compte : elles restent sur ton appareil.")],
        },
        {
          h2: tr("Durée de conservation"),
          paragraphs: [tr("Tes données sont conservées tant que ton compte existe. Si tu supprimes ton compte, elles sont effacées, à l'exception de ce que la loi nous oblige à garder.")],
        },
        {
          h2: tr("Tes droits"),
          paragraphs: [tr("Tu peux à tout moment demander l'accès à tes données, leur correction, leur suppression, leur export (portabilité), ou t'opposer à un traitement. Écris-nous à l'adresse de contact indiquée dans les mentions légales. Tu peux aussi saisir la CNIL (cnil.fr) si tu estimes que tes droits ne sont pas respectés.")],
        },
        {
          h2: tr("Sécurité"),
          paragraphs: [tr("La connexion au site est chiffrée (HTTPS). Les accès aux données sont limités à ton foyer. Aucun service ne peut garantir une sécurité absolue : choisis un mot de passe unique et garde-le secret.")],
        },
        {
          h2: tr("Modifications"),
          paragraphs: [tr("Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de page.")],
        },
      ]}
    />
  );
}
