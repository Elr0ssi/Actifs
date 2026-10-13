import { cache } from "react";
import { getAppContext } from "@/lib/data/context";

/** Les membres du foyer (prénoms) et qui je suis : sert à écrire « par Raph » sur ce qui n'est pas à moi. */
export const loadPeople = cache(async () => {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const householdId = ctx.profile?.household_id ?? "";
  const { data } = await ctx.supabase.from("profiles").select("id, display_name").eq("household_id", householdId);
  const names: Record<string, string> = Object.fromEntries((data ?? []).map((p) => [p.id as string, (p.display_name as string | null)?.trim() || "—"]));
  return { meId: ctx.user.id, names, count: (data ?? []).length };
});
