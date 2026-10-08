import { getLocale, getT } from "@/lib/i18n/server";
import { intlOf } from "@/lib/i18n";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { getGuide } from "@/lib/marketing/guides";
import { SITE_NAME, absolute, localeUrl } from "@/lib/marketing/site";

export interface ToolPageProps {
  path: string;
  name: string;
  h1: string;
  intro: string;
  description: string;
  children: React.ReactNode;
  steps: { title: string; text: string }[];
  uses: { title: string; text: string }[];
  faq: { q: string; a: string }[];
  guides: string[];
}

/** Gabarit commun des outils gratuits : l'outil d'abord, puis du contenu utile (usages, mode d'emploi, questions) pour le référencement. */
export function ToolPage({ path, name, h1, intro, description, children, steps, uses, faq, guides }: ToolPageProps) {
  const tr = getT();
  const related = guides.map((s) => getGuide(s)).filter((g): g is NonNullable<typeof g> => !!g);
  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: tr(name),
            url: localeUrl(path, getLocale()),
            description: tr(description),
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web",
            inLanguage: intlOf(getLocale()),
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
            publisher: { "@type": "Organization", name: SITE_NAME },
          },
          faqJsonLd(faq),
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Outils gratuits", url: absolute("/outils") }, { name, url: absolute(path) }]),
        ]}
      />
      <SiteHeader current="outils" />
      <main className="mx-auto max-w-6xl px-6 py-12">
        <nav aria-label={tr("Fil d'Ariane")} className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-800">{tr("Accueil")}</Link> <span className="mx-1">/</span>
          <Link href="/outils" className="hover:text-stone-800">{tr("Outils gratuits")}</Link>
        </nav>
        <header className="mt-4 max-w-3xl">
          <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{tr("Gratuit · sans compte · sans abonnement")}</span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{tr(h1)}</h1>
          <p className="mt-3 text-lg leading-relaxed text-stone-600">{tr(intro)}</p>
        </header>

        <section className="mt-10" aria-label={tr(name)}>{children}</section>

        <section className="mt-20 grid gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">{tr("Comment ça marche")}</h2>
            <ol className="mt-5 space-y-4">
              {steps.map((st, i) => (
                <li key={st.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">{i + 1}</span>
                  <div>
                    <h3 className="font-semibold text-stone-900">{tr(st.title)}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-600">{tr(st.text)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-stone-900">{tr("À quoi ça sert")}</h2>
            <div className="mt-5 space-y-4">
              {uses.map((u) => (
                <div key={u.title} className="card p-5">
                  <h3 className="font-semibold text-stone-900">{tr(u.title)}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{tr(u.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="faq">
          <h2 id="faq" className="text-2xl font-bold tracking-tight text-stone-900">{tr("Questions fréquentes")}</h2>
          <div className="mt-5 space-y-3">
            {faq.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="cursor-pointer list-none font-medium text-stone-900"><span className="mr-2 inline-block transition group-open:rotate-90">›</span>{tr(f.q)}</summary>
                <p className="mt-2 pl-4 text-sm leading-relaxed text-stone-600">{tr(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-lg font-bold text-stone-900">{tr("Guides associés")}</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="card card-hover block p-5">
                  <p className="text-xs text-brand-700">{tr(r.category)}</p>
                  <p className="mt-1 font-semibold leading-snug text-stone-900">{tr(r.h1)}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
