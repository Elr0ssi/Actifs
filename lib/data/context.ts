import { createClient } from "@/lib/supabase/server";
import type { Household, Profile } from "@/lib/types";

export async function getAppContext() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  let household: Household | null = null;
  if (profile?.household_id) {
    const { data } = await supabase
      .from("households")
      .select("*")
      .eq("id", profile.household_id)
      .single<Household>();
    household = data ?? null;
  }

  return { user, profile: profile ?? null, household, supabase };
}
