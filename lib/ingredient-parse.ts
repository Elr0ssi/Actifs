import { intlLocale } from "@/lib/i18n";
// Analyse des lignes d'ingrédients écrites en texte libre ("320 g pâtes", "4 cuisses de poulet", "2 c. à soupe huile d'olive")
// pour en tirer une quantité, une unité et un nom, puis les rapprocher du catalogue (prix) et les mettre à l'échelle.
import type { CatalogIngredient, IngredientUnit, QtyUnit } from "@/lib/shopping";

export interface ParsedLine {
  qty: number | null;
  unit: QtyUnit;
  name: string;
}

const FRACTIONS: Record<string, number> = { "½": 0.5, "¼": 0.25, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3 };

function parseNumber(token: string): number | null {
  const t = token.trim();
  if (FRACTIONS[t] !== undefined) return FRACTIONS[t];
  const mixed = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
  if (mixed) return Number(mixed[1]) + Number(mixed[2]) / Number(mixed[3]);
  const frac = /^(\d+)\/(\d+)$/.exec(t);
  if (frac) return Number(frac[1]) / Number(frac[2]);
  const n = Number(t.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

const UNIT_RE = /^(kg|mg|g|ml|cl|dl|l|litres?|grammes?|c\.?\s*à\s*(?:soupe|s|café|c)\.?|cuill[eè]res?\s+à\s+(?:soupe|café))(?=\s|$|\.)\s*/i;

/** "320 g pâtes" → 320 g « pâtes » ; "1 oignon" → 1 u « oignon » ; "sel" → sans quantité. */
export function parseIngredientLine(text: string): ParsedLine {
  const raw = text.trim().replace(/\s+/g, " ");
  const m = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?|[½¼¾⅓⅔])\s*(.*)$/.exec(raw);
  if (!m) return { qty: null, unit: "u", name: raw };
  let qty = parseNumber(m[1]);
  let rest = m[2];
  if (qty === null) return { qty: null, unit: "u", name: raw };
  let unit: QtyUnit = "u";
  const u = UNIT_RE.exec(rest);
  if (u) {
    const w = u[1].toLowerCase().replace(/\s+/g, "");
    rest = rest.slice(u[0].length);
    if (w === "kg") unit = "kg";
    else if (w === "g" || w.startsWith("gramme") || w === "mg") { unit = "g"; if (w === "mg") qty /= 1000; }
    else if (w === "ml") unit = "ml";
    else if (w === "cl") { unit = "ml"; qty *= 10; }
    else if (w === "dl") { unit = "ml"; qty *= 100; }
    else if (w === "l" || w.startsWith("litre")) unit = "l";
    else if (/soupe|^c\.?às\.?$/.test(w)) { unit = "ml"; qty *= 15; }
    else { unit = "ml"; qty *= 5; } // cuillère à café
    rest = rest.replace(/^(de |d')\s*/i, "");
  }
  return { qty, unit, name: rest.trim() || raw };
}

/* ---------- Rapprochement avec le catalogue ---------- */

const STOP = new Set(["de", "du", "des", "d", "la", "le", "les", "l", "en", "au", "aux", "a", "et", "frais", "fraiche", "fraiches", "frais", "petit", "petite", "petits", "petites", "gros", "grosse", "rape", "rapee", "hache", "hachee", "mou", "cuit", "cuite", "surgele", "surgelee"]);
const CONTAINERS = new Set(["gousse", "tranche", "boite", "sachet", "brique", "bouquet", "pot", "paquet", "filet", "feuille", "brin", "pincee", "botte", "bocal", "tablette", "cube", "bloc"]);

export const foldText = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/œ/g, "oe").replace(/[’']/g, " ");

function tokens(s: string, dropContainers: boolean) {
  const out: string[] = [];
  for (const w of foldText(s).replace(/\bx\d+\b/g, " ").replace(/[^a-z0-9]+/g, " ").split(" ")) {
    if (!w || STOP.has(w) || /^\d+$/.test(w)) continue;
    const sing = w.length > 3 && /[sx]$/.test(w) ? w.slice(0, -1) : w;
    if (dropContainers && CONTAINERS.has(sing)) continue;
    out.push(sing);
  }
  return out;
}

/** Quand le catalogue n'a pas le mot générique, on tente un produit courant équivalent. */
const SYNONYMS: [string, string][] = [
  ["pate", "spaghetti"],
  ["riz", "riz long"],
  ["huile", "huile d'olive vierge extra"],
  ["huile neutre", "huile de tournesol"],
  ["oignon", "oignons jaunes"],
  ["oignon rouge", "oignons jaunes"],
  ["citron", "citrons jaunes"],
  ["oeuf", "oeufs plein air x12"],
  ["ail", "ail"],
  ["tomate concasse", "tomates concassees conserve"],
  ["coulis tomate", "sauce tomate"],
  ["creme liquide", "creme fraiche epaisse 30%"],
  ["creme", "creme fraiche epaisse 30%"],
  ["lait", "lait demi-ecreme"],
  ["beurre", "beurre doux"],
  ["farine", "farine t55"],
  ["sucre", "sucre blanc"],
  ["sel", "sel fin"],
  ["poivre", "poivre noir moulu"],
  ["poivron", "poivron rouge"],
  ["fromage rape", "emmental rape"],
  ["emmental", "emmental rape"],
  ["yaourt nature", "yaourt nature x4"],
  ["bouillon legume", "bouillon cube legumes x12"],
  ["bouillon volaille", "bouillon cube volaille x12"],
  ["poulet", "cuisses de poulet"],
  ["lardon", "lardons fumes"],
  ["champignon", "champignons de paris"],
  ["thon", "thon au naturel"],
  ["moutarde", "moutarde de dijon"],
  ["pomme terre", "pommes de terre"],
  ["parmesan", "parmesan"],
  ["mozzarella", "mozzarella"],
  ["feta", "feta"],
];

export interface MatchResult {
  ingredient: CatalogIngredient;
  /** Nombre de "produits" que représente 1 pièce ("u") quand le catalogue compte au poids ou par lot. */
  score: number;
}

export function buildMatcher(catalog: CatalogIngredient[]) {
  const entries = catalog.map((c) => ({ c, t: tokens(c.name, false) }));
  const byFolded = new Map(catalog.map((c) => [foldText(c.name).replace(/[^a-z0-9]+/g, " ").trim(), c]));
  return (name: string): CatalogIngredient | null => {
    const ti = tokens(name, true);
    if (!ti.length) return null;
    const key = ti.join(" ");
    let best: { c: CatalogIngredient; score: number } | null = null;
    for (const { c, t } of entries) {
      if (!t.length) continue;
      const inter = t.filter((w) => ti.includes(w)).length;
      if (!inter) continue;
      const union = new Set([...t, ...ti]).size;
      let score = inter / union;
      if (t.length === ti.length && inter === t.length) score += 1; // identique
      else if (inter === t.length) score += 0.25; // tout le nom du catalogue est dans la ligne
      if (c.personal) score += 0.05;
      if (!best || score > best.score) best = { c, score };
    }
    if (best && best.score >= 0.6) return best.c;
    for (const [k, target] of SYNONYMS) {
      if (key === k || key.startsWith(`${k} `) || ti.includes(k.split(" ")[0]) && k.split(" ").every((w) => ti.includes(w))) {
        const hit = byFolded.get(target.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9%]+/g, " ").trim()) ?? entries.find((e) => e.t.join(" ") === tokens(target, false).join(" "))?.c;
        if (hit) return hit;
      }
    }
    return best && best.score >= 0.45 ? best.c : null;
  };
}

/** Poids moyen d'une pièce, pour convertir "4 cuisses de poulet" en grammes quand le prix est au kilo. */
const PIECE_GRAMS: [string, number][] = [
  ["cuisse", 250], ["pilon", 130], ["blanc de poulet", 150], ["escalope", 130], ["steak", 125], ["saucisse", 80], ["pave", 140],
  ["poivron", 200], ["oignon", 150], ["echalote", 30], ["tomate", 120], ["carotte", 100], ["pomme de terre", 150], ["courgette", 250],
  ["aubergine", 300], ["citron", 100], ["pomme", 150], ["banane", 120], ["orange", 150], ["poire", 150], ["champignon", 20],
  ["tranche", 35], ["pate feuilletee", 230], ["pate brisee", 230], ["pate a pizza", 250], ["concombre", 300], ["avocat", 200], ["patate", 150], ["poireau", 150], ["radis", 15],
];

export interface CatalogQty {
  qty: number | null;
  unit: QtyUnit;
  /** Vrai si la quantité a dû être arrondie à des lots entiers (œufs, gousses d'ail…). */
  packed?: boolean;
}

/** Ramène (qty, unit) à une unité compatible avec le prix du catalogue (kg / L / pièce). */
export function toCatalogQty(qty: number | null, unit: QtyUnit, name: string, ingredient: CatalogIngredient): CatalogQty {
  if (qty === null) return { qty: null, unit: ingredient.unit === "kg" ? "g" : ingredient.unit === "l" ? "ml" : "u" };
  const family: IngredientUnit = unit === "g" || unit === "kg" ? "kg" : unit === "ml" || unit === "l" ? "l" : "unit";
  const folded = foldText(name);
  if (ingredient.unit === "unit" && unit === "u") {
    // Produits vendus en lot ("x12", "x4") ou en tête d'ail : on arrondit au lot entier.
    const pack = /x\s*(\d+)\s*$/i.exec(ingredient.name);
    if (pack) return { qty: Math.max(1, Math.ceil(qty / Number(pack[1]))), unit: "u", packed: true };
    if (/gousse/.test(folded) && /^ail/.test(foldText(ingredient.name))) return { qty: Math.max(1, Math.ceil(qty / 10)), unit: "u", packed: true };
    return { qty, unit: "u" };
  }
  if (family === ingredient.unit) return { qty, unit };
  if (ingredient.unit === "kg" && unit === "u") {
    const w = PIECE_GRAMS.find(([k]) => folded.includes(k));
    return w ? { qty: Math.round(qty * w[1]), unit: "g" } : { qty, unit: "u" };
  }
  if (ingredient.unit === "unit" && (unit === "g" || unit === "kg" || unit === "ml" || unit === "l")) return { qty: 1, unit: "u", packed: true };
  return { qty, unit };
}

/* ---------- Mise à l'échelle pour un nombre de personnes ---------- */

const trim = (n: number) => String(+n.toFixed(n < 10 ? 2 : 1)).replace(".", ",");

/** Formate une quantité "propre" : 1500 g → 1,5 kg, 0,5 → ½. */
export function formatScaled(qty: number, unit: QtyUnit): string {
  if (unit === "g" && qty >= 1000) return `${trim(qty / 1000)} kg`;
  if (unit === "ml" && qty >= 1000) return `${trim(qty / 1000)} L`;
  if (unit === "u") {
    if (Math.abs(qty - 0.5) < 0.01) return "½";
    if (Math.abs(qty - 0.25) < 0.01) return "¼";
    if (Math.abs(qty - 1.5) < 0.01) return "1½";
    return trim(Math.round(qty * 4) / 4 === qty ? qty : Math.round(qty * 10) / 10);
  }
  return `${trim(unit === "g" ? Math.round(qty) : qty)} ${unit === "l" ? "L" : unit}`;
}

/** "320 g pâtes" × 1.5 → "480 g pâtes". Les lignes sans quantité ("sel, poivre") ne changent pas. */
export function scaleIngredientText(text: string, factor: number): string {
  if (factor === 1) return text;
  const p = parseIngredientLine(text);
  if (p.qty === null) return text;
  // Les cuillères sont converties en ml pour l'analyse : on les remontre en cuillères.
  const spoon = /^\s*[\d.,/½¼¾\s]+(c\.?\s*à\s*(?:soupe|café|s|c)\.?|cuill[eè]res?\s+à\s+(?:soupe|café))/i.exec(text);
  if (spoon) {
    const nq = parseNumber(/^\s*([\d.,/½¼¾\s]+?)\s*(?:c\.|cuill)/i.exec(text)?.[1] ?? "") ;
    if (nq !== null) return text.replace(/^\s*[\d.,/½¼¾\s]+?(?=\s*(?:c\.|cuill))/i, `${trim(Math.round(nq * factor * 4) / 4)} `).replace(/\s{2,}/g, " ");
  }
  return `${formatScaled(p.qty * factor, p.unit)} ${p.name}`.replace(/^½ /, "½ ").trim();
}

export function scaleQuantityLabel(qty: number | null, unit: string | null, factor: number, fallback?: string | null): string | null {
  if (qty === null || qty === undefined) return fallback ?? null;
  return formatScaled(Number(qty) * factor, (unit as QtyUnit) || "u");
}

/**
 * Met à l'échelle une ligne d'ingrédient affichée dans une autre langue que le français
 * (« 320 g pasta » × 1,5 → « 480 g pasta »). Sans traduction, on retombe sur la version française.
 */
export function scaleTranslatedIngredient(label: string, factor: number, tr: (k: string) => string): string {
  const translated = tr(label);
  if (translated === label) return scaleIngredientText(label, factor);
  if (factor === 1) return translated;
  const m = /^(\s*)(\d+(?:[.,]\d+)?|½|¼|¾)(\s*)(kg|ml|cl|g|L|l)?(?![A-Za-zÀ-ÿ])(.*)$/.exec(translated);
  if (!m) return translated;
  const raw = m[2] === "½" ? 0.5 : m[2] === "¼" ? 0.25 : m[2] === "¾" ? 0.75 : parseFloat(m[2].replace(",", "."));
  const unit = m[4];
  let out: string;
  if (unit === "kg") out = formatScaled(raw * 1000 * factor, "g");
  else if (unit === "L" || unit === "l") out = formatScaled(raw * 1000 * factor, "ml");
  else if (unit === "cl") out = formatScaled(raw * 10 * factor, "ml");
  else if (unit === "g" || unit === "ml") out = formatScaled(raw * factor, unit);
  else out = `${new Intl.NumberFormat(intlLocale(), { maximumFractionDigits: 2 }).format(Math.round(raw * factor * 4) / 4)}${unit ? ` ${unit}` : ""}`;
  return `${m[1]}${out}${unit || m[3] ? (unit ? "" : " ") : ""}${m[5].startsWith(" ") || m[5] === "" ? m[5] : ` ${m[5]}`}`.replace(/\s{2,}/g, " ");
}
