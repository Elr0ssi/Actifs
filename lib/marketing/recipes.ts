// Recettes de démonstration pour le site public. Distinctes des recettes privées de chaque foyer
// (créées dans l'app) — celles-ci sont éditoriales, communes à tous les visiteurs.

export interface MarketingRecipe {
  slug: string;
  name: string;
  icon: string;
  image: string | null;
  category: string;
  tag: string;
  gradient: string;
  time: string;
  servings: number;
  difficulty: "Facile" | "Moyen";
  desc: string;
  ingredients: string[];
  steps: string[];
}

export const CATEGORIES = ["Rapide", "Healthy", "Familial", "Végé", "Batch cooking", "Gourmand"] as const;

export const RECIPES: MarketingRecipe[] = [
  {
    slug: "poulet-basquaise",
    name: "Poulet basquaise",
    icon: "🍗",
    image: null,
    category: "Rapide",
    tag: "35 min",
    gradient: "from-amber-200 to-rose-200",
    time: "35 min",
    servings: 4,
    difficulty: "Facile",
    desc: "Poivrons, tomates et riz mijotés en une seule casserole : un classique familial.",
    ingredients: ["4 cuisses de poulet", "3 poivrons (rouge, jaune, vert)", "2 oignons", "400 g tomates concassées", "200 g riz", "2 gousses d'ail", "Huile d'olive, paprika, thym"],
    steps: [
      "Faire dorer les cuisses de poulet à l'huile d'olive dans une cocotte, réserver.",
      "Faire suer oignons et poivrons émincés 5 min, ajouter l'ail.",
      "Ajouter les tomates concassées, le paprika et le thym, remettre le poulet.",
      "Laisser mijoter 25 min à couvert.",
      "Cuire le riz à part et servir avec la sauce.",
    ],
  },
  {
    slug: "bowl-quinoa-avocat",
    name: "Bowl healthy quinoa",
    icon: "🥗",
    image: null,
    category: "Healthy",
    tag: "20 min",
    gradient: "from-emerald-200 to-lime-200",
    time: "20 min",
    servings: 2,
    difficulty: "Facile",
    desc: "Quinoa, avocat, pois chiches et citron : frais et rassasiant.",
    ingredients: ["150 g quinoa", "1 avocat", "1 boîte de pois chiches", "1 citron", "100 g tomates cerises", "Graines de sésame", "Huile d'olive"],
    steps: [
      "Rincer et cuire le quinoa 15 min, égoutter et laisser tiédir.",
      "Égoutter et rincer les pois chiches.",
      "Couper l'avocat et les tomates cerises.",
      "Assembler dans un bol, arroser de jus de citron et d'huile d'olive.",
      "Parsemer de graines de sésame.",
    ],
  },
  {
    slug: "pates-bolognaise-maison",
    name: "Pâtes bolognaise maison",
    icon: "🍝",
    image: null,
    category: "Familial",
    tag: "45 min",
    gradient: "from-rose-200 to-orange-200",
    time: "45 min",
    servings: 4,
    difficulty: "Facile",
    desc: "Bœuf haché, tomates, carottes et oignons : la vraie recette qui mijote longtemps.",
    ingredients: ["500 g bœuf haché 5% MG", "800 g tomates concassées", "2 carottes", "2 oignons", "2 gousses d'ail", "400 g pâtes", "Herbes de Provence, laurier"],
    steps: [
      "Faire revenir oignons, carottes et ail émincés finement.",
      "Ajouter la viande hachée, bien émietter et colorer.",
      "Verser les tomates concassées, les herbes et le laurier.",
      "Laisser mijoter à couvert 30 min en remuant de temps en temps.",
      "Cuire les pâtes al dente et servir nappées de sauce.",
    ],
  },
  {
    slug: "curry-legumes-coco",
    name: "Curry de légumes",
    icon: "🍲",
    image: null,
    category: "Végé",
    tag: "30 min",
    gradient: "from-yellow-200 to-amber-200",
    time: "30 min",
    servings: 3,
    difficulty: "Facile",
    desc: "Lait de coco, courgettes, pois chiches et riz : doux et parfumé.",
    ingredients: ["400 ml lait de coco", "2 courgettes", "1 boîte de pois chiches", "1 oignon", "2 c.à.s pâte de curry", "200 g riz basmati", "Coriandre fraîche"],
    steps: [
      "Faire revenir l'oignon émincé, ajouter la pâte de curry 1 min.",
      "Ajouter les courgettes en dés et les pois chiches égouttés.",
      "Verser le lait de coco, laisser mijoter 15 min.",
      "Cuire le riz basmati à part.",
      "Servir le curry sur le riz, parsemé de coriandre.",
    ],
  },
  {
    slug: "chili-sin-carne",
    name: "Chili sin carne",
    icon: "🌶️",
    image: null,
    category: "Végé",
    tag: "35 min",
    gradient: "from-red-200 to-rose-200",
    time: "35 min",
    servings: 4,
    difficulty: "Facile",
    desc: "Haricots rouges, maïs et tomates : généreux et sans viande.",
    ingredients: ["2 boîtes de haricots rouges", "1 boîte de maïs", "800 g tomates concassées", "1 poivron rouge", "1 oignon", "2 c.à.c cumin", "Piment doux ou fort au choix"],
    steps: [
      "Faire revenir l'oignon et le poivron émincés.",
      "Ajouter le cumin et le piment, mélanger 1 min.",
      "Ajouter tomates, haricots rouges et maïs égouttés.",
      "Laisser mijoter 25 min à feu doux.",
      "Servir avec du riz ou du pain.",
    ],
  },
  {
    slug: "saumon-teriyaki",
    name: "Saumon teriyaki & riz vinaigré",
    icon: "🍣",
    image: null,
    category: "Healthy",
    tag: "25 min",
    gradient: "from-sky-200 to-cyan-200",
    time: "25 min",
    servings: 2,
    difficulty: "Facile",
    desc: "Pavés de saumon laqués, riz vinaigré, brocolis vapeur.",
    ingredients: ["2 pavés de saumon", "3 c.à.s sauce soja", "2 c.à.s miel", "1 c.à.s vinaigre de riz", "200 g riz rond", "1 tête de brocoli"],
    steps: [
      "Mélanger sauce soja, miel et un peu d'ail pour la marinade.",
      "Faire mariner le saumon 10 min puis cuire à la poêle 4 min de chaque côté.",
      "Cuire le riz, l'assaisonner de vinaigre de riz.",
      "Cuire les brocolis à la vapeur 6 min.",
      "Servir le saumon nappé de sa marinade réduite.",
    ],
  },
  {
    slug: "dahl-lentilles-corail",
    name: "Dahl de lentilles corail",
    icon: "🫘",
    image: null,
    category: "Batch cooking",
    tag: "30 min",
    gradient: "from-orange-200 to-yellow-200",
    time: "30 min",
    servings: 4,
    difficulty: "Facile",
    desc: "Se congèle très bien, parfait pour préparer plusieurs repas d'avance.",
    ingredients: ["300 g lentilles corail", "400 ml lait de coco", "1 oignon", "2 c.à.c curcuma", "1 c.à.c cumin", "400 g tomates concassées", "Épinards frais (optionnel)"],
    steps: [
      "Faire revenir l'oignon avec le curcuma et le cumin.",
      "Ajouter les lentilles rincées, les tomates et le lait de coco.",
      "Laisser mijoter 20 min en remuant régulièrement.",
      "Ajouter les épinards en fin de cuisson.",
      "Répartir en portions et congeler ce qui n'est pas consommé.",
    ],
  },
  {
    slug: "tarte-courgettes-chevre",
    name: "Tarte courgettes & chèvre",
    icon: "🥧",
    image: null,
    category: "Gourmand",
    tag: "40 min",
    gradient: "from-lime-200 to-emerald-200",
    time: "40 min",
    servings: 4,
    difficulty: "Moyen",
    desc: "Pâte feuilletée, courgettes fondantes, bûche de chèvre.",
    ingredients: ["1 pâte feuilletée", "2 courgettes", "1 bûche de chèvre", "2 œufs", "20 cl crème liquide", "Thym"],
    steps: [
      "Préchauffer le four à 200°C, étaler la pâte dans un moule.",
      "Couper les courgettes en fines rondelles, les disposer sur la pâte.",
      "Mélanger œufs et crème, verser sur les courgettes.",
      "Émietter le chèvre par-dessus, parsemer de thym.",
      "Cuire 30 min jusqu'à coloration dorée.",
    ],
  },
];

export function getRecipe(slug: string) {
  return RECIPES.find((r) => r.slug === slug) ?? null;
}
