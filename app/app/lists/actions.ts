"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { ListType } from "@/lib/types";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function parseBulkLines(raw: string) {
  return raw
    .split("\n")
    .map((l) => l.replace(/^[\s]*[-*•▪️✓☐☑]+\s*/, "").trim())
    .filter(Boolean);
}

export async function createList(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const category = String(formData.get("category") || "Général").trim() || "Général";
  const type = (String(formData.get("type") || "generic") as ListType);
  if (!name) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase
    .from("lists")
    .insert({ household_id: householdId, name, category, type, created_by: userId })
    .select("id")
    .single();
  revalidatePath("/app/lists");
  if (data?.id) redirect(`/app/lists/${data.id}`);
}

export async function deleteList(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("lists").delete().eq("id", listId);
  revalidatePath("/app/lists");
  redirect("/app/lists");
}

export async function addListItem(listId: string, formData: FormData) {
  const label = String(formData.get("label") || "").trim();
  const quantity = String(formData.get("quantity") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  if (!label) return;
  const { supabase } = await ctx();
  const { count } = await supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", listId);
  await supabase.from("list_items").insert({ list_id: listId, label, quantity, note, position: count ?? 0 });
  revalidatePath(`/app/lists/${listId}`);
}

export async function bulkImportItems(listId: string, formData: FormData) {
  const raw = String(formData.get("bulk") || "");
  const lines = parseBulkLines(raw);
  if (lines.length === 0) return;
  const { supabase } = await ctx();
  const { count } = await supabase.from("list_items").select("*", { count: "exact", head: true }).eq("list_id", listId);
  const start = count ?? 0;
  await supabase.from("list_items").insert(lines.map((label, i) => ({ list_id: listId, label, position: start + i })));
  revalidatePath(`/app/lists/${listId}`);
}

export async function toggleListItem(listId: string, itemId: string, checked: boolean) {
  const { supabase } = await ctx();
  await supabase.from("list_items").update({ checked }).eq("id", itemId);
  revalidatePath(`/app/lists/${listId}`);
}

export async function deleteListItem(listId: string, itemId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("id", itemId);
  revalidatePath(`/app/lists/${listId}`);
}

export async function clearCheckedItems(listId: string) {
  const { supabase } = await ctx();
  await supabase.from("list_items").delete().eq("list_id", listId).eq("checked", true);
  revalidatePath(`/app/lists/${listId}`);
}

export async function addItemLocation(formData: FormData) {
  const itemLabel = String(formData.get("item_label") || "").trim();
  const storeName = String(formData.get("store_name") || "").trim();
  const note = String(formData.get("note") || "").trim() || null;
  if (!itemLabel || !storeName) return;
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("item_locations").insert({ household_id: householdId, item_label: itemLabel, store_name: storeName, note });
  revalidatePath("/app/lists");
}

export async function deleteItemLocation(id: string) {
  const { supabase } = await ctx();
  await supabase.from("item_locations").delete().eq("id", id);
  revalidatePath("/app/lists");
}
