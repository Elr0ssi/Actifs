// Questions fréquentes supplémentaires : plus nombreuses et plus détaillées, pour répondre aux vraies recherches.
export type Faq = { q: string; a: string };

export const HOME_FAQ_EXTRA: Faq[] = [
  { q: "Flozea fonctionne-t-il sur iPhone et sur Android ?", a: "Flozea est une application web : elle s'ouvre dans le navigateur de ton téléphone, de ta tablette ou de ton ordinateur, et tu peux l'ajouter à l'écran d'accueil comme une application. Il n'y a rien à télécharger dans un magasin d'applications. Seuls les paiements automatiques par Apple Pay demandent un iPhone." },
  { q: "Puis-je utiliser Flozea seul, sans partager mon espace ?", a: "Oui. Ton espace est personnel par défaut : tâches, courses, budget et notes ne sont visibles que de toi. Le partage est une option que tu actives seulement si tu invites quelqu'un." },
  { q: "Comment inviter mon conjoint ou mes colocataires ?", a: "Dans les paramètres, tu trouves le code d'invitation de ton foyer. La personne crée son compte, saisit ce code et rejoint ton espace : vous partagez alors la même liste de courses, le même menu, le même agenda et le même budget." },
  { q: "Mes données sont-elles en sécurité ?", a: "La connexion au site est chiffrée (HTTPS) et l'accès aux données est limité à ton foyer. Les données sont hébergées chez Supabase et Vercel, nous ne les vendons pas et nous n'affichons aucune publicité. Le détail figure dans la politique de confidentialité." },
  { q: "Flozea existe-t-il dans d'autres langues que le français ?", a: "Oui : le site et l'application sont disponibles en français, en anglais, en espagnol et en allemand. Tu changes de langue avec le drapeau en haut de la page ou dans les paramètres, et les recettes proposées sont traduites aussi." },
  { q: "Dois-je connecter ma banque pour utiliser le budget ?", a: "Non. Tu peux saisir tes revenus et tes charges récurrents, ajouter tes paiements Apple Pay automatiquement si tu as un iPhone, ou tout saisir à la main. La connexion directe à la banque est prévue plus tard, dans l'offre à 3 € par mois." },
  { q: "Les recettes sont-elles payantes ?", a: "Non. Plus de 90 recettes simples sont incluses gratuitement, avec leurs ingrédients, leurs ustensiles et leurs étapes. Tu peux aussi créer tes propres recettes avec une photo et les mettre en favori." },
  { q: "Combien de temps faut-il pour prendre Flozea en main ?", a: "Quelques minutes suffisent : tu crées ton espace, ajoutes une première tâche ou choisis une recette, et la suite se met en place. Le plus simple est de commencer par un seul usage (les courses ou le budget, par exemple) puis d'ajouter les autres peu à peu." },
  { q: "Puis-je supprimer mon compte et mes données ?", a: "Oui, à tout moment. Si tu supprimes ton compte, tes données sont effacées, à l'exception de ce que la loi nous oblige à conserver. Tu peux aussi demander l'accès à tes données ou leur export, comme l'explique la politique de confidentialité." },
  { q: "Qu'est-ce que le « foyer » dans Flozea ?", a: "Le foyer est l'espace partagé entre les personnes que tu invites : couple, colocation ou famille. Les listes de courses, le menu de la semaine, l'agenda, les tâches, les notes et le budget y sont communs, avec le même solde et le même reste à vivre." },
];

export const TARIFS_FAQ_EXTRA: Faq[] = [
  { q: "Y a-t-il une période d'essai ?", a: "Pas besoin : l'offre gratuite n'a pas de limite de durée et donne accès à toutes les fonctionnalités. Tu peux l'utiliser aussi longtemps que tu veux avant de décider si l'offre à 3 € par mois t'intéresse." },
  { q: "Faut-il une carte bancaire pour s'inscrire ?", a: "Non. L'inscription gratuite ne demande ni carte bancaire ni moyen de paiement. Tu crées ton espace avec une adresse e-mail ou avec ton compte Google." },
  { q: "Le partage avec mon conjoint ou mes colocataires est-il payant ?", a: "Non. Inviter les personnes de ton foyer fait partie de l'offre gratuite : vous partagez les listes, le menu, l'agenda, les notes et le budget sans supplément." },
  { q: "Les paiements automatiques Apple Pay sont-ils gratuits ?", a: "Oui. Les paiements par carte envoyés depuis ton iPhone via l'app Raccourcis sont inclus dans l'offre gratuite. L'offre à 3 € par mois ajoutera la connexion directe à ton compte bancaire, une autre manière de recevoir tes opérations." },
  { q: "Y a-t-il de la publicité dans Flozea ?", a: "Non. Flozea n'affiche pas de publicité et ne vend pas tes données. Le service est financé par l'offre payante à venir, pas par la revente d'informations sur toi." },
  { q: "Pourquoi la connexion bancaire est-elle payante ?", a: "Relier un compte bancaire passe par des services tiers qui coûtent de l'argent à chaque connexion. L'offre à 3 € par mois sert à couvrir ce coût, sans toucher à la gratuité du reste de Flozea." },
  { q: "Que deviennent mes données si je reste sur l'offre gratuite ?", a: "Elles restent dans ton espace tant que ton compte existe, sans limite de volume : projets, listes, routines, opérations financières. Rien n'est supprimé ni bloqué parce que tu n'as pas pris d'offre payante." },
];

export const FEATURE_FAQ_EXTRA: Record<string, Faq[]> = {
  agenda: [
    { q: "Peut-on voir sa journée, sa semaine et son mois ?", a: "Oui. L'agenda propose une vue jour, une vue semaine et une vue mois, chacune en trois tailles (compact, normal, grand) pour voir toute ta journée sans faire défiler la page." },
    { q: "Comment crée-t-on une tâche dans l'agenda ?", a: "Tu fais glisser la souris sur un créneau libre, tu donnes un titre, puis tu peux ajouter un projet, une priorité, des notes et des heures de début et de fin. La tâche se déplace ensuite d'un glisser-déposer, et son bord se tire pour changer sa durée." },
    { q: "Les rentrées et sorties d'argent apparaissent-elles dans l'agenda ?", a: "Oui, tu peux afficher les opérations financières prévues à côté de tes tâches et de tes routines, et les masquer avec un filtre quand tu veux un agenda plus sobre." },
    { q: "L'agenda peut-il être partagé avec mon conjoint ?", a: "Oui. Les personnes de ton foyer partagent le même agenda : chacun voit les tâches et les rendez-vous communs, ce qui évite les doubles réservations." },
  ],
  "taches-et-routines": [
    { q: "Comment organiser ses tâches par projet ?", a: "Tu crées un projet avec un nom, une icône et une couleur (travail, maison, vacances…), puis tu y ranges tes tâches. Chaque projet affiche un compteur d'avancement et un filtre permet de n'afficher qu'un projet à la fois." },
    { q: "Comment fonctionne le suivi des routines ?", a: "Tu choisis les jours prévus pour chaque routine (tous les jours ou seulement certains jours), tu la coches chaque jour et Flozea calcule ta série et une courbe de régularité par jour, par semaine, par mois et par année." },
    { q: "Une journée ratée casse-t-elle ma série ?", a: "La série compte les jours d'affilée où toutes tes routines prévues sont faites. Une journée en cours pas encore terminée ne casse rien, et tu peux corriger une journée passée : la courbe se met à jour." },
    { q: "Peut-on définir une priorité et une échéance pour une tâche ?", a: "Oui. Chaque tâche a une fiche avec une priorité, une date, des heures, un projet et des notes. Les tâches en retard sont signalées pour que tu saches quoi traiter en premier." },
  ],
  "recettes-et-menu-de-la-semaine": [
    { q: "Combien de recettes sont proposées ?", a: "Plus de 90 recettes simples, classées par catégorie (pâtes, riz, végétarien, rapide, dessert…), avec les ingrédients par personne, les ustensiles nécessaires et des étapes détaillées." },
    { q: "Peut-on filtrer les recettes selon l'équipement disponible ?", a: "Oui. Tu coches ce que tu as chez toi (four, poêle, casserole, mixeur, micro-ondes…) et Flozea ne montre que les recettes réalisables avec ces équipements." },
    { q: "Comment planifier un repas du midi ou du soir ?", a: "Tu touches un jour de la semaine, tu choisis le moment (midi ou soir), puis la recette. Les cartes du menu défilent jour par jour avec la photo, le nom et la durée, et tu peux déplacer un repas du midi au soir." },
    { q: "Les recettes sont-elles disponibles dans plusieurs langues ?", a: "Oui. Les recettes proposées par Flozea sont traduites en français, en anglais, en espagnol et en allemand. Tes propres recettes restent dans la langue dans laquelle tu les écris." },
  ],
  "liste-de-courses": [
    { q: "Comment ajoute-t-on des recettes à une liste de courses ?", a: "Tu crées une liste, tu choisis une ou plusieurs recettes avec le nombre de personnes de chacune, puis Flozea affiche un écran de vérification des quantités avant d'ajouter les ingrédients à la liste. Tu peux corriger une ligne, la retirer ou changer l'unité." },
    { q: "Peut-on ajouter des articles qui ne viennent pas d'une recette ?", a: "Oui. Tu ajoutes librement un produit avec sa quantité, et Flozea te suggère les articles de tes dernières courses pour aller plus vite. Les produits que tu rachètes souvent reviennent ainsi en un clic." },
    { q: "À quoi sert la comparaison des magasins ?", a: "Une fois les courses terminées, Flozea estime le total que la liste aurait coûté dans chaque enseigne à partir des prix de référence, pour te montrer où tu aurais dépensé le moins." },
    { q: "Que deviennent les articles que je n'ai pas cochés ?", a: "Ils restent dans la liste pour la prochaine fois : rien ne disparaît tant que tu ne l'as pas coché ou retiré. Quand tu coches un article en magasin, il se coche aussi pour les autres personnes du foyer." },
  ],
  "budget-et-finances": [
    { q: "Comment ajouter un revenu ou une dépense récurrente ?", a: "Tu crées une opération en choisissant son type (charge fixe, dépense variable, revenu ou épargne), son montant, sa date de début et sa récurrence : une seule fois, toutes les semaines, tous les mois ou tous les ans. Elle se répète ensuite toute seule dans le calendrier." },
    { q: "Que se passe-t-il quand mon salaire tombe un week-end ?", a: "Tu indiques une fois la règle (reporter au lundi suivant ou avancer au vendredi précédent) et la date se décale chaque mois. Tu peux aussi déplacer à la main une occurrence précise sans toucher aux autres." },
    { q: "Peut-on suivre plusieurs comptes ?", a: "Oui : compte courant, compte joint, livrets et placements peuvent avoir chacun leurs soldes datés. Un solde est un montant précis à une date, que tu peux modifier ou supprimer." },
    { q: "Flozea donne-t-il des conseils financiers ou fiscaux ?", a: "Non. Les montants, projections et estimations (dont la provision d'impôt indicative) sont des aides à la décision fondées sur ce que tu saisis. Ils ne remplacent ni les relevés de ta banque, ni un simulateur officiel, ni l'avis d'un professionnel." },
  ],
  "paiements-automatiques": [
    { q: "Les paiements automatiques fonctionnent-ils sur Android ?", a: "Non, pas pour l'instant : l'automatisation repose sur l'app Raccourcis de l'iPhone et sur Apple Pay. Sur Android, tu peux saisir tes dépenses à la main dans le calendrier financier." },
    { q: "Combien de temps faut-il pour configurer l'automatisation ?", a: "Environ deux minutes, une seule fois. Flozea affiche les étapes exactes à suivre dans Raccourcis, avec les noms des champs à copier, et propose un paiement test de 1 € pour vérifier que tout fonctionne." },
    { q: "L'adresse privée d'envoi est-elle sécurisée ?", a: "Elle contient un identifiant secret propre à ton foyer : garde-la pour toi. Si tu penses qu'elle a fuité, tu peux en générer une nouvelle dans Flozea, puis mettre à jour ton automatisation." },
    { q: "Le paiement est-il retiré de mon solde à la bonne date ?", a: "Oui. Chaque paiement est ajouté avec le commerçant, le montant et l'heure d'arrivée, retiré de ton solde à sa date, et ton reste à vivre est recalculé. Tu peux ensuite changer sa catégorie ou supprimer un doublon." },
  ],
  "analyse-bancaire": [
    { q: "Quelles banques seront compatibles ?", a: "La liste des banques compatibles sera précisée à l'ouverture de l'offre, puisqu'elle dépend des services de connexion bancaire utilisés. Elle sera communiquée avant toute souscription." },
    { q: "L'accès à mon compte sera-t-il en lecture seule ?", a: "C'est le principe prévu : tu choisis ta banque et tu confirmes un accès en lecture seule, ce qui permet de récupérer tes opérations sans pouvoir effectuer de virement." },
    { q: "Quelles analyses seront proposées ?", a: "Une répartition de tes dépenses par catégorie, l'évolution d'un mois à l'autre, tes plus gros postes et le repérage des abonnements et prélèvements qui reviennent, pour les ajouter à ton calendrier financier." },
    { q: "Faut-il payer pour utiliser le calendrier financier ?", a: "Non. Le calendrier financier, le reste à vivre et les paiements automatiques Apple Pay sont gratuits. Seule la connexion directe à la banque et son analyse feront l'objet de l'offre à 3 € par mois." },
  ],
  notes: [
    { q: "Peut-on organiser ses notes en sous-pages ?", a: "Oui. Chaque page peut contenir des sous-pages, avec une arborescence repliable et un fil d'Ariane. Deux ou trois niveaux suffisent dans la plupart des cas pour tout retrouver." },
    { q: "Comment ajouter un titre ou une liste à cocher ?", a: "Tape « / » pour ouvrir le menu des blocs (titre, liste, case à cocher, citation, code), ou utilise les raccourcis Markdown : # pour un titre, - pour une liste, [] pour une case à cocher, > pour une citation." },
    { q: "Comment retrouver une note rapidement ?", a: "La recherche trouve un mot dans les titres comme dans le contenu des pages, et tu peux épingler les pages les plus utiles pour les garder toujours à portée." },
    { q: "Peut-on personnaliser une page avec une icône ?", a: "Oui, tu peux choisir une icône emoji pour chaque page et réorganiser les blocs en les montant, en les descendant ou en les supprimant depuis leur poignée." },
  ],
};

export const TOOL_FAQ_EXTRA: Record<string, Faq[]> = {
  "budget-mensuel": [
    { q: "Comment utiliser le calculateur de budget mensuel ?", a: "Saisis tes revenus nets, tes charges fixes et tes dépenses variables, puis indique l'épargne visée et le nombre de jours avant ta prochaine rentrée d'argent. Le calculateur affiche tout de suite ton reste à vivre, ton budget par jour et ta répartition." },
    { q: "L'outil fonctionne-t-il pour un couple ?", a: "Oui : additionne les revenus et les charges du foyer pour voir votre reste à vivre commun. Pour partager un vrai budget à deux, avec calendrier et soldes, il faut créer un espace Flozea." },
    { q: "Puis-je utiliser le calculateur sans créer de compte ?", a: "Oui. L'outil est gratuit, sans inscription ni abonnement, et tes montants restent dans ton navigateur au lieu d'être envoyés à nos serveurs." },
  ],
  "liste-de-courses": [
    { q: "Comment obtenir ma liste de courses à partir de recettes ?", a: "Cherche ou choisis des recettes, indique pour combien de personnes tu cuisines, puis récupère la liste fusionnée : les ingrédients identiques sont additionnés et classés par rayon." },
    { q: "La liste tient-elle compte des formats vendus en magasin ?", a: "Oui, les formats courants sont proposés : un filet de 1 kg pour les oignons, un paquet de 500 g pour les pâtes, une boîte de 400 g pour les tomates. Le besoin réel reste affiché à côté." },
    { q: "Puis-je imprimer ou copier ma liste ?", a: "Oui. Tu peux copier la liste dans tes notes, l'imprimer ou cocher les articles au fur et à mesure de tes courses depuis ton téléphone." },
  ],
  "suivi-habitudes": [
    { q: "Comment est calculé le pourcentage de réussite ?", a: "Il compare les jours cochés aux jours prévus pour chaque habitude. Les jours à venir ne comptent pas, et une habitude pas encore cochée aujourd'hui ne dégrade pas ton score." },
    { q: "Puis-je suivre des habitudes seulement certains jours ?", a: "Oui : tu choisis les jours prévus de chaque habitude, par exemple lundi, mercredi et vendredi pour le sport. Les autres jours ne comptent pas dans la régularité." },
    { q: "Comment retrouver mes habitudes sur un autre appareil ?", a: "Dans l'outil gratuit, elles restent dans le navigateur de cet appareil. Avec un espace Flozea, tes routines sont synchronisées partout et apparaissent dans ton agenda avec une courbe de régularité." },
  ],
  calculateurs: [
    { q: "Comment passer du salaire brut au salaire net ?", a: "Le calculateur applique un ratio indicatif adapté à ton statut (cadre ou non-cadre) à ton salaire brut annuel, puis affiche le net mensuel. C'est une estimation, qui peut différer de ta fiche de paie." },
    { q: "L'alternance est-elle prise en compte pour l'impôt ?", a: "Oui : l'estimation tient compte de l'exonération d'impôt sur le revenu jusqu'à 21 000 € par an pour les périodes d'alternance." },
    { q: "Le résultat remplace-t-il un simulateur officiel ?", a: "Non. Le résultat sert à anticiper une provision d'impôt, pas à remplir ta déclaration. Utilise le simulateur officiel de l'administration fiscale pour un montant précis." },
  ],
};

export const GUIDE_FAQ_EXTRA: Record<string, Faq[]> = {
  "faire-un-budget-mensuel": [
    { q: "Combien de temps faut-il pour faire un budget mensuel ?", a: "Une première fois, comptez une heure pour lister vos revenus, vos charges fixes et vos dépenses habituelles. Ensuite, dix minutes par semaine suffisent pour suivre et corriger." },
    { q: "Faut-il un tableur ou une application pour faire son budget ?", a: "Aucun des deux n'est obligatoire : un papier peut suffire pour commencer. Un outil devient utile quand vous voulez voir les dates des revenus et des prélèvements, et calculer automatiquement votre reste à vivre." },
  ],
  "calculer-son-reste-a-vivre": [
    { q: "Le reste à vivre est-il calculé sur le revenu net ou brut ?", a: "Sur le revenu net, c'est-à-dire ce qui arrive réellement sur le compte après les prélèvements et l'impôt à la source. Le brut ne dit rien de ce que vous pouvez dépenser." },
    { q: "Que faire si mon reste à vivre est trop faible ?", a: "Regardez d'abord les plus gros postes : logement, assurances, abonnements, forfaits. Renégocier ou comparer ces contrats a plus d'effet que de rogner sur les petites dépenses du quotidien." },
  ],
  "planifier-ses-repas-de-la-semaine": [
    { q: "Faut-il planifier tous les repas de la semaine ?", a: "Non. Prévoir quatre à six repas et garder un ou deux jours libres pour les restes, les invitations ou l'envie du moment évite le gaspillage et la lassitude." },
    { q: "Quel jour planifier ses repas ?", a: "Le jour où vous avez un moment calme avant de faire les courses, souvent le dimanche. L'important est de planifier avant d'aller en magasin, pas pendant." },
  ],
  "faire-sa-liste-de-courses-sans-gaspillage": [
    { q: "Faut-il classer la liste de courses par rayon ?", a: "Oui, c'est l'un des gestes les plus efficaces : en suivant l'ordre des rayons, on ne passe qu'une fois dans chaque et on oublie moins de produits." },
    { q: "Comment ne pas oublier ce qu'on a déjà à la maison ?", a: "Ouvrez le frigo et les placards avant de finaliser la liste, retirez ce que vous avez déjà, et construisez les premiers repas autour des produits à consommer en priorité." },
  ],
  "creer-une-routine-quotidienne-qui-tient": [
    { q: "À quelle heure vaut-il mieux placer une routine ?", a: "À un moment qui existe déjà dans votre journée : après le café, en rentrant du travail, avant de se coucher. Accrocher la routine à une habitude existante évite de décider chaque jour." },
    { q: "Combien de routines peut-on installer en même temps ?", a: "Commencez par une à trois. Quand elles sont ancrées, ajoutez-en une nouvelle : en vouloir dix d'un coup est la meilleure façon de tout abandonner." },
  ],
  "remplacer-notion-excel-jow": [
    { q: "Est-il vraiment utile de regrouper ses outils en un seul ?", a: "Oui quand l'information se recoupe : le menu alimente les courses, les courses pèsent sur le budget et tout se place dans l'agenda. Un seul espace évite de tout recopier d'une application à l'autre." },
    { q: "Peut-on migrer progressivement ?", a: "Oui, et c'est conseillé. Commencez par l'usage qui vous coûte le plus de temps, gardez vos anciens outils quelques semaines en lecture seule, puis basculez les autres usages un par un." },
  ],
  "gerer-son-budget-en-couple": [
    { q: "Comment parler d'argent sans se disputer ?", a: "Fixez ensemble un rendez-vous régulier, regardez les mêmes chiffres (revenus, charges fixes, reste à vivre) et décidez à l'avance d'un seuil au-delà duquel on se prévient avant un achat." },
    { q: "Faut-il tout mettre en commun dans un couple ?", a: "Pas forcément. Certains couples mettent tout en commun, d'autres partagent seulement les dépenses du foyer au prorata des revenus. L'important est que la règle soit claire et acceptée par les deux." },
  ],
  "epargne-de-precaution": [
    { q: "À partir de quel montant peut-on dire qu'on a une épargne de précaution ?", a: "Un mois de dépenses essentielles est un premier palier réaliste, puis trois à six mois pour être vraiment protégé, davantage si vos revenus sont irréguliers." },
    { q: "Peut-on utiliser son épargne de précaution pour un projet ?", a: "Ce n'est pas son rôle : elle sert uniquement à encaisser un imprévu (panne, santé, perte de revenus). Pour un voyage ou un achat, prévoyez une épargne de projet à part." },
  ],
  "regle-50-30-20": [
    { q: "La règle 50/30/20 convient-elle à tout le monde ?", a: "C'est un repère de départ, pas une obligation. Avec un loyer élevé, on peut adapter à 60/20/20 ou 65/15/20 en gardant toujours une part d'épargne non nulle." },
    { q: "Comment appliquer la règle si mes revenus varient ?", a: "Appliquez-la à votre revenu minimal habituel, et traitez ce qui dépasse comme un bonus à verser en priorité à l'épargne." },
  ],
  "reduire-ses-depenses-mensuelles": [
    { q: "Combien peut-on économiser en renégociant ses contrats ?", a: "Cela dépend des contrats, mais comparer l'énergie, l'assurance, internet et le forfait mobile une fois par an est souvent le geste le plus rentable, sans rien changer au quotidien." },
    { q: "Comment ne pas craquer sur les achats impulsifs ?", a: "Attendez 48 heures avant un achat non essentiel, fixez une enveloppe par catégorie et regardez chaque jour ce qu'il vous reste à dépenser." },
  ],
  "budget-etudiant": [
    { q: "Quelles aides inclure dans un budget étudiant ?", a: "Notez chaque entrée avec sa date de versement : bourse, aide au logement, aide des parents, job d'été ou à temps partiel. Ce sont les dates qui font tenir le mois." },
    { q: "Comment manger pour pas cher quand on est étudiant ?", a: "Planifiez cinq repas à l'avance, cuisinez en plus grosse quantité, congelez les portions en trop et partagez les courses en colocation." },
  ],
  "suivre-ses-depenses-automatiquement": [
    { q: "Peut-on suivre ses dépenses sans partager ses identifiants bancaires ?", a: "Oui. Sur iPhone, une automatisation envoie chaque paiement Apple Pay vers votre espace, sans jamais communiquer de mot de passe bancaire." },
    { q: "Quelle est la meilleure méthode pour suivre ses dépenses ?", a: "Celle que vous ferez encore dans trois mois : une revue hebdomadaire de dix minutes, un tableur ou un enregistrement automatique. L'essentiel est de comparer d'un mois sur l'autre." },
  ],
  "calendrier-financier-salaire-et-prelevements": [
    { q: "Un calendrier financier remplace-t-il un budget ?", a: "Il le complète : le budget dit combien on dépense, le calendrier dit quand. Les deux ensemble évitent de découvrir un loyer prélevé avant l'arrivée du salaire." },
    { q: "Faut-il saisir tous les prélèvements ?", a: "Commencez par les gros : loyer, abonnements, assurances, crédits et salaire. Ils suffisent à montrer les jours où le solde est le plus bas." },
  ],
  "batch-cooking-debutant": [
    { q: "Quels plats se prêtent le mieux au batch cooking ?", a: "Les céréales (riz, pâtes, quinoa), les légumes rôtis, les plats mijotés, les soupes et les protéines cuites (poulet, œufs durs, lentilles) se préparent et se conservent facilement." },
    { q: "Peut-on congeler les plats préparés ?", a: "Beaucoup se congèlent très bien, surtout les plats mijotés et les soupes. Laissez refroidir rapidement, étiquetez avec la date et vérifiez la durée recommandée pour chaque aliment." },
  ],
  "idees-repas-pas-chers": [
    { q: "Quels ingrédients privilégier pour manger pas cher ?", a: "Les légumineuses, les œufs, les pâtes, le riz, les légumes de saison et les surgelés nature offrent beaucoup de nutriments pour peu d'argent." },
    { q: "Comment faire baisser la facture sans manger toujours pareil ?", a: "Variez les assaisonnements et les accompagnements autour des mêmes ingrédients, planifiez vos menus et cuisinez en double pour avoir un repas d'avance." },
  ],
  "reduire-le-gaspillage-alimentaire": [
    { q: "Comment bien ranger son frigo pour éviter le gaspillage ?", a: "Mettez devant les produits qui se périment en premier, utilisez des boîtes transparentes pour voir ce qu'il y a dedans et notez la date sur les plats préparés." },
    { q: "Que faire des restes ?", a: "Un reste de riz devient un riz sauté, des légumes fatigués une soupe, du pain rassis du pain perdu. Prévoyez aussi un repas « fond de frigo » en fin de semaine." },
  ],
  "quantites-par-personne": [
    { q: "Combien de viande ou de poisson par personne ?", a: "Environ 100 à 150 g par adulte pour un repas principal, à ajuster selon l'appétit et l'accompagnement." },
    { q: "Comment adapter une recette à un autre nombre de personnes ?", a: "Multipliez ou divisez chaque quantité par le rapport entre le nombre de personnes souhaité et celui de la recette, puis goûtez pour ajuster les épices, le sel et la matière grasse." },
  ],
  "liste-de-courses-partagee-en-couple": [
    { q: "Comment se répartir les courses à deux ?", a: "Décidez qui fait quelles courses : par exemple l'un le gros magasin hebdomadaire, l'autre les produits frais. Une liste unique évite que chacun achète la même chose." },
    { q: "Que faire si l'on oublie de cocher un article ?", a: "Avec une liste partagée en direct, l'autre personne voit ce qui est déjà coché. Les articles non cochés restent dans la liste pour la prochaine fois." },
  ],
  "matrice-eisenhower-prioriser-ses-taches": [
    { q: "Quelle est la différence entre urgent et important ?", a: "Une tâche urgente demande une action immédiate ; une tâche importante contribue à vos objectifs à long terme. Les deux ne vont pas toujours ensemble, et c'est tout l'intérêt de la matrice." },
    { q: "Que mettre dans le quadrant « important mais pas urgent » ?", a: "Le sport, l'épargne, les projets et les relations : ce qui fait avancer la vie à long terme et qu'on repousse faute d'échéance. La solution est de lui donner une date dans l'agenda." },
  ],
  "creer-une-liste-de-taches-efficace": [
    { q: "Comment formuler une tâche pour qu'elle soit actionnable ?", a: "Commencez par un verbe d'action et décrivez ce qui peut se faire en une session : « Télécharger l'avis d'imposition » plutôt que « Impôts »." },
    { q: "Faut-il estimer la durée de chaque tâche ?", a: "C'est utile : estimer la durée permet de savoir si la liste du jour tient vraiment dans la journée, et d'éviter de la surcharger." },
  ],
  "organiser-sa-semaine-le-dimanche": [
    { q: "Que faire pendant les 20 minutes de planification ?", a: "Regardez l'agenda des sept prochains jours, choisissez les tâches importantes, planifiez un repas par jour et jetez un œil aux prélèvements à venir." },
    { q: "Et si la semaine ne se passe pas comme prévu ?", a: "Ajustez sans culpabiliser : un plan sert de repère, pas de contrat. Décaler une tâche ou un repas coûte une minute si tout est au même endroit." },
  ],
  "suivre-ses-habitudes-habit-tracker": [
    { q: "Vaut-il mieux suivre des habitudes quotidiennes ou hebdomadaires ?", a: "Les deux ont leur place : choisissez les jours qui correspondent à votre emploi du temps réel, pas à celui que vous aimeriez avoir. Une routine du lundi, mercredi et vendredi qui tient vaut mieux qu'une routine quotidienne abandonnée." },
    { q: "Que regarder dans un habit tracker : la série ou le pourcentage ?", a: "Le pourcentage de régularité par semaine ou par mois donne une vision plus juste qu'une seule série interrompue : un jour manqué n'efface rien." },
  ],
  "agenda-partage-en-couple-ou-famille": [
    { q: "Comment éviter les doubles réservations en famille ?", a: "Ajoutez chaque événement dès que vous l'apprenez, dans le même agenda que tout le monde consulte, et prévoyez un créneau hebdomadaire pour vous coordonner." },
    { q: "Faut-il un agenda par personne ?", a: "Un agenda commun avec des couleurs par personne ou par type d'événement est souvent plus simple que plusieurs agendas à comparer." },
  ],
  "synchroniser-calendrier-iphone-google-agenda": [
    { q: "Comment ajouter le lien dans Google Agenda ?", a: "Depuis un ordinateur, ouvrez Google Agenda, ajoutez un agenda « À partir de l'URL » et collez l'adresse du flux. Google met à jour l'affichage à son rythme." },
    { q: "Que faire si le lien a été partagé par erreur ?", a: "Régénérez-le dans les réglages de Flozea, puis abonnez-vous de nouveau avec le nouveau lien : l'ancien cesse alors de fonctionner." },
  ],
  "prendre-des-notes-structurees": [
    { q: "Faut-il classer ses notes dans des dossiers ?", a: "Mieux vaut quelques pages principales avec des sous-pages et miser sur la recherche : moins on clique, plus on retrouve." },
    { q: "Quels types de blocs utiliser pour structurer une note ?", a: "Titres pour découper, listes à puces pour énumérer, cases à cocher pour les actions et citations pour garder une idée. Les raccourcis Markdown accélèrent la saisie." },
  ],
};
