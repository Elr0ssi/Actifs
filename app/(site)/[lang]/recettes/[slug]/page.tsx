import { lowerFor } from "@/lib/i18n";
import { intlOf } from "@/lib/i18n";
import { getLocale, getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { notFound } from "next/navigation";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { RECIPES, getRecipe } from "@/lib/marketing/recipes";
import { ideasOf, ideaRecipes } from "@/lib/marketing/ideas";
import { recipeFaq } from "@/lib/marketing/recipe-faq";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { SITE_NAME, absolute, pageMeta } from "@/lib/marketing/site";
import { Ambience } from "@/components/marketing/sections";

export function generateStaticParams() {
  return RECIPES.map((r) => ({ slug: r.slug }));
}

export function generateMetadata({ params }: { params: { lang: string; slug: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  const recipe = getRecipe(params.slug);
  if (!recipe) return {};
  const title = tr("{name} : recette facile en {time} ({servings} pers.)", { name: tr(recipe.name), time: tr(recipe.time), servings: recipe.servings });
  const description = tr("{name} : {list}… Ingrédients, étapes détaillées et liste de courses automatique pour {servings} personnes.", { name: tr(recipe.name), list: recipe.ingredients.slice(0, 5).map((i) => tr(i)).join(", "), servings: recipe.servings });
  return pageMeta({ title, description, path: `/recettes/${recipe.slug}`, type: "article", images: recipe.image ? [recipe.image] : undefined });
}

export default function RecipeDetailPage({ params }: { params: { lang: string; slug: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  const recipe = getRecipe(params.slug);
  if (!recipe) notFound();

  const others = RECIPES.filter((r) => r.slug !== recipe.slug && r.category === recipe.category).slice(0, 3);
  const ideas = ideasOf(recipe);
  const alike = [...new Map(ideas.flatMap((i) => ideaRecipes(i)).filter((r) => r.slug !== recipe.slug && !others.some((o) => o.slug === r.slug)).map((r) => [r.slug, r])).values()].slice(0, 6);
  const faq = recipeFaq(recipe, tr);

  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Recipe",
            name: tr(recipe.name),
            description: tr(recipe.desc),
            recipeCategory: tr(recipe.category),
            recipeCuisine: tr("Française"),
            recipeYield: tr("{n} personnes", { n: recipe.servings }),
            inLanguage: intlOf(getLocale()),
            prepTime: `PT${recipe.prepMinutes}M`,
            cookTime: `PT${recipe.cookMinutes}M`,
            totalTime: `PT${recipe.prepMinutes + recipe.cookMinutes}M`,
            recipeIngredient: recipe.ingredients.map((x) => tr(x)),
            recipeInstructions: recipe.steps.map((text, i) => ({ "@type": "HowToStep", position: i + 1, text: tr(text) })),
            ...(recipe.image ? { image: [absolute(recipe.image)] } : {}),
            author: { "@type": "Organization", name: SITE_NAME },
          },
          { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
          breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Recettes", url: absolute("/recettes") }, { name: recipe.name, url: absolute(`/recettes/${recipe.slug}`) }]),
        ]}
      />
      <SiteHeader current="recettes" />
      <div className="absolute inset-x-0 top-0 h-[34rem]"><Ambience tone="amber" /></div>
      <main className="relative mx-auto max-w-4xl px-6 py-12">
        <Link href="/recettes" className="text-sm font-medium text-stone-500 hover:text-stone-800">{tr("← Toutes les recettes")}</Link>

        <FadeIn>
          <div className="relative mt-4">
            <div className="aspect-video overflow-hidden rounded-3xl bg-stone-100">
              {recipe.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={recipe.image} alt={tr(recipe.name)} loading="lazy" decoding="async" width={640} height={360} className="h-full w-full object-cover" />
              ) : (
                <div className={`flex h-full items-center justify-center bg-gradient-to-br ${recipe.gradient}`}><span className="text-8xl drop-shadow-sm">{tr(recipe.icon)}</span></div>
              )}
            </div>
            <span className="absolute -bottom-4 left-5 z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-surface bg-surface text-2xl shadow-md">
              {tr(recipe.icon)}
            </span>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">{tr(recipe.category)}</span>
            <span className="text-sm text-stone-500">{tr(recipe.time)} · {recipe.servings} {tr("pers. ·")} {tr(recipe.difficulty)}</span>
          </div>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{tr(recipe.name)}</h1>
          <p className="mt-2 text-lg text-stone-600">{tr(recipe.desc)}</p>
        </FadeIn>

        <FadeIn delay={80}>
          <div className="mt-10 grid gap-8 sm:grid-cols-[1fr_1.6fr]">
            <div>
              <h2 className="mb-3 font-semibold text-stone-900">{tr("Ingrédients")}</h2>
              <ul className="space-y-2 text-sm text-stone-700">
                {recipe.ingredients.map((ing) => (
                  <li key={ing} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-400" />
                    {tr(ing)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 font-semibold text-stone-900">{tr("Préparation")}</h2>
              <ol className="space-y-3">
                {recipe.steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xs font-bold text-white">{i + 1}</span>
                    <span className="pt-0.5">{tr(step)}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </FadeIn>

        <FadeIn delay={110}>
          <div className="mt-10 rounded-3xl border border-stone-200 bg-stone-50 p-6 sm:p-8">
            <h2 className="font-semibold text-stone-900">{tr("Détail plus poussé")}</h2>
            <div className="mt-5 grid gap-6 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Préparation")}</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.prepMinutes} {tr("min")}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Cuisson")}</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.cookMinutes > 0 ? `${recipe.cookMinutes} min` : "—"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Temps total")}</p>
                <p className="mt-1 text-lg font-bold text-stone-900">{recipe.prepMinutes + recipe.cookMinutes} {tr("min")}</p>
              </div>
            </div>
            {recipe.utensils.length > 0 && (
              <div className="mt-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">{tr("Ustensiles nécessaires")}</p>
                <div className="flex flex-wrap gap-2">
                  {recipe.utensils.map((u) => (
                    <span key={u} className="rounded-full border border-stone-200 bg-surface px-3 py-1 text-sm text-stone-700">
                      {tr(u)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </FadeIn>

        <section className="mt-12" aria-labelledby="faq-recette">
          <h2 id="faq-recette" className="text-xl font-bold text-stone-900">{tr("Questions fréquentes sur {name}", { name: tr(recipe.name) })}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {faq.map((f) => (
              <details key={f.q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-medium text-stone-900">{f.q}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <FadeIn delay={140}>
          <div className="mt-12 rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
            <h2 className="text-xl font-bold text-stone-900">{tr("Envie de cuisiner ça cette semaine ?")}</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">
              {tr("Crée ton espace gratuit : Flozea transforme cette recette en liste de courses complète, avec quantités et prix estimés par enseigne.")}
            </p>
            <Link href="/signup" className="btn-primary mt-5 inline-block px-6 py-3 text-base">{tr("Créer ma liste de courses →")}</Link>
            <p className="mt-3 text-xs text-stone-500">{tr("Gratuit, sans carte bancaire.")}</p>
          </div>
        </FadeIn>

        {ideas.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-3 font-semibold text-stone-900">{tr("Cette recette dans nos idées")}</h2>
            <div className="flex flex-wrap gap-2">
              {ideas.map((i) => (
                <Link key={i.slug} href={`/recettes/idees/${i.slug}`} className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium text-stone-700 transition hover:border-brand-300 hover:text-brand-700">
                  {i.icon} {tr(i.label)}
                </Link>
              ))}
            </div>
          </div>
        )}

        {alike.length > 0 && (
          <div className="mt-12">
            <h2 className="mb-4 font-semibold text-stone-900">{tr("D'autres idées dans le même esprit")}</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {alike.map((r) => (
                <RecipeCard key={r.slug} recipe={r} size="small" />
              ))}
            </div>
          </div>
        )}

        {others.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-4 font-semibold text-stone-900">{tr("Autres recettes")} {lowerFor(getLocale(), tr(recipe.category))}</h2>
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
