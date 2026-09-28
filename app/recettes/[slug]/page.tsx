import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { RECIPES, getRecipe } from "@/lib/marketing/recipes";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const recipe = getRecipe(params.slug);
  if (!recipe) return {};
  return { title: `${recipe.name} — Actifs`, description: recipe.desc };
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
          <div className={`mt-4 flex h-56 items-center justify-center rounded-3xl bg-gradient-to-br ${recipe.gradient} text-8xl`}>
            {recipe.icon}
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-2">
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

        <FadeIn delay={140}>
          <div className="mt-12 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
            <h2 className="text-xl font-bold text-slate-900">Envie de cuisiner ça cette semaine ?</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
              Crée ton espace gratuit : Actifs transforme cette recette en liste de courses complète, avec quantités et
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
                <Link key={r.slug} href={`/recettes/${r.slug}`} className="card block overflow-hidden p-0 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className={`flex h-24 items-center justify-center bg-gradient-to-br ${r.gradient} text-4xl`}>{r.icon}</div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-slate-900">{r.name}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
