/**
 * Variables publiques lues au build (EAS) ou depuis mobile/.env :
 *  - EXPO_PUBLIC_SUPABASE_URL
 *  - EXPO_PUBLIC_SUPABASE_ANON_KEY   (clé « anon » publique — jamais la clé service_role)
 */
export const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function missingEnv(): string[] {
  const out: string[] = [];
  if (!SUPABASE_URL) out.push("EXPO_PUBLIC_SUPABASE_URL");
  if (!SUPABASE_ANON_KEY) out.push("EXPO_PUBLIC_SUPABASE_ANON_KEY");
  return out;
}
