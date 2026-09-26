import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { loadCatalog } from "@/lib/data/ingredients";
import { STORES } from "@/lib/shopping";
import { createPersonalIngredient } from "@/app/app/lists/actions";
import { IngredientsTable } from "@/components/app/lists/ingredients-table";

export const metadata: Metadata = { title: "Ingrédients & prix" };

export default async function IngredientsPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { catalog, prices } = await loadCatalog(ctx.supabase);

  return (
    <div className="space-y-6">
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ingrédients & prix</h1>
        <p className="mt-1 text-sm text-slate-500">
          Base de référence pré-remplie (prix indicatifs par enseigne). Tes ajouts et tes prix restent personnels à ton foyer.
        </p>
      </div>

      <form action={createPersonalIngredient} className="card grid gap-2 p-4 sm:grid-cols-[1fr_130px_160px_110px_auto]">
        <input name="name" placeholder="Nouvel ingrédient (ex. Gnocchis)" className="input" required />
        <select name="unit" defaultValue="unit" className="input">
          <option value="unit">Prix à l'unité</option>
          <option value="kg">Prix au kilo</option>
            <option value="l">Prix au litre</option>
        </select>
        <select name="store" defaultValue="" className="input">
          <option value="">Enseigne (optionnel)</option>
          {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="price" inputMode="decimal" placeholder="Prix €" className="input" />
        <button className="btn-primary">Ajouter</button>
      </form>

      <IngredientsTable catalog={catalog} prices={prices} />
    </div>
  );
}
