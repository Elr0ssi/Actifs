import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { RecipesBrowser } from "@/components/marketing/recipes-browser";

export const metadata: Metadata = {
  title: "Recettes — Actifs",
  description: "Des recettes faciles, avec leur liste de courses générée automatiquement dans Actifs.",
};

export default function RecipesPage() {
  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="recettes" />
      <main>
        <section className="mx-auto max-w-6xl px-6 py-16 text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Des recettes simples, prêtes à cuisiner</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Parcours-les librement. Ouvre une recette pour voir ingrédients et étapes — et si tu veux sa liste de courses
              complète (quantités et prix par enseigne compris), crée ton espace gratuit en un clic.
            </p>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <FadeIn>
            <RecipesBrowser />
          </FadeIn>
        </section>

        <section className="bg-slate-900 py-20 text-center text-white">
          <FadeIn className="mx-auto max-w-2xl px-6">
            <h2 className="text-3xl font-bold tracking-tight">Ta liste de courses, générée toute seule</h2>
            <p className="mt-3 text-slate-300">
              Dans Actifs, choisis une ou plusieurs recettes et la liste complète se crée automatiquement — quantités
              ajustées, prix estimés par enseigne, rien à recopier.
            </p>
            <Link href="/signup" className="btn-primary mt-8 inline-block px-6 py-3 text-base">Créer mon espace gratuit →</Link>
          </FadeIn>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
