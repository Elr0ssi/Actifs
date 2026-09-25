"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const displayName = String(formData.get("display_name") || "").trim();
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  if (!user || !displayName) return;
  await supabase.from("profiles").update({ display_name: displayName }).eq("id", user.id);
  revalidatePath("/app/settings");
  revalidatePath("/app");
}

export async function updateHouseholdName(formData: FormData) {
  const name = String(formData.get("household_name") || "").trim();
  if (!name) return;
  const supabase = createClient();
  const { data: { user } } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  if (!profile?.household_id) return;
  await supabase.from("households").update({ name }).eq("id", profile.household_id);
  revalidatePath("/app/settings");
}

export async function joinHousehold(formData: FormData) {
  const code = String(formData.get("invite_code") || "").trim();
  if (!code) return;
  const supabase = createClient();
  const { error } = await supabase.rpc("join_household", { code });
  revalidatePath("/app/settings");
  revalidatePath("/app");
  if (error) throw new Error(error.message);
}
