import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { IDEAS, getIdea, ideaRecipes } from "@/lib/marketing/ideas";
import { absolute, localeUrl, pageMeta } from "@/lib/marketing/site";
import { getLocale } from "@/lib/i18n/server";

export function generateStaticParams() {
  return IDEAS.map((i) => ({ slug: i.slug }));
}

export function generateMetadata({ params }: { params: { lang: string; slug: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  const idea = getIdea(params.slug);
  if (!idea) return {};
  return pageMeta({ title: tr(idea.h1), description: tr(idea.intro), path: `/recettes/idees/${idea.slug}` });
}

export default function IdeaPage({ params }: { params: { lang: string; slug: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  const idea = getIdea(params.slug);
  if (!idea) notFound();
  const recipes = ideaRecipes(idea);
  const others = IDEAS.filter((i) => i.slug !== idea.slug);
  const path = `/recettes/idees/${idea.slug}`;

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: tr(idea.h1),
            numberOfItems: recipes.length,
            itemListElement: recipes.map((r, i) => ({ "@type": "ListItem", position: i + 1, url: localeUrl(`/recettes/${r.slug}`, getLocale()), name: tr(r.name) })),
          },
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: idea.faq.map((f) => ({ "@type": "Question", name: tr(f.q), acceptedAnswer: { "@type": "Answer", text: tr(f.a) } })) },
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Recettes", url: absolute("/recettes") }, { name: "Idées de recettes", url: absolute("/recettes/idees") }, { name: idea.label, url: absolute(path) }]),
        ]}
      />
      <SiteHeader current="recettes" />
      <section className="relative">
        <Ambience tone="amber" emojis={[idea.icon, "🍅", "🌿"]} />
        <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
          <FadeIn>
            <nav aria-label={tr("Fil d'Ariane")} className="mb-4 text-xs text-stone-500">
              <Link href="/recettes" className="hover:text-stone-800">{tr("Recettes")}</Link> · <Link href="/recettes/idees" className="hover:text-stone-800">{tr("Idées de recettes")}</Link>
            </nav>
            <span className="text-5xl">{idea.icon}</span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-5xl">{tr(idea.h1)}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">{tr(idea.intro)}</p>
            <p className="mt-3 text-sm font-medium text-brand-700">{tr("{n} recettes dans cette sélection", { n: recipes.length })}</p>
          </FadeIn>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 pb-24">
        <section aria-label={tr("Recettes")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recipes.slice(0, 24).map((r) => <RecipeCard key={r.slug} recipe={r} />)}
          </div>
        </section>

        <section className="mx-auto mt-20 max-w-3xl" aria-labelledby="conseils">
          <h2 id="conseils" className="text-2xl font-bold tracking-tight text-stone-900">{tr("Nos conseils")}</h2>
          <p className="mt-3 leading-relaxed text-stone-600">{tr(idea.tips)}</p>
        </section>

        <section className="mx-auto mt-16 max-w-3xl" aria-labelledby="faq-idee">
          <h2 id="faq-idee" className="text-2xl font-bold tracking-tight text-stone-900">{tr("Questions fréquentes")}</h2>
          <div className="mt-5 divide-y divide-line border-y border-line">
            {idea.faq.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">{tr(f.q)}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{tr(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20" aria-labelledby="autres-idees">
          <h2 id="autres-idees" className="text-xl font-bold text-stone-900">{tr("Autres idées de recettes")}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {others.map((i) => (
              <Link key={i.slug} href={`/recettes/idees/${i.slug}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-brand-300 hover:text-brand-700">{i.icon} {tr(i.label)}</Link>
            ))}
          </div>
        </section>

        <div className="mt-20">
          <CtaBanner title={tr("Ta liste de courses, générée toute seule")} text={tr("Choisis une ou plusieurs recettes : la liste se crée avec les quantités ajustées et les prix estimés, rien à recopier.")} secondary={{ href: "/recettes", label: tr("Toutes les recettes") }} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
