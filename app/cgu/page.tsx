import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Conditions générales d'utilisation (CGU)",
  description: "Les règles d'utilisation de Flozea : compte, usage du service, offre gratuite, offre payante à venir, responsabilités.",
  path: "/cgu",
});

export default function Page() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      path="/cgu"
      updated="8 octobre 2026"
      intro="Ces conditions encadrent l'utilisation de Flozea (le site flozea.com et l'application). En créant un compte ou en utilisant le site, tu les acceptes."
      sections={[
        {
          h2: "Le service",
          paragraphs: ["Flozea est un espace personnel qui regroupe un agenda, des tâches et routines, des listes de courses, des recettes, un budget et des notes, seul ou à plusieurs. Le service est fourni « en l'état » et peut évoluer."],
        },
        {
          h2: "Ton compte",
          list: [
            "Tu dois fournir une adresse e-mail valide et garder ton mot de passe confidentiel.",
            "Tu es responsable de ce qui se passe depuis ton compte et de l'accès que tu donnes aux personnes de ton foyer.",
            "Un compte est personnel : n'utilise pas celui de quelqu'un d'autre.",
          ],
        },
        {
          h2: "Utilisation acceptable",
          list: [
            "Ne pas perturber le service ni tenter d'accéder aux données d'autres personnes.",
            "Ne pas utiliser Flozea pour des contenus illégaux ou pour du spam.",
            "Ne pas automatiser des inscriptions ou des requêtes de façon abusive.",
          ],
        },
        {
          h2: "Offres et prix",
          paragraphs: ["L'offre gratuite donne accès aux fonctionnalités décrites sur la page Tarifs. Une offre payante à 3 € par mois, destinée à la connexion directe d'un compte bancaire et à l'analyse des dépenses, est en préparation : elle n'est pas encore disponible. Ses conditions précises seront communiquées avant toute souscription."],
        },
        {
          h2: "Informations financières",
          paragraphs: ["Les montants, projections et analyses affichés par Flozea sont des aides à la décision fondées sur ce que tu saisis. Ils ne constituent ni un conseil financier, ni un conseil fiscal, et ne remplacent pas les relevés de ta banque."],
        },
        {
          h2: "Tes données",
          paragraphs: ["Tu restes propriétaire de ce que tu saisis. Le traitement de tes données est décrit dans la politique de confidentialité. Tu peux supprimer ton compte à tout moment."],
        },
        {
          h2: "Responsabilité",
          paragraphs: ["Nous mettons tout en œuvre pour que le service soit disponible et fiable, sans pouvoir garantir l'absence d'interruption ou d'erreur. Dans la limite permise par la loi, notre responsabilité ne couvre pas les pertes indirectes. Pense à garder une copie des informations importantes."],
        },
        {
          h2: "Fin du service et modifications",
          paragraphs: ["Nous pouvons modifier ces conditions ou faire évoluer le service ; la date de mise à jour figure en haut de page. Nous pouvons suspendre un compte qui ne respecterait pas ces règles."],
        },
        {
          h2: "Droit applicable",
          paragraphs: ["Ces conditions sont soumises au droit français. En cas de litige, une solution amiable est recherchée avant toute action."],
        },
      ]}
    />
  );
}
