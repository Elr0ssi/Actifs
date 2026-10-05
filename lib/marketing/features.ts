import type { MockKey } from "@/components/marketing/mocks";

export type CategoryKey = "organisation" | "repas" | "finances";

export interface Feature {
  slug: string;
  category: CategoryKey;
  /** Fonctionnalité de l'offre payante, pas encore ouverte. */
  soon?: boolean;
  icon: string;
  name: string;
  short: string;
  /** Dégradé d'accent de la fonctionnalité (classes Tailwind). */
  gradient: string;
  soft: string;
  mock: MockKey;
  title: string;
  description: string;
  h1: string;
  intro: string;
  bubbles: { icon: string; title: string; sub: string; tone: "violet" | "green" | "amber" | "rose" | "sky" }[];
  highlights: { icon: string; title: string; text: string }[];
  steps: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  tool?: { href: string; label: string };
  guides: string[];
}

export const FEATURES: Feature[] = [
  {
    slug: "agenda",
    category: "organisation",
    icon: "📅",
    name: "Agenda",
    short: "Un agenda horaire où tâches, routines et rentrées d'argent vivent ensemble.",
    gradient: "from-brand-500 to-violet-700",
    soft: "bg-brand-50 text-brand-700",
    mock: "agenda",
    title: "Agenda en ligne avec tâches et routines : vue jour, semaine, mois",
    description: "Un agenda façon Google Agenda : crée une tâche en glissant sur un créneau, déplace-la, allonge sa durée. Tes routines et tes rentrées d'argent apparaissent au même endroit.",
    h1: "Un agenda où tout se retrouve : tâches, routines, argent",
    intro: "Une grille horaire claire en vue jour, semaine ou mois. Tu poses une tâche en glissant sur un créneau, tu la déplaces à la souris, tu allonges sa durée, et tes routines se cochent au même endroit.",
    bubbles: [
      { icon: "🖱️", title: "Glisse pour créer", sub: "13:00 – 15:00", tone: "violet" },
      { icon: "↻", title: "Sport", sub: "routine cochable", tone: "green" },
      { icon: "💶", title: "+ 1 845 €", sub: "salaire le 1er", tone: "amber" },
    ],
    highlights: [
      { icon: "🖱️", title: "Créer, déplacer, redimensionner", text: "Glisse sur un créneau pour créer une tâche, déplace-la d'un jour à l'autre, tire le bord pour changer sa durée. Un clic ouvre la fiche avec notes, priorité et projet." },
      { icon: "🔍", title: "Jour, semaine ou mois", text: "Trois vues, trois tailles d'affichage (compact, normal, grand) pour voir toute ta journée sans défiler." },
      { icon: "↻", title: "Routines dans la grille", text: "Tes routines quotidiennes ou hebdomadaires s'affichent en haut de chaque jour et se cochent d'un clic, avec ta série de réussite." },
      { icon: "🎨", title: "Projets en couleur", text: "Chaque tâche prend la couleur de son projet : travail, vacances, maison. Un filtre n'affiche qu'un projet à la fois." },
      { icon: "🔗", title: "Compatible Google Agenda et iPhone", text: "Un lien de calendrier privé te permet de voir tes tâches et tes routines dans Google Agenda ou dans l'app Calendrier de l'iPhone." },
    ],
    steps: [
      { title: "Choisis ta vue", text: "Jour, semaine ou mois, avec la taille qui te convient." },
      { title: "Pose tes tâches", text: "Glisse sur un créneau libre, donne un titre, un projet, des notes." },
      { title: "Coche au fil de l'eau", text: "Les tâches et les routines se cochent directement dans la grille." },
      { title: "Abonne ton agenda", text: "Ajoute le lien All In à Google Agenda ou à ton iPhone." },
    ],
    faq: [
      { q: "L'agenda All In remplace-t-il Google Agenda ?", a: "Pour organiser tâches, routines et rendez-vous personnels, oui. Tu peux aussi garder Google Agenda : un lien de calendrier affiche tes tâches et routines dedans (en lecture seule)." },
      { q: "Peut-on déplacer une tâche avec la souris ?", a: "Oui : en vue semaine ou jour, tu fais glisser la tâche vers un autre créneau ou un autre jour, et tu tires son bord pour allonger sa durée. En vue mois, tu la glisses sur un autre jour." },
      { q: "Les routines apparaissent-elles dans l'agenda ?", a: "Oui, chaque jour prévu, avec une case à cocher et ton suivi de régularité." },
    ],
    tool: { href: "/outils/suivi-habitudes", label: "Essayer le suivi d'habitudes gratuit" },
    guides: ["agenda-partage-en-couple-ou-famille", "synchroniser-calendrier-iphone-google-agenda", "organiser-sa-semaine-le-dimanche", "remplacer-notion-excel-jow"],
  },
  {
    slug: "taches-et-routines",
    category: "organisation",
    icon: "✅",
    name: "Tâches & routines",
    short: "Priorités, projets, notes dans chaque tâche et routines avec courbe de régularité.",
    gradient: "from-emerald-500 to-teal-700",
    soft: "bg-emerald-50 text-emerald-700",
    mock: "tasks",
    title: "Gestionnaire de tâches, projets et routines (suivi d'habitudes)",
    description: "Organise tes tâches par projet, ajoute des notes, fixe des priorités et suis tes routines avec une courbe de régularité par semaine, mois et année.",
    h1: "Tâches, projets et routines, sans prise de tête",
    intro: "Tes tâches rangées par projet et par priorité, des notes dans chacune, et des routines dont tu suis la régularité semaine après semaine. Un rond pour valider, un clic pour consulter.",
    bubbles: [
      { icon: "🔥", title: "12 jours de suite", sub: "série de routines", tone: "amber" },
      { icon: "📝", title: "Notes dans la tâche", sub: "étapes, liens", tone: "violet" },
      { icon: "✓", title: "Validée", sub: "Envoyer le devis", tone: "green" },
    ],
    highlights: [
      { icon: "📁", title: "Projets colorés", text: "Regroupe tes tâches par projet (Achats, Création d'entreprise, Sport…) avec une couleur et un compteur d'avancement." },
      { icon: "📝", title: "Une fiche par tâche", text: "Clique sur une tâche pour la consulter : notes, priorité, date, heure de début et de fin. Le rond, lui, sert uniquement à la valider." },
      { icon: "↻", title: "Routines quotidiennes ou hebdomadaires", text: "Choisis les jours prévus ; les routines manquées ne pénalisent pas la journée en cours." },
      { icon: "📈", title: "Courbe de régularité", text: "Visualise ta réussite par jour, par semaine du mois ou par mois de l'année, et fais défiler les périodes." },
      { icon: "⚡", title: "Ajout rapide", text: "Un raccourci clavier ouvre la recherche et l'ajout de tâche depuis n'importe quelle page." },
    ],
    steps: [
      { title: "Crée un projet", text: "Nomme-le, choisis une icône et une couleur." },
      { title: "Ajoute des tâches", text: "Avec priorité, date, heure et notes si besoin." },
      { title: "Programme tes routines", text: "Quotidiennes ou sur certains jours de la semaine." },
      { title: "Suis ta régularité", text: "Une courbe te montre les semaines où tu as tenu le rythme." },
    ],
    faq: [
      { q: "Quelle différence entre une tâche et une routine ?", a: "Une tâche se fait une fois, avec une échéance. Une routine se répète (chaque jour ou certains jours) et se suit dans la durée." },
      { q: "Puis-je ajouter des notes à une tâche ?", a: "Oui, chaque tâche a une fiche avec notes, priorité, date, heures et projet." },
      { q: "Peut-on partager ses tâches à deux ?", a: "Oui, les tâches et projets sont partagés avec les personnes de ton foyer." },
    ],
    tool: { href: "/outils/suivi-habitudes", label: "Essayer le suivi d'habitudes gratuit" },
    guides: ["creer-une-routine-quotidienne-qui-tient", "suivre-ses-habitudes-habit-tracker", "creer-une-liste-de-taches-efficace", "matrice-eisenhower-prioriser-ses-taches"],
  },
  {
    slug: "recettes-et-menu-de-la-semaine",
    category: "repas",
    icon: "🍽️",
    name: "Recettes & menu",
    short: "Des recettes à la bonne quantité et un menu de la semaine par jour, avec photos.",
    gradient: "from-amber-500 to-orange-600",
    soft: "bg-amber-50 text-amber-700",
    mock: "meals",
    title: "Recettes et menu de la semaine : planifier ses repas par personne",
    description: "Choisis des recettes, règle le nombre de personnes, planifie ton menu jour par jour et consulte les ingrédients et étapes ajustés. Alternative à Jow.",
    h1: "Recettes et menu de la semaine, au bon nombre de personnes",
    intro: "Une carte par jour avec photo, nom et durée. Tu règles le nombre de personnes, la fiche de la recette s'ajuste, et le menu alimente ta liste de courses sans effort.",
    bubbles: [
      { icon: "🍝", title: "Pâtes tomate", sub: "25 min · 2 pers.", tone: "amber" },
      { icon: "👥", title: "Nous sommes 2", sub: "quantités ajustées", tone: "violet" },
      { icon: "⭐", title: "Favori", sub: "dans Mes recettes", tone: "rose" },
    ],
    highlights: [
      { icon: "🗓️", title: "Menu jour par jour", text: "Des cartes par jour, défilables à la souris, avec photo, durée et nombre de personnes. Un jour vide t'invite à planifier." },
      { icon: "👥", title: "Quantités pour N personnes", text: "Une recette pour quatre ne convient pas à un couple : ingrédients et quantités se recalculent pour le nombre choisi." },
      { icon: "📖", title: "Fiches de consultation", text: "Ingrédients, ustensiles et étapes numérotées. Tes propres recettes acceptent des notes en puces." },
      { icon: "⭐", title: "Favoris et créations", text: "Mets en favori une recette découverte ; elle rejoint Mes recettes à côté de celles que tu as créées." },
      { icon: "🔍", title: "Idées et recherche", text: "Une base de recettes à parcourir par catégorie, ingrédient ou équipement, avec tri sur tes recettes." },
    ],
    steps: [
      { title: "Choisis des recettes", text: "Dans la base d'idées ou dans tes recettes." },
      { title: "Règle le nombre de personnes", text: "Une valeur par défaut, modifiable recette par recette." },
      { title: "Place-les dans la semaine", text: "Touche un jour pour planifier ; rien n'est ajouté aux courses sans que tu le décides." },
      { title: "Consulte et cuisine", text: "La fiche affiche ingrédients ajustés et étapes." },
    ],
    faq: [
      { q: "Les quantités s'adaptent-elles au nombre de personnes ?", a: "Oui. Les ingrédients sont recalculés pour le nombre de personnes choisi, par recette." },
      { q: "Puis-je planifier un repas sans l'ajouter à ma liste de courses ?", a: "Oui : le menu et la liste de courses sont indépendants, utile quand tu as déjà les ingrédients." },
      { q: "Puis-je créer mes propres recettes ?", a: "Oui, avec photo, catégorie, ingrédients, nombre de personnes et étapes." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Générer une liste de courses gratuite" },
    guides: ["planifier-ses-repas-de-la-semaine", "batch-cooking-debutant", "idees-repas-pas-chers", "quantites-par-personne"],
  },
  {
    slug: "liste-de-courses",
    category: "repas",
    icon: "🛒",
    name: "Listes de courses",
    short: "Quantités fusionnées, formats vendus, prix par enseigne et liste partagée.",
    gradient: "from-sky-500 to-blue-700",
    soft: "bg-sky-50 text-sky-700",
    mock: "shopping",
    title: "Liste de courses intelligente : quantités, prix par enseigne, partage à deux",
    description: "Crée ta liste de courses depuis tes recettes : quantités fusionnées et arrondies aux formats vendus, prix par enseigne, comparaison des magasins, liste partagée.",
    h1: "Des listes de courses qui calculent à ta place",
    intro: "Tu choisis les recettes, All In additionne les ingrédients, arrondit aux formats vendus en magasin, estime le prix chez ton enseigne et partage la liste en direct avec ton foyer.",
    bubbles: [
      { icon: "🧅", title: "1 kg d'oignons", sub: "besoin 300 g", tone: "sky" },
      { icon: "🏆", title: "− 3,40 €", sub: "chez Lidl", tone: "green" },
      { icon: "🤝", title: "Liste partagée", sub: "cochée en direct", tone: "violet" },
    ],
    highlights: [
      { icon: "📦", title: "Formats vendus", text: "300 g d'oignons deviennent un filet de 1 kg, 320 g de pâtes un paquet de 500 g. Le besoin réel reste affiché." },
      { icon: "✏️", title: "Vérification avant d'ajouter", text: "Un écran récapitule les quantités à acheter : corrige-les, retire une ligne, ajuste l'unité." },
      { icon: "💶", title: "Prix et comparaison", text: "Estimation du total chez ton enseigne et comparatif des magasins une fois les courses terminées." },
      { icon: "👥", title: "Personnes par recette", text: "Change le nombre de personnes d'une recette déjà dans la liste : les quantités se recalculent." },
      { icon: "🔄", title: "Partage en direct", text: "À deux, chacun voit les articles cochés, sans doublons. Les produits habituels sont suggérés." },
    ],
    steps: [
      { title: "Crée la liste", text: "Choisis l'enseigne et la semaine." },
      { title: "Ajoute des recettes", text: "Avec le nombre de personnes de chacune." },
      { title: "Vérifie les quantités", text: "Les formats vendus sont proposés ; modifie ce que tu veux." },
      { title: "Coche en magasin", text: "Tu vois le total restant et le détail par rayon." },
    ],
    faq: [
      { q: "Les prix sont-ils exacts ?", a: "Ce sont des prix de référence par enseigne, indicatifs. Tu peux renseigner tes propres prix pour chaque produit." },
      { q: "Comment la liste évite-t-elle le gaspillage ?", a: "En additionnant les besoins de toutes les recettes et en arrondissant aux conditionnements réels, tu achètes ce qu'il faut, pas plus." },
      { q: "La liste est-elle partageable ?", a: "Oui, tout le foyer voit et coche la même liste." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Essayer le générateur gratuit" },
    guides: ["faire-sa-liste-de-courses-sans-gaspillage", "reduire-le-gaspillage-alimentaire", "liste-de-courses-partagee-en-couple", "quantites-par-personne"],
  },
  {
    slug: "budget-et-finances",
    category: "finances",
    icon: "💶",
    name: "Budget & finances",
    short: "Calendrier financier, reste à vivre, soldes réels et paiements Apple Pay.",
    gradient: "from-fuchsia-500 to-brand-700",
    soft: "bg-fuchsia-50 text-fuchsia-700",
    mock: "budget",
    title: "Application de budget : calendrier financier, reste à vivre, paiements Apple Pay",
    description: "Suis ton budget avec un calendrier financier, ton reste à vivre jusqu'à la prochaine paie, tes soldes réels datés et tes paiements par carte ajoutés automatiquement.",
    h1: "Un budget qui vit : calendrier, reste à vivre, paiements en direct",
    intro: "Tes revenus et tes charges placés dans un calendrier, ton reste à vivre calculé jusqu'à la prochaine paie, et chaque paiement Apple Pay qui vient réduire ton solde au bon jour.",
    bubbles: [
      { icon: "💳", title: "Carrefour City", sub: "− 12,50 € · Apple Pay", tone: "violet" },
      { icon: "📆", title: "Salaire lundi 24", sub: "décalé hors week-end", tone: "amber" },
      { icon: "🎯", title: "46 € par jour", sub: "reste à vivre", tone: "green" },
    ],
    highlights: [
      { icon: "📆", title: "Calendrier financier", text: "Tes opérations récurrentes (salaire, loyer, abonnements) jour par jour, avec le solde prévu et le détail de chaque journée." },
      { icon: "🧮", title: "Reste à vivre", text: "Ce que tu peux dépenser par jour jusqu'à ta prochaine rentrée d'argent, après toutes les opérations prévues." },
      { icon: "📌", title: "Soldes réels datés", text: "Un solde saisi est un montant précis à une date, pas un cumul. Tu peux les modifier, les supprimer et nettoyer l'ancien historique." },
      { icon: "🗓️", title: "Salaires hors week-end", text: "Un revenu du 23 tombé un dimanche est reporté au lundi. Tu peux aussi déplacer une date à la main." },
      { icon: "💳", title: "Paiements Apple Pay", text: "Une automatisation de l'app Raccourcis envoie chaque paiement : commerçant, montant, carte, heure. Il apparaît dans ta page Paiements et dans ton solde." },
    ],
    steps: [
      { title: "Saisis tes opérations", text: "Salaire, loyer, abonnements : elles se répètent toutes seules." },
      { title: "Renseigne ton solde réel", text: "À la date de ton choix, modifiable ensuite." },
      { title: "Lis ton reste à vivre", text: "Jusqu'à ta prochaine paie, jour par jour." },
      { title: "Connecte Apple Pay", text: "Tes paiements arrivent automatiquement, avec catégorie devinée." },
    ],
    faq: [
      { q: "Mes paiements Apple Pay arrivent-ils automatiquement ?", a: "Oui, via une automatisation de l'app Raccourcis de l'iPhone à créer une fois. Chaque paiement est envoyé à ton espace avec le commerçant et le montant." },
      { q: "Qu'est-ce que le reste à vivre ?", a: "Le montant disponible jusqu'à ta prochaine rentrée d'argent, après les opérations prévues. Il se calcule par jour pour piloter ton quotidien." },
      { q: "Peut-on se connecter directement à sa banque ?", a: "Ce n'est pas encore proposé. Les paiements par carte arrivent via Apple Pay, et les opérations récurrentes sont saisies dans le calendrier." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Calculer mon reste à vivre" },
    guides: ["faire-un-budget-mensuel", "calculer-son-reste-a-vivre", "gerer-son-budget-en-couple", "regle-50-30-20", "epargne-de-precaution", "reduire-ses-depenses-mensuelles", "calendrier-financier-salaire-et-prelevements", "suivre-ses-depenses-automatiquement"],
  },
  {
    slug: "paiements-automatiques",
    category: "finances",
    icon: "💳",
    name: "Paiements automatiques",
    short: "Chaque paiement Apple Pay arrive tout seul dans ton budget, au bon jour.",
    gradient: "from-rose-500 to-fuchsia-700",
    soft: "bg-rose-50 text-rose-700",
    mock: "budget",
    title: "Suivre ses paiements par carte automatiquement avec Apple Pay et Raccourcis",
    description: "Une automatisation de l'app Raccourcis de l'iPhone envoie chaque paiement par carte vers ton budget : commerçant, montant, date. Ton solde se met à jour sans saisie.",
    h1: "Tes paiements par carte arrivent tout seuls dans ton budget",
    intro: "Tu paies avec ton iPhone, et le paiement apparaît dans All In avec le commerçant et le montant. Tu crées l'automatisation une seule fois, ensuite tu n'as plus rien à saisir.",
    bubbles: [
      { icon: "📲", title: "Paiement détecté", sub: "Carrefour City · 12,50 €", tone: "violet" },
      { icon: "🧾", title: "Ajouté au budget", sub: "à la date du paiement", tone: "green" },
      { icon: "🎯", title: "Reste à vivre", sub: "mis à jour", tone: "amber" },
    ],
    highlights: [
      { icon: "⚡", title: "Zéro saisie", text: "L'automatisation envoie le commerçant, le montant, la carte et l'heure dès que tu paies." },
      { icon: "🗓️", title: "Au bon jour", text: "Le paiement est retiré de ton solde à sa date, et ton reste à vivre se recalcule." },
      { icon: "🏷️", title: "Page Paiements", text: "Retrouve la liste de tes paiements, modifie une catégorie ou supprime un doublon." },
      { icon: "🔒", title: "Sans identifiants bancaires", text: "Rien n'est partagé avec ta banque : seul ton iPhone envoie ses propres paiements, vers une adresse privée liée à ton foyer." },
    ],
    steps: [
      { title: "Ouvre Raccourcis", text: "Crée une automatisation déclenchée par une transaction Apple Pay." },
      { title: "Ajoute l'envoi", text: "Une requête vers l'adresse privée fournie par All In, avec quatre champs." },
      { title: "Paie comme d'habitude", text: "Le raccourci s'exécute immédiatement, sans confirmation." },
      { title: "Retrouve tout dans All In", text: "Le paiement est listé et ton solde est à jour." },
    ],
    faq: [
      { q: "Faut-il connecter ma banque ?", a: "Non. Ce sont les paiements Apple Pay de ton iPhone qui sont envoyés par une automatisation, sans identifiants bancaires." },
      { q: "Et si je paie sans Apple Pay ?", a: "Ces paiements ne sont pas détectés par l'automatisation : tu peux les ajouter à la main dans ton calendrier financier." },
      { q: "Le tutoriel est-il détaillé ?", a: "Oui, All In affiche les étapes exactes à suivre dans Raccourcis, avec les noms des champs à copier." },
    ],
    guides: ["suivre-ses-depenses-automatiquement"],
  },
  {
    slug: "analyse-bancaire",
    category: "finances",
    soon: true,
    icon: "🏦",
    name: "Analyse bancaire",
    short: "Connecte ton compte en direct et obtiens une analyse de tes dépenses. Offre à 3 € par mois, bientôt.",
    gradient: "from-indigo-500 to-violet-800",
    soft: "bg-indigo-50 text-indigo-700",
    mock: "budget",
    title: "Connexion bancaire et analyse de ses dépenses : l'offre All In à 3 € par mois",
    description: "L'offre à 3 € par mois d'All In permettra de connecter ton compte bancaire en direct et d'analyser tes dépenses. Bientôt disponible.",
    h1: "Ton compte bancaire connecté, et une vraie analyse de tes dépenses",
    intro: "L'offre à 3 € par mois est en préparation : elle permettra de relier ton compte bancaire en direct pour que tes opérations arrivent d'elles-mêmes, puis de les analyser. Elle n'est pas encore ouverte.",
    bubbles: [
      { icon: "🔗", title: "Compte relié", sub: "opérations importées", tone: "violet" },
      { icon: "📊", title: "Dépenses par catégorie", sub: "mois après mois", tone: "sky" },
      { icon: "🔁", title: "Abonnements repérés", sub: "ceux que tu oublies", tone: "amber" },
    ],
    highlights: [
      { icon: "🔗", title: "Connexion en direct", text: "Tes opérations arrivent automatiquement, sans saisie ni raccourci, une fois ton compte autorisé." },
      { icon: "📊", title: "Analyse des dépenses", text: "Répartition par catégorie, évolution d'un mois à l'autre, plus gros postes." },
      { icon: "🔁", title: "Abonnements et récurrences", text: "Repérage des prélèvements qui reviennent pour les ajouter à ton calendrier financier." },
      { icon: "🎯", title: "Projections plus justes", text: "Ton solde réel vient de ta banque, donc ton reste à vivre repart d'un chiffre exact." },
    ],
    steps: [
      { title: "Passe à l'offre à 3 €", text: "Quand elle sera ouverte, depuis tes réglages." },
      { title: "Autorise l'accès", text: "Tu choisis ta banque et tu confirmes l'accès en lecture seule." },
      { title: "Les opérations arrivent", text: "Elles s'ajoutent à ton calendrier et à ton solde." },
      { title: "Lis l'analyse", text: "Catégories, tendances et abonnements repérés." },
    ],
    faq: [
      { q: "L'offre à 3 € par mois est-elle disponible ?", a: "Pas encore. Elle est en préparation : la connexion bancaire n'est pas ouverte aujourd'hui." },
      { q: "En attendant, comment suivre mes paiements ?", a: "Avec les paiements automatiques Apple Pay et le calendrier financier, disponibles dans l'offre gratuite." },
      { q: "Pourquoi une offre payante ?", a: "La connexion à une banque repose sur des services de tiers qui ont un coût : l'offre à 3 € par mois couvre ce coût." },
    ],
    guides: ["suivre-ses-depenses-automatiquement", "reduire-ses-depenses-mensuelles"],
  },
  {
    slug: "notes",
    category: "organisation",
    icon: "📝",
    name: "Notes",
    short: "Pages, sous-pages et blocs façon Notion, avec recherche dans tout le contenu.",
    gradient: "from-slate-600 to-brand-700",
    soft: "bg-slate-100 text-slate-700",
    mock: "notes",
    title: "Prise de notes en pages et blocs : alternative simple à Notion",
    description: "Écris des pages avec sous-pages et blocs (titres, listes à cocher, citations, code), raccourcis Markdown, recherche et pages épinglées. Une alternative simple à Notion.",
    h1: "Des notes en pages et en blocs, rapides à écrire",
    intro: "Des pages, des sous-pages et un éditeur à blocs : tape « / » pour choisir un type de bloc, ou utilise les raccourcis Markdown. Tout s'enregistre automatiquement et se retrouve par recherche.",
    bubbles: [
      { icon: "/", title: "Menu de blocs", sub: "titre, liste, citation…", tone: "violet" },
      { icon: "📌", title: "Pages épinglées", sub: "toujours à portée", tone: "amber" },
      { icon: "💾", title: "Enregistré", sub: "automatiquement", tone: "green" },
    ],
    highlights: [
      { icon: "⌨️", title: "Menu « / » et Markdown", text: "Tape # pour un titre, - pour une liste, [] pour une case à cocher, > pour une citation." },
      { icon: "🌳", title: "Pages et sous-pages", text: "Une arborescence repliable pour tout ranger, avec icône emoji et fil d'Ariane." },
      { icon: "✨", title: "Mise en forme en ligne", text: "Gras, italique, code et liens s'affichent proprement dès que tu sors du bloc." },
      { icon: "🔎", title: "Recherche intégrale", text: "La recherche trouve un mot dans les titres comme dans le contenu des pages." },
      { icon: "↕️", title: "Blocs réorganisables", text: "Monte, descends ou supprime un bloc depuis sa poignée." },
    ],
    steps: [
      { title: "Crée une page", text: "Donne-lui un titre et une icône." },
      { title: "Écris en blocs", text: "« / » ou Markdown pour changer le type de bloc." },
      { title: "Range avec des sous-pages", text: "Un clic sur + ajoute une sous-page." },
      { title: "Retrouve tout", text: "Recherche et pages épinglées." },
    ],
    faq: [
      { q: "All In remplace-t-il Notion ?", a: "Pour des notes personnelles ou à deux, oui. Ce n'est pas un outil de gestion d'équipe en entreprise." },
      { q: "Les notes sont-elles enregistrées automatiquement ?", a: "Oui, quelques instants après chaque modification, avec un indicateur d'enregistrement." },
      { q: "Peut-on partager ses notes ?", a: "Les notes sont partagées avec les personnes de ton foyer." },
    ],
    guides: ["prendre-des-notes-structurees", "remplacer-notion-excel-jow"],
  },
];

export interface FeatureCategory {
  key: CategoryKey;
  /** Adresse de la page de la catégorie. */
  href: string;
  /** Libellé court dans le menu. */
  label: string;
  name: string;
  icon: string;
  tagline: string;
  description: string;
  gradient: string;
  soft: string;
  tone: "violet" | "emerald" | "amber" | "sky" | "rose";
  emojis: string[];
  /** Pages de la catégorie, dans l'ordre d'affichage. */
  features: string[];
}

export const CATEGORIES: FeatureCategory[] = [
  {
    key: "organisation",
    href: "/organisation",
    label: "Agenda",
    name: "Agenda & organisation",
    icon: "📅",
    tagline: "Ton temps, tes tâches et tes idées au même endroit.",
    description: "Un agenda horaire où tâches, routines et rentrées d'argent vivent ensemble, des tâches avec projets et notes, et des notes en pages façon Notion.",
    gradient: "from-brand-500 to-violet-700",
    soft: "bg-brand-50 text-brand-700",
    tone: "violet",
    emojis: ["📅", "✅", "📝", "🔁"],
    features: ["agenda", "taches-et-routines", "notes"],
  },
  {
    key: "repas",
    href: "/repas",
    label: "Repas",
    name: "Repas & courses",
    icon: "🍽️",
    tagline: "Du menu de la semaine au caddie, sans rien ressaisir.",
    description: "Une liste de courses aux bonnes quantités, arrondies aux formats vendus, et des recettes avec le menu de la semaine pour le bon nombre de personnes.",
    gradient: "from-amber-500 to-orange-700",
    soft: "bg-amber-50 text-amber-700",
    tone: "amber",
    emojis: ["🍅", "🥕", "🛒", "🧀"],
    features: ["liste-de-courses", "recettes-et-menu-de-la-semaine"],
  },
  {
    key: "finances",
    href: "/finances",
    label: "Finances",
    name: "Finances",
    icon: "💶",
    tagline: "Ton argent dans un calendrier, du salaire au dernier paiement.",
    description: "Un calendrier financier avec reste à vivre, des paiements par carte ajoutés automatiquement et, bientôt, la connexion directe à ton compte bancaire.",
    gradient: "from-fuchsia-500 to-brand-700",
    soft: "bg-fuchsia-50 text-fuchsia-700",
    tone: "sky",
    emojis: ["💶", "📈", "💳", "🏦"],
    features: ["budget-et-finances", "paiements-automatiques", "analyse-bancaire"],
  },
];

export const getCategory = (key: string) => CATEGORIES.find((c) => c.key === key);
export const categoryOf = (f: Feature) => CATEGORIES.find((c) => c.key === f.category)!;
export const featuresOf = (c: FeatureCategory) => c.features.map((s) => FEATURES.find((f) => f.slug === s)).filter((f): f is Feature => !!f);

export const getFeature = (slug: string) => FEATURES.find((f) => f.slug === slug);
