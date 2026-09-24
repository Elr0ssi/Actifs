import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { ListRow, ItemLocation } from "@/lib/types";
import { createList, addItemLocation, deleteItemLocation } from "@/app/app/lists/actions";

export const metadata: Metadata = { title: "Listes" };

const TYPE_LABEL: Record<string, string> = { generic: "Générale", shopping: "Courses", recipe: "Recette" };

export default async function ListsPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: lists }, { data: locations }] = await Promise.all([
    supabase.from("lists").select("*, list_items(checked)").eq("household_id", householdId).order("created_at", { ascending: false }),
    supabase.from("item_locations").select("*").eq("household_id", householdId).order("item_label").returns<ItemLocation[]>(),
  ]);

  type ListWithItems = ListRow & { list_items: { checked: boolean }[] };
  const typedLists = (lists ?? []) as unknown as ListWithItems[];
  const byCategory = new Map<string, ListWithItems[]>();
  for (const l of typedLists) {
    const cat = l.category || "Général";
    byCategory.set(cat, [...(byCategory.get(cat) ?? []), l]);
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Listes</h1>
          <p className="mt-1 text-sm text-slate-500">Courses, notes partagées, checklists — organisées par catégorie.</p>
        </div>
        <Link href="/app/lists/recipes" className="btn-secondary">🍽️ Mes recettes</Link>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouvelle liste</h2>
        <form action={createList} className="flex flex-wrap items-center gap-2">
          <input name="name" placeholder="Ex. Courses de la semaine" className="input flex-1 min-w-[200px]" required />
          <input name="category" placeholder="Catégorie (ex. Courses)" className="input w-52" />
          <select name="type" className="input w-40" defaultValue="shopping">
            <option value="shopping">Courses</option>
            <option value="generic">Générale</option>
          </select>
          <button className="btn-primary">Créer</button>
        </form>
      </div>

      <div className="space-y-6">
        {typedLists.length === 0 && <p className="text-sm text-slate-400">Aucune liste pour l'instant.</p>}
        {[...byCategory.entries()].map(([category, ls]) => (
          <section key={category}>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">{category}</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {ls.map((l) => {
                const total = l.list_items.length;
                const done = l.list_items.filter((i) => i.checked).length;
                return (
                  <Link key={l.id} href={`/app/lists/${l.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-slate-900">{l.name}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{TYPE_LABEL[l.type]}</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
                      <div className="h-1.5 rounded-full bg-brand-500" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
                    </div>
                    <p className="mt-2 text-xs text-slate-400">{done}/{total} articles cochés</p>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      <section className="card p-6">
        <h2 className="mb-1 font-semibold text-slate-900">Emplacements habituels</h2>
        <p className="mb-4 text-sm text-slate-500">Note où tu trouves habituellement certains articles.</p>
        <form action={addItemLocation} className="mb-4 flex flex-wrap items-center gap-2">
          <input name="item_label" placeholder="Article (ex. Fromage de chèvre)" className="input flex-1 min-w-[180px]" required />
          <input name="store_name" placeholder="Magasin (ex. Monoprix Montparnasse)" className="input flex-1 min-w-[180px]" required />
          <input name="note" placeholder="Note (optionnel)" className="input flex-1 min-w-[150px]" />
          <button className="btn-secondary">Ajouter</button>
        </form>
        <div className="grid gap-2 sm:grid-cols-2">
          {(locations ?? []).map((loc) => (
            <div key={loc.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-slate-800">{loc.item_label}</span>
                <span className="text-slate-400"> → {loc.store_name}</span>
              </span>
              <form action={deleteItemLocation.bind(null, loc.id)}>
                <button className="text-xs text-slate-400 hover:text-rose-600">✕</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
