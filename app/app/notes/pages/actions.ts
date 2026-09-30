"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { sanitizeBlocks, searchText } from "@/lib/notes";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

const refresh = () => revalidatePath("/app/notes/pages", "layout");

export async function createNote(parentId: string | null = null) {
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase
    .from("notes")
    .insert({ household_id: householdId, parent_id: parentId, created_by: userId, title: "", blocks: [] })
    .select("id")
    .single();
  refresh();
  if (data) redirect(`/app/notes/pages/${data.id}`);
}

export async function saveNote(id: string, patch: { title: string; icon: string | null; blocks: unknown }) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return { ok: false };
  const blocks = sanitizeBlocks(patch.blocks);
  const title = patch.title.slice(0, 200);
  const { error } = await supabase
    .from("notes")
    .update({ title, icon: patch.icon, blocks, search: searchText(blocks), updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("household_id", householdId);
  refresh();
  return { ok: !error };
}

export async function togglePin(id: string, pinned: boolean) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  await supabase.from("notes").update({ pinned }).eq("id", id).eq("household_id", householdId);
  refresh();
}

export async function deleteNote(id: string) {
  const { supabase, householdId } = await ctx();
  if (!householdId) return;
  const { data } = await supabase.from("notes").select("parent_id").eq("id", id).single();
  await supabase.from("notes").delete().eq("id", id).eq("household_id", householdId);
  refresh();
  redirect(data?.parent_id ? `/app/notes/pages/${data.parent_id}` : "/app/notes/pages");
}
