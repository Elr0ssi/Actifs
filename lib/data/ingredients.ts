import type { createClient } from "@/lib/supabase/server";

type Client = ReturnType<typeof createClient>;

export interface PickedIngredient {
  id?: string | null;
  name: string;
  quantity?: string | null;
}

export function parsePicked(raw: FormDataEntryValue | null): PickedIngredient[] {
  try {
    const parsed = JSON.parse(String(raw ?? "[]"));
    return Array.isArray(parsed) ? parsed.filter((p) => p && String(p.name ?? "").trim()) : [];
  } catch {
    return [];
  }
}

/** Resolves ingredient names to catalog ids, creating the missing catalog entries. */
export async function ensureIngredients(supabase: Client, householdId: string, names: string[]) {
  const wanted = [...new Map(names.map((n) => [n.trim().toLowerCase(), n.trim()])).entries()].filter(([k]) => k);
  const { data: existing } = await supabase.from("ingredients").select("id, name").eq("household_id", householdId);
  const byName = new Map((existing ?? []).map((i) => [i.name.toLowerCase(), i.id as string]));
  const missing = wanted.filter(([k]) => !byName.has(k)).map(([, name]) => ({ household_id: householdId, name }));
  if (missing.length) {
    const { data: created } = await supabase.from("ingredients").insert(missing).select("id, name");
    for (const c of created ?? []) byName.set(c.name.toLowerCase(), c.id);
  }
  return byName;
}
