"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").trim().slice(0, 200);
  const password = String(formData.get("password") || "").slice(0, 200);
  if (!EMAIL_RE.test(email) || !password) redirect("/login?error=" + encodeURIComponent("Vérifie ton adresse e-mail et ton mot de passe."));
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/app");
}

export async function signup(formData: FormData) {
  // Anti-spam : le champ « website » est invisible pour une personne ; s'il est rempli, c'est un robot.
  if (String(formData.get("website") || "").trim()) redirect("/signup?error=" + encodeURIComponent("Inscription impossible."));
  const email = String(formData.get("email") || "").trim().slice(0, 200);
  const password = String(formData.get("password") || "").slice(0, 200);
  const displayName = String(formData.get("displayName") || "").trim().slice(0, 60);
  if (!displayName) redirect("/signup?error=" + encodeURIComponent("Indique ton prénom."));
  if (!EMAIL_RE.test(email)) redirect("/signup?error=" + encodeURIComponent("Cette adresse e-mail ne semble pas valide."));
  if (password.length < 6) redirect("/signup?error=" + encodeURIComponent("Le mot de passe doit faire au moins 6 caractères."));
  const supabase = createClient();

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName } },
  });
  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }
  redirect("/app");
}

export async function logout() {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
