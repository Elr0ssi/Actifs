import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { DEFAULT_LOCALE, LANG_COOKIE, isLocale, localeFromAcceptLanguage, splitLocalePath, type Locale } from "@/lib/i18n";

const BOT = /bot|crawl|spider|slurp|facebookexternalhit|preview|lighthouse|pagespeed|headless|embedly|whatsapp|telegram|discord|linkedin|twitter|pinterest/i;

/** Pays → langue, utilisé seulement quand le navigateur n'indique aucune langue. */
const COUNTRY_LANG: Record<string, Locale> = {
  GB: "en", US: "en", IE: "en", AU: "en", NZ: "en", CA: "en", ZA: "en", IN: "en", SG: "en",
  ES: "es", MX: "es", AR: "es", CO: "es", CL: "es", PE: "es", VE: "es", UY: "es", EC: "es",
  DE: "de", AT: "de", LI: "de",
};

const cookieOptions = { path: "/", maxAge: 60 * 60 * 24 * 365, sameSite: "lax" as const };

/** Langue à proposer à un visiteur sans préférence enregistrée : sa langue de navigateur, sinon son pays. */
function guessLocale(request: NextRequest): Locale {
  const header = request.headers.get("accept-language");
  if (header) return localeFromAcceptLanguage(header);
  return COUNTRY_LANG[request.headers.get("x-vercel-ip-country") ?? ""] ?? DEFAULT_LOCALE;
}

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Appli et connexion : session Supabase (la langue vient du cookie).
  if (/^\/(app|login|signup)(\/|$)/.test(pathname)) return await updateSession(request);

  // Site public. Le français n'a pas de préfixe (/tarifs), les autres langues oui (/en/tarifs).
  const { locale: urlLocale, path } = splitLocalePath(pathname);

  // /fr/... est un doublon de /... : redirection permanente.
  if (urlLocale === "fr") {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url, 308);
  }

  // /en/..., /es/..., /de/... : on retient la langue pour l'appli et les prochaines visites.
  if (urlLocale) {
    const res = NextResponse.next();
    if (request.cookies.get(LANG_COOKIE)?.value !== urlLocale) res.cookies.set(LANG_COOKIE, urlLocale, cookieOptions);
    return res;
  }

  // Adresse sans préfixe : français, sauf si le visiteur a choisi ou parle une autre langue.
  const isImage = /\/(opengraph|twitter)-image/.test(pathname);
  if (!isImage && (request.method === "GET" || request.method === "HEAD") && !BOT.test(request.headers.get("user-agent") ?? "")) {
    const saved = request.cookies.get(LANG_COOKIE)?.value;
    const target = isLocale(saved) ? saved : guessLocale(request);
    if (target !== DEFAULT_LOCALE) {
      const url = request.nextUrl.clone();
      url.pathname = pathname === "/" ? `/${target}` : `/${target}${pathname}`;
      const res = NextResponse.redirect(url, 307);
      res.headers.set("Vary", "Accept-Language, Cookie");
      return res;
    }
  }

  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? "/fr" : `/fr${pathname}`;
  const res = NextResponse.rewrite(url);
  res.headers.set("Vary", "Accept-Language, Cookie");
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/|auth/|apple-icon|icon$|icon/|manifest|.*\\..*).*)"],
};
