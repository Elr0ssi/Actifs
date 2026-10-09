// FAQ générée pour chaque recette : des questions que les gens tapent vraiment (temps, ingrédients, accompagnement, conservation…).
// Les phrases sont des modèles traduits, remplis avec les données de la recette.
import type { MarketingRecipe } from "@/lib/marketing/recipes";
import { BASIC_UTENSILS } from "@/lib/marketing/recipes";

type Tr = (key: string, vars?: Record<string, string | number>) => string;

const WITH: Record<string, string> = {
  Rapide: "Une salade verte ou des crudités suffisent, avec un féculent (riz, pâtes, pain) si le plat est léger.",
  Viande: "Un féculent (riz, pommes de terre, semoule ou pâtes) et des légumes de saison équilibrent l'assiette.",
  Poisson: "Du riz, des pommes de terre vapeur ou de la semoule, avec des légumes verts ou une salade, et un filet de citron.",
  Pâtes: "Une salade verte, du parmesan râpé et un peu de pain suffisent pour un repas complet.",
  Riz: "Des légumes sautés ou une salade fraîche, et une protéine (œuf, poulet, tofu) si tu veux un plat plus complet.",
  Végétarien: "Du riz ou de la semoule, et du pain ou du yaourt nature pour adoucir les épices.",
  Salade: "Du pain croustillant et un fruit ou un yaourt en dessert : la salade suffit pour un déjeuner complet.",
  Soupe: "Du pain grillé, du fromage râpé ou une tartine pour faire un repas complet.",
  Gratin: "Une salade verte vinaigrée allège le plat et apporte du croquant.",
  Tarte: "Une salade verte assaisonnée d'une vinaigrette à la moutarde.",
  Apéritif: "Du pain grillé, des crudités et deux ou trois tartinades différentes pour composer une planche.",
  "Petit déjeuner": "Un fruit frais, un yaourt ou une boisson chaude complètent le petit déjeuner.",
  Dessert: "Un thé, un café ou une boule de glace vanille, selon le dessert.",
};

const KEEP: Record<string, string> = {
  Rapide: "Il se déguste de préférence tout de suite. Les restes se gardent un jour au frigo dans une boîte fermée.",
  Viande: "Oui : 2 à 3 jours au frigo, et jusqu'à 3 mois au congélateur pour les plats mijotés. Décongèle au frigo la veille.",
  Poisson: "Il se garde un jour au frigo. Évite de congeler un poisson déjà cuit, dont la texture devient sèche.",
  Pâtes: "Les restes se gardent 2 jours au frigo. Les plats en sauce et les lasagnes se congèlent bien.",
  Riz: "Refroidis le riz rapidement et garde-le au frigo 1 à 2 jours maximum. Réchauffe-le bien chaud.",
  Végétarien: "Oui : les plats de légumineuses et de légumes se gardent 3 jours au frigo et se congèlent très bien.",
  Salade: "Prépare les ingrédients à l'avance, mais ajoute la vinaigrette et les herbes au dernier moment pour garder le croquant.",
  Soupe: "Oui : 3 jours au frigo et jusqu'à 3 mois au congélateur, en portions.",
  Gratin: "Oui : 2 à 3 jours au frigo, et il se congèle avant ou après cuisson. Réchauffe-le au four.",
  Tarte: "Elle se garde 2 jours au frigo et se réchauffe au four. La pâte se congèle crue.",
  Apéritif: "Les tartinades se préparent la veille et se gardent 2 à 3 jours au frigo; ajoute les éléments croquants au dernier moment.",
  "Petit déjeuner": "Les préparations (pâte, porridge, flocons d'avoine) se font la veille; les tartines et toasts se mangent aussitôt.",
  Dessert: "La plupart se gardent 2 à 3 jours dans une boîte hermétique; les cookies et gâteaux se congèlent bien.",
};

export function recipeFaq(r: MarketingRecipe, tr: Tr): { q: string; a: string }[] {
  const name = tr(r.name);
  const total = r.prepMinutes + r.cookMinutes;
  const out: { q: string; a: string }[] = [
    {
      q: tr("Combien de temps faut-il pour préparer {name} ?", { name }),
      a: r.cookMinutes > 0
        ? tr("Compte {total} minutes en tout : {prep} minutes de préparation et {cook} minutes de cuisson, pour {servings} personnes.", { total, prep: r.prepMinutes, cook: r.cookMinutes, servings: r.servings })
        : tr("Compte {total} minutes en tout, sans cuisson, pour {servings} personnes.", { total, servings: r.servings }),
    },
    { q: tr("Quels ingrédients faut-il pour {name} ?", { name }), a: tr("Pour {servings} personnes, il te faut : {list}.", { servings: r.servings, list: r.ingredients.map((i) => tr(i)).join(", ") }) },
  ];
  const tools = r.utensils.filter((u) => !BASIC_UTENSILS.includes(u));
  if (tools.length) out.push({ q: tr("Quels ustensiles faut-il pour {name} ?", { name }), a: tr("Tu auras besoin de : {list}.", { list: tools.map((u) => tr(u)).join(", ") }) });
  out.push(
    { q: tr("Comment adapter {name} à un autre nombre de personnes ?", { name }), a: tr("La recette est prévue pour {servings} personnes. Multiplie ou divise chaque quantité par le même rapport, ou laisse Flozea le faire : change le nombre de personnes et la liste de courses se recalcule.", { servings: r.servings }) },
    { q: tr("{name} est-il facile à réussir ?", { name }), a: r.difficulty === "Facile" ? tr("Oui, c'est une recette facile : les étapes sont courtes et ne demandent aucune technique particulière.") : tr("C'est une recette de niveau moyen : prévois un peu d'attention pendant la cuisson, mais rien de compliqué.") },
  );
  if (WITH[r.category]) out.push({ q: tr("Par quoi accompagner {name} ?", { name }), a: tr(WITH[r.category]) });
  if (KEEP[r.category]) out.push({ q: tr("Peut-on préparer {name} à l'avance ou le congeler ?", { name }), a: tr(KEEP[r.category]) });
  out.push({ q: tr("Comment obtenir la liste de courses de {name} ?", { name }), a: tr("Dans Flozea, ouvre la recette, choisis le nombre de personnes et ajoute-la à ta liste : les quantités sont fusionnées avec tes autres recettes et classées par rayon.") });
  return out;
}
