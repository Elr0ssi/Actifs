import "react-native-url-polyfill/auto";
import { AppState } from "react-native";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";
import { secureStorage } from "./secure-storage";

let client: SupabaseClient | null = null;

/** Client unique : clé anon + session de l'utilisateur → la RLS du projet Supabase s'applique à chaque requête. */
export function supabase(): SupabaseClient {
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { storage: secureStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false, flowType: "pkce" },
    });
    // Le rafraîchissement automatique du jeton n'a lieu qu'au premier plan.
    AppState.addEventListener("change", (s) => {
      if (s === "active") client?.auth.startAutoRefresh();
      else client?.auth.stopAutoRefresh();
    });
  }
  return client;
}
