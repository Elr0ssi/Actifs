import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { pageMeta } from "@/lib/marketing/site";
import Link from "@/components/marketing/link";
import { IDEAS } from "@/lib/marketing/ideas";
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
          <div className="relative mx-auto max-w-4xl px-6 pb-16 pt-20 text-center">
            <FadeIn>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">{tr("🍽️ Flozea Recettes · plus de 90 recettes")}</span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
                {tr("Des recettes")} <span className="bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">{tr("simples")}</span>{tr(", prêtes à cuisiner")}
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                {tr("Ouvre une recette pour voir ingrédients et étapes. Dans Flozea, elle devient une liste de courses aux bonnes quantités, avec les prix de ton enseigne.")}
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-32">
          <FadeIn>
            <RecipesBrowser />
          </FadeIn>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24" aria-labelledby="idees">
          <h2 id="idees" className="text-center text-2xl font-bold tracking-tight text-stone-900">{tr("Idées de recettes")}</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-stone-600">{tr("Pas d'idée pour ce soir ? Choisis une envie, on te propose des recettes simples avec leurs ingrédients, leurs étapes et la liste de courses qui va avec.")}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {IDEAS.map((i) => (
              <Link key={i.slug} href={`/recettes/idees/${i.slug}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-brand-300 hover:text-brand-700">{i.icon} {tr(i.label)}</Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-28">
          <CtaBanner title={tr("Ta liste de courses, générée toute seule")} text={tr("Choisis une ou plusieurs recettes : la liste se crée avec les quantités ajustées et les prix estimés, rien à recopier.")} secondary={{ href: "/repas", label: tr("Voir Repas & courses") }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
