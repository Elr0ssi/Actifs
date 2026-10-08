import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { loadCatalog } from "@/lib/data/ingredients";
import { STORES } from "@/lib/shopping";
import { createPersonalIngredient } from "@/app/(main)/app/lists/actions";
import { IngredientsTable } from "@/components/app/lists/ingredients-table";

export function generateMetadata(): Metadata {
  return { title: getT()("Ingrédients & prix") };
}

export default async function IngredientsPage() {
  const tr = getT();
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { catalog, prices } = await loadCatalog(ctx.supabase);

  return (
    <div className="space-y-6">
      <p className="text-xs text-stone-500">{tr("Base de référence pré-remplie (prix indicatifs par enseigne). Tes ajouts et tes prix restent personnels à ton foyer.")}</p>

      <form action={createPersonalIngredient} className="card grid gap-2 p-4 sm:grid-cols-[1fr_130px_160px_110px_auto]">
        <input name="name" placeholder={tr("Nouvel ingrédient (ex. Gnocchis)")} className="input" required />
        <select name="unit" defaultValue="unit" className="input">
          <option value="unit">{tr("Prix à l'unité")}</option>
          <option value="kg">{tr("Prix au kilo")}</option>
            <option value="l">{tr("Prix au litre")}</option>
        </select>
        <select name="store" defaultValue="" className="input">
          <option value="">{tr("Enseigne (optionnel)")}</option>
          {STORES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input name="price" inputMode="decimal" placeholder={tr("Prix €")} className="input" />
        <button className="btn-primary">{tr("Ajouter")}</button>
      </form>

      <IngredientsTable catalog={catalog} prices={prices} />
    </div>
  );
}
