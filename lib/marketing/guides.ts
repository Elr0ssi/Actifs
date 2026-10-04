export interface GuideSection {
  h2: string;
  paragraphs: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  /** Balise <title> : la requête principale d'abord. */
  title: string;
  h1: string;
  description: string;
  category: "Budget" | "Courses & repas" | "Organisation";
  minutes: number;
  published: string;
  intro: string;
  sections: GuideSection[];
  faq: { q: string; a: string }[];
  tool?: { href: string; label: string; text: string };
  related: string[];
}

export const GUIDES: Guide[] = [
  {
    slug: "faire-un-budget-mensuel",
    title: "Comment faire un budget mensuel simple et qui tient (méthode + modèle)",
    h1: "Comment faire un budget mensuel simple, qui tient dans la durée",
    description: "Une méthode en 5 étapes pour faire son budget mensuel : revenus, charges fixes, dépenses variables, épargne. Avec la règle 50/30/20 et un outil gratuit sans compte.",
    category: "Budget",
    minutes: 6,
    published: "2026-10-04",
    intro: "Faire un budget mensuel, ce n'est pas se priver : c'est savoir à l'avance où va chaque euro pour ne plus avoir de mauvaise surprise en fin de mois. Voici une méthode en cinq étapes, utilisable avec un simple tableur ou avec l'outil gratuit d'All In.",
    sections: [
      {
        h2: "Étape 1 : poser ce qui rentre, pour de vrai",
        paragraphs: [
          "Commence par tes revenus nets mensuels, c'est-à-dire ce qui arrive réellement sur ton compte : salaire net après impôt à la source, allocations, pensions, revenus d'une activité à côté. Si tes revenus varient (freelance, intérim, primes), prends la moyenne des trois à six derniers mois, ou le mois le plus bas pour rester prudent.",
          "Note aussi la date à laquelle chaque revenu tombe. Elle compte autant que le montant : un salaire versé le 28 ne paie pas un loyer prélevé le 5 si tu n'as pas de marge. C'est exactement ce que montre une vue calendrier de tes finances.",
        ],
      },
      {
        h2: "Étape 2 : lister les charges fixes",
        paragraphs: [
          "Les charges fixes sont les dépenses qui reviennent chaque mois pour un montant à peu près identique. Ce sont elles qui réduisent ta marge de manœuvre avant même que le mois commence.",
        ],
        list: ["Loyer ou crédit immobilier, charges de copropriété", "Électricité, gaz, eau, internet, forfait mobile", "Assurances (habitation, auto, mutuelle)", "Abonnements : streaming, salle de sport, cloud, applications", "Transports : pass Navigo, essence, parking", "Remboursements de crédits en cours"],
      },
      {
        h2: "Étape 3 : estimer les dépenses variables",
        paragraphs: [
          "Courses, restaurants, sorties, vêtements, loisirs : ces dépenses changent chaque mois. Plutôt que de deviner, regarde tes trois derniers relevés bancaires et fais une moyenne par catégorie. Si tu n'as jamais suivi, fixe-toi une enveloppe par catégorie et ajuste après un mois.",
          "Les courses sont souvent le poste variable le plus important. Planifier ses repas de la semaine et partir avec une liste précise réduit à la fois le gaspillage et la facture (voir notre guide sur la planification des repas).",
        ],
      },
      {
        h2: "Étape 4 : décider de l'épargne avant de dépenser",
        paragraphs: [
          "Une règle très répandue est le 50/30/20 : environ 50 % du revenu net pour les besoins (logement, factures, courses de base), 30 % pour les envies (sorties, loisirs) et 20 % pour l'épargne ou le remboursement de dettes. C'est un repère, pas une obligation : en région parisienne, le logement dépasse souvent à lui seul 40 %.",
          "L'astuce la plus efficace est de programmer un virement automatique vers ton épargne dès que le salaire arrive. Ce qui reste est ton vrai budget du mois.",
        ],
      },
      {
        h2: "Étape 5 : suivre, comparer, ajuster",
        paragraphs: [
          "Un budget qu'on ne regarde plus devient vite faux. Une fois par semaine, compare ce qui était prévu et ce qui s'est passé. L'important est de repérer les écarts récurrents : si tu dépasses chaque mois de 80 € en sorties, relève l'enveloppe ou change l'habitude, mais ne te mens pas.",
          "Dans All In, tes opérations récurrentes (salaire, loyer, abonnements) sont placées dans un calendrier, et tes paiements par carte peuvent s'y ajouter automatiquement : tu vois en temps réel ce qu'il te reste avant la prochaine rentrée d'argent.",
        ],
      },
    ],
    faq: [
      { q: "Quelle est la meilleure méthode pour faire un budget ?", a: "La plus simple qui tienne dans la durée : lister revenus et charges fixes, fixer des enveloppes pour les dépenses variables, épargner en premier. La règle 50/30/20 donne un bon point de départ." },
      { q: "À quelle fréquence faut-il revoir son budget ?", a: "Un point rapide chaque semaine et un bilan chaque fin de mois suffisent pour corriger les écarts avant qu'ils ne s'accumulent." },
      { q: "Faut-il un budget différent si les revenus varient ?", a: "Oui : base-toi sur le revenu le plus bas des derniers mois pour tes charges fixes, et mets l'excédent de côté pour lisser les mois creux." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Calculateur de budget mensuel", text: "Saisis tes revenus et tes charges : l'outil calcule ton reste à vivre et compare ta répartition à la règle 50/30/20, sans compte." },
    related: ["calculer-son-reste-a-vivre", "gerer-son-budget-en-couple", "planifier-ses-repas-de-la-semaine"],
  },
  {
    slug: "calculer-son-reste-a-vivre",
    title: "Reste à vivre : définition, calcul et exemple (+ calculateur gratuit)",
    h1: "Calculer son reste à vivre : formule, exemple et conseils",
    description: "Le reste à vivre, c'est ce qu'il vous reste après vos charges fixes. Formule, exemple chiffré, seuils repères et calculateur gratuit sans inscription.",
    category: "Budget",
    minutes: 5,
    published: "2026-10-04",
    intro: "Le reste à vivre est l'indicateur le plus parlant d'un budget : c'est la somme dont tu disposes réellement, chaque mois, pour manger, te déplacer, sortir et épargner une fois les charges incompressibles payées.",
    sections: [
      {
        h2: "La formule du reste à vivre",
        paragraphs: [
          "Reste à vivre = revenus nets mensuels − charges fixes (et crédits). Les charges fixes comprennent le loyer, l'énergie, internet et téléphone, les assurances, les abonnements et les mensualités de crédit. Les dépenses du quotidien (alimentation, loisirs) ne sont pas retirées : elles sont payées avec le reste à vivre.",
          "Pour savoir ce que tu peux dépenser par jour, divise ensuite le reste à vivre par le nombre de jours jusqu'à la prochaine rentrée d'argent. C'est plus utile qu'un montant mensuel, car il tient compte de la date réelle de ton salaire.",
        ],
      },
      {
        h2: "Un exemple chiffré",
        paragraphs: [
          "Imaginons 2 100 € de revenus nets, 720 € de loyer, 120 € d'énergie et d'internet, 80 € d'assurances, 60 € d'abonnements et 150 € de transport : 1 130 € de charges fixes. Le reste à vivre est de 970 €, soit environ 32 € par jour sur un mois de 30 jours.",
          "Si tu veux épargner 200 € par mois, ton reste à vivre disponible pour les dépenses est de 770 €, soit un peu plus de 25 € par jour pour les courses, les sorties et les imprévus.",
        ],
      },
      {
        h2: "Quel reste à vivre est « confortable » ?",
        paragraphs: [
          "Il n'y a pas de seuil universel : cela dépend de la taille du foyer et du coût de la vie dans ta région. Les banques regardent surtout le taux d'effort (part des charges de logement dans les revenus), souvent autour de 33 %. Pour ton propre budget, retiens plutôt ceci :",
        ],
        list: ["Un reste à vivre négatif signifie que les charges fixes dépassent les revenus : il faut agir sur le poste le plus lourd.", "Entre 0 et environ 10 € par jour et par personne, la marge est très serrée.", "Au-delà, tu peux répartir entre épargne, courses et plaisir selon tes priorités."],
      },
      {
        h2: "Comment l'augmenter sans se priver",
        paragraphs: [
          "Renégocier ou comparer les contrats récurrents (énergie, assurance, forfait) est souvent le levier le plus rentable car il ne change rien à ton quotidien. Fais ensuite le tri des abonnements inutilisés. Enfin, planifier les courses et les repas de la semaine fait baisser le poste alimentation sans effort de volonté.",
          "Dans All In, le reste à vivre est calculé automatiquement jusqu'à ta prochaine rentrée d'argent, en tenant compte de chaque opération prévue entre-temps et des paiements déjà faits par carte.",
        ],
      },
    ],
    faq: [
      { q: "Le reste à vivre inclut-il les courses ?", a: "Non : les courses font partie des dépenses du quotidien payées avec le reste à vivre. On ne retire que les charges fixes et les crédits." },
      { q: "Comment calculer son reste à vivre par jour ?", a: "Divise le reste à vivre par le nombre de jours jusqu'à ta prochaine rentrée d'argent." },
      { q: "Quelle différence avec le reste pour vivre des banques ?", a: "Les banques utilisent un calcul normalisé pour évaluer un prêt. Le reste à vivre personnel sert à piloter ton quotidien et peut inclure tes propres charges réelles." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Calculer mon reste à vivre", text: "Renseigne tes revenus et charges, le calculateur te donne le reste à vivre mensuel et par jour." },
    related: ["faire-un-budget-mensuel", "gerer-son-budget-en-couple"],
  },
  {
    slug: "planifier-ses-repas-de-la-semaine",
    title: "Planifier ses repas de la semaine : méthode simple + liste de courses",
    h1: "Planifier ses repas de la semaine en 15 minutes",
    description: "Comment planifier ses menus de la semaine, éviter le gaspillage et gagner du temps : méthode en 4 étapes, conseils anti-gaspi et générateur de liste de courses gratuit.",
    category: "Courses & repas",
    minutes: 6,
    published: "2026-10-04",
    intro: "Savoir le dimanche ce que l'on mangera toute la semaine change beaucoup de choses : moins de « qu'est-ce qu'on mange ce soir ? », moins de commandes de dernière minute, moins de gaspillage et un budget courses maîtrisé.",
    sections: [
      {
        h2: "1. Partir de ce que tu as déjà",
        paragraphs: [
          "Avant de choisir des recettes, ouvre le frigo et les placards. Note les produits à consommer en priorité (légumes fatigués, restes, produits proches de la date limite) et construis tes premiers repas autour d'eux. C'est le geste le plus efficace contre le gaspillage alimentaire.",
        ],
      },
      {
        h2: "2. Choisir 4 à 6 repas, pas 7",
        paragraphs: [
          "Inutile de planifier chaque dîner : prévois des repas pour quatre à six soirs et garde un ou deux jours libres pour les restes, les invitations ou l'envie du moment. Varie les types de plats (une recette de pâtes, un plat de légumes, une protéine) et pense à cuisiner double une fois pour avoir un déjeuner prêt le lendemain.",
        ],
        list: ["Équilibre : un féculent, un légume, une protéine par repas", "Rapidité : une recette de moins de 20 minutes pour les soirs chargés", "Réutilisation : des ingrédients communs à plusieurs recettes (oignons, tomates, riz)"],
      },
      {
        h2: "3. Adapter les quantités au nombre de personnes",
        paragraphs: [
          "Une recette écrite pour quatre personnes ne convient ni à un couple ni à un foyer de cinq. Recalcule les quantités avant de faire la liste : 320 g de pâtes pour quatre deviennent 160 g pour deux. Dans All In, tu choisis le nombre de personnes pour chaque repas et les quantités se mettent à jour toutes seules.",
          "Pense aussi aux formats vendus : on n'achète pas 300 g d'oignons mais un filet de 1 kg. Arrondir au conditionnement réel évite de se retrouver à court en caisse… ou avec trois kilos de trop.",
        ],
      },
      {
        h2: "4. Faire une liste de courses classée",
        paragraphs: [
          "Regroupe les ingrédients de tous les repas, additionne les quantités identiques et retire ce que tu as déjà. Classe la liste par rayon (fruits et légumes, frais, épicerie, surgelés) pour ne faire qu'un seul passage en magasin. Une liste précise réduit les achats d'impulsion, souvent la plus grosse source de dépassement.",
        ],
      },
      {
        h2: "Garder le rythme sur la durée",
        paragraphs: [
          "Garde un petit stock de recettes qui marchent et réutilise-les : planifier devient alors une question de deux minutes. Note aussi ce que tu as vraiment cuisiné pour ajuster la semaine suivante. Les recettes favorites et le menu de la semaine d'All In servent exactement à cela.",
        ],
      },
    ],
    faq: [
      { q: "Combien de temps faut-il pour planifier ses repas ?", a: "Une fois l'habitude prise, 10 à 15 minutes par semaine suffisent, surtout avec des recettes favorites que l'on réutilise." },
      { q: "Comment éviter le gaspillage en planifiant ses menus ?", a: "En partant de ce que l'on a déjà, en choisissant des recettes qui partagent des ingrédients et en ne prévoyant pas tous les dîners de la semaine." },
      { q: "Combien peut-on économiser sur les courses ?", a: "Cela dépend des foyers, mais planifier et partir avec une liste précise réduit nettement les achats impulsifs et les produits jetés." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Générateur de liste de courses", text: "Choisis des recettes et un nombre de personnes : la liste de courses est calculée, fusionnée et arrondie aux formats vendus." },
    related: ["faire-sa-liste-de-courses-sans-gaspillage", "faire-un-budget-mensuel"],
  },
  {
    slug: "faire-sa-liste-de-courses-sans-gaspillage",
    title: "Liste de courses efficace : 7 astuces pour moins dépenser et moins gaspiller",
    h1: "Faire sa liste de courses : 7 astuces pour dépenser moins et gaspiller moins",
    description: "Comment faire une liste de courses efficace : classement par rayon, quantités réelles, formats vendus, liste partagée à deux. Conseils concrets et outil gratuit.",
    category: "Courses & repas",
    minutes: 5,
    published: "2026-10-04",
    intro: "Une bonne liste de courses fait gagner du temps en magasin et de l'argent à la caisse. Voici sept habitudes simples pour que la tienne soit vraiment utile, que tu fasses tes courses seul ou à deux.",
    sections: [
      {
        h2: "Les 7 habitudes d'une bonne liste",
        paragraphs: ["Ces conseils valent pour une liste sur papier comme pour une application, mais certains sont bien plus faciles à appliquer avec un outil qui calcule à ta place."],
        list: [
          "Pars des repas prévus : une liste construite à partir de recettes évite les achats « au cas où ».",
          "Additionne les quantités identiques : trois recettes avec des oignons donnent une seule ligne « oignons ».",
          "Mets les vraies quantités : 400 g de tomates concassées valent mieux que « tomates ».",
          "Arrondis aux formats vendus : paquet de 500 g de pâtes, filet de 1 kg d'oignons, boîte de 400 g de tomates.",
          "Classe par rayon pour un seul passage dans le magasin.",
          "Retire ce que tu as déjà avant de partir, pas en rayon.",
          "Partage la liste avec la personne qui fait aussi les courses pour ne rien acheter en double.",
        ],
      },
      {
        h2: "Pourquoi les quantités changent tout",
        paragraphs: [
          "Une liste sans quantité oblige à décider en rayon, là où l'impulsion est la plus forte. Avec les quantités, tu sais exactement combien acheter et tu peux estimer le total avant de partir. Si tu connais le prix de référence de tes produits chez ton enseigne, tu peux même comparer plusieurs magasins : c'est ce que fait All In pour chaque liste.",
        ],
      },
      {
        h2: "Faire les courses à deux sans doublons",
        paragraphs: [
          "Une liste partagée se met à jour en direct : quand l'un coche un article, l'autre le voit disparaître. Cela évite le classique « on a déjà un pot de moutarde » et permet de se répartir les magasins. Les produits non cochés restent dans la liste pour la prochaine fois.",
        ],
      },
      {
        h2: "Garder un historique utile",
        paragraphs: [
          "Les produits que tu rachètes à chaque fois (lait, café, lessive) peuvent être proposés automatiquement dans ta prochaine liste. Tu gagnes quelques minutes et tu n'oublies plus l'essentiel.",
        ],
      },
    ],
    faq: [
      { q: "Comment organiser sa liste de courses ?", a: "Par rayon, avec des quantités précises, construite à partir des repas de la semaine et en retirant ce que l'on a déjà." },
      { q: "Faut-il une application pour faire sa liste de courses ?", a: "Ce n'est pas obligatoire, mais une application additionne les quantités, arrondit aux formats vendus et partage la liste en direct, ce qui est long à faire à la main." },
      { q: "Comment éviter les achats impulsifs ?", a: "Partir avec une liste précise, ne pas faire les courses le ventre vide et s'en tenir à la liste préparée à partir des repas prévus." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Liste de courses depuis des recettes", text: "Sélectionne tes recettes, All In calcule la liste fusionnée avec les quantités à acheter." },
    related: ["planifier-ses-repas-de-la-semaine", "faire-un-budget-mensuel"],
  },
  {
    slug: "creer-une-routine-quotidienne-qui-tient",
    title: "Créer une routine quotidienne qui tient : méthode et suivi d'habitudes",
    h1: "Créer une routine quotidienne qui tient (sans s'épuiser)",
    description: "Comment installer une routine quotidienne ou hebdomadaire durablement : commencer petit, lier l'habitude à un moment, suivre sa régularité. Habit tracker gratuit.",
    category: "Organisation",
    minutes: 5,
    published: "2026-10-04",
    intro: "Le sport trois fois par semaine, dix minutes de lecture, un rituel du soir : beaucoup de bonnes résolutions s'arrêtent au bout de dix jours. Ce qui fait la différence n'est pas la motivation, c'est la façon de structurer l'habitude et de la suivre.",
    sections: [
      {
        h2: "Commencer trop petit pour échouer",
        paragraphs: [
          "Une habitude durable est d'abord une habitude facile. Plutôt que « une heure de sport tous les jours », vise « mettre mes chaussures et sortir dix minutes ». Une fois le geste installé, tu pourras l'allonger. L'objectif des premières semaines est la régularité, pas la performance.",
        ],
      },
      {
        h2: "Accrocher l'habitude à un moment précis",
        paragraphs: [
          "Relie ta nouvelle routine à quelque chose qui existe déjà : « après le café du matin, je lis dix pages », « en rentrant du travail, je fais ma séance ». Le déclencheur évite d'avoir à décider chaque jour si c'est le bon moment.",
        ],
      },
      {
        h2: "Quotidienne ou hebdomadaire ?",
        paragraphs: [
          "Toutes les habitudes n'ont pas besoin d'être quotidiennes. Une séance de sport trois fois par semaine ou une revue de budget le dimanche sont des routines hebdomadaires. Choisis les jours qui s'accordent avec ton emploi du temps réel, pas avec celui que tu aimerais avoir.",
        ],
        list: ["Habitudes quotidiennes : hydratation, lecture, méditation, rangement de 10 minutes", "Habitudes hebdomadaires : sport, planification des repas, revue du budget, appel à un proche"],
      },
      {
        h2: "Suivre pour garder la motivation",
        paragraphs: [
          "Voir une série de jours cochés est un puissant moteur. Suis le pourcentage de réussite par semaine plutôt que la perfection : un jour manqué ne casse pas la routine, deux jours de suite oui. Dans All In, les routines apparaissent dans ton agenda à côté de tes tâches et une courbe te montre ta régularité par semaine, par mois et par année.",
        ],
      },
    ],
    faq: [
      { q: "Combien de temps faut-il pour créer une habitude ?", a: "Cela varie selon les personnes et les habitudes : plusieurs semaines sont généralement nécessaires. Mieux vaut viser la régularité que la durée exacte." },
      { q: "Que faire quand on rate un jour ?", a: "Reprendre dès le lendemain sans culpabiliser : c'est la répétition sur la durée qui compte, pas la perfection." },
      { q: "Comment suivre ses habitudes ?", a: "Avec un tableau de suivi simple (jours cochés par habitude) ou une application qui calcule le pourcentage de réussite et les séries." },
    ],
    tool: { href: "/outils/suivi-habitudes", label: "Suivi d'habitudes gratuit", text: "Ajoute tes habitudes, coche chaque jour et vois ta régularité de la semaine, directement dans ton navigateur." },
    related: ["remplacer-notion-excel-jow", "faire-un-budget-mensuel"],
  },
  {
    slug: "remplacer-notion-excel-jow",
    title: "Remplacer Notion, Excel, Jow et Google Agenda par une seule application",
    h1: "Notion, Excel, Jow, Google Agenda : et si une seule application suffisait ?",
    description: "Tâches dans Notion, budget dans Excel, repas dans Jow, agenda dans Google : comment tout regrouper dans un seul espace pour gagner du temps. Comparatif des usages.",
    category: "Organisation",
    minutes: 6,
    published: "2026-10-04",
    intro: "Beaucoup de personnes organisent leur vie avec quatre ou cinq outils : un espace de notes pour les projets, un tableur pour le budget, une application de recettes, un agenda et une application de listes. Chacun est bon à sa place, mais l'information est dispersée et rien ne se parle.",
    sections: [
      {
        h2: "Le coût caché de la dispersion",
        paragraphs: [
          "Quand le repas de jeudi est dans une application, la liste de courses dans une autre et le budget dans un tableur, tu fais le lien toi-même : copier les ingrédients, recalculer les quantités, reporter la dépense. Cette charge mentale est invisible mais constante, et c'est elle qui fait abandonner les outils au bout de quelques semaines.",
        ],
      },
      {
        h2: "Ce qu'on cherche vraiment dans chaque outil",
        paragraphs: ["Pour savoir ce qu'il faut regrouper, regarde ce que tu utilises concrètement dans chacun :"],
        list: [
          "Notion (ou équivalent) : des pages de notes organisées, des tâches, des listes liées entre elles.",
          "Excel ou Google Sheets : un budget avec des opérations récurrentes et des soldes à jour.",
          "Jow ou une application de recettes : des idées de repas, des quantités ajustées au nombre de personnes, une liste de courses.",
          "Google Agenda : des rendez-vous placés dans le temps, avec une vue jour, semaine et mois.",
        ],
      },
      {
        h2: "Un seul espace : tâches, agenda, repas, budget, notes",
        paragraphs: [
          "All In regroupe ces usages : un agenda façon calendrier où tes tâches et tes routines sont placées sur une grille horaire ; des recettes qui génèrent des listes de courses aux bonnes quantités ; un budget avec calendrier financier et reste à vivre ; des notes en pages et sous-pages avec blocs, comme dans un outil de prise de notes moderne.",
          "L'intérêt tient dans les liens : le menu de la semaine alimente la liste de courses, les courses réalisées pèsent sur le budget, et ton agenda montre tâches, routines et rentrées d'argent au même endroit.",
        ],
      },
      {
        h2: "Garder ton agenda Google ou iPhone",
        paragraphs: [
          "Tu n'as pas à abandonner ton agenda actuel : All In fournit un flux de calendrier que tu peux ajouter à Google Agenda ou au Calendrier de ton iPhone pour y voir tes tâches et tes routines.",
        ],
      },
      {
        h2: "Comment migrer sans tout refaire",
        paragraphs: [
          "Commence par un seul usage, celui qui te coûte le plus de temps (souvent les courses ou le budget), puis ajoute les autres progressivement. Garde tes anciens outils en lecture seule quelques semaines, le temps de vérifier que tu ne perds rien.",
        ],
      },
    ],
    faq: [
      { q: "All In remplace-t-il Notion ?", a: "Pour la prise de notes en pages et sous-pages avec blocs, les tâches et les listes, oui pour un usage personnel ou à deux. Ce n'est pas un outil de gestion d'équipe en entreprise." },
      { q: "Puis-je importer mon budget Excel ?", a: "Tu peux ressaisir tes opérations récurrentes (salaire, loyer, abonnements) en quelques minutes : elles se répètent ensuite automatiquement dans le calendrier financier." },
      { q: "Mes tâches apparaissent-elles dans Google Agenda ?", a: "Oui, en ajoutant le flux de calendrier All In à Google Agenda ou à l'application Calendrier de l'iPhone (lecture seule)." },
    ],
    tool: { href: "/signup", label: "Créer mon espace", text: "Essaie All In : l'inscription est rapide et tu peux commencer par un seul usage." },
    related: ["planifier-ses-repas-de-la-semaine", "creer-une-routine-quotidienne-qui-tient", "faire-un-budget-mensuel"],
  },
  {
    slug: "gerer-son-budget-en-couple",
    title: "Gérer son budget en couple : 3 méthodes + comment s'organiser à deux",
    h1: "Gérer son budget en couple : trois méthodes et comment s'organiser",
    description: "Compte joint, répartition proportionnelle ou comptes séparés : comment gérer son argent en couple sans conflit. Méthodes, organisation et outil de budget partagé.",
    category: "Budget",
    minutes: 6,
    published: "2026-10-04",
    intro: "L'argent est une source classique de tension dans un couple, souvent parce que les règles ne sont pas posées. Il n'existe pas de méthode universelle, mais trois grandes approches fonctionnent selon les situations. L'essentiel est de choisir ensemble et de garder une vue commune.",
    sections: [
      {
        h2: "Méthode 1 : tout en commun",
        paragraphs: [
          "Tous les revenus arrivent sur un compte joint, qui paie l'ensemble des dépenses. C'est simple et transparent, et cela convient bien quand les revenus sont proches et que la confiance est établie. Prévoir une petite enveloppe personnelle pour chacun évite que les achats individuels deviennent un sujet.",
        ],
      },
      {
        h2: "Méthode 2 : une contribution proportionnelle aux revenus",
        paragraphs: [
          "Chacun garde son compte et verse sur un compte commun une part proportionnelle à son revenu pour les dépenses du foyer. Si l'un gagne 2 000 € et l'autre 1 000 €, ils financent le foyer à hauteur de deux tiers et un tiers. C'est souvent perçu comme équitable quand les revenus sont inégaux.",
        ],
      },
      {
        h2: "Méthode 3 : comptes séparés, dépenses réparties",
        paragraphs: [
          "Chacun prend en charge des postes précis : l'un le loyer, l'autre les courses et les factures, par exemple. Cette méthode garde l'indépendance de chacun mais demande de bien suivre qui paie quoi, sinon des écarts s'installent sans que personne ne s'en rende compte.",
        ],
      },
      {
        h2: "Peu importe la méthode : avoir la même vue",
        paragraphs: [
          "Dans tous les cas, ce qui apaise est de regarder les mêmes chiffres : revenus, charges fixes, reste à vivre, objectifs d'épargne. Un budget partagé permet de décider à deux d'une dépense importante en sachant ce qu'elle change pour le reste du mois.",
          "Dans All In, vous partagez le même espace : listes de courses, menu de la semaine, calendrier, tâches et budget sont communs à votre foyer, avec le même solde et le même reste à vivre.",
        ],
        list: ["Fixez ensemble une date par mois pour faire le point (15 minutes suffisent)", "Définissez un seuil au-delà duquel on se prévient avant un achat", "Gardez un objectif d'épargne commun, visible et chiffré"],
      },
    ],
    faq: [
      { q: "Faut-il un compte joint pour gérer son budget en couple ?", a: "Ce n'est pas obligatoire. Un compte joint simplifie les dépenses communes, mais on peut aussi garder des comptes séparés avec une contribution régulière à un compte commun." },
      { q: "Comment répartir les dépenses quand les revenus sont inégaux ?", a: "La répartition proportionnelle aux revenus est la plus courante : chacun contribue selon sa part du revenu total du foyer." },
      { q: "À quelle fréquence faire le point à deux ?", a: "Une fois par mois suffit en général, avec un échange rapide en cas de grosse dépense." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Simuler le budget du foyer", text: "Additionne vos revenus et vos charges pour voir votre reste à vivre commun." },
    related: ["faire-un-budget-mensuel", "calculer-son-reste-a-vivre"],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
