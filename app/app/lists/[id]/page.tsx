import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import type { ListItem, ListRow, ItemLocation, Recipe, RecipeItem } from "@/lib/types";
import { ListItemsChecklist } from "@/components/app/list-items-checklist";
import { ListComposer } from "@/components/app/lists/list-composer";
import { formatEUR } from "@/lib/utils";
import { loadCatalog } from "@/lib/data/ingredients";
import { STORES, compareStores, lineCost, priceMap } from "@/lib/shopping";
import {
  addListItem,
  bulkImportItems,
  deleteList,
  clearCheckedItems,
  composeList,
  setListStore,
  setListArchived,
  finishShopping,
} from "@/app/app/lists/actions";

function weekLabel(iso: string | null) {
  if (!iso) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  const end = new Date(d.getTime() + 6 * 86_400_000);
  const f = (x: Date) => x.toLocaleDateString("fr-FR", { day: "numeric", month: "short", timeZone: "UTC" });
  return `Semaine du ${f(d)} au ${f(end)}`;
}

export default async function ListDetailPage({ params, searchParams }: { params: { id: string }; searchParams: { compose?: string; done?: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase } = ctx;

  const { data: list } = await supabase.from("lists").select("*").eq("id", params.id).single<ListRow>();
  if (!list) notFound();
  const isShopping = list.type === "shopping";
  const hh = list.household_id;

  const [{ data: items }, { data: locations }, { data: recipes }, { catalog, prices }, { data: pastLists }] = await Promise.all([
    supabase.from("list_items").select("*").eq("list_id", params.id).order("position").returns<ListItem[]>(),
    supabase.from("item_locations").select("*").eq("household_id", hh).returns<ItemLocation[]>(),
    isShopping
      ? supabase.from("recipes").select("*, recipe_items(*)").eq("household_id", hh).order("is_favorite", { ascending: false }).order("name")
      : Promise.resolve({ data: [] }),
    isShopping ? loadCatalog(supabase) : Promise.resolve({ catalog: [], prices: [] }),
    isShopping
      ? supabase.from("lists").select("id, list_items(label)").eq("household_id", hh).eq("type", "shopping").neq("id", list.id).order("created_at", { ascending: false }).limit(8)
      : Promise.resolve({ data: [] }),
  ]);

  const priceAt = priceMap(prices, list.store);
  const unitOf = new Map(catalog.map((c) => [c.id, c.unit]));
  const composerRecipes = ((recipes ?? []) as (Recipe & { recipe_items: RecipeItem[] })[]).map((r) => {
    const costs = r.recipe_items
      .map((i) => (i.ingredient_id ? lineCost(i.qty, i.qty_unit, unitOf.get(i.ingredient_id) ?? "unit", priceAt.get(i.ingredient_id)) : null))
      .filter((c): c is number => c !== null);
    return {
      id: r.id,
      name: r.name,
      category: r.category,
      image_url: r.image_url,
      itemCount: r.recipe_items.length,
      estimate: costs.length ? costs.reduce((s, c) => s + c, 0) : null,
    };
  });
  const recommendations = [
    ...new Set(((pastLists ?? []) as { list_items: { label: string }[] }[]).flatMap((l) => l.list_items.map((i) => i.label))),
  ].slice(0, 30);

  const all = items ?? [];
  const locationByLabel = new Map((locations ?? []).map((l) => [l.item_label.toLowerCase(), l]));
  const checkedCount = all.filter((i) => i.checked).length;
  const lineTotal = (i: ListItem) => (i.price !== null ? Number(i.price) * (i.count || 1) : 0);
  const total = all.reduce((s, i) => s + lineTotal(i), 0);
  const remaining = all.filter((i) => !i.checked).reduce((s, i) => s + lineTotal(i), 0);
  const unpriced = all.filter((i) => i.price === null).length;
  const composeOpen = !list.archived && (searchParams.compose === "1" || (isShopping && all.length === 0));
  const bought = all.some((i) => i.checked) ? all.filter((i) => i.checked) : all;
  const comparison = isShopping ? compareStores(bought, prices, unitOf) : [];
  const comparable = bought.filter((i) => i.ingredient_id).length;
  const outsideBase = bought.length - comparable;
  const best = comparison.find((c) => c.missing === 0) ?? comparison[0];
  const current = comparison.find((c) => c.store === list.store);
  const maxTotal = Math.max(...comparison.map((c) => c.total), 1);

  return (
    <div className="space-y-6">
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{list.name}</h1>
          <p className="mt-1 text-sm text-slate-500">
            {[list.category, weekLabel(list.week_start), `${checkedCount}/${all.length} cochés`].filter(Boolean).join(" · ")}
            {list.archived && <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">Archivée</span>}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={clearCheckedItems.bind(null, list.id)}>
            <button className="btn-secondary text-xs">Nettoyer les cochés</button>
          </form>
          {isShopping && !list.archived && (
            <form action={finishShopping.bind(null, list.id)}>
              <button className="btn-primary text-xs">✓ J'ai fini mes courses</button>
            </form>
          )}
          <form action={setListArchived.bind(null, list.id, !list.archived)}>
            <button className="btn-secondary text-xs">{list.archived ? "Désarchiver" : "Archiver"}</button>
          </form>
          <form action={deleteList.bind(null, list.id)}>
            <button className="btn-secondary text-xs text-rose-600">Supprimer</button>
          </form>
        </div>
      </div>

      {isShopping && (list.archived || searchParams.done === "1") && comparable > 0 && (
        <section id="comparatif" className="card p-6">
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <h2 className="font-semibold text-slate-900">🧾 Comparatif des enseignes</h2>
              <p className="text-xs text-slate-500">
                Tes {comparable} article(s) {all.some((i) => i.checked) ? "achetés" : "de la liste"} au prix de référence de chaque enseigne
                {outsideBase > 0 && ` · ${outsideBase} hors base non comparé(s)`}
              </p>
            </div>
            {best && current && best.store !== current.store && current.total - best.total > 0.01 && (
              <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
                {formatEUR(current.total - best.total)} d'économie possible chez {best.store}
              </p>
            )}
            {best && current && best.store === current.store && (
              <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">✓ {current.store} était le meilleur choix</p>
            )}
          </div>
          <div className="space-y-2.5">
            {comparison.map((c) => {
              const isBest = c.store === best?.store;
              const isCurrent = c.store === list.store;
              const diff = current ? c.total - current.total : 0;
              return (
                <div key={c.store} className="flex items-center gap-3">
                  <span className={`w-28 shrink-0 text-sm ${isCurrent ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                    {c.store}
                    {isCurrent && <span className="ml-1 text-[10px] text-slate-400">(ta liste)</span>}
                  </span>
                  <div className="h-7 flex-1 overflow-hidden rounded-lg bg-slate-100">
                    <div
                      className={`flex h-full items-center rounded-lg px-2 text-xs font-semibold text-white ${isBest ? "bg-emerald-500" : isCurrent ? "bg-brand-500" : "bg-slate-400"}`}
                      style={{ width: `${Math.max(12, (c.total / maxTotal) * 100)}%` }}
                    >
                      {formatEUR(c.total)}
                    </div>
                  </div>
                  <span className={`w-20 shrink-0 text-right text-xs ${diff > 0.01 ? "text-rose-600" : diff < -0.01 ? "text-emerald-600" : "text-slate-400"}`}>
                    {current && !isCurrent ? `${diff > 0 ? "+" : ""}${formatEUR(diff)}` : isBest ? "🏆" : ""}
                  </span>
                  {c.missing > 0 && <span className="w-16 shrink-0 text-[11px] text-slate-400">{c.missing} sans prix</span>}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {isShopping && (
        <div className="grid gap-4 sm:grid-cols-2">
          <form action={setListStore.bind(null, list.id)} className="card flex items-end gap-2 p-4">
            <label className="flex-1 text-xs text-slate-500">
              Enseigne
              <select name="store" defaultValue={list.store ?? ""} className="input mt-1" required>
                <option value="" disabled>Choisir…</option>
                {STORES.map((st) => <option key={st} value={st}>{st}</option>)}
              </select>
            </label>
            <button className="btn-secondary">Changer</button>
          </form>
          <div className="card flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-slate-500">Total estimé{list.store ? ` chez ${list.store}` : ""}</p>
              <p className="text-2xl font-bold text-slate-900">{formatEUR(total)}</p>
              {unpriced > 0 && <p className="text-[11px] text-slate-400">{unpriced} article(s) sans prix</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Reste à acheter</p>
              <p className="text-lg font-semibold text-brand-700">{formatEUR(remaining)}</p>
            </div>
          </div>
        </div>
      )}

      {isShopping && (
        <details open={composeOpen} className="card group p-6">
          <summary className="cursor-pointer list-none font-semibold text-slate-900">
            <span className="mr-2 inline-block transition group-open:rotate-90">›</span>Ajouter des recettes et des produits
          </summary>
          <div className="mt-5">
            <ListComposer
              action={composeList.bind(null, list.id)}
              recipes={composerRecipes}
              catalog={catalog}
              prices={Object.fromEntries(priceAt)}
              recommendations={recommendations}
              store={list.store}
            />
          </div>
        </details>
      )}

      <div className="card p-6">
        <ListItemsChecklist
          listId={list.id}
          items={all.map((it) => ({ ...it, store: locationByLabel.get(it.label.toLowerCase())?.store_name }))}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Ajouter un article</h2>
          <form action={addListItem.bind(null, list.id)} className="space-y-2">
            <input name="label" placeholder="Article" className="input" required />
            <div className="flex gap-2">
              <input name="quantity" placeholder="Quantité" className="input" />
              <input name="note" placeholder="Note" className="input" />
            </div>
            <button className="btn-primary w-full">Ajouter</button>
          </form>
        </div>

        <div className="card p-5">
          <h2 className="mb-1 text-sm font-semibold text-slate-700">Import rapide</h2>
          <p className="mb-3 text-xs text-slate-400">Colle une liste (ChatGPT, notes…), une ligne = un article.</p>
          <form action={bulkImportItems.bind(null, list.id)} className="space-y-2">
            <textarea name="bulk" rows={4} className="input" placeholder={"- Lait\n- Oeufs\n- Farine"} />
            <button className="btn-primary w-full">Importer en checklist</button>
          </form>
        </div>
      </div>
    </div>
  );
}
