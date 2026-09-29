import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { RECIPES, getRecipe } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const recipe = getRecipe(params.slug);
  if (!recipe) return {};
  return { title: `${recipe.name} — All In`, description: recipe.desc };
}

export default function RecipeDetailPage({ params }: { params: { slug: string } }) {
  const recipe = getRecipe(params.slug);
  if (!recipe) notFound();

  const others = RECIPES.filter((r) => r.slug !== recipe.slug && r.category === recipe.category).slice(0, 3);

  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="recettes" />
      <main className="mx-auto max-w-4xl px-6 py-12">
        <Link href="/recettes" className="text-sm font-medium text-slate-500 hover:text-slate-800">← Toutes les recettes</Link>

        <FadeIn>
          <div className="relative mt-4">
            <div className="h-56 overflow-hidden rounded-3xl bg-slate-100">
              {recipe.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.image} alt={recipe.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-300">Photo à venir</div>
              )}
            </div>
            <span className="absolute -bottom-4 left-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-white text-2xl shadow-md">
              {recipe.icon}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{recipe.category}</span>
            <span className="text-sm text-slate-400">{recipe.time} · {recipe.servings} pers. · {recipe.difficulty}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">{recipe.name}</h1>
          <p className="mt-2 text-lg text-slate-600">{recipe.desc}</p>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_1.6fr]">
            <div>
              <h2 className="mb-3 font-semibold text-slate-900">Ingrédients</h2>
              <ul className="space-y-2 text-sm text-slate-700">
                {recipe.ingredients.map((ing) => (
                  <li key={ing} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-semibold text-slate-900">Préparation</h2>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={110}>
          <div className="mt-10 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
            <h2 className="font-semibold text-slate-900">Détail plus poussé</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Préparation</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{recipe.prepMinutes} min</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Cuisson</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{recipe.cookMinutes > 0 ? `${recipe.cookMinutes} min` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Temps total</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{recipe.prepMinutes + recipe.cookMinutes} min</p>
              </div>
            </div>
            {recipe.utensils.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Ustensiles nécessaires</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.utensils.map((u) => (
                    <span key={u} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm text-slate-700">
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
            <h2 className="text-xl font-bold text-slate-900">Envie de cuisiner ça cette semaine ?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Crée ton espace gratuit : All In transforme cette recette en liste de courses complète, avec quantités et
              prix estimés par enseigne.
            </p>
            <Link href="/signup" className="btn-primary mt-5 inline-block px-6 py-3 text-base">Créer ma liste de courses →</Link>
            <p className="mt-3 text-xs text-slate-400">Gratuit, sans carte bancaire.</p>
          </div>
        </FadeIn>

        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-4 font-semibold text-slate-900">Autres recettes {recipe.category.toLowerCase()}</h2>
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
