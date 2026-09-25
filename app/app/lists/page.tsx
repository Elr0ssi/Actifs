import Link from "next/link";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { ListRow, ItemLocation } from "@/lib/types";
import { formatEUR } from "@/lib/utils";
import { STORES } from "@/lib/shopping";
import { createList, addItemLocation, deleteItemLocation } from "@/app/app/lists/actions";

export const metadata: Metadata = { title: "Listes" };

const TYPE_LABEL: Record<string, string> = { generic: "Générale", shopping: "Courses", recipe: "Recette" };

export default async function ListsPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const [{ data: lists }, { data: locations }] = await Promise.all([
    supabase.from("lists").select("*, list_items(checked, price, count)").eq("household_id", householdId).order("created_at", { ascending: false }),
    supabase.from("item_locations").select("*").eq("household_id", householdId).order("item_label").returns<ItemLocation[]>(),
  ]);

  type ListWithItems = ListRow & { list_items: { checked: boolean; price: number | null; count: number }[] };
  const typedLists = (lists ?? []) as unknown as ListWithItems[];
  const active = typedLists.filter((l) => !l.archived);
  const archived = typedLists.filter((l) => l.archived).sort((x, y) => (y.week_start ?? y.created_at).localeCompare(x.week_start ?? x.created_at));
  const monday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    return d.toISOString().slice(0, 10);
  })();

  const card = (l: ListWithItems) => {
    const total = l.list_items.length;
    const done = l.list_items.filter((i) => i.checked).length;
    const amount = l.list_items.reduce((s, i) => s + (i.price !== null ? Number(i.price) * (i.count || 1) : 0), 0);
    return (
      <Link key={l.id} href={`/app/lists/${l.id}`} className="card block p-5 transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-2">
          <p className="font-semibold text-slate-900">{l.name}</p>
          <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">{TYPE_LABEL[l.type]}</span>
        </div>
        <p className="mt-0.5 text-xs text-slate-400">
          {[l.week_start && `Sem. du ${new Date(`${l.week_start}T00:00:00Z`).toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" })}`, l.store].filter(Boolean).join(" · ")}
        </p>
        <div className="mt-3 h-1.5 w-full rounded-full bg-slate-100">
          <div className="h-1.5 rounded-full bg-brand-500" style={{ width: total ? `${(done / total) * 100}%` : "0%" }} />
        </div>
        <div className="mt-2 flex justify-between text-xs text-slate-400">
          <span>{done}/{total} cochés</span>
          {amount > 0 && <span className="font-medium text-slate-600">{formatEUR(amount)}</span>}
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Listes</h1>
          <p className="mt-1 text-sm text-slate-500">Listes de courses composées depuis tes recettes, et checklists partagées.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/app/lists/recipes" className="btn-secondary">🍽️ Recettes</Link>
          <Link href="/app/lists/ingredients" className="btn-secondary">🏷️ Ingrédients & prix</Link>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">Nouvelle liste de courses</h2>
        <form action={createList} className="grid gap-2 sm:grid-cols-[1fr_170px_200px_auto]">
          <input type="hidden" name="type" value="shopping" />
          <input name="name" placeholder="Nom (ex. Courses semaine 42)" className="input" required />
          <label className="sr-only" htmlFor="week_start">Semaine</label>
          <input id="week_start" name="week_start" type="date" defaultValue={monday} title="Début de la semaine" className="input" />
          <select name="store" defaultValue="" className="input" required>
            <option value="" disabled>Enseigne…</option>
            {STORES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <button className="btn-primary">Créer et choisir les recettes</button>
        </form>
        <form action={createList} className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
          <input type="hidden" name="type" value="generic" />
          <input name="name" placeholder="Ou une liste simple (checklist, notes…)" className="input py-1.5 text-sm" required />
          <button className="btn-secondary py-1.5 text-xs">Créer</button>
        </form>
      </div>

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">En cours</h3>
        {active.length === 0 && <p className="text-sm text-slate-400">Aucune liste en cours.</p>}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{active.map(card)}</div>
      </section>

      {archived.length > 0 && (
        <details className="group">
          <summary className="mb-3 cursor-pointer list-none text-sm font-semibold uppercase tracking-wide text-slate-500">
            <span className="mr-1 inline-block transition group-open:rotate-90">›</span> Archives ({archived.length})
          </summary>
          <div className="grid gap-4 opacity-80 sm:grid-cols-2 lg:grid-cols-3">{archived.map(card)}</div>
        </details>
      )}

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
