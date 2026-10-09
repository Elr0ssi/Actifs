// Détecte les photos de plats déposées dans public/recettes/ (nom du fichier = identifiant de la recette, ex. poulet-basquaise.png)
// et génère lib/marketing/recipe-images.generated.ts. Lancé automatiquement avant `npm run build` et `npm run dev`.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

const dir = join(process.cwd(), "public", "recettes");
const exts = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);
const map = {};
if (existsSync(dir)) {
  for (const f of readdirSync(dir).sort()) {
    if (exts.has(extname(f).toLowerCase())) map[basename(f, extname(f))] = `/recettes/${f}`;
  }
}
const body = `// Fichier généré par scripts/recipe-images.mjs : ne pas modifier à la main.\nexport const RECIPE_IMAGES: Record<string, string> = ${JSON.stringify(map, null, 2)};\n`;
writeFileSync(join(process.cwd(), "lib", "marketing", "recipe-images.generated.ts"), body);
console.log(`Photos de recettes détectées : ${Object.keys(map).length}`);
