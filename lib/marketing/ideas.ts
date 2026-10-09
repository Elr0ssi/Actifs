// Pages « idées » : des regroupements de recettes pensés comme les recherches que font vraiment les gens
// (« idée tartine », « avocado toast », « poulet pâtes sauce »…). Chaque idée a son texte, sa FAQ et la liste de recettes qui correspondent.
import type { MarketingRecipe } from "@/lib/marketing/recipes";
import { RECIPES } from "@/lib/marketing/recipes";

export interface IdeaFaq { q: string; a: string }
export interface Idea {
  slug: string;
  icon: string;
  /** Mot court, pour les pastilles de navigation. */
  label: string;
  h1: string;
  /** Paragraphe d'introduction (sert aussi de description de la page). */
  intro: string;
  /** Second paragraphe : conseils concrets, pour répondre aux questions que les gens se posent. */
  tips: string;
  faq: IdeaFaq[];
  test: (r: MarketingRecipe) => boolean;
}

const total = (r: MarketingRecipe) => r.prepMinutes + r.cookMinutes;
const has = (r: MarketingRecipe, re: RegExp) => re.test(r.name) || r.ingredients.some((i) => re.test(i));
const named = (r: MarketingRecipe, re: RegExp) => re.test(r.name);

export const IDEAS: Idea[] = [
  {
    slug: "idees-tartines",
    icon: "🥪",
    label: "Tartines",
    h1: "Idées de tartines : recettes faciles pour le petit déjeuner, le déjeuner et l'apéro",
    intro: "Une tartine, c'est un repas complet en dix minutes : du pain, une base crémeuse et une garniture qui change tout. Voici des idées de tartines salées et sucrées, de l'avocat au saumon fumé jusqu'à la ricotta au miel, pour ne plus tourner en rond.",
    tips: "Pour une tartine réussie, grille le pain avant de le garnir et choisis une base qui tient : avocat écrasé, houmous, fromage frais ou beurre de cacahuète. Ajoute ensuite un élément frais (tomate, concombre, fruits) et une touche croquante (noix, graines, herbes).",
    faq: [
      { q: "Quelles garnitures de tartines salées sont les plus rapides ?", a: "L'avocat écrasé avec du citron, le houmous avec des crudités, la mozzarella avec du pesto et le thon avec du yaourt sont prêts en moins de dix minutes, sans cuisson." },
      { q: "Quel pain choisir pour une tartine ?", a: "Un pain complet ou de campagne, assez dense, garde sa tenue une fois garni. Le grille-pain ou la poêle suffit à le rendre croustillant." },
      { q: "Que mettre sur une tartine sucrée ?", a: "Ricotta et fruits rouges, beurre de cacahuète et banane, fromage frais et miel : une protéine ou un corps gras, un fruit et un filet de miel équilibrent le sucre." },
    ],
    test: (r) => named(r, /tartine|toast|bruschetta|croque/i),
  },
  {
    slug: "idees-avocat",
    icon: "🥑",
    label: "Avocat",
    h1: "Idées de recettes à l'avocat : avocado toast, bowls, wraps et plus encore",
    intro: "L'avocat se marie avec presque tout : œuf, saumon, thon, tomates cerises, feta. Des idées de recettes à l'avocat, du classique avocado toast aux wraps et aux bowls, avec des quantités et des étapes claires.",
    tips: "Choisis un avocat qui cède légèrement sous le doigt, écrase-le avec un peu de jus de citron pour qu'il ne noircisse pas, et assaisonne généreusement. Il se garde mieux entier : ne l'ouvre que juste avant de servir.",
    faq: [
      { q: "Comment réussir un avocado toast ?", a: "Grille bien le pain, écrase l'avocat avec du citron, du sel et du poivre, puis ajoute une garniture : œuf, tomates cerises et feta, saumon fumé ou graines." },
      { q: "Comment éviter que l'avocat noircisse ?", a: "Ajoute du jus de citron, couvre-le au contact avec un film et consomme-le dans la journée. Garde le noyau dans la préparation s'il en reste." },
      { q: "Peut-on cuisiner l'avocat ?", a: "On le mange surtout cru : en tartine, en bowl, en wrap ou en guacamole. Chauffé, il devient amer, donc on l'ajoute en fin de recette." },
    ],
    test: (r) => has(r, /avocat/i),
  },
  {
    slug: "idees-poulet",
    icon: "🍗",
    label: "Poulet",
    h1: "Idées de recettes au poulet : plats faciles pour toute la semaine",
    intro: "Le poulet est l'ingrédient le plus polyvalent du frigo : poêlé, mijoté, au four ou en wrap, il se prête à toutes les cuisines. Voici des idées de plats au poulet simples, avec des ingrédients de supermarché et des étapes courtes.",
    tips: "Coupe le poulet en morceaux réguliers pour qu'il cuise uniformément, fais-le dorer avant d'ajouter la sauce et vérifie qu'il n'est plus rosé à cœur. Les blancs cuisent vite, les cuisses supportent mieux le mijotage.",
    faq: [
      { q: "Quelles recettes de poulet sont les plus rapides ?", a: "Les poêlées, les sautés et les wraps : compte vingt à trente minutes en coupant le poulet en petits morceaux." },
      { q: "Quelle sauce pour accompagner du poulet ?", a: "Une sauce moutarde, tomate-basilic, crème-parmesan ou lait de coco et curry transforme le même poulet en quatre plats différents." },
      { q: "Quel accompagnement avec le poulet ?", a: "Du riz, des pâtes, de la semoule ou des pommes de terre pour les féculents, et une poêlée de légumes de saison pour équilibrer l'assiette." },
    ],
    test: (r) => has(r, /poulet/i),
  },
  {
    slug: "idees-poulet-pates-sauce",
    icon: "🍝",
    label: "Poulet, pâtes et sauce",
    h1: "Idées poulet, pâtes et sauce : crémeuse, tomate, pesto ou champignons",
    intro: "Du poulet, des pâtes et une bonne sauce : la combinaison qui sauve la semaine. Voici des idées de plats de pâtes en sauce, avec ou sans poulet, crémeux, à la tomate, au pesto ou aux champignons, prêts en moins de trente minutes.",
    tips: "Garde un peu d'eau de cuisson des pâtes : une louche mélangée à la sauce la rend onctueuse et la fait adhérer. Fais dorer le poulet d'abord, déglace avec la sauce, puis ajoute les pâtes égouttées dans la poêle.",
    faq: [
      { q: "Comment faire une sauce crémeuse pour des pâtes au poulet ?", a: "Fais revenir oignon et ail, ajoute de la crème liquide et du parmesan, laisse réduire cinq minutes, puis mélange avec les pâtes et un peu d'eau de cuisson." },
      { q: "Quelle sauce sans crème pour des pâtes ?", a: "Une sauce tomate-basilic, un pesto de courgettes ou une sauce aux champignons et à l'ail donnent un résultat savoureux sans crème." },
      { q: "Combien de pâtes par personne ?", a: "Compte environ 80 g de pâtes crues par adulte, un peu plus si le plat est principal et sans entrée." },
    ],
    test: (r) => (r.category === "Pâtes" && (has(r, /poulet|crème|crémeu|sauce|tomate|pesto|champignon/i))) || (has(r, /poulet/i) && has(r, /pâtes|spaghetti|penne|gnocchi|nouilles/i)),
  },
  {
    slug: "idees-pates",
    icon: "🍝",
    label: "Pâtes",
    h1: "Idées de recettes de pâtes faciles : carbonara, pesto, tomate, gratin et lasagnes",
    intro: "Des idées de pâtes pour tous les soirs : classiques italiens, versions végétariennes, gratins et lasagnes. Chaque recette précise les quantités par personne et le temps réel de préparation.",
    tips: "Sale l'eau de cuisson quand elle bout, goûte une minute avant la fin du temps indiqué et ne rince jamais les pâtes chaudes : l'amidon aide la sauce à tenir.",
    faq: [
      { q: "Quelle recette de pâtes est la plus rapide ?", a: "Les pâtes à la tomate et au basilic, ou au thon, se préparent en vingt minutes avec des ingrédients de placard." },
      { q: "Quelles pâtes végétariennes essayer ?", a: "Pâtes pesto courgettes, pâtes crémeuses aux champignons, one pot épinards-tomates ou lasagnes épinards-ricotta." },
      { q: "Comment éviter que les pâtes collent ?", a: "Utilise beaucoup d'eau bouillante salée, remue dans la première minute et mélange aussitôt à la sauce après les avoir égouttées." },
    ],
    test: (r) => r.category === "Pâtes",
  },
  {
    slug: "idees-petit-dejeuner",
    icon: "🥞",
    label: "Petit déjeuner",
    h1: "Idées de petit déjeuner : tartines, porridge, pancakes et smoothies",
    intro: "Des idées de petit déjeuner salées ou sucrées, prêtes en dix à vingt minutes : tartines, porridge à la banane, pancakes, flocons d'avoine et smoothies. De quoi varier sans y passer la matinée.",
    tips: "Prépare la veille ce qui peut l'être : flocons d'avoine au yaourt, pâte à pancakes ou fruits coupés. Associe un féculent, une protéine et un fruit pour tenir jusqu'au déjeuner.",
    faq: [
      { q: "Quel petit déjeuner est rapide et rassasiant ?", a: "Un porridge à la banane ou des flocons d'avoine au yaourt et aux fruits se préparent en cinq minutes et tiennent plusieurs heures." },
      { q: "Quelles idées de petit déjeuner salé ?", a: "Toast avocat et œuf, tartine saumon et avocat ou œufs brouillés sur du pain complet remplacent avantageusement les céréales sucrées." },
      { q: "Peut-on préparer le petit déjeuner à l'avance ?", a: "Oui : le porridge froid (overnight oats), les muffins et la pâte à pancakes se conservent au frigo jusqu'au lendemain." },
    ],
    test: (r) => r.category === "Petit déjeuner",
  },
  {
    slug: "idees-rapides",
    icon: "⚡",
    label: "Rapides",
    h1: "Idées de repas rapides : recettes prêtes en 20 minutes ou moins",
    intro: "Pas le temps de cuisiner ? Voici des idées de repas rapides, prêtes en vingt minutes ou moins, avec peu d'ingrédients et sans technique compliquée.",
    tips: "Prévois les ingrédients la veille avec ta liste de courses, utilise une seule poêle ou casserole et choisis des légumes qui cuisent vite (courgettes, tomates, épinards).",
    faq: [
      { q: "Quel repas préparer en 15 minutes ?", a: "Une omelette aux champignons, des pâtes au pesto, une tartine garnie ou un wrap se préparent en un quart d'heure." },
      { q: "Comment gagner du temps en semaine ?", a: "Planifie ton menu le week-end, cuisine une base en double (riz, légumes rôtis) et garde des conserves de base : thon, tomates concassées, légumineuses." },
      { q: "Peut-on manger équilibré avec des repas rapides ?", a: "Oui, en associant un féculent, une protéine et des légumes, même simples : c'est le trio qui fait l'assiette équilibrée." },
    ],
    test: (r) => total(r) <= 20,
  },
  {
    slug: "idees-vegetarien",
    icon: "🥦",
    label: "Végétarien",
    h1: "Idées de recettes végétariennes faciles : curry, dahl, gratins et bowls",
    intro: "Des idées de recettes végétariennes qui rassasient vraiment : curry de pois chiches, dahl de lentilles, gratins, galettes et bowls. Simples, économiques et pleines de goût.",
    tips: "Pour rassasier sans viande, combine légumineuses et céréales (lentilles et riz, pois chiches et semoule), ajoute des épices et un élément gras comme le lait de coco ou l'huile d'olive.",
    faq: [
      { q: "Comment avoir assez de protéines sans viande ?", a: "Les lentilles, pois chiches, haricots, œufs, tofu et fromages en apportent. Les associer à une céréale complète couvre bien les besoins." },
      { q: "Quelle recette végétarienne pour débuter ?", a: "Le dahl de lentilles corail et le curry de pois chiches sont faciles, économiques et se préparent en une seule casserole." },
      { q: "Les plats végétariens sont-ils plus économiques ?", a: "Souvent oui : les légumineuses sèches ou en conserve coûtent peu et remplacent la viande dans de nombreux plats." },
    ],
    test: (r) => r.category === "Végétarien",
  },
  {
    slug: "idees-etudiant",
    icon: "🎓",
    label: "Étudiant",
    h1: "Idées de repas étudiants pas chers : simples, rapides et sans four",
    intro: "Des idées de recettes pour étudiants : peu d'ingrédients, un budget serré, vingt-cinq minutes maximum et pas besoin de four. Idéal en studio ou en colocation.",
    tips: "Cuisine pour deux repas et garde les portions au frigo, achète les féculents en gros paquets et complète avec des légumes surgelés nature : peu chers et prêts à l'emploi.",
    faq: [
      { q: "Que cuisiner avec un petit budget ?", a: "Pâtes, riz, œufs, lentilles et légumes de saison donnent de nombreux repas à moins de deux euros la portion." },
      { q: "Comment cuisiner sans four ?", a: "Poêle et casserole suffisent : sautés, one pot, omelettes, poêlées et soupes couvrent la plupart des besoins." },
      { q: "Comment éviter le gaspillage en colocation ?", a: "Planifie les repas de la semaine, partage une liste de courses commune et note qui achète quoi pour ne pas acheter deux fois la même chose." },
    ],
    test: (r) => r.difficulty === "Facile" && total(r) <= 25 && r.ingredients.length <= 7 && !r.utensils.includes("four"),
  },
  {
    slug: "idees-apero",
    icon: "🥂",
    label: "Apéro",
    h1: "Idées d'apéro facile : tartinades, bruschettas et petites bouchées maison",
    intro: "Des idées d'apéritif faciles à préparer à l'avance : houmous, guacamole, tzatziki, bruschettas et tartines chèvre-miel. Peu d'ingrédients, beaucoup d'effet.",
    tips: "Prépare les tartinades la veille, grille le pain au dernier moment et sers le tout sur une grande planche : trois sauces et deux supports suffisent pour un apéro réussi.",
    faq: [
      { q: "Que préparer pour un apéro à l'avance ?", a: "Houmous, guacamole, tzatziki et tapenade se préparent la veille. Seul le pain grillé se fait au dernier moment." },
      { q: "Combien compter par personne pour un apéro ?", a: "Environ cinq à huit bouchées par personne pour un apéro avant un repas, le double pour un apéro dînatoire." },
      { q: "Quel apéro végétarien rapide ?", a: "Houmous maison, tzatziki, bruschetta tomate-basilic et tartines chèvre-miel-noix sont rapides et sans viande." },
    ],
    test: (r) => r.category === "Apéritif",
  },
  {
    slug: "idees-salades",
    icon: "🥗",
    label: "Salades",
    h1: "Idées de salades repas : grecque, quinoa, lentilles, pâtes et taboulé",
    intro: "Des idées de salades complètes qui font un vrai repas : salade grecque, quinoa et pois chiches, lentilles et feta, pâtes tomate-mozzarella, taboulé. Parfaites à emporter.",
    tips: "Pour une salade repas, ajoute un féculent (quinoa, pâtes, lentilles), une protéine (thon, œuf, feta, pois chiches), des légumes croquants et une vinaigrette maison.",
    faq: [
      { q: "Comment faire une salade qui cale ?", a: "Ajoute des légumineuses ou des céréales, une protéine et un peu de fromage ou de noix. La vinaigrette à l'huile d'olive apporte les bons gras." },
      { q: "Quelle salade se prépare à l'avance ?", a: "Le taboulé, les salades de lentilles, de quinoa et de pâtes sont meilleures après quelques heures au frais. Ajoute les herbes au dernier moment." },
      { q: "Comment réussir sa vinaigrette ?", a: "Une cuillère de moutarde, trois d'huile d'olive, une de vinaigre ou de citron, sel et poivre : mélange au fouet pour une émulsion stable." },
    ],
    test: (r) => r.category === "Salade",
  },
  {
    slug: "idees-poisson",
    icon: "🐟",
    label: "Poisson",
    h1: "Idées de recettes de poisson : au four, en papillote et poêlés",
    intro: "Des idées de poisson simples, au four, en papillote ou à la poêle : saumon citron-herbes, cabillaud aux tomates, crevettes à l'ail. Rapides et sans odeur persistante.",
    tips: "Le poisson cuit vite : préchauffe le four, ne le laisse pas plus de douze à quinze minutes et sors-le quand la chair se détache à la fourchette. La papillote garde le moelleux.",
    faq: [
      { q: "Quel poisson choisir pour débuter ?", a: "Le saumon et le cabillaud sont tolérants à la cuisson et se marient avec presque tous les légumes." },
      { q: "Comment cuire le poisson sans odeur ?", a: "Cuis-le au four, en papillote ou à la vapeur, aère la pièce et évite de le faire frire." },
      { q: "Peut-on utiliser du poisson surgelé ?", a: "Oui : décongèle-le au frigo la veille, sèche-le bien avant la cuisson et assaisonne au dernier moment." },
    ],
    test: (r) => r.category === "Poisson" || has(r, /saumon|cabillaud|thon|crevette/i),
  },
  {
    slug: "idees-desserts",
    icon: "🍫",
    label: "Desserts",
    h1: "Idées de desserts faciles : gâteau au yaourt, moelleux, cookies et compotes",
    intro: "Des idées de desserts simples à faire à la maison : gâteau au yaourt, moelleux au chocolat, cookies, crêpes, riz au lait. Des recettes sans matériel particulier.",
    tips: "Pèse les ingrédients, préchauffe le four et ne l'ouvre pas pendant la première moitié de la cuisson. Un gâteau est cuit quand la lame d'un couteau en ressort sèche.",
    faq: [
      { q: "Quel dessert faire quand on débute ?", a: "Le gâteau au yaourt se mesure avec le pot, sans balance. La compote maison et la salade de fruits sont encore plus simples." },
      { q: "Comment alléger un dessert ?", a: "Réduis le sucre d'un tiers, remplace une partie du beurre par du yaourt ou de la compote et ajoute des fruits." },
      { q: "Quels desserts se conservent le mieux ?", a: "Cookies et gâteaux se gardent plusieurs jours en boîte hermétique. Les desserts au lait se consomment sous deux jours au frais." },
    ],
    test: (r) => r.category === "Dessert",
  },
  {
    slug: "idees-soupes",
    icon: "🍲",
    label: "Soupes",
    h1: "Idées de soupes et veloutés : recettes réconfortantes et économiques",
    intro: "Des idées de soupes et veloutés simples : carottes au lait de coco, potimarron, courgettes au fromage, minestrone. Faciles à congeler et parfaites pour les soirs d'hiver.",
    tips: "Cuis les légumes dans juste assez d'eau pour les couvrir, mixe en gardant un peu de liquide de côté et rectifie l'assaisonnement à la fin. Une cuillère de crème ou d'huile d'olive donne de l'onctuosité.",
    faq: [
      { q: "Comment rendre un velouté plus onctueux ?", a: "Ajoute une pomme de terre à la cuisson, mixe longuement et termine avec un peu de crème, de lait de coco ou de fromage frais." },
      { q: "Peut-on congeler une soupe ?", a: "Oui, jusqu'à trois mois. Laisse-la refroidir, congèle-la en portions et réchauffe doucement en remuant." },
      { q: "Quelle soupe est la plus rassasiante ?", a: "Le minestrone, avec ses légumineuses et ses pâtes, ou un velouté accompagné de pain grillé et de fromage." },
    ],
    test: (r) => r.category === "Soupe",
  },
  {
    slug: "idees-oeufs",
    icon: "🥚",
    label: "Œufs",
    h1: "Idées de recettes aux œufs : omelettes, shakshuka, quiches et tortilla",
    intro: "L'œuf est l'ingrédient de dépannage idéal. Des idées d'omelettes, de shakshuka, de quiches, de tortilla et de tartines à l'œuf, prêtes en moins de trente minutes.",
    tips: "Casse les œufs dans un bol avant de les verser, cuis à feu moyen pour qu'ils restent moelleux et assaisonne à la fin de la cuisson. Un œuf frais coule au fond d'un verre d'eau.",
    faq: [
      { q: "Quelle recette rapide avec des œufs ?", a: "Une omelette aux champignons ou un œuf cocotte se préparent en dix minutes avec ce qu'on a dans le frigo." },
      { q: "Combien d'œufs par personne ?", a: "Compte deux œufs par personne pour une omelette ou un plat principal, un seul s'ils accompagnent d'autres ingrédients." },
      { q: "Comment réussir une omelette moelleuse ?", a: "Bats les œufs sans excès, cuis dans une poêle chaude beurrée à feu moyen et replie l'omelette quand le dessus est encore légèrement baveux." },
    ],
    test: (r) => has(r, /œuf|oeuf/i) && !named(r, /gâteau|moelleux|cookies|crêpes|pancakes/i),
  },
  {
    slug: "idees-legumineuses",
    icon: "🫘",
    label: "Lentilles et pois chiches",
    h1: "Idées de recettes aux lentilles et aux pois chiches : économiques et riches en protéines",
    intro: "Lentilles, pois chiches, haricots rouges : des légumineuses peu chères, riches en protéines et en fibres. Des idées de dahl, curry, salades, falafels et burritos pour les cuisiner autrement.",
    tips: "Les légumineuses en conserve se rincent et se réchauffent en cinq minutes. À sec, les lentilles corail cuisent en quinze minutes sans trempage : idéales pour un dahl.",
    faq: [
      { q: "Faut-il faire tremper les lentilles ?", a: "Non, pas les lentilles : elles cuisent en quinze à trente minutes selon la variété. Seuls les pois chiches secs demandent un trempage de plusieurs heures." },
      { q: "Quelle recette de lentilles est la plus simple ?", a: "Le dahl de lentilles corail : lentilles, lait de coco, épices et tomates dans une seule casserole en vingt minutes." },
      { q: "Pois chiches en conserve ou secs ?", a: "Ceux en conserve sont prêts à l'emploi et suffisent à la plupart des recettes. Les secs coûtent moins cher mais demandent du temps." },
    ],
    test: (r) => has(r, /lentille|pois chiche|haricot|falafel|houmous/i),
  },
];

export function ideaRecipes(idea: Idea): MarketingRecipe[] {
  return RECIPES.filter(idea.test);
}

export function getIdea(slug: string) {
  return IDEAS.find((i) => i.slug === slug) ?? null;
}

/** Idées qui contiennent cette recette (pour les liens croisés). */
export function ideasOf(recipe: MarketingRecipe) {
  return IDEAS.filter((i) => i.test(recipe));
}
