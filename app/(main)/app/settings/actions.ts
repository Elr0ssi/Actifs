"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { LANG_COOKIE, isLocale } from "@/lib/i18n";
import { ACCENT_COOKIE, THEME_COOKIE, parseAccent, parseMode } from "@/lib/theme";
import { FINANCE_OWNER_COOKIE, isShareLevel, isShareSection, parseShareDefaults } from "@/lib/sharing";

/** Donne, change ou retire l'accès d'un membre du foyer à l'une de TES sections (la base applique les règles). */
export async function setMemberShare(memberId: string, section: string, level: string) {
  if (!isShareSection(section) || !isShareLevel(level)) throw new Error("Réglage inconnu");
  const supabase = createClient();
  const { error } = await supabase.rpc("set_member_share", { p_member: memberId, p_section: section, p_level: level });
  if (error) throw new Error(error.message);
  // Si on retire l'accès à la finance, on ne garde pas un cookie qui pointe vers elle.
  if (section === "finance" && level === "none") cookies().delete(FINANCE_OWNER_COOKIE);
  revalidatePath("/app", "layout");
}

/** Ce que les nouvelles personnes qui rejoignent avec TON code pourront voir de ce qui est à toi. */
export async function setShareDefault(section: string, level: string) {
  if (!isShareSection(section) || !isShareLevel(level)) throw new Error("Réglage inconnu");
  const supabase = createClient();
  const { data: { user } } = await getSessionUser(supabase);
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("share_defaults").eq("id", user.id).single();
  const next: Record<string, string> = { ...parseShareDefaults(profile?.share_defaults) };
  next[section] = section === "finance" && level === "edit" ? "view" : level;
  for (const k of Object.keys(next)) if (next[k] === "none") delete next[k];
  await supabase.from("profiles").update({ share_defaults: next }).eq("id", user.id);
  revalidatePath("/app/settings");
}

/** Partage (ou retire) un projet précis avec un membre du foyer. */
export async function setProjectMember(projectId: string, memberId: string, level: string) {
  if (!isShareLevel(level)) throw new Error("Réglage inconnu");
  const supabase = createClient();
  const { error } = await supabase.rpc("set_project_member", { p_project: projectId, p_member: memberId, p_level: level });
  if (error) throw new Error(error.message);
  revalidatePath("/app", "layout");
}

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
  if (!user) return;
  // Le lien du calendrier est personnel : il ne donne que tes tâches (et celles qu'on te partage).
  await supabase.from("user_tokens").update({ ical_token: crypto.randomUUID() }).eq("user_id", user.id);
  revalidatePath("/app/settings");
}

/** Change la langue de l'interface (cookie conservé un an). */
export async function setLanguage(code: string) {
  if (!isLocale(code)) return;
  cookies().set(LANG_COOKIE, code, { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" });
  revalidatePath("/app", "layout");
}
