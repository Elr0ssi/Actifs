import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";

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
    desc: "Vois routines, tâches et échéances financières au même endroit. Clique sur une date pour connaître le cumul de charges fixes jusqu'à aujourd'hui.",
  },
  {
    icon: "💶",
    title: "Finances & budget",
    desc: "Abonnements, loyers, salaires, investissements : programme chaque échéance et suis ton flux de trésorerie en direct.",
  },
];

const STEPS = [
  { n: "01", title: "Crée ton espace", desc: "Inscription en 30 secondes, gratuite et sans carte bancaire." },
  { n: "02", title: "Personnalise tout", desc: "Projets, listes, routines, budget : configure ton hub comme tu l'entends." },
  { n: "03", title: "Partage-le", desc: "Invite ton/ta partenaire pour partager listes, budget et objectifs à deux." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-200 via-brand-100 to-transparent blur-3xl" />

      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">A</span>
            Actifs
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#fonctionnalites" className="hover:text-slate-900">Fonctionnalités</a>
            <a href="#comment" className="hover:text-slate-900">Comment ça marche</a>
            <a href="#gratuit" className="hover:text-slate-900">Tarif</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">
              Connexion
            </Link>
            <Link href="/signup" className="btn-primary">Créer mon espace</Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-20 text-center sm:pt-28">
          <FadeIn>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
              100% gratuit · aucune carte bancaire requise
            </span>
          </FadeIn>
          <FadeIn delay={80}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Le hub qui organise <span className="bg-gradient-to-r from-brand-600 via-fuchsia-500 to-brand-600 bg-[length:200%_auto] bg-clip-text text-transparent animate-gradientShift">toute ta vie</span>
            </h1>
          </FadeIn>
          <FadeIn delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
              Tâches et projets, listes de courses partagées, routines quotidiennes et finances personnelles :
              un seul espace ultra personnalisé, pensé pour piloter ton quotidien avec précision.
            </p>
          </FadeIn>
          <FadeIn delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/signup" className="btn-primary px-6 py-3 text-base">
                Commencer gratuitement
              </Link>
              <a href="#fonctionnalites" className="btn-secondary px-6 py-3 text-base">
                Découvrir les fonctionnalités
              </a>
            </div>
          </FadeIn>

          <FadeIn delay={320}>
            <div className="relative mx-auto mt-16 max-w-4xl">
              <div className="absolute -left-6 top-10 hidden h-24 w-24 animate-float rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 sm:flex items-center justify-center text-3xl">
                🔥 3 routines
              </div>
              <div className="absolute -right-8 bottom-6 hidden h-24 w-28 animate-float rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 sm:flex items-center justify-center text-center text-sm font-semibold text-slate-700" style={{ animationDelay: "1.5s" }}>
                Cumul au 10/09 : 842 €
              </div>
              <div className="glass rounded-3xl p-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-inner">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-500">Aujourd'hui</p>
                    <p className="text-sm text-slate-400">Lundi 24 septembre</p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="card p-4">
                      <p className="label">Priorité haute</p>
                      <p className="mt-1 font-semibold">Démarcher 1ère entreprise</p>
                      <p className="mt-1 text-xs text-slate-500">Projet : Création boîte</p>
                    </div>
                    <div className="card p-4">
                      <p className="label">Routine</p>
                      <p className="mt-1 font-semibold">☑ Séance de sport</p>
                      <p className="mt-1 text-xs text-slate-500">Quotidienne · 7/7</p>
                    </div>
                    <div className="card p-4">
                      <p className="label">Liste de courses</p>
                      <p className="mt-1 font-semibold">4/9 articles cochés</p>
                      <p className="mt-1 text-xs text-slate-500">Repas : Poulet basquaise</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </section>

        <section id="fonctionnalites" className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce qui compte, un seul endroit</h2>
            <p className="mt-4 text-slate-600">
              Actifs remplace ton carnet, ton tableur budget et tes 5 applis de listes par un hub unique et cohérent.
            </p>
          </FadeIn>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.title} delay={i * 70}>
                <div className="card h-full p-6 transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">{f.icon}</div>
                  <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="comment" className="bg-slate-900 py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Comment ça marche</h2>
              <p className="mt-4 text-slate-300">Trois étapes, aucun frein.</p>
            </FadeIn>
            <div className="mt-14 grid gap-8 sm:grid-cols-3">
              {STEPS.map((s, i) => (
                <FadeIn key={s.n} delay={i * 100}>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <span className="text-sm font-bold text-brand-300">{s.n}</span>
                    <h3 className="mt-3 text-lg font-semibold">{s.title}</h3>
                    <p className="mt-2 text-sm text-slate-300">{s.desc}</p>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        <section id="gratuit" className="mx-auto max-w-4xl px-6 py-24 text-center">
          <FadeIn>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Complètement gratuit</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Actifs est un outil gratuit pour organiser ta vie, ton temps et tes finances. Aucune carte bancaire,
              aucune limite artificielle.
            </p>
            <div className="mx-auto mt-10 max-w-sm rounded-3xl border border-brand-200 bg-brand-50 p-8">
              <p className="text-5xl font-bold text-brand-700">0€</p>
              <p className="mt-1 text-sm text-brand-700/80">pour toujours</p>
              <ul className="mt-6 space-y-2 text-left text-sm text-slate-700">
                <li>✓ Tâches, projets & routines illimités</li>
                <li>✓ Listes et recettes partagées</li>
                <li>✓ Calendrier & budget complets</li>
                <li>✓ Partage avec ton foyer</li>
              </ul>
              <Link href="/signup" className="btn-primary mt-8 w-full py-3">Créer mon espace gratuit</Link>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <p className="text-sm text-slate-500">© {new Date().getFullYear()} Actifs. Organise ta vie, simplement.</p>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Link href="/login" className="hover:text-slate-800">Connexion</Link>
            <span>·</span>
            <Link href="/signup" className="hover:text-slate-800">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
