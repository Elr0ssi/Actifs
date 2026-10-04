export const SITE_URL = "https://actifs.app";
export const SITE_NAME = "All In";

export const absolute = (path: string) => `${SITE_URL}${path}`;

/** Métadonnées d'une page publique : titre, description, URL canonique et aperçu de partage. */
export function pageMeta({ title, description, path }: { title: string; description: string; path: string }) {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: absolute(path), type: "website" as const, locale: "fr_FR", siteName: SITE_NAME },
    twitter: { card: "summary_large_image" as const, title, description },
  };
}
