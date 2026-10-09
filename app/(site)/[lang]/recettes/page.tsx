import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { pageMeta } from "@/lib/marketing/site";
import Link from "@/components/marketing/link";
import { IDEAS, ideaRecipes } from "@/lib/marketing/ideas";
import { IdeasCarousel } from "@/components/marketing/ideas-carousel";
import { RecipesBrowser } from "@/components/marketing/recipes-browser";
import { Ambience, CtaBanner } from "@/components/marketing/sections";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Recettes simples et rapides avec liste de courses automatique"),
  description: tr("Plus de 90 recettes faciles (pâtes, riz, végétarien, rapide…) avec ingrédients, étapes et liste de courses générée automatiquement pour le bon nombre de personnes."),
  path: "/recettes",
});
}

export default function RecipesPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="recettes" />
      <main>
        <section className="relative">
          <Ambience tone="amber" emojis={["🍅", "🥕", "🧅", "🧀", "🌿"]} />
          <div className="relative mx-auto max-w-4xl px-6 pb-6 pt-14 text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">
                {tr("Des recettes")} <span className="bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">{tr("simples")}</span>{tr(", prêtes à cuisiner")}
              </h1>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16" aria-labelledby="idees">
          <FadeIn>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 id="idees" className="text-2xl font-bold tracking-tight text-stone-900">{tr("Idées de recettes")}</h2>
              </div>
              <Link href="/recettes/idees" className="text-sm font-semibold text-brand-700 hover:underline">{tr("Toutes les idées →")}</Link>
            </div>
            <div className="mt-5">
              <IdeasCarousel prev={tr("Précédent")} next={tr("Suivant")} items={IDEAS.map((i) => ({ slug: i.slug, icon: i.icon, label: tr(i.label), count: tr("{n} recettes", { n: ideaRecipes(i).length }) }))} />
            </div>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-32" aria-labelledby="toutes">
          <FadeIn>
            <h2 id="toutes" className="mb-5 text-2xl font-bold tracking-tight text-stone-900">{tr("Toutes les recettes")}</h2>
            <RecipesBrowser />
          </FadeIn>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-28">
          <CtaBanner title={tr("Ta liste de courses, générée toute seule")} text={tr("Choisis une ou plusieurs recettes : la liste se crée avec les quantités ajustées et les prix estimés, rien à recopier.")} secondary={{ href: "/repas", label: tr("Voir Repas & courses") }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
