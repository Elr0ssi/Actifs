// Formats de vente courants : on n'achète pas 300 g d'oignons mais un filet de 1 kg.
import { foldText } from "@/lib/ingredient-parse";
import type { QtyUnit } from "@/lib/shopping";

interface Rule {
  re: RegExp;
  /** Contenances disponibles en magasin (g ou ml), de la plus petite à la plus grande. */
  sizes: number[];
  label: string;
}

// L'ordre compte : la première règle qui correspond au nom du produit du catalogue s'applique.
const RULES: Rule[] = [
  { re: /tomates? (concassee|pelee)/, sizes: [400], label: "boîte" },
  { re: /tomates? cerise/, sizes: [250, 500], label: "barquette" },
  { re: /concentre de tomate/, sizes: [140], label: "tube" },
  { re: /sauce tomate/, sizes: [400, 680], label: "pot" },
  { re: /^tomate/, sizes: [500, 1000], label: "barquette" },
  { re: /oignon/, sizes: [1000], label: "filet" },
  { re: /echalote/, sizes: [250], label: "filet" },
  { re: /carotte/, sizes: [1000], label: "sachet" },
  { re: /pommes? de terre/, sizes: [1500, 2500], label: "sac" },
  { re: /champignon.*conserve/, sizes: [200, 400], label: "boîte" },
  { re: /champignon/, sizes: [250, 500], label: "barquette" },
  { re: /(pois chiche|haricot|lentille|mais|flageolet|petits pois).*conserve/, sizes: [265, 400], label: "boîte" },
  { re: /(lentille|pois chiche|haricot).*(sec|vert)/, sizes: [500], label: "paquet" },
  { re: /(spaghetti|penne|fusilli|farfalle|tagliatelle|macaroni|coquillette|pate|lasagne)/, sizes: [500], label: "paquet" },
  { re: /(semoule|couscous|boulgour|quinoa|orge|millet|polenta|epeautre|sarrasin)/, sizes: [500], label: "paquet" },
  { re: /^riz/, sizes: [500, 1000], label: "paquet" },
  { re: /farine/, sizes: [1000], label: "paquet" },
  { re: /(sucre glace|maizena|cassonade)/, sizes: [500], label: "paquet" },
  { re: /sucre/, sizes: [1000], label: "paquet" },
  { re: /(sel fin|fleur de sel)/, sizes: [250, 1000], label: "boîte" },
  { re: /poivre/, sizes: [50], label: "pot" },
  { re: /(herbes de provence|cumin|paprika|curry|cannelle|origan|thym|ras el hanout|epice)/, sizes: [30], label: "pot d'épice" },
  { re: /beurre/, sizes: [250], label: "plaquette" },
  { re: /(emmental|fromage|cheddar|gruyere|comte).*rape|rape/, sizes: [200], label: "sachet" },
  { re: /parmesan/, sizes: [100, 200], label: "morceau" },
  { re: /mozzarella/, sizes: [125], label: "boule" },
  { re: /(feta|chevre|ricotta|mascarpone)/, sizes: [150, 200, 250], label: "barquette" },
  { re: /lardons?/, sizes: [200], label: "barquette" },
  { re: /(jambon|bacon)/, sizes: [150], label: "paquet" },
  { re: /lait/, sizes: [1000], label: "brique" },
  { re: /\bcreme\b/, sizes: [200, 500], label: "pot" },
  { re: /huile d.?olive/, sizes: [500, 1000], label: "bouteille" },
  { re: /huile/, sizes: [1000], label: "bouteille" },
  { re: /vinaigre/, sizes: [500], label: "bouteille" },
  { re: /(sauce soja|worcestershire|tabasco)/, sizes: [150, 250], label: "bouteille" },
  { re: /moutarde/, sizes: [200], label: "pot" },
  { re: /(miel|confiture|pesto|mayonnaise|ketchup)/, sizes: [250, 500], label: "pot" },
  { re: /(chocolat|pepites)/, sizes: [100, 200], label: "tablette" },
  { re: /(levure|gelatine)/, sizes: [30], label: "sachet" },
  { re: /(bouillon)/, sizes: [100], label: "boîte" },
  { re: /(jus|boisson|eau)/, sizes: [1000], label: "bouteille" },
];

const fmtSize = (size: number, u: string) => (size >= 1000 ? `${+(size / 1000).toFixed(2)} ${u === "g" ? "kg" : "L"}`.replace(".", ",") : `${size} ${u}`);

export interface PackResult {
  qty: number;
  /** Description du conditionnement retenu, ex. « filet de 1 kg » ; null quand on arrondit simplement. */
  label: string | null;
}

/** Quantité réellement à acheter pour un besoin donné (en g, ml ou pièces) : on monte au conditionnement vendu. */
export function roundToPack(need: number, unit: QtyUnit | string, ingredientName: string): PackResult {
  if (!(need > 0)) return { qty: need, label: null };
  if (unit === "u") return { qty: Math.ceil(need - 1e-9), label: null };
  const u = unit === "kg" ? "g" : unit === "l" ? "ml" : unit;
  const n = unit === "kg" || unit === "l" ? need * 1000 : need;
  if (u !== "g" && u !== "ml") return { qty: need, label: null };
  const name = foldText(ingredientName);
  const rule = RULES.find((r) => r.re.test(name));
  if (rule) {
    let best: { total: number; count: number; size: number } | null = null;
    for (const size of rule.sizes) {
      const count = Math.max(1, Math.ceil(n / size - 1e-9));
      const total = count * size;
      if (!best || total < best.total || (total === best.total && count < best.count)) best = { total, count, size };
    }
    if (best) {
      const one = `${rule.label} de ${fmtSize(best.size, u)}`;
      return { qty: best.total, label: best.count > 1 ? `${best.count} × ${one}` : one };
    }
  }
  // Produit vendu au poids ou en vrac : on arrondit à 50 g / 100 g près.
  const step = n < 500 ? 50 : 100;
  return { qty: Math.ceil(n / step - 1e-9) * step, label: null };
}
