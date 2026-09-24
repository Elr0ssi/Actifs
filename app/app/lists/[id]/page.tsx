import Link from "next/link";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import type { ListItem, ListRow, ItemLocation } from "@/lib/types";
import { ListItemsChecklist } from "@/components/app/list-items-checklist";
import { addListItem, bulkImportItems, deleteList, clearCheckedItems } from "@/app/app/lists/actions";

export default async function ListDetailPage({ params }: { params: { id: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase } = ctx;

  const { data: list } = await supabase.from("lists").select("*").eq("id", params.id).single<ListRow>();
  if (!list) notFound();

  const [{ data: items }, { data: locations }] = await Promise.all([
    supabase.from("list_items").select("*").eq("list_id", params.id).order("position").returns<ListItem[]>(),
    supabase.from("item_locations").select("*").eq("household_id", list.household_id).returns<ItemLocation[]>(),
  ]);

  const locationByLabel = new Map((locations ?? []).map((l) => [l.item_label.toLowerCase(), l]));
  const checkedCount = (items ?? []).filter((i) => i.checked).length;

  const addItem = addListItem.bind(null, list.id);
  const bulkImport = bulkImportItems.bind(null, list.id);
  const clearChecked = clearCheckedItems.bind(null, list.id);
  const removeList = deleteList.bind(null, list.id);

  return (
    <div className="space-y-6">
      <Link href="/app/lists" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Listes</Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{list.name}</h1>
          <p className="mt-1 text-sm text-slate-500">{list.category} · {checkedCount}/{(items ?? []).length} cochés</p>
        </div>
        <div className="flex gap-2">
          <form action={clearChecked}>
            <button className="btn-secondary text-xs">Nettoyer les cochés</button>
          </form>
          <form action={removeList}>
            <button className="btn-secondary text-xs text-rose-600">Supprimer la liste</button>
          </form>
        </div>
      </div>

      <div className="card p-6">
        <ListItemsChecklist
          listId={list.id}
          items={(items ?? []).map((it) => ({
            ...it,
            store: locationByLabel.get(it.label.toLowerCase())?.store_name,
          }))}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Ajouter un article</h2>
          <form action={addItem} className="space-y-2">
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
          <form action={bulkImport} className="space-y-2">
            <textarea name="bulk" rows={5} className="input" placeholder={"- Lait\n- Oeufs\n- Farine"} />
            <button className="btn-primary w-full">Importer en checklist</button>
          </form>
        </div>
      </div>
    </div>
  );
}
