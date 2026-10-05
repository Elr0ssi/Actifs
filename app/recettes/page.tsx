import type { Metadata } from "next";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { pageMeta } from "@/lib/marketing/site";
import { RecipesBrowser } from "@/components/marketing/recipes-browser";
import { Bubble, Float } from "@/components/marketing/fx";
import { Ambience, CtaBanner } from "@/components/marketing/sections";

export const metadata: Metadata = pageMeta({
  title: "Recettes simples et rapides avec liste de courses automatique",
  description: "Plus de 90 recettes faciles (pâtes, riz, végétarien, rapide…) avec ingrédients, étapes et liste de courses générée automatiquement pour le bon nombre de personnes.",
  path: "/recettes",
});

export default function RecipesPage() {
  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="recettes" />
      <main>
        <section className="relative">
          <Ambience tone="amber" emojis={["🍅", "🥕", "🧅", "🧀", "🌿"]} />
          <div className="relative mx-auto max-w-4xl px-6 pb-10 pt-16 text-center">
            <Float delay={0} duration={7} amp={10} rot={2} className="absolute left-0 top-20 hidden lg:block"><Bubble icon="⏱️" title="25 min" sub="pâtes tomate basilic" tone="amber" /></Float>
            <Float delay={1.2} duration={8} amp={12} rot={-2} className="absolute right-0 top-28 hidden lg:block"><Bubble icon="🛒" title="Liste prête" sub="quantités pour 2" tone="green" /></Float>
            <FadeIn>
              <span className="rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-800">🍽️ Plus de 90 recettes</span>
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
                Des recettes <span className="bg-gradient-to-r from-amber-500 to-rose-600 bg-clip-text text-transparent">simples</span>, prêtes à cuisiner
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-stone-600">
                Ouvre une recette pour voir ingrédients et étapes. Dans All In, elle devient une liste de courses aux bonnes quantités, avec les prix de ton enseigne.
              </p>
            </FadeIn>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <FadeIn>
            <RecipesBrowser />
          </FadeIn>
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title="Ta liste de courses, générée toute seule" text="Choisis une ou plusieurs recettes : la liste se crée avec les quantités ajustées et les prix estimés, rien à recopier." secondary={{ href: "/repas", label: "Voir Repas & courses" }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
