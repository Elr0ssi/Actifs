/** Outils partagés pour les paiements Apple Pay / Wallet reçus via un Raccourci iPhone. */

/** "12,50 €", "€12.50", "1 234,56", "-8" → nombre. Renvoie null si rien d'exploitable. */
export function parseAmount(raw: unknown): number | null {
  if (typeof raw === "number") return Number.isFinite(raw) ? raw : null;
  if (typeof raw !== "string") return null;
  let s = raw.replace(/[^\d,.\-−]/g, "").replace("−", "-");
  if (!/\d/.test(s)) return null;
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) s = lastComma > lastDot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  else if (lastComma > -1) s = s.replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

const RULES: [RegExp, string][] = [
  [/carrefour|leclerc|auchan|lidl|aldi|intermarch|monoprix|franprix|casino|picard|grand frais|biocoop|naturalia|u express|super u|netto/i, "Alimentation / Courses"],
  [/mcdo|mc donald|burger|kfc|quick|uber ?eats|deliveroo|just ?eat|restaurant|brasserie|bistro|pizz|sushi|boulangerie|paul|starbucks|cafe|café|bar |kebab|tacos/i, "Restaurants / Livraison"],
  [/sncf|ratp|navigo|uber|bolt|total|esso|bp |shell|station|autoroute|vinci|blablacar|trainline|parking|getaround/i, "Transport"],
  [/pharmac|doctolib|dentist|optic|medecin|médecin|hopital|hôpital|laboratoire/i, "Santé"],
  [/zara|h&m|h & m|kiabi|decathlon|uniqlo|nike|adidas|primark|celio|jules|vinted|shein|asos/i, "Habillement"],
  [/cinema|cinéma|ugc|pathe|pathé|netflix|spotify|steam|fnac|cultura|theatre|théâtre|concert|ticketmaster|billetterie/i, "Sorties & loisirs"],
  [/ikea|leroy merlin|castorama|brico|but |conforama|maison du monde|darty|boulanger/i, "Maison"],
];

export function guessCategory(merchant: string) {
  for (const [re, cat] of RULES) if (re.test(merchant)) return cat;
  return "Autre";
}

/** Date et heure "à Paris" au moment de l'appel. */
export function parisNow(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date());
  const [date, time] = parts.split(" ");
  return { date, time };
}
