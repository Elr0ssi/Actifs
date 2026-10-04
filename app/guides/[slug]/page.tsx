import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { GUIDES, getGuide } from "@/lib/marketing/guides";
import { SITE_NAME, absolute } from "@/lib/marketing/site";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const g = getGuide(params.slug);
  if (!g) return {};
  const path = `/guides/${g.slug}`;
  return {
    title: g.title,
    description: g.description,
    alternates: { canonical: path },
    openGraph: { title: g.title, description: g.description, url: absolute(path), type: "article", locale: "fr_FR", siteName: SITE_NAME, publishedTime: g.published },
    twitter: { card: "summary_large_image", title: g.title, description: g.description },
  };
}

export default function GuidePage({ params }: { params: { slug: string } }) {
  const g = getGuide(params.slug);
  if (!g) notFound();
  const related = g.related.map((s) => getGuide(s)).filter((x): x is NonNullable<typeof x> => !!x);
  const url = absolute(`/guides/${g.slug}`);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: g.h1,
            description: g.description,
            datePublished: g.published,
            dateModified: g.published,
            inLanguage: "fr-FR",
            mainEntityOfPage: url,
            author: { "@type": "Organization", name: SITE_NAME },
            publisher: { "@type": "Organization", name: SITE_NAME },
          },
          faqJsonLd(g.faq),
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Guides", url: absolute("/guides") }, { name: g.h1, url }]),
        ]}
      />
      <SiteHeader current="guides" />
      <main className="mx-auto max-w-3xl px-6 py-12">
        <nav aria-label="Fil d'Ariane" className="text-sm text-stone-500">
          <Link href="/" className="hover:text-stone-800">Accueil</Link> <span className="mx-1">/</span>
          <Link href="/guides" className="hover:text-stone-800">Guides</Link>
        </nav>

        <article className="mt-6">
          <header>
            <p className="text-xs font-semibold text-brand-700">{g.category} · {g.minutes} min de lecture</p>
            <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-stone-900 sm:text-4xl">{g.h1}</h1>
            <p className="mt-4 text-lg leading-relaxed text-stone-600">{g.intro}</p>
          </header>

          {g.tool && (
            <aside className="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-5">
              <p className="text-sm font-semibold text-brand-800">Outil gratuit, sans compte</p>
              <p className="mt-1 text-sm text-stone-700">{g.tool.text}</p>
              <Link href={g.tool.href} className="btn-primary mt-3 inline-block px-4 py-2 text-sm">{g.tool.label} →</Link>
            </aside>
          )}

          <nav aria-label="Sommaire" className="mt-8 rounded-2xl border border-line p-5">
            <p className="text-sm font-semibold text-stone-900">Dans ce guide</p>
            <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-stone-600">
              {g.sections.map((s, i) => (
                <li key={s.h2}><a href={`#s${i + 1}`} className="hover:text-brand-700">{s.h2}</a></li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 space-y-10">
            {g.sections.map((s, i) => (
              <section key={s.h2} id={`s${i + 1}`} className="scroll-mt-24">
                <h2 className="text-2xl font-bold tracking-tight text-stone-900">{s.h2}</h2>
                {s.paragraphs.map((p, k) => <p key={k} className="mt-3 leading-relaxed text-stone-700">{p}</p>)}
                {s.list && (
                  <ul className="mt-3 space-y-2 text-stone-700">
                    {s.list.map((li) => (
                      <li key={li} className="flex gap-2.5 leading-relaxed"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />{li}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>

          <section className="mt-14" aria-labelledby="faq">
            <h2 id="faq" className="text-2xl font-bold tracking-tight text-stone-900">Questions fréquentes</h2>
            <div className="mt-4 space-y-3">
              {g.faq.map((f) => (
                <details key={f.q} className="card group p-5">
                  <summary className="cursor-pointer list-none font-medium text-stone-900"><span className="mr-2 inline-block transition group-open:rotate-90">›</span>{f.q}</summary>
                  <p className="mt-2 pl-4 text-sm leading-relaxed text-stone-600">{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className="mt-14 rounded-3xl bg-stone-900 p-8 text-center text-white">
            <h2 className="text-2xl font-bold">Mets-le en pratique dans All In</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-300">Tâches, agenda, courses, recettes, budget et notes dans un seul espace, seul ou à deux.</p>
            <Link href="/signup" className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-stone-900 hover:bg-stone-100">Créer mon espace</Link>
          </section>
        </article>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-lg font-bold text-stone-900">À lire aussi</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {related.map((r) => (
                <Link key={r.slug} href={`/guides/${r.slug}`} className="card card-hover block p-5">
                  <p className="text-xs text-brand-700">{r.category}</p>
                  <p className="mt-1 font-semibold leading-snug text-stone-900">{r.h1}</p>
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
