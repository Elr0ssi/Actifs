import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { createIngredients, deleteIngredient, importIngredientPrices, setIngredientPrice } from "@/app/app/lists/actions";

export const metadata: Metadata = { title: "Ingrédients & prix" };

export default async function IngredientsPage({ searchParams }: { searchParams: { store?: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const hh = profile?.household_id ?? "";

  const [{ data: ingredients }, { data: prices }] = await Promise.all([
    supabase.from("ingredients").select("id, name").eq("household_id", hh).order("name"),
    supabase.from("ingredient_prices").select("ingredient_id, store, price").eq("household_id", hh),
  ]);
  const priceRows = (prices ?? []) as { ingredient_id: string; store: string; price: number }[];
  const stores = [...new Set([...priceRows.map((p) => p.store), ...(searchParams.store ? [searchParams.store] : [])])].sort();
  const price = new Map(priceRows.map((p) => [`${p.ingredient_id}|${p.store}`, Number(p.price)]));

  return (
    <div className="space-y-6">
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Ingrédients & prix</h1>
        <p className="mt-1 text-sm text-slate-500">Ton catalogue d'ingrédients et leur prix habituel par enseigne. Utilisé pour estimer tes listes de courses.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <form action={createIngredients} className="card space-y-2 p-5">
          <p className="label">Ajouter des ingrédients</p>
          <textarea name="names" rows={3} placeholder={"Poivron\nOignon\nBœuf haché"} className="input" required />
          <button className="btn-secondary w-full">Ajouter au catalogue</button>
        </form>
        <form method="get" className="card space-y-2 p-5">
          <p className="label">Ajouter une enseigne</p>
          <input name="store" placeholder="Ex. Monoprix Montparnasse" className="input" required />
          <button className="btn-secondary w-full">Ajouter la colonne</button>
          <p className="text-[11px] text-slate-400">Elle sera enregistrée dès que tu saisis un premier prix.</p>
        </form>
        <form action={importIngredientPrices} className="card space-y-2 p-5">
          <p className="label">Import en masse</p>
          <textarea name="rows" rows={3} placeholder={"Poivron ; Carrefour ; 0,89\nPâtes ; Lidl ; 1,15"} className="input font-mono text-xs" required />
          <button className="btn-secondary w-full">Importer</button>
          <p className="text-[11px] text-slate-400">Une ligne = ingrédient ; enseigne ; prix. Les ingrédients manquants sont créés.</p>
        </form>
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-slate-500">
              <th className="px-4 py-3 font-medium">Ingrédient ({(ingredients ?? []).length})</th>
              {stores.map((st) => <th key={st} className="px-3 py-3 font-medium">{st}</th>)}
              <th className="w-10" />
            </tr>
          </thead>
          <tbody>
            {(ingredients ?? []).length === 0 && (
              <tr><td colSpan={stores.length + 2} className="px-4 py-6 text-slate-400">Aucun ingrédient. Ils sont aussi créés automatiquement depuis tes recettes.</td></tr>
            )}
            {(ingredients ?? []).map((ing) => (
              <tr key={ing.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 font-medium text-slate-800">{ing.name}</td>
                {stores.map((st) => (
                  <td key={st} className="px-3 py-1.5">
                    <form action={setIngredientPrice.bind(null, ing.id, st)} className="flex items-center gap-1">
                      <input name="price" inputMode="decimal" defaultValue={price.get(`${ing.id}|${st}`) ?? ""} placeholder="—" className="w-20 rounded-lg border border-slate-200 px-2 py-1 text-right text-sm focus:border-brand-400 focus:outline-none" />
                      <span className="text-xs text-slate-400">€</span>
                      <button className="text-xs text-brand-600" title="Enregistrer">✓</button>
                    </form>
                  </td>
                ))}
                <td className="px-2">
                  <form action={deleteIngredient.bind(null, ing.id)}>
                    <button className="text-xs text-slate-300 hover:text-rose-600">✕</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
