import type { Guide } from "@/lib/marketing/guides";

const D = "2026-10-04";

/** Articles de blog complémentaires, organisés par section du produit pour couvrir un maximum de requêtes. */
export const MORE_GUIDES: Guide[] = [
  {
    slug: "epargne-de-precaution",
    title: "Épargne de précaution : combien mettre de côté et comment s'y prendre",
    h1: "Épargne de précaution : combien mettre de côté, et comment commencer",
    description: "Pourquoi avoir une épargne de précaution, combien viser (3 à 6 mois de dépenses) et comment la construire pas à pas avec un virement automatique.",
    category: "Budget",
    minutes: 5,
    published: D,
    intro: "L'épargne de précaution est la réserve qui évite de s'endetter quand un imprévu arrive : panne de voiture, facture de dentiste, perte de revenus. Elle ne sert pas à investir ni à faire un voyage, seulement à encaisser un choc sans stress.",
    sections: [
      {
        h2: "Combien viser ?",
        paragraphs: [
          "Le repère le plus courant est de couvrir trois à six mois de dépenses courantes. Pour le calculer, additionne tes charges fixes et tes dépenses variables essentielles (logement, alimentation, transport, assurances), pas ton salaire. Si tu es indépendant, en CDD ou que tes revenus varient, vise plutôt le haut de la fourchette.",
          "Un premier palier réaliste est un mois de dépenses. Il suffit déjà à absorber la plupart des petits imprévus et rend le palier suivant beaucoup moins abstrait.",
        ],
      },
      {
        h2: "Construire la réserve sans y penser",
        paragraphs: [
          "La méthode qui fonctionne le mieux est le virement automatique le jour de la paie : l'épargne part avant que tu puisses la dépenser. Même 50 € par mois créent l'habitude, que tu augmenteras quand une charge disparaît (fin d'un crédit, d'un abonnement).",
        ],
        list: ["Calcule ton montant cible (dépenses essentielles × nombre de mois)", "Choisis un placement disponible à tout moment", "Programme un virement le jour du salaire", "Augmente le montant à chaque baisse de charge", "Ne touche à cette réserve que pour un vrai imprévu"],
      },
      {
        h2: "Suivre sa progression",
        paragraphs: [
          "Voir la jauge se remplir motive. Dans un budget par mois, traite l'épargne comme une dépense obligatoire et non comme ce qui reste en fin de mois : c'est ce changement de place dans le calcul qui fait toute la différence.",
        ],
      },
    ],
    faq: [
      { q: "Combien de mois de dépenses faut-il épargner ?", a: "Trois à six mois de dépenses courantes est le repère le plus répandu. Commencer par un mois est un bon premier objectif." },
      { q: "Où placer son épargne de précaution ?", a: "Sur un support disponible à tout moment et sans risque de perte en capital. Compare les offres de ta banque et les plafonds avant de choisir." },
      { q: "Faut-il épargner avant de rembourser ses dettes ?", a: "Une petite réserve d'abord, pour ne pas se rendetter au premier imprévu, puis un effort plus important sur les dettes à taux élevé." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Calculer mon budget", text: "Pose tes revenus et tes charges pour voir combien tu peux mettre de côté chaque mois." },
    related: ["faire-un-budget-mensuel", "regle-50-30-20", "calculer-son-reste-a-vivre"],
  },
  {
    slug: "regle-50-30-20",
    title: "Règle 50/30/20 : définition, exemple chiffré et limites",
    h1: "La règle 50/30/20 : comment répartir son salaire (avec un exemple)",
    description: "La règle 50/30/20 répartit le revenu net entre besoins, envies et épargne. Exemple chiffré, adaptations pour un loyer élevé et limites de la méthode.",
    category: "Budget",
    minutes: 5,
    published: D,
    intro: "La règle 50/30/20 est une façon simple de répartir son revenu net : 50 % pour les besoins, 30 % pour les envies, 20 % pour l'épargne et le remboursement des dettes. C'est un repère de départ, à adapter à ta situation.",
    sections: [
      {
        h2: "Le principe en trois blocs",
        paragraphs: [
          "Les besoins sont ce que tu ne peux pas supprimer : logement, charges, courses de base, transport pour aller travailler, assurances. Les envies regroupent sorties, restaurants, abonnements de loisirs, vêtements au-delà du nécessaire. Le dernier bloc va à l'épargne et au remboursement accéléré des dettes.",
        ],
      },
      {
        h2: "Exemple avec 2 000 € nets par mois",
        paragraphs: ["Avec 2 000 € nets, la règle donne les ordres de grandeur suivants :"],
        list: ["Besoins : 1 000 € (loyer, factures, courses, transport)", "Envies : 600 € (sorties, loisirs, achats plaisir)", "Épargne et dettes : 400 € (virement automatique à la paie)"],
      },
      {
        h2: "Quand le loyer dépasse 50 %",
        paragraphs: [
          "Dans les grandes villes, le logement seul dépasse souvent 40 % du revenu. Dans ce cas, on peut adapter : 60/20/20, voire 65/15/20. L'important est de garder une part d'épargne non nulle et de savoir ce que tu arbitres.",
          "La règle montre aussi ses limites si tes revenus varient beaucoup : applique-la alors à ton revenu minimal habituel.",
        ],
      },
    ],
    faq: [
      { q: "La règle 50/30/20 s'applique-t-elle au net ou au brut ?", a: "Au revenu net, c'est-à-dire ce qui arrive sur ton compte après prélèvements." },
      { q: "Que faire si je ne peux pas épargner 20 % ?", a: "Commence plus bas, par exemple 5 à 10 %, et augmente progressivement. Le plus important est la régularité." },
      { q: "Les courses sont-elles un besoin ou une envie ?", a: "L'alimentation de base est un besoin. Les restaurants et la livraison relèvent plutôt des envies." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Tester la règle 50/30/20", text: "L'outil gratuit affiche ta répartition réelle face au repère 50/30/20." },
    related: ["faire-un-budget-mensuel", "epargne-de-precaution", "reduire-ses-depenses-mensuelles"],
  },
  {
    slug: "reduire-ses-depenses-mensuelles",
    title: "Réduire ses dépenses mensuelles : 12 leviers concrets sans se priver",
    h1: "Réduire ses dépenses mensuelles : 12 leviers concrets",
    description: "Courses, abonnements, énergie, assurances, banque : 12 leviers pour réduire ses dépenses du mois sans rogner sur ce qui compte, classés par impact.",
    category: "Budget",
    minutes: 6,
    published: D,
    intro: "Réduire ses dépenses commence par regarder où va l'argent, pas par se priver partout. Voici des leviers classés du plus rentable au plus anecdotique : agis d'abord sur les gros postes.",
    sections: [
      {
        h2: "Les gros postes d'abord",
        paragraphs: ["Le logement, les transports et l'alimentation représentent l'essentiel du budget. Un petit effort sur eux pèse plus que dix économies de quelques euros."],
        list: ["Renégocie ou mets en concurrence l'assurance habitation, auto et la mutuelle", "Compare les offres d'énergie, internet et mobile une fois par an", "Planifie tes repas pour réduire la facture des courses et le gaspillage", "Regroupe les trajets ou compare les abonnements de transport"],
      },
      {
        h2: "Les fuites discrètes",
        paragraphs: [
          "Les abonnements oubliés, les frais bancaires et les petits achats répétés sont invisibles au quotidien et massifs sur l'année. Passe un relevé en revue une fois par trimestre et résilie ce que tu n'utilises plus.",
        ],
        list: ["Liste tous tes abonnements et note la date de renouvellement", "Vérifie les frais de tenue de compte et de carte", "Mesure la part de la livraison de repas et des achats impulsifs"],
      },
      {
        h2: "Les habitudes qui changent tout",
        paragraphs: [
          "Attends 48 heures avant un achat non essentiel, fixe-toi une enveloppe par catégorie et regarde ton reste à vivre quotidien. Voir le chiffre « combien je peux dépenser aujourd'hui » change le comportement plus que n'importe quelle résolution.",
        ],
      },
    ],
    faq: [
      { q: "Par quel poste de dépense commencer ?", a: "Par les plus gros : logement, transport, alimentation et assurances. Ce sont eux qui produisent les plus grosses économies." },
      { q: "Comment repérer les abonnements oubliés ?", a: "En relisant trois mois de relevé bancaire et en listant les prélèvements récurrents." },
      { q: "Réduire ses dépenses oblige-t-il à se priver ?", a: "Pas forcément : beaucoup d'économies viennent de la négociation, de la planification et de la suppression de ce qu'on n'utilise pas." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Voir où va mon argent", text: "Liste tes charges et repère les postes les plus lourds." },
    related: ["faire-un-budget-mensuel", "faire-sa-liste-de-courses-sans-gaspillage", "regle-50-30-20"],
  },
  {
    slug: "budget-etudiant",
    title: "Budget étudiant : comment s'organiser avec peu de revenus",
    h1: "Budget étudiant : s'organiser avec un petit budget, mois après mois",
    description: "Méthode simple pour un budget étudiant : recenser aides, jobs et dépenses, fixer des enveloppes, réduire les courses et garder une marge pour les imprévus.",
    category: "Budget",
    minutes: 5,
    published: D,
    intro: "Avec des revenus modestes et irréguliers, chaque euro compte. Un budget étudiant efficace tient en trois idées : connaître ses entrées, protéger les dépenses obligatoires et ajuster les envies à ce qui reste.",
    sections: [
      {
        h2: "Recenser toutes les entrées",
        paragraphs: ["Bourse, aide au logement, aide des parents, job d'été ou temps partiel : note chaque source avec sa date de versement. Les entrées d'un étudiant tombent à des dates variées, et c'est le calendrier qui fait tenir le mois, pas seulement le total."],
      },
      {
        h2: "Protéger l'essentiel",
        paragraphs: ["Loyer, charges, transport, assurance et forfait sont à régler en premier. Programme-les dans ton calendrier financier pour voir les jours où le solde est le plus bas."],
      },
      {
        h2: "Les courses : le poste qui bouge le plus",
        paragraphs: [
          "C'est là que se jouent les plus grosses économies. Planifie cinq repas à l'avance, cuisine en plus grosse quantité et partage les courses en colocation. Une liste précise, avec les quantités nécessaires, évite l'achat en double.",
        ],
        list: ["Choisis des recettes économiques et de saison", "Compare deux enseignes sur ta liste habituelle", "Congèle les portions en trop"],
      },
      {
        h2: "Garder une marge",
        paragraphs: ["Garde une petite enveloppe pour les imprévus (matériel, santé, transport) et note ton reste à vivre jusqu'à la prochaine entrée d'argent : c'est le chiffre qui t'empêche de finir le mois à découvert."],
      },
    ],
    faq: [
      { q: "Comment faire un budget avec des revenus irréguliers ?", a: "Base-toi sur le revenu minimal habituel et traite tout ce qui dépasse comme un bonus pour l'épargne." },
      { q: "Quel budget courses pour un étudiant ?", a: "Il dépend de la ville et des habitudes. Mieux vaut le mesurer sur un mois puis fixer une enveloppe hebdomadaire." },
      { q: "Peut-on épargner avec un petit budget ?", a: "Oui, même quelques euros par mois installent l'habitude et constituent un premier coussin." },
    ],
    tool: { href: "/outils/budget-mensuel", label: "Faire mon budget étudiant", text: "Revenus, charges et reste à vivre, sans créer de compte." },
    related: ["faire-un-budget-mensuel", "idees-repas-pas-chers", "calculer-son-reste-a-vivre"],
  },
  {
    slug: "suivre-ses-depenses-automatiquement",
    title: "Suivre ses dépenses sans prise de tête : méthodes manuelles et automatiques",
    h1: "Suivre ses dépenses sans prise de tête : manuel, tableur ou automatique",
    description: "Comment suivre ses dépenses au quotidien : saisie manuelle, relevé bancaire, tableur ou enregistrement automatique des paiements par carte avec un raccourci iPhone.",
    category: "Budget",
    minutes: 6,
    published: D,
    intro: "Le suivi des dépenses échoue rarement par manque de volonté : il échoue parce qu'il demande trop d'efforts. La bonne méthode est celle que tu feras encore dans trois mois.",
    sections: [
      {
        h2: "Option 1 : la revue hebdomadaire",
        paragraphs: ["Dix minutes le dimanche pour passer en revue les dépenses de la semaine, les catégoriser et comparer à l'enveloppe. C'est la méthode la plus légère, suffisante pour la plupart des gens."],
      },
      {
        h2: "Option 2 : le tableur",
        paragraphs: ["Un tableur donne une liberté totale, mais demande de la discipline : saisie, formules, catégories. Il devient vite lourd quand on veut voir les prochaines dates de prélèvements ou de salaires."],
      },
      {
        h2: "Option 3 : l'enregistrement automatique",
        paragraphs: [
          "Sur iPhone, une automatisation de l'app Raccourcis peut envoyer chaque paiement par carte (commerçant, montant) vers ton espace Flozea dès qu'il est effectué. Le solde est ajusté à la date du paiement sans que tu saisisses quoi que ce soit.",
          "Le principe : à chaque paiement, le téléphone envoie une requête avec les informations du paiement, et l'application l'ajoute à tes opérations.",
        ],
      },
      {
        h2: "Quelle que soit la méthode : une catégorie par dépense",
        paragraphs: ["Choisis une dizaine de catégories maximum. Trop de catégories découragent, trop peu masquent les fuites. L'essentiel est de comparer d'un mois sur l'autre."],
      },
    ],
    faq: [
      { q: "Faut-il connecter son compte bancaire pour suivre ses dépenses ?", a: "Non. On peut suivre ses dépenses manuellement ou avec une automatisation de paiement sans partager d'identifiants bancaires." },
      { q: "Combien de catégories de dépenses utiliser ?", a: "Une dizaine suffit : logement, courses, transport, santé, loisirs, abonnements, etc." },
      { q: "À quelle fréquence mettre à jour son suivi ?", a: "Une revue hebdomadaire est un bon compromis entre précision et effort." },
    ],
    tool: { href: "/fonctionnalites/budget-et-finances", label: "Voir la fonctionnalité Budget", text: "Calendrier financier, soldes datés et paiements Apple Pay automatiques." },
    related: ["faire-un-budget-mensuel", "calculer-son-reste-a-vivre", "reduire-ses-depenses-mensuelles"],
  },
  {
    slug: "calendrier-financier-salaire-et-prelevements",
    title: "Calendrier financier : anticiper salaire, loyer et prélèvements du mois",
    h1: "Calendrier financier : voir à l'avance salaire, loyer et prélèvements",
    description: "Pourquoi un calendrier financier évite les découverts : placer revenus et charges à leur date, anticiper le week-end et suivre le solde jour par jour.",
    category: "Budget",
    minutes: 5,
    published: D,
    intro: "Un budget en tableau dit combien tu dépenses ; un calendrier financier dit quand. Et c'est le quand qui provoque les découverts : un loyer prélevé le 3 alors que le salaire arrive le 5.",
    sections: [
      {
        h2: "Pourquoi les dates comptent",
        paragraphs: ["Deux mois peuvent avoir le même total de revenus et de dépenses, mais un solde très différent au milieu du mois. Placer chaque opération à sa date de prélèvement montre les jours où le solde est le plus bas."],
      },
      {
        h2: "Le piège du week-end",
        paragraphs: ["Un salaire qui tombe un samedi ou un dimanche est généralement versé le lundi suivant (ou parfois le vendredi précédent selon l'employeur). Un bon calendrier le gère : on indique la règle une fois, et la date se décale chaque mois."],
      },
      {
        h2: "Récurrences et exceptions",
        paragraphs: ["Les opérations récurrentes (loyer, abonnements, salaire) se répètent seules. Mais il faut pouvoir déplacer une occurrence précise quand un paiement est décalé, sans modifier toutes les autres."],
      },
      {
        h2: "Se caler sur le solde réel",
        paragraphs: ["Pour que les projections restent justes, remets à jour ton solde réel de temps en temps, à une date précise. Le calendrier recalcule alors tout à partir de ce point de référence."],
      },
    ],
    faq: [
      { q: "Qu'est-ce qu'un calendrier financier ?", a: "Un calendrier qui place revenus et dépenses à leur date pour afficher le solde prévu jour par jour." },
      { q: "Que faire quand le salaire tombe un week-end ?", a: "Applique la règle de ton employeur (lundi suivant ou vendredi précédent) et décale la date chaque mois." },
      { q: "Pourquoi mettre à jour son solde réel ?", a: "Pour que les projections repartent d'un chiffre exact et ne dérivent pas." },
    ],
    tool: { href: "/fonctionnalites/budget-et-finances", label: "Voir le calendrier financier", text: "Salaire décalé le week-end, soldes datés, reste à vivre." },
    related: ["calculer-son-reste-a-vivre", "faire-un-budget-mensuel", "gerer-son-budget-en-couple"],
  },
  {
    slug: "batch-cooking-debutant",
    title: "Batch cooking pour débutants : organiser sa semaine en 2 heures",
    h1: "Batch cooking pour débutants : cuisiner pour la semaine en 2 heures",
    description: "Le batch cooking expliqué simplement : choisir ses recettes, ordonner ses 2 heures de cuisine, conserver les plats et éviter les erreurs de débutant.",
    category: "Courses & repas",
    minutes: 6,
    published: D,
    intro: "Le batch cooking consiste à cuisiner en une seule session les bases de plusieurs repas. L'objectif n'est pas de manger la même chose cinq jours, mais de réduire le temps passé en cuisine en semaine.",
    sections: [
      {
        h2: "Choisir 3 à 4 préparations",
        paragraphs: ["Pour débuter, cuisine une céréale (riz, pâtes, quinoa), une protéine (poulet rôti, œufs durs, lentilles), un plat mijoté et des légumes rôtis. Tu combines ensuite ces éléments de plusieurs façons dans la semaine."],
      },
      {
        h2: "Ordonner ta session",
        paragraphs: ["Lance d'abord ce qui est long et passif (four, mijoteuse), puis coupe les légumes pendant la cuisson, et termine par les préparations rapides."],
        list: ["Four : légumes ou volaille", "Plaques : plat mijoté et céréale", "Pendant ce temps : sauces, assaisonnements, salade", "Fin : refroidir avant de ranger"],
      },
      {
        h2: "Conserver en sécurité",
        paragraphs: ["Laisse refroidir rapidement, range en boîtes hermétiques au réfrigérateur et consomme dans les jours qui suivent. Ce qui ne sera pas mangé dans les trois à quatre jours se congèle. Étiquette avec la date."],
      },
      {
        h2: "La liste de courses fait gagner autant de temps",
        paragraphs: ["Le gros du temps gagné se joue avant la cuisine : un menu planifié génère une liste aux bonnes quantités, et tu fais tes courses une seule fois."],
      },
    ],
    faq: [
      { q: "Combien de temps dure une session de batch cooking ?", a: "Deux heures suffisent pour préparer les bases de quatre à cinq repas quand on est organisé." },
      { q: "Combien de temps se conservent les plats préparés ?", a: "Quelques jours au réfrigérateur ; au-delà, la congélation est préférable. Respecte toujours les durées recommandées pour chaque aliment." },
      { q: "Doit-on manger la même chose toute la semaine ?", a: "Non : on prépare des bases qu'on assemble différemment chaque jour." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Générer ma liste de courses", text: "Choisis tes recettes et obtiens la liste aux bonnes quantités." },
    related: ["planifier-ses-repas-de-la-semaine", "faire-sa-liste-de-courses-sans-gaspillage", "idees-repas-pas-chers"],
  },
  {
    slug: "idees-repas-pas-chers",
    title: "Repas pas chers : 15 idées simples pour manger bien avec peu",
    h1: "Repas pas chers : 15 idées simples pour manger bien avec un petit budget",
    description: "Idées de repas économiques et équilibrés, ingrédients à privilégier et astuces pour baisser la facture des courses sans manger toujours des pâtes.",
    category: "Courses & repas",
    minutes: 5,
    published: D,
    intro: "Manger bien et pas cher repose sur quelques ingrédients stratégiques et sur la planification. Voici des repères et des idées qui marchent pour un étudiant, un couple ou une famille.",
    sections: [
      {
        h2: "Les ingrédients rentables",
        paragraphs: ["Les légumineuses (lentilles, pois chiches), les œufs, les pâtes, le riz, les légumes de saison et les surgelés nature offrent beaucoup de nutriments pour peu d'argent."],
      },
      {
        h2: "15 idées de repas",
        paragraphs: ["Des plats simples, bon marché et faciles à décliner :"],
        list: ["Pâtes tomate basilic", "Chili sin carne", "Dahl de lentilles corail", "Omelette aux légumes", "Riz sauté aux légumes et œuf", "Soupe de légumes et croûtons", "Gratin de pommes de terre", "Salade de pois chiches", "Poulet rôti et pommes de terre", "Curry de pois chiches", "Quiche poireaux-lardons", "Pâtes carbonara", "Salade de concombre au yaourt", "Galettes de légumes", "Ratatouille et riz"],
      },
      {
        h2: "Les astuces qui font baisser la note",
        paragraphs: ["Planifie avant d'aller en magasin, compare les prix au kilo, achète en vrac les produits qui se gardent et cuisine en double pour avoir un repas d'avance. Une liste avec les quantités exactes évite d'acheter ce qu'il y a déjà dans le placard."],
      },
    ],
    faq: [
      { q: "Quel est le repas le moins cher ?", a: "Les plats à base de légumineuses, de riz, de pâtes et de légumes de saison sont parmi les plus économiques." },
      { q: "Comment manger équilibré avec peu de budget ?", a: "En variant légumes, féculents et protéines économiques (œufs, légumineuses) et en limitant les produits transformés." },
      { q: "Les surgelés sont-ils intéressants ?", a: "Les légumes surgelés nature sont pratiques, se conservent longtemps et limitent le gaspillage." },
    ],
    tool: { href: "/recettes", label: "Voir les recettes", text: "Des recettes simples avec quantités par personne et prix estimés." },
    related: ["planifier-ses-repas-de-la-semaine", "batch-cooking-debutant", "reduire-le-gaspillage-alimentaire"],
  },
  {
    slug: "reduire-le-gaspillage-alimentaire",
    title: "Réduire le gaspillage alimentaire : 10 gestes simples à la maison",
    h1: "Réduire le gaspillage alimentaire : 10 gestes simples à la maison",
    description: "Planification, liste précise, bon rangement du frigo, restes et congélation : 10 gestes concrets pour jeter moins de nourriture et économiser.",
    category: "Courses & repas",
    minutes: 5,
    published: D,
    intro: "Jeter de la nourriture, c'est jeter de l'argent. La plupart du gaspillage vient de quelques causes simples : on achète trop, on oublie ce qu'on a et on ne sait pas quoi faire des restes.",
    sections: [
      {
        h2: "Acheter juste",
        paragraphs: ["Planifie tes repas, vérifie le placard avant de partir et suis une liste aux quantités précises. Pense aussi au nombre de personnes : une recette pour quatre n'est pas la même chose pour deux."],
      },
      {
        h2: "Bien conserver",
        paragraphs: ["Range les produits qui se périment en premier devant, congèle ce que tu ne mangeras pas à temps et utilise des boîtes transparentes pour voir ce qu'il y a dedans."],
      },
      {
        h2: "Cuisiner les restes",
        paragraphs: ["Un reste de riz devient un riz sauté, des légumes tristes une soupe, du pain rassis du pain perdu ou de la chapelure."],
        list: ["Prévois un repas « fond de frigo » en fin de semaine", "Congèle en portions individuelles", "Note la date sur les plats préparés"],
      },
      {
        h2: "Les formats vendus comptent",
        paragraphs: ["Si une recette demande 300 g d'oignons mais qu'on les vend par 1 kg, mieux vaut prévoir un second plat qui en utilise le reste. Une liste qui arrondit au format vendu évite les mauvaises surprises."],
      },
    ],
    faq: [
      { q: "Quelle est la première cause de gaspillage alimentaire ?", a: "Acheter trop ou ne pas utiliser à temps ce qu'on a acheté. La planification des repas réduit ces deux problèmes." },
      { q: "Peut-on congeler presque tout ?", a: "Beaucoup d'aliments se congèlent, mais pas tous. Vérifie chaque produit avant." },
      { q: "Comment éviter d'acheter en double ?", a: "En regardant ses placards avant les courses et en ayant une liste partagée avec les autres membres du foyer." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Faire une liste précise", text: "Quantités fusionnées et arrondies aux formats vendus." },
    related: ["faire-sa-liste-de-courses-sans-gaspillage", "planifier-ses-repas-de-la-semaine", "batch-cooking-debutant"],
  },
  {
    slug: "quantites-par-personne",
    title: "Quantités par personne : combien prévoir de riz, pâtes, viande et légumes",
    h1: "Quantités par personne : combien prévoir pour chaque repas",
    description: "Repères de quantités par personne pour les féculents, la viande, le poisson et les légumes, et comment les adapter à un repas pour 2, 4 ou 6.",
    category: "Courses & repas",
    minutes: 4,
    published: D,
    intro: "Se tromper de quantité, c'est soit manquer, soit jeter. Voici des repères par personne pour un repas principal, à ajuster selon l'appétit et l'âge.",
    sections: [
      {
        h2: "Repères pour un adulte",
        paragraphs: ["Ce sont des ordres de grandeur, à adapter à l'appétit :"],
        list: ["Pâtes ou riz : environ 80 à 100 g de poids sec", "Viande ou poisson : environ 100 à 150 g", "Légumes : environ 200 g", "Pommes de terre : environ 250 g", "Légumineuses sèches : environ 60 à 80 g"],
      },
      {
        h2: "Adapter une recette à un autre nombre de personnes",
        paragraphs: ["Multiplie ou divise chaque quantité par le rapport entre le nombre de personnes souhaité et celui de la recette. Les épices, le sel et la matière grasse ne suivent pas exactement : goûte et ajuste."],
      },
      {
        h2: "Et à la caisse ?",
        paragraphs: ["Les produits ne se vendent pas au gramme près : 300 g d'oignons, c'est un filet d'un kilo. Flozea calcule ce qu'il te faut pour tes repas et l'arrondit au format réellement vendu."],
      },
    ],
    faq: [
      { q: "Combien de pâtes par personne ?", a: "Environ 80 à 100 g de pâtes sèches pour un adulte, selon l'appétit." },
      { q: "Comment doubler une recette ?", a: "Multiplie les quantités par deux, mais ajuste les épices et le temps de cuisson." },
      { q: "Les enfants comptent-ils comme une personne ?", a: "Selon l'âge, une demi-portion à une portion. Adapte à ta situation." },
    ],
    tool: { href: "/outils/liste-de-courses", label: "Calculer mes quantités", text: "Choisis le nombre de personnes et obtiens les quantités à acheter." },
    related: ["planifier-ses-repas-de-la-semaine", "faire-sa-liste-de-courses-sans-gaspillage", "reduire-le-gaspillage-alimentaire"],
  },
  {
    slug: "liste-de-courses-partagee-en-couple",
    title: "Liste de courses partagée : organiser les courses à deux sans doublons",
    h1: "Liste de courses partagée : faire les courses à deux sans doublons",
    description: "Comment partager une liste de courses en couple ou en colocation : une liste commune, des rôles clairs et un menu planifié pour éviter achats en double.",
    category: "Courses & repas",
    minutes: 4,
    published: D,
    intro: "Quand deux personnes font les courses chacune de leur côté, on finit avec trois paquets de pâtes et plus de lait. Une liste unique et partagée règle presque tout.",
    sections: [
      {
        h2: "Une seule liste, visible par tous",
        paragraphs: ["Chacun ajoute ce qui manque dès qu'il le remarque, et la personne qui fait les courses voit la liste en temps réel. Cocher un article en magasin le retire pour les deux."],
      },
      {
        h2: "Partir du menu, pas du frigo",
        paragraphs: ["Quand le menu de la semaine est planifié à deux, la liste se construit toute seule à partir des recettes choisies, avec les bonnes quantités pour le bon nombre de personnes."],
      },
      {
        h2: "Se répartir les rôles",
        paragraphs: ["Décidez qui fait quelles courses : l'un le gros magasin hebdomadaire, l'autre les produits frais. Et gardez un petit budget commun visible pour éviter les débats en fin de mois."],
      },
    ],
    faq: [
      { q: "Comment partager une liste de courses avec son conjoint ?", a: "Avec une application où les deux comptes partagent le même foyer, la liste se met à jour pour les deux en même temps." },
      { q: "Peut-on lier la liste de courses au budget ?", a: "Oui : en renseignant les prix par enseigne, le coût estimé de la liste apparaît avant d'aller en magasin." },
      { q: "Et en colocation ?", a: "Le principe est identique : une liste commune et des règles claires sur ce qui est partagé ou personnel." },
    ],
    tool: { href: "/fonctionnalites/liste-de-courses", label: "Voir la liste de courses", text: "Liste partagée, quantités fusionnées et prix par enseigne." },
    related: ["gerer-son-budget-en-couple", "planifier-ses-repas-de-la-semaine", "faire-sa-liste-de-courses-sans-gaspillage"],
  },
  {
    slug: "matrice-eisenhower-prioriser-ses-taches",
    title: "Matrice d'Eisenhower : prioriser ses tâches (urgent / important)",
    h1: "La matrice d'Eisenhower : prioriser ses tâches avec urgent et important",
    description: "Comment utiliser la matrice d'Eisenhower pour trier ses tâches en quatre catégories et passer moins de temps sur l'urgent et plus sur l'important.",
    category: "Organisation",
    minutes: 5,
    published: D,
    intro: "Tout n'est pas urgent, et tout ce qui est urgent n'est pas important. La matrice d'Eisenhower aide à trier ses tâches en deux questions : est-ce urgent ? est-ce important ?",
    sections: [
      {
        h2: "Les quatre cases",
        paragraphs: ["Chaque tâche tombe dans l'un de ces quadrants :"],
        list: ["Urgent et important : à faire tout de suite", "Important mais pas urgent : à planifier (le plus rentable)", "Urgent mais pas important : à déléguer ou limiter", "Ni urgent ni important : à supprimer"],
      },
      {
        h2: "Le quadrant qui change tout",
        paragraphs: ["Le quadrant « important mais pas urgent » regroupe ce qui fait avancer la vie sur le long terme : sport, épargne, projets, relations. Comme rien ne presse, c'est lui qu'on repousse. La solution est de lui donner une date dans l'agenda."],
      },
      {
        h2: "L'appliquer au quotidien",
        paragraphs: ["Chaque matin, regarde ta liste et attribue une priorité. Dans Flozea, chaque tâche a une priorité et une échéance, et le calendrier montre ce qui est prévu chaque jour pour ne pas tout laisser à la dernière minute."],
      },
    ],
    faq: [
      { q: "Qui a créé la matrice d'Eisenhower ?", a: "Elle est attribuée à Dwight D. Eisenhower, qui distinguait l'urgent de l'important, et popularisée par Stephen Covey." },
      { q: "Comment éviter de tout classer en urgent ?", a: "En se demandant ce qui se passe réellement si la tâche est faite demain." },
      { q: "Faut-il un outil particulier ?", a: "Non, une feuille suffit, mais une application qui gère priorités et échéances évite de refaire le tri chaque jour." },
    ],
    tool: { href: "/fonctionnalites/taches-et-routines", label: "Voir tâches et routines", text: "Priorités, projets et échéances au même endroit." },
    related: ["creer-une-liste-de-taches-efficace", "organiser-sa-semaine-le-dimanche", "creer-une-routine-quotidienne-qui-tient"],
  },
  {
    slug: "creer-une-liste-de-taches-efficace",
    title: "To-do list efficace : 7 règles pour une liste de tâches qui sert vraiment",
    h1: "Une to-do list efficace : 7 règles pour une liste qui sert vraiment",
    description: "Comment faire une to-do list qui fonctionne : tâches concrètes, priorités, échéances, durée estimée et revue quotidienne pour ne plus se noyer.",
    category: "Organisation",
    minutes: 5,
    published: D,
    intro: "Une liste de tâches qui s'allonge sans cesse décourage. Une bonne liste est courte, concrète et liée à un moment précis dans la journée.",
    sections: [
      {
        h2: "Des tâches concrètes",
        paragraphs: ["« Impôts » n'est pas une tâche, « Télécharger l'avis d'imposition » en est une. Une tâche commence par un verbe d'action et peut se faire en une session."],
      },
      {
        h2: "Les règles qui font la différence",
        paragraphs: [],
        list: ["Limite la liste du jour à trois ou quatre tâches importantes", "Donne une échéance à tout ce qui en a une", "Estime la durée pour savoir si ça tient dans la journée", "Regroupe par projet (maison, travail, administratif)", "Mets les notes et liens dans la tâche, pas ailleurs", "Fais une revue de cinq minutes chaque soir", "Supprime ce que tu repousses depuis des semaines"],
      },
      {
        h2: "De la liste à l'agenda",
        paragraphs: ["Une tâche qui a un créneau dans l'agenda a beaucoup plus de chances d'être faite. Glisse-la sur une plage horaire pour lui réserver du temps."],
      },
    ],
    faq: [
      { q: "Combien de tâches mettre dans la liste du jour ?", a: "Trois à cinq tâches réalistes valent mieux que vingt tâches impossibles à finir." },
      { q: "Pourquoi je repousse toujours certaines tâches ?", a: "Souvent parce qu'elles sont trop vagues ou trop grosses. Découpe-les en actions concrètes." },
      { q: "Papier ou application ?", a: "Le meilleur outil est celui que tu ouvres chaque jour. Une application a l'avantage des rappels et des échéances." },
    ],
    tool: { href: "/fonctionnalites/taches-et-routines", label: "Voir tâches et routines", text: "Tâches, projets, notes et routines cochables." },
    related: ["matrice-eisenhower-prioriser-ses-taches", "organiser-sa-semaine-le-dimanche", "creer-une-routine-quotidienne-qui-tient"],
  },
  {
    slug: "organiser-sa-semaine-le-dimanche",
    title: "Organiser sa semaine le dimanche : la routine de 20 minutes",
    h1: "Organiser sa semaine le dimanche : la routine de 20 minutes",
    description: "Une routine de planification hebdomadaire en 20 minutes : agenda, tâches, menu, courses et budget de la semaine pour commencer le lundi l'esprit libre.",
    category: "Organisation",
    minutes: 5,
    published: D,
    intro: "Vingt minutes de planification le dimanche évitent des heures d'improvisation en semaine. Cette routine couvre l'agenda, les tâches, les repas et l'argent.",
    sections: [
      {
        h2: "Étape 1 : l'agenda (5 min)",
        paragraphs: ["Regarde les sept prochains jours : rendez-vous, déplacements, soirées. Repère les journées chargées et celles où il reste de la place."],
      },
      {
        h2: "Étape 2 : les tâches (5 min)",
        paragraphs: ["Choisis les tâches importantes de la semaine et place-les sur des créneaux. Ajoute les routines que tu veux tenir (sport, lecture) pour qu'elles apparaissent chaque jour."],
      },
      {
        h2: "Étape 3 : le menu et les courses (5 min)",
        paragraphs: ["Planifie un repas par jour en tenant compte de ton agenda : repas rapide les soirs chargés, plat mijoté le week-end. La liste de courses se génère à partir de ces choix."],
      },
      {
        h2: "Étape 4 : l'argent (5 min)",
        paragraphs: ["Jette un œil aux prélèvements à venir et à ton reste à vivre jusqu'à la prochaine paie. Tu sais ainsi combien tu peux dépenser par jour cette semaine."],
      },
    ],
    faq: [
      { q: "Pourquoi planifier le dimanche ?", a: "C'est un moment calme où l'on a une vue d'ensemble sur la semaine qui arrive." },
      { q: "Combien de temps doit durer la planification hebdomadaire ?", a: "Une vingtaine de minutes suffisent quand le rituel est installé." },
      { q: "Peut-on le faire à deux ?", a: "Oui, c'est même idéal : agenda, repas et budget étant partagés, vous décidez ensemble en quelques minutes." },
    ],
    tool: { href: "/signup", label: "Créer mon espace", text: "Agenda, tâches, menu, courses et budget dans le même espace." },
    related: ["planifier-ses-repas-de-la-semaine", "creer-une-liste-de-taches-efficace", "creer-une-routine-quotidienne-qui-tient"],
  },
  {
    slug: "suivre-ses-habitudes-habit-tracker",
    title: "Habit tracker : comment suivre ses habitudes et tenir dans la durée",
    h1: "Habit tracker : suivre ses habitudes et tenir dans la durée",
    description: "Comment utiliser un suivi d'habitudes : choisir peu d'habitudes, des jours prévus réalistes, suivre sa série et sa régularité par semaine, mois et année.",
    category: "Organisation",
    minutes: 5,
    published: D,
    intro: "Une habitude se construit par la répétition, pas par la motivation. Un suivi visible aide à rester régulier, surtout quand on sait quels jours on s'engage.",
    sections: [
      {
        h2: "Commencer petit",
        paragraphs: ["Une à trois habitudes à la fois, pas dix. Choisis une action minuscule (dix minutes de lecture, cinq minutes d'étirements) : elle sera facile à répéter même les mauvais jours."],
      },
      {
        h2: "Des jours prévus réalistes",
        paragraphs: ["Tous les jours n'est pas toujours réaliste. Une routine du lundi, mercredi et vendredi qui tient vaut mieux qu'une routine quotidienne abandonnée au bout de dix jours."],
      },
      {
        h2: "Regarder la régularité, pas la perfection",
        paragraphs: ["Une journée manquée n'efface rien. Ce qui compte est la tendance : une courbe de régularité par semaine, par mois et par année montre les progrès réels, au-delà d'une seule série interrompue."],
      },
      {
        h2: "Relier l'habitude à l'agenda",
        paragraphs: ["Quand la routine apparaît dans ton agenda à côté de tes tâches, tu la vois et tu peux la cocher au bon moment, sans application supplémentaire."],
      },
    ],
    faq: [
      { q: "Combien d'habitudes suivre en même temps ?", a: "Une à trois suffisent pour commencer. Ajoutes-en une nouvelle seulement quand les premières sont ancrées." },
      { q: "Que faire quand on rate un jour ?", a: "Reprendre le lendemain sans culpabiliser : ne jamais rater deux fois de suite est un bon repère." },
      { q: "Combien de temps faut-il pour créer une habitude ?", a: "Cela varie beaucoup d'une personne et d'une habitude à l'autre : mieux vaut se concentrer sur la régularité que sur un chiffre magique." },
    ],
    tool: { href: "/outils/suivi-habitudes", label: "Essayer le suivi d'habitudes", text: "Jours prévus, séries et régularité, sans compte." },
    related: ["creer-une-routine-quotidienne-qui-tient", "organiser-sa-semaine-le-dimanche", "creer-une-liste-de-taches-efficace"],
  },
  {
    slug: "agenda-partage-en-couple-ou-famille",
    title: "Agenda partagé en couple ou en famille : comment bien s'organiser",
    h1: "Agenda partagé en couple ou en famille : comment bien s'organiser",
    description: "Pourquoi un agenda commun simplifie la vie à deux ou en famille : rendez-vous, tâches, repas et budget au même endroit, avec les bonnes pratiques.",
    category: "Agenda & notes",
    minutes: 5,
    published: D,
    intro: "Quand chacun a son agenda et que personne ne regarde celui de l'autre, les doubles réservations arrivent vite. Un agenda partagé donne à tout le foyer la même vue de la semaine.",
    sections: [
      {
        h2: "Ce qu'on met dans l'agenda commun",
        paragraphs: ["Les rendez-vous qui concernent l'autre (médecin, garde, déplacements), les soirées, les échéances administratives, mais aussi les tâches ménagères et les repas prévus."],
      },
      {
        h2: "Les bonnes pratiques",
        paragraphs: [],
        list: ["Ajoute les événements au moment où tu les apprends", "Utilise des couleurs par personne ou par type", "Prévois un créneau hebdomadaire pour se coordonner", "Mets les tâches partagées dans le même espace que les rendez-vous"],
      },
      {
        h2: "Tout au même endroit",
        paragraphs: ["Quand l'agenda affiche aussi les tâches, les routines et les rentrées d'argent, vous voyez en un coup d'œil si la semaine est chargée et si le budget suit."],
      },
    ],
    faq: [
      { q: "Quel est le meilleur agenda partagé pour un couple ?", a: "Celui que vous consultez tous les deux : l'important est qu'il soit simple à mettre à jour et visible par chacun." },
      { q: "Peut-on garder son agenda Google ?", a: "Oui : Flozea fournit un flux de calendrier que Google Agenda ou l'iPhone peuvent afficher." },
      { q: "Les tâches doivent-elles être dans l'agenda ?", a: "C'est plus efficace : une tâche avec un créneau a plus de chances d'être faite." },
    ],
    tool: { href: "/fonctionnalites/agenda", label: "Voir la fonctionnalité Agenda", text: "Grille horaire, tâches, routines et argent au même endroit." },
    related: ["synchroniser-calendrier-iphone-google-agenda", "gerer-son-budget-en-couple", "organiser-sa-semaine-le-dimanche"],
  },
  {
    slug: "synchroniser-calendrier-iphone-google-agenda",
    title: "Synchroniser son calendrier avec Google Agenda et l'iPhone (flux iCal)",
    h1: "Synchroniser son calendrier avec Google Agenda et l'iPhone grâce à un flux iCal",
    description: "Comment afficher tes tâches et événements dans Google Agenda ou le calendrier de l'iPhone avec un lien d'abonnement iCal, étape par étape.",
    category: "Agenda & notes",
    minutes: 4,
    published: D,
    intro: "Tu n'as pas à abandonner l'agenda que tu utilises déjà. Avec un lien d'abonnement au format iCal, tes tâches et événements de Flozea s'affichent dans Google Agenda ou dans l'app Calendrier de l'iPhone.",
    sections: [
      {
        h2: "Le principe",
        paragraphs: ["Un flux iCal est une adresse web qui décrit ton calendrier. Ton application de calendrier s'y abonne et la relit régulièrement : l'affichage est en lecture seule, ce que tu modifies dans Flozea se retrouve ensuite dans l'autre agenda."],
      },
      {
        h2: "Sur iPhone",
        paragraphs: ["Dans Réglages, ajoute un compte de type calendrier abonné et colle l'adresse du flux. Les éléments apparaissent dans l'app Calendrier."],
      },
      {
        h2: "Dans Google Agenda",
        paragraphs: ["Depuis un ordinateur, ouvre Google Agenda, ajoute un agenda « À partir de l'URL » et colle l'adresse. Google met à jour l'affichage à son rythme, qui peut prendre un certain temps."],
      },
      {
        h2: "Quelques précautions",
        paragraphs: ["Le lien est personnel : ne le partage pas. Si tu penses qu'il a fuité, régénère-le dans les réglages et abonne-toi de nouveau avec le nouveau lien."],
      },
    ],
    faq: [
      { q: "La synchronisation est-elle dans les deux sens ?", a: "Non, le flux est en lecture seule : les modifications se font dans Flozea." },
      { q: "Pourquoi les mises à jour mettent-elles du temps ?", a: "Google Agenda et l'iPhone relisent les flux abonnés à intervalles réguliers, qui varient selon le service." },
      { q: "Le lien est-il sécurisé ?", a: "Il contient un identifiant secret propre à ton foyer. Garde-le privé et régénère-le au besoin." },
    ],
    tool: { href: "/fonctionnalites/agenda", label: "Voir l'agenda", text: "Vues jour, semaine, mois et flux vers Google Agenda ou iPhone." },
    related: ["agenda-partage-en-couple-ou-famille", "organiser-sa-semaine-le-dimanche", "remplacer-notion-excel-jow"],
  },
  {
    slug: "prendre-des-notes-structurees",
    title: "Prendre des notes efficacement : pages, sous-pages et organisation façon Notion",
    h1: "Prendre des notes efficacement : pages, sous-pages et organisation",
    description: "Comment organiser ses notes : une structure simple en pages et sous-pages, des titres, des listes à cocher et une recherche rapide pour tout retrouver.",
    category: "Agenda & notes",
    minutes: 5,
    published: D,
    intro: "Des notes éparpillées dans dix applications ne servent à rien si tu ne les retrouves pas. Une structure simple et une bonne recherche suffisent largement.",
    sections: [
      {
        h2: "Une structure en arbre, pas en dossiers profonds",
        paragraphs: ["Quelques pages principales (Maison, Travail, Projets, Idées) avec des sous-pages, plutôt que dix niveaux de dossiers. Moins on clique, plus on retrouve."],
      },
      {
        h2: "Des blocs pour tout",
        paragraphs: ["Titres, listes à puces, cases à cocher, citations : tu écris librement et tu structures ensuite. Les raccourcis Markdown (par exemple # pour un titre) accélèrent la saisie."],
      },
      {
        h2: "Retrouver au lieu de classer",
        paragraphs: ["Plutôt que de perdre du temps à ranger, mise sur la recherche dans tout le contenu. Un bon titre et quelques mots-clés suffisent."],
      },
      {
        h2: "Relier les notes au reste",
        paragraphs: ["Une note de projet à côté des tâches du projet, une liste de voyage à côté du budget : les notes servent davantage quand elles vivent dans le même espace que le reste."],
      },
    ],
    faq: [
      { q: "Quelle est la meilleure application de notes ?", a: "Celle que tu ouvres vraiment. Cherche la simplicité, une recherche efficace et la structure en pages." },
      { q: "Combien de niveaux de sous-pages utiliser ?", a: "Deux ou trois niveaux suffisent dans la plupart des cas." },
      { q: "Peut-on cocher des listes dans les notes ?", a: "Oui, les listes à cocher font partie des blocs disponibles." },
    ],
    tool: { href: "/fonctionnalites/notes", label: "Voir les notes", text: "Pages, sous-pages, blocs et recherche dans tout le contenu." },
    related: ["remplacer-notion-excel-jow", "creer-une-liste-de-taches-efficace", "organiser-sa-semaine-le-dimanche"],
  },
];
