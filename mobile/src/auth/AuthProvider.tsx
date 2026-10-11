import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "~/lib/supabase";
import { missingEnv } from "~/lib/env";
import { wipeUser } from "~/data/cache";
import { clearWidgetSnapshot } from "~/native/widgets";
import { cancelAll } from "~/native/notifications";

WebBrowser.maybeCompleteAuthSession();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

interface AuthValue {
  /** `loading` tant que la session stockée n'est pas lue. */
  status: "loading" | "signedOut" | "signedIn" | "misconfigured";
  session: Session | null;
  userId: string | null;
  signIn(email: string, password: string): Promise<string | null>;
  signUp(email: string, password: string, name: string): Promise<string | null>;
  signInWithGoogle(): Promise<string | null>;
  signOut(): Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);
export const useAuth = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth hors AuthProvider");
  return v;
};

/** Messages d'erreur Supabase les plus courants, en français. */
function friendly(message: string): string {
  if (/invalid login credentials/i.test(message)) return "Adresse e-mail ou mot de passe incorrect.";
  if (/email not confirmed/i.test(message)) return "Confirme d'abord ton adresse e-mail (lien reçu par e-mail).";
  if (/already registered|already been registered/i.test(message)) return "Un compte existe déjà avec cette adresse.";
  if (/network|fetch/i.test(message)) return "Pas de connexion. Réessaie quand tu es en ligne.";
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const misconfigured = missingEnv().length > 0;
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!misconfigured);

  useEffect(() => {
    if (misconfigured) return;
    const sb = supabase();
    let alive = true;
    sb.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, [misconfigured]);

  // Liens profonds d'authentification (confirmation d'e-mail, retour OAuth) : échange du code PKCE.
  useEffect(() => {
    if (misconfigured) return;
    const handle = async (url: string | null) => {
      if (!url) return;
      const code = Linking.parse(url).queryParams?.code;
      if (typeof code === "string") await supabase().auth.exchangeCodeForSession(code).catch(() => undefined);
    };
    Linking.getInitialURL().then(handle);
    const sub = Linking.addEventListener("url", (e) => void handle(e.url));
    return () => sub.remove();
  }, [misconfigured]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!EMAIL_RE.test(email.trim()) || !password) return "Vérifie ton adresse e-mail et ton mot de passe.";
    const { error } = await supabase().auth.signInWithPassword({ email: email.trim(), password });
    return error ? friendly(error.message) : null;
  }, []);

  const signUp = useCallback(async (email: string, password: string, name: string) => {
    if (!name.trim()) return "Indique ton prénom.";
    if (!EMAIL_RE.test(email.trim())) return "Cette adresse e-mail ne semble pas valide.";
    if (password.length < 6) return "Le mot de passe doit faire au moins 6 caractères.";
    const { data, error } = await supabase().auth.signUp({ email: email.trim(), password, options: { data: { display_name: name.trim().slice(0, 60) }, emailRedirectTo: Linking.createURL("auth-callback") } });
    if (error) return friendly(error.message);
    return data.session ? null : "Compte créé. Confirme ton adresse e-mail avec le lien reçu, puis connecte-toi.";
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const redirectTo = Linking.createURL("auth-callback");
    const { data, error } = await supabase().auth.signInWithOAuth({ provider: "google", options: { redirectTo, skipBrowserRedirect: true } });
    if (error || !data.url) return friendly(error?.message ?? "Connexion Google impossible.");
    const res = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (res.type !== "success") return null;
    const code = Linking.parse(res.url).queryParams?.code;
    if (typeof code !== "string") return "Connexion Google impossible, réessaie.";
    const { error: ex } = await supabase().auth.exchangeCodeForSession(code);
    return ex ? friendly(ex.message) : null;
  }, []);

  const signOut = useCallback(async () => {
    const uid = session?.user.id ?? null;
    // On vide d'abord les copies locales (cache, widgets, rappels), puis la session.
    clearWidgetSnapshot();
    await cancelAll();
    await wipeUser(uid);
    await supabase().auth.signOut();
  }, [session]);

  const value = useMemo<AuthValue>(
    () => ({ status: misconfigured ? "misconfigured" : loading ? "loading" : session ? "signedIn" : "signedOut", session, userId: session?.user.id ?? null, signIn, signUp, signInWithGoogle, signOut }),
    [misconfigured, loading, session, signIn, signUp, signInWithGoogle, signOut]
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
