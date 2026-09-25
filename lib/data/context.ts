import { cache } from "react";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import type { Household, Profile } from "@/lib/types";

type ProfileWithHousehold = Profile & { household: Household | null };

/**
 * Cached per request: layout + page (+ any nested component) all call this,
 * but React's cache() dedupes it to a single auth+DB round trip per request
 * instead of one per caller.
 */
export const getAppContext = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, household:households(*)")
    .eq("id", user.id)
    .single<ProfileWithHousehold>();

  return {
    user,
    profile: profile as Profile | null,
    household: profile?.household ?? null,
    supabase,
  };
});
