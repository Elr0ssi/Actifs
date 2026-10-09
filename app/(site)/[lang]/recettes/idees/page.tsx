import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { IDEAS, ideaRecipes } from "@/lib/marketing/ideas";
import { absolute, pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
    title: tr("Idées de recettes faciles : tartines, poulet, pâtes, avocat, végétarien…"),
    description: tr("Pas d'idée pour ce soir ? Des idées de recettes classées par envie : tartines, avocado toast, poulet et pâtes en sauce, repas rapides, étudiants, végétariens, apéro et desserts."),
    path: "/recettes/idees",
  });
}

export default function IdeasPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Recettes", url: absolute("/recettes") }, { name: "Idées de recettes", url: absolute("/recettes/idees") }])} />
      <SiteHeader current="recettes" />
      <section className="relative">
        <Ambience tone="amber" emojis={["🥑", "🍗", "🍝", "🥪", "🍫"]} />
        <div className="relative mx-auto max-w-4xl px-6 pb-12 pt-16 text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">{tr("Idées de recettes")}</h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">{tr("Pas d'idée pour ce soir ? Choisis une envie, on te propose des recettes simples avec leurs ingrédients, leurs étapes et la liste de courses qui va avec.")}</p>
          </FadeIn>
        </div>
      </section>
      <main className="mx-auto max-w-6xl px-6 pb-24">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {IDEAS.map((i, k) => (
            <FadeIn key={i.slug} delay={k * 40}>
              <Link href={`/recettes/idees/${i.slug}`} className="card group block h-full p-6 transition hover:-translate-y-1 hover:shadow-lift">
                <span className="text-4xl">{i.icon}</span>
                <h2 className="mt-3 text-lg font-bold text-stone-900 group-hover:text-brand-700">{tr(i.label)}</h2>
                <p className="mt-1 line-clamp-3 text-sm text-stone-600">{tr(i.intro)}</p>
                <p className="mt-3 text-xs font-semibold text-brand-600">{tr("{n} recettes", { n: ideaRecipes(i).length })} →</p>
              </Link>
            </FadeIn>
          ))}
        </div>
        <div className="mt-20">
          <CtaBanner title={tr("Ta liste de courses, générée toute seule")} text={tr("Choisis une ou plusieurs recettes : la liste se crée avec les quantités ajustées et les prix estimés, rien à recopier.")} secondary={{ href: "/recettes", label: tr("Toutes les recettes") }} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
