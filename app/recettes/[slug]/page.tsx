import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { RECIPES, getRecipe } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { SITE_NAME, absolute } from "@/lib/marketing/site";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const recipe = getRecipe(params.slug);
  if (!recipe) return {};
  const path = `/recettes/${recipe.slug}`;
  const title = `${recipe.name} : recette facile en ${recipe.time} (${recipe.servings} pers.)`;
  const description = `${recipe.desc} Ingrédients, étapes et liste de courses automatique.`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, url: absolute(path), type: "article", locale: "fr_FR", siteName: SITE_NAME, ...(recipe.image ? { images: [recipe.image] } : {}) },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipe(params.slug);
  if (!recipe) notFound();

  const others = RECIPES.filter((r) => r.slug !== recipe.slug && r.category === recipe.category).slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: recipe.name,
            description: recipe.desc,
            recipeCategory: recipe.category,
            recipeCuisine: "Française",
            recipeYield: `${recipe.servings} personnes`,
            prepTime: `PT${recipe.prepMinutes}M`,
            cookTime: `PT${recipe.cookMinutes}M`,
            totalTime: `PT${recipe.prepMinutes + recipe.cookMinutes}M`,
            recipeIngredient: recipe.ingredients,
            recipeInstructions: recipe.steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text })),
            ...(recipe.image ? { image: [absolute(recipe.image)] } : {}),
            author: { "@type": "Organization", name: SITE_NAME },
          },
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Recettes", url: absolute("/recettes") }, { name: recipe.name, url: absolute(`/recettes/${recipe.slug}`) }]),
        ]}
      />
      <SiteHeader current="recettes" />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/recettes" className="text-sm font-medium text-stone-500 hover:text-stone-800">← Toutes les recettes</Link>

        <FadeIn>
          <div className="relative mt-4">
            <div className="aspect-video overflow-hidden rounded-3xl bg-stone-100">
              {recipe.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-stone-300">Photo à venir</div>
              )}
            </div>
            <span className="absolute -bottom-4 left-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-surface bg-surface text-2xl shadow-md">
              {recipe.icon}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{recipe.category}</span>
            <span className="text-sm text-stone-400">{recipe.time} · {recipe.servings} pers. · {recipe.difficulty}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{recipe.name}</h1>
          <p className="mt-2 text-lg text-stone-600">{recipe.desc}</p>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_1.6fr]">
            <div>
              <h2 className="mb-3 font-semibold text-stone-900">Ingrédients</h2>
              <ul className="space-y-2 text-sm text-stone-700">
                {recipe.ingredients.map((ing) => (
                  <li key={ing} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-semibold text-stone-900">Préparation</h2>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={110}>
          <div className="mt-10 rounded-3xl border border-stone-200 bg-stone-50 p-6 sm:p-8">
            <h2 className="font-semibold text-stone-900">Détail plus poussé</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Préparation</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.prepMinutes} min</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Cuisson</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.cookMinutes > 0 ? `${recipe.cookMinutes} min` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Temps total</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.prepMinutes + recipe.cookMinutes} min</p>
              </div>
            </div>
            {recipe.utensils.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400">Ustensiles nécessaires</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.utensils.map((u) => (
                    <span key={u} className="rounded-full border border-stone-200 bg-surface px-3 py-1 text-sm text-stone-700">
                      {u}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <FadeIn delay={140}>
          <div className="mt-12 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
            <h2 className="text-xl font-bold text-stone-900">Envie de cuisiner ça cette semaine ?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              Crée ton espace gratuit : All In transforme cette recette en liste de courses complète, avec quantités et
              prix estimés par enseigne.
            </p>
            <Link href="/signup" className="btn-primary mt-5 inline-block px-6 py-3 text-base">Créer ma liste de courses →</Link>
            <p className="mt-3 text-xs text-stone-400">Gratuit, sans carte bancaire.</p>
          </div>
        </FadeIn>

        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-4 font-semibold text-stone-900">Autres recettes {recipe.category.toLowerCase()}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {others.map((r) => (
                <RecipeCard key={r.slug} recipe={r} size="small" />
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
