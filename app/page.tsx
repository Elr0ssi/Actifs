import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";

const FEATURES = [
  {
    icon: "✅",
    title: "Tâches & projets",
    desc: "Organise tes journées, priorise ce qui compte vraiment et regroupe tes tâches par projet : Achats, Création d'entreprise, Sport, tout y passe.",
  },
  {
    icon: "🛒",
    title: "Listes partagées",
    desc: "Colle une liste générée par ChatGPT, elle devient une checklist. Coche, partage à deux, classe par catégorie et garde les articles restants d'une fois sur l'autre.",
  },
  {
    icon: "🍽️",
    title: "Recettes préréglées",
    desc: "Crée un repas une fois : sa liste de courses complète se génère en un clic, avec des notes sur où trouver chaque article (Monoprix Montparnasse, Carrefour Créteil...).",
  },
  {
    icon: "🔁",
    title: "Routines & habitudes",
    desc: "Programme tes séances de sport, tes avancées de projet, tes rituels quotidiens ou hebdomadaires et coche-les au fil de l'eau.",
  },
  {
    icon: "📅",
    title: "Calendrier intelligent",
    desc: "Vois routines et tâches au même endroit, avec un défilement fluide entre les jours et les mois.",
  },
  {
    icon: "💶",
    title: "Finances & budget",
    desc: "Comptes Courant, Épargne, Investissement, budget mensuel et calculateur d'impôt : ton flux de trésorerie en direct.",
  },
];

const STEPS = [
  { n: "01", title: "Crée ton espace", desc: "Inscription en 30 secondes, gratuite et sans carte bancaire." },
  { n: "02", title: "Personnalise tout", desc: "Projets, listes, routines, budget : configure ton hub comme tu l'entends." },
  { n: "03", title: "Partage-le", desc: "Invite ton/ta partenaire pour partager listes, budget et objectifs à deux." },
];

const TEASER_RECIPES = RECIPES.slice(0, 4);

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-200 via-brand-100 to-transparent blur-3xl" />

      <SiteHeader />

      <main>
        <section className="mx-auto max-w-4xl px-6 pb-16 pt-20 text-center sm:pt-28">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              100% gratuit · aucune carte bancaire requise
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
              Le hub qui organise <span className="text-brand-600">toute ta vie</span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mx-auto mt-6 max-w-xl text-lg text-stone-600">
              Tâches et projets, listes de courses partagées, routines quotidiennes et finances personnelles :
              un seul espace ultra personnalisé, pensé pour piloter ton quotidien avec précision.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Commencer gratuitement
              </Link>
              <Link href="/#fonctionnalites" className="btn-secondary px-6 py-3 text-base">
                Découvrir les fonctionnalités
              </Link>
            </div>
          </FadeIn>
        </section>

        <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce qui compte, un seul endroit</h2>
            <p className="mt-4 text-stone-600">
              All In remplace ton carnet, ton tableur budget et tes 5 applis de listes par un hub unique et cohérent.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 70}>
                <div className="card h-full p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="comment" className="bg-stone-900 py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
              <p className="mt-4 text-stone-300">Trois étapes, aucun frein.</p>
            </FadeIn>
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <FadeIn key={s.n} delay={i * 100}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <span className="text-sm font-bold text-brand-300">{s.n}</span>
                    <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-stone-300">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Des recettes, et leur liste de courses en un clic</h2>
            <p className="mt-4 text-stone-600">
              Choisis une recette, All In génère la liste de courses complète — quantités et prix par enseigne compris.
            </p>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEASER_RECIPES.map((r, i) => (
              <FadeIn key={r.slug} delay={i * 70}>
                <RecipeCard recipe={r} size="small" />
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={280} className="mt-8 text-center">
            <Link href="/recettes" className="btn-secondary px-5 py-2.5">Voir toutes les recettes →</Link>
          </FadeIn>
        </section>

        <section className="bg-stone-50 py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <FadeIn>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ton salaire et ton impôt, calculés</h2>
              <p className="mx-auto mt-4 max-w-xl text-stone-600">
                Un aperçu gratuit de l'outil Finance : passe du brut annuel au net mensuel, et connais ta provision
                d'impôt indicative — sans créer de compte.
              </p>
              <Link href="/calculateurs" className="btn-primary mt-7 inline-block px-6 py-3 text-base">Essayer le calculateur →</Link>
            </FadeIn>
          </div>
        </section>

        <section id="gratuit" className="mx-auto max-w-3xl px-6 py-24 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Complètement gratuit</h2>
            <p className="mx-auto mt-4 max-w-xl text-stone-600">
              Aucune carte bancaire, aucune limite artificielle. Tout est inclus.
            </p>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace gratuit</Link>
              <Link href="/tarifs" className="btn-secondary px-6 py-3 text-base">Voir le détail →</Link>
            </div>
          </FadeIn>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
