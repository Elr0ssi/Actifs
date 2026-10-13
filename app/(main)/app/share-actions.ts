"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { isSharedTable } from "@/lib/sharing";

/**
 * Passe une liste de courses, une recette ou un repas planifié en « Partagé » (visible par tout le foyer, modifiable par toi seul(e))
 * ou en « Perso » (visible par toi seul(e)). Seul le propriétaire peut le faire — la base le garantit aussi.
 */
export async function setItemShared(table: string, id: string, shared: boolean) {
  if (!isSharedTable(table)) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  if (!user) return;
  await supabase.from(table).update({ shared }).eq("id", id).eq("owner_id", user.id);
  revalidatePath("/app", "layout");
}
