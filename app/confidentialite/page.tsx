import type { Metadata } from "next";
import { LegalPage } from "@/components/marketing/legal-page";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Politique de confidentialité (RGPD)",
  description: "Quelles données Flozea collecte, pourquoi, où elles sont hébergées, combien de temps elles sont conservées et comment exercer tes droits.",
  path: "/confidentialite",
});

export default function Page() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      path="/confidentialite"
      updated="8 octobre 2026"
      intro="Flozea respecte ta vie privée. Cette page explique, simplement, quelles données sont utilisées, pourquoi, et comment tu gardes la main dessus (règlement européen RGPD)."
      sections={[
        {
          h2: "Les données que nous utilisons",
          list: [
            "Ton compte : adresse e-mail, prénom et mot de passe (stocké chiffré, nous ne pouvons pas le lire). Si tu te connectes avec Google, nous recevons ton e-mail et ton nom.",
            "Ce que tu saisis dans Flozea : tâches, routines, agenda, listes de courses, recettes, menus, notes, opérations et soldes financiers.",
            "Les paiements que tu choisis d'envoyer depuis ton iPhone (commerçant, montant, date) si tu actives l'automatisation Apple Pay.",
            "Des statistiques de visites anonymes sur le site (pages vues, pays, type d'appareil), sans cookie et sans pouvoir t'identifier.",
          ],
        },
        {
          h2: "Pourquoi ces données",
          paragraphs: ["Uniquement pour faire fonctionner Flozea : te connecter, afficher et enregistrer tes informations, les partager avec les personnes de ton foyer que tu invites, et améliorer le site grâce aux statistiques de visite. Nous ne vendons pas tes données et nous n'affichons pas de publicité."],
        },
        {
          h2: "Qui y a accès",
          paragraphs: ["Toi, et les personnes que tu invites dans ton foyer (elles voient ce que vous partagez : listes, menu, agenda, budget). Nous faisons appel à des prestataires techniques pour faire tourner le service :"],
          list: [
            "Supabase : base de données et authentification (hébergement des données de ton compte).",
            "Vercel : hébergement du site et statistiques de visite anonymes.",
            "Google : uniquement si tu choisis « Continuer avec Google ».",
          ],
        },
        {
          h2: "Cookies et stockage",
          paragraphs: ["Flozea n'utilise que des cookies nécessaires au fonctionnement du site : ta session de connexion et tes préférences d'apparence (thème, couleur). Les statistiques de visite ne déposent aucun cookie. Ces cookies ne demandent donc pas de consentement, mais nous t'en informons par une courte bannière. Certaines préférences peuvent aussi être gardées dans le navigateur (stockage local), par exemple tes saisies dans les anciens outils sans compte : elles restent sur ton appareil."],
        },
        {
          h2: "Durée de conservation",
          paragraphs: ["Tes données sont conservées tant que ton compte existe. Si tu supprimes ton compte, elles sont effacées, à l'exception de ce que la loi nous oblige à garder."],
        },
        {
          h2: "Tes droits",
          paragraphs: ["Tu peux à tout moment demander l'accès à tes données, leur correction, leur suppression, leur export (portabilité), ou t'opposer à un traitement. Écris-nous à l'adresse de contact indiquée dans les mentions légales. Tu peux aussi saisir la CNIL (cnil.fr) si tu estimes que tes droits ne sont pas respectés."],
        },
        {
          h2: "Sécurité",
          paragraphs: ["La connexion au site est chiffrée (HTTPS). Les accès aux données sont limités à ton foyer. Aucun service ne peut garantir une sécurité absolue : choisis un mot de passe unique et garde-le secret."],
        },
        {
          h2: "Modifications",
          paragraphs: ["Cette politique peut évoluer. La date de dernière mise à jour est indiquée en haut de page."],
        },
      ]}
    />
  );
}
