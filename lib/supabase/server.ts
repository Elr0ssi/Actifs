import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // called from a Server Component; middleware handles refresh
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // called from a Server Component; middleware handles refresh
          }
        },
      },
    }
  );
}

type SessionClient = { auth: { getSession: () => Promise<{ data: { session: { access_token: string } | null } }> } };

/**
 * The middleware already validated the session with getUser() on this request, so server
 * components and actions read the user from the (verified, refreshed) cookie JWT instead of
 * paying another network round trip to Supabase Auth. RLS still enforces access on every query.
 */
export async function getSessionUser(supabase: SessionClient) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return { data: { user: null } };
  const claims = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString());
  return { data: { user: { id: claims.sub as string, email: (claims.email as string) ?? null, user_metadata: claims.user_metadata ?? {} } } };
}
