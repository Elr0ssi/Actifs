import { getLocale, getT } from "@/lib/i18n/server";
import { SITE_URL, localeUrl } from "@/lib/marketing/site";

/** Données structurées (schema.org) pour les moteurs de recherche. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

/** Une adresse du site écrite en français (https://…/tarifs) devient celle de la page dans la langue courante. */
const inLocale = (url: string) => (url.startsWith(SITE_URL) ? localeUrl(url.slice(SITE_URL.length) || "/", getLocale()) : url);

export function faqJsonLd(items: { q: string; a: string }[]) {
  const tr = getT();
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: tr(i.q), acceptedAnswer: { "@type": "Answer", text: tr(i.a) } })),
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  const tr = getT();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: tr(it.name), item: inLocale(it.url) })),
  };
}
