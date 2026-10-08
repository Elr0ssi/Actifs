"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";

async function ctx() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

function refresh() {
  revalidatePath("/app/notes", "layout");
}

export async function addWord(formData: FormData) {
  const french = String(formData.get("french") || "").trim();
  const english = String(formData.get("english") || "").trim();
  if (!french || !english) return;
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  await supabase.from("vocab_words").insert({ household_id: householdId, french, english, created_by: userId });
  refresh();
}

/** One pair per line — "chat - cat", "chat : cat" or "chat, cat" all work. */
export async function bulkAddWords(formData: FormData) {
  const raw = String(formData.get("bulk") || "");
  const { supabase, householdId, userId } = await ctx();
  if (!householdId) return;
  const rows = raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s*(?:-|:|,|\t|=>|→)\s*/);
      if (parts.length < 2) return null;
      const [french, english] = parts;
      return french && english ? { household_id: householdId, french: french.trim(), english: english.trim(), created_by: userId } : null;
    })
    .filter((r): r is NonNullable<typeof r> => r !== null);
  if (rows.length === 0) return;
  await supabase.from("vocab_words").insert(rows);
  refresh();
}

export async function deleteWord(id: string) {
  const { supabase } = await ctx();
  await supabase.from("vocab_words").delete().eq("id", id);
  refresh();
}
