import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { GUIDES } from "@/lib/marketing/guides";
import { SITE_NAME, SITE_URL, pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "All In — Agenda, tâches, courses, recettes, budget et notes dans une seule appli",
  description:
    "Remplace Notion, Excel, Jow et Google Agenda par un seul espace : agenda horaire, tâches et routines, listes de courses et recettes à la bonne quantité, budget et calendrier financier, notes. Seul ou à deux. Outils gratuits sans compte.",
  path: "/",
});

const NEEDS = [
  { icon: "😵", q: "Tout est éparpillé", a: "Un agenda, un tableur, une appli de recettes, des notes : rien ne se parle. All In relie le menu de la semaine, la liste de courses, le budget et l'agenda." },
  { icon: "🛒", q: "Les courses coûtent cher et on jette", a: "Les recettes génèrent une liste aux bonnes quantités, arrondie aux formats vendus, pour le bon nombre de personnes." },
  { icon: "💸", q: "On ne sait pas où va l'argent", a: "Calendrier financier, reste à vivre jusqu'à la prochaine paie, paiements par carte ajoutés automatiquement." },
  { icon: "🔁", q: "Les bonnes habitudes ne tiennent pas", a: "Des routines cochables dans l'agenda et une courbe de régularité par semaine, par mois et par année." },
];

const FEATURES = [
  { icon: "📅", title: "Agenda horaire façon Google Agenda", desc: "Vue jour, semaine et mois. Crée une tâche en glissant sur un créneau, déplace-la, allonge sa durée. Tes routines et tes rentrées d'argent apparaissent au même endroit.", tag: "Agenda" },
  { icon: "✅", title: "Tâches, projets et routines", desc: "Priorités, projets colorés, notes dans chaque tâche, routines quotidiennes ou hebdomadaires à cocher, série de jours réussis.", tag: "Organisation" },
  { icon: "🍽️", title: "Recettes et menu de la semaine", desc: "Cartes par jour avec photo et durée, nombre de personnes réglable, fiches avec ingrédients ajustés et étapes pas à pas.", tag: "Repas" },
  { icon: "🛒", title: "Listes de courses intelligentes", desc: "Quantités fusionnées, arrondies aux formats vendus (1 kg d'oignons, paquet de 500 g), prix par enseigne et comparaison des magasins, liste partagée à deux.", tag: "Courses" },
  { icon: "💶", title: "Budget et calendrier financier", desc: "Salaire décalé le lundi quand il tombe un week-end, soldes réels datés, reste à vivre, budgets par catégorie, et paiements Apple Pay enregistrés automatiquement.", tag: "Finance" },
  { icon: "📝", title: "Notes façon Notion", desc: "Pages et sous-pages, blocs, titres, listes à cocher, citations, raccourcis Markdown et recherche dans tout le contenu.", tag: "Notes" },
];

const COMPARE = [
  { need: "Notes, tâches, listes", before: "Notion", now: "Pages, tâches et listes reliées" },
  { need: "Budget et opérations récurrentes", before: "Excel / Sheets", now: "Calendrier financier et reste à vivre" },
  { need: "Recettes et menus", before: "Jow", now: "Recettes, menu de la semaine, quantités par personne" },
  { need: "Rendez-vous et créneaux", before: "Google Agenda", now: "Agenda horaire + flux vers Google / iPhone" },
];

const FAQ = [
  { q: "All In, c'est quoi exactement ?", a: "Un espace personnel qui regroupe un agenda, des tâches et routines, des listes de courses et des recettes, un budget avec calendrier financier et des notes. Il se partage à deux (couple, colocation, famille)." },
  { q: "Puis-je essayer sans créer de compte ?", a: "Oui. Les outils gratuits (budget mensuel et reste à vivre, liste de courses par recettes, suivi d'habitudes, salaire net et impôt) fonctionnent directement dans ton navigateur, sans inscription ni abonnement." },
  { q: "All In remplace-t-il Notion, Excel, Jow et Google Agenda ?", a: "Pour un usage personnel ou à deux, oui : notes en pages, budget avec opérations récurrentes, recettes et menus, agenda horaire. Tu peux aussi garder ton agenda actuel grâce au flux de calendrier vers Google Agenda ou l'iPhone." },
  { q: "Comment les paiements Apple Pay arrivent-ils dans le budget ?", a: "Une automatisation de l'app Raccourcis de l'iPhone envoie chaque paiement par carte à ton espace, avec le commerçant et le montant. Le paiement est retiré de ton solde à sa date." },
  { q: "Mes données sont-elles partagées avec mon conjoint ?", a: "Uniquement avec les personnes que tu invites dans ton foyer : elles partagent alors les listes, le menu, l'agenda et le budget communs." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "fr-FR" },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            url: SITE_URL,
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web, iPhone, Android (application web)",
            description: "Agenda, tâches, routines, listes de courses, recettes, budget et notes dans un seul espace personnel, seul ou à deux.",
            inLanguage: "fr-FR",
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          },
          faqJsonLd(FAQ),
        ]}
      />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,#000_40%,transparent_100%)]" />
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-brand-200 via-brand-100 to-transparent blur-3xl" />

      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <FadeIn>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
                  Outils gratuits sans compte · seul ou à deux
                </span>
              </FadeIn>
              <FadeIn delay={80}>
                <h1 className="mt-6 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.4rem] lg:leading-[1.05]">
                  Agenda, courses, budget et notes : <span className="text-brand-600">une seule appli</span>
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                  All In remplace Notion, Excel, Jow et Google Agenda. Ton menu de la semaine génère ta liste de courses, tes courses alimentent ton budget, et tout apparaît dans ton agenda.
                </p>
              </FadeIn>
              <FadeIn delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace</Link>
                  <Link href="/outils" className="btn-secondary px-6 py-3 text-base">Essayer les outils gratuits</Link>
                </div>
                <p className="mt-3 text-xs text-stone-400">Les outils gratuits fonctionnent sans inscription : tes données restent dans ton navigateur.</p>
              </FadeIn>
            </div>

            {/* Aperçu du produit */}
            <FadeIn delay={200}>
              <div className="relative mx-auto w-full max-w-md" aria-hidden>
                <div className="card p-4 shadow-lift">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800"><span>Agenda · semaine</span><span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">Aujourd'hui</span></div>
                  <div className="mt-3 grid grid-cols-5 gap-1.5 text-[10px] text-stone-400">
                    {["Lun", "Mar", "Mer", "Jeu", "Ven"].map((d) => <span key={d} className="text-center">{d}</span>)}
                    <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">Réunion</span><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Sport</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-amber-500/15 px-1 py-4 text-amber-800">Appel client</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Lecture</span><span className="block rounded-md bg-sky-500/15 px-1 py-3 text-sky-800">Dentiste</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">Devis</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">↻ Sport</span><span className="block rounded-md bg-rose-500/15 px-1 py-2 text-rose-700">+ 1 845 €</span></div>
                  </div>
                </div>
                <div className="card -mt-3 ml-8 mr-[-1rem] p-4 shadow-lift">
                  <p className="text-xs font-semibold text-stone-800">Repas de la semaine</p>
                  <div className="mt-2 flex gap-2">
                    {[["Lun", "🍗", "Poulet basquaise"], ["Mar", "🍝", "Pâtes tomate"], ["Mer", "🌶️", "Chili sin carne"]].map(([d, e, n]) => (
                      <div key={d} className="flex-1 rounded-xl border border-line p-2"><p className="text-[10px] font-bold text-stone-700">{d}</p><p className="my-1 text-center text-2xl">{e}</p><p className="truncate text-[10px] text-stone-600">{n}</p></div>
                    ))}
                  </div>
                </div>
                <div className="card -mt-3 mr-8 p-4 shadow-lift">
                  <p className="text-xs text-stone-500">Reste à vivre jusqu'au prochain salaire</p>
                  <p className="text-2xl font-bold text-stone-900">642 €</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" /></div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Besoins */}
        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="besoins">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="besoins" className="text-3xl font-bold tracking-tight sm:text-4xl">Pour celles et ceux qui jonglent entre 5 outils</h2>
            <p className="mt-4 text-stone-600">Étudiants, jeunes actifs, couples, familles, indépendants : si tu organises ton temps, tes repas et ton argent à plusieurs endroits, All In les réunit.</p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {NEEDS.map((n, i) => (
              <FadeIn key={n.q} delay={i * 70}>
                <div className="card h-full p-6">
                  <span className="text-3xl">{n.icon}</span>
                  <h3 className="mt-3 font-semibold text-stone-900">{n.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-stone-600">{n.a}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Fonctionnalités */}
        <section id="fonctionnalites" className="bg-stone-50 py-20">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Tout ce qui compte, relié</h2>
              <p className="mt-4 text-stone-600">Chaque module sert aux autres : c'est ce qui change tout par rapport à des applications séparées.</p>
            </FadeIn>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f, i) => (
                <FadeIn key={f.title} delay={i * 60}>
                  <article className="card h-full p-6 transition hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">{f.icon}</div>
                      <span className="text-[11px] font-semibold text-brand-700">{f.tag}</span>
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-stone-900">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.desc}</p>
                  </article>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Outils gratuits */}
        <section className="mx-auto max-w-6xl px-6 py-20" aria-labelledby="outils">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="outils" className="text-3xl font-bold tracking-tight sm:text-4xl">Essaie gratuitement, sans compte</h2>
            <p className="mt-4 text-stone-600">Une version simple d'All In, directement dans ton navigateur. Pas d'inscription, pas d'abonnement : tes données restent chez toi.</p>
          </FadeIn>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: "/outils/budget-mensuel", icon: "💶", t: "Budget & reste à vivre", d: "Revenus, charges, règle 50/30/20." },
              { href: "/outils/liste-de-courses", icon: "🛒", t: "Liste de courses", d: "Depuis des recettes, aux bonnes quantités." },
              { href: "/outils/suivi-habitudes", icon: "🔁", t: "Suivi d'habitudes", d: "Jours prévus, séries, régularité." },
              { href: "/calculateurs", icon: "🧾", t: "Salaire net & impôt", d: "Du brut annuel au net mensuel." },
            ].map((t, i) => (
              <FadeIn key={t.href} delay={i * 60}>
                <Link href={t.href} className="card card-hover block h-full p-6">
                  <span className="text-3xl">{t.icon}</span>
                  <h3 className="mt-3 font-semibold text-stone-900">{t.t}</h3>
                  <p className="mt-1 text-sm text-stone-600">{t.d}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-600">Essayer →</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Comparatif */}
        <section className="bg-stone-900 py-20 text-white" aria-labelledby="remplace">
          <div className="mx-auto max-w-4xl px-6">
            <FadeIn className="text-center">
              <h2 id="remplace" className="text-3xl font-bold tracking-tight sm:text-4xl">Ce que All In remplace</h2>
              <p className="mt-4 text-stone-300">Garde le meilleur de chaque outil, dans un seul endroit.</p>
            </FadeIn>
            <div className="mt-10 overflow-hidden rounded-2xl border border-white/10">
              {COMPARE.map((c) => (
                <div key={c.need} className="grid gap-1 border-b border-white/10 p-4 last:border-0 sm:grid-cols-[1.2fr_1fr_1.6fr] sm:items-center sm:gap-4">
                  <p className="font-semibold">{c.need}</p>
                  <p className="text-sm text-stone-400 line-through decoration-stone-600">{c.before}</p>
                  <p className="text-sm text-brand-200">→ {c.now}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-stone-400">
              <Link href="/guides/remplacer-notion-excel-jow" className="text-brand-300 underline underline-offset-4 hover:text-white">Lire le guide : remplacer Notion, Excel et Jow</Link>
            </p>
          </div>
        </section>

        {/* Recettes */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Des recettes, et la liste de courses qui va avec</h2>
            <p className="mt-4 text-stone-600">Choisis une recette et un nombre de personnes : All In calcule les quantités à acheter, avec les prix de ton enseigne.</p>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RECIPES.slice(0, 4).map((r, i) => (
              <FadeIn key={r.slug} delay={i * 70}>
                <RecipeCard recipe={r} size="small" />
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={280} className="mt-8 text-center">
            <Link href="/recettes" className="btn-secondary px-5 py-2.5">Voir toutes les recettes →</Link>
          </FadeIn>
        </section>

        {/* Guides */}
        <section className="bg-stone-50 py-20" aria-labelledby="guides">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 id="guides" className="text-3xl font-bold tracking-tight sm:text-4xl">Guides pratiques</h2>
              <p className="mt-4 text-stone-600">Budget, repas, courses, routines : des méthodes simples pour mieux t'organiser.</p>
            </FadeIn>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {GUIDES.slice(0, 6).map((g, i) => (
                <FadeIn key={g.slug} delay={i * 50}>
                  <Link href={`/guides/${g.slug}`} className="card card-hover block h-full p-6">
                    <p className="text-xs font-semibold text-brand-700">{g.category}</p>
                    <h3 className="mt-2 font-semibold leading-snug text-stone-900">{g.h1}</h3>
                    <p className="mt-2 line-clamp-3 text-sm text-stone-600">{g.description}</p>
                  </Link>
                </FadeIn>
              ))}
            </div>
            <p className="mt-8 text-center"><Link href="/guides" className="btn-secondary px-5 py-2.5">Tous les guides →</Link></p>
          </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-20" aria-labelledby="faq">
          <h2 id="faq" className="text-center text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          <div className="mt-8 space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="card group p-5">
                <summary className="cursor-pointer list-none font-medium text-stone-900"><span className="mr-2 inline-block transition group-open:rotate-90">›</span>{f.q}</summary>
                <p className="mt-2 pl-4 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Prêt à tout regrouper ?</h2>
          <p className="mx-auto mt-4 max-w-xl text-stone-600">Crée ton espace en quelques secondes, ou commence par un outil gratuit sans compte.</p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace</Link>
            <Link href="/outils" className="btn-secondary px-6 py-3 text-base">Outils gratuits</Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
