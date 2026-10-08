"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { LANG_COOKIE, isLocale } from "@/lib/i18n";
import { ACCENT_COOKIE, THEME_COOKIE, parseAccent, parseMode } from "@/lib/theme";

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

export async function changePassword(formData: FormData) {
  const password = String(formData.get("password") || "");
  if (password.length < 8) return;
  const supabase = createClient();
  await supabase.auth.updateUser({ password });
  revalidatePath("/app/settings");
}

/** Apparence propre à l'appareil : mode (clair / sombre / auto) et couleur d'accent, gardés dans des cookies. */
export async function setAppearance(mode: string | null, accent: string | null) {
  const jar = cookies();
  const opts = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };
  if (mode !== null) jar.set(THEME_COOKIE, parseMode(mode), opts);
  if (accent !== null) jar.set(ACCENT_COOKIE, parseAccent(accent), opts);
  revalidatePath("/app", "layout");
}

export async function regenerateCalendarToken() {
  const supabase = createClient();
  const { data: { user } } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  if (!profile?.household_id) return;
  await supabase.from("households").update({ ical_token: crypto.randomUUID() }).eq("id", profile.household_id);
  revalidatePath("/app/settings");
}

/** Change la langue de l'interface (cookie conservé un an). */
export async function setLanguage(code: string) {
  if (!isLocale(code)) return;
  cookies().set(LANG_COOKIE, code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/app", "layout");
}
