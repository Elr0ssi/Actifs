import { HOME_FAQ_EXTRA } from "@/lib/marketing/faq-extra";
import { intlOf, lowerFor } from "@/lib/i18n";
import { MOCKS } from "@/components/marketing/mocks";
import { getLocale, getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { Aurora, Counter, Float, InView } from "@/components/marketing/fx";
import { AllInOne, WeekTimeline } from "@/components/marketing/home-sections";
import { PinnedFeatures } from "@/components/marketing/pinned-features";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { CATEGORIES, FEATURES, categoryOf, featuresOf } from "@/lib/marketing/features";
import { cx } from "@/lib/utils";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { GUIDES } from "@/lib/marketing/guides";
import { SITE_NAME, localeUrl, pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Flozea — Agenda, tâches, courses, recettes, budget et notes dans une seule appli"),
  description:
    tr("Remplace Notion, Excel, Jow et Google Agenda par un seul espace : agenda horaire, tâches et routines, listes de courses et recettes à la bonne quantité, budget et calendrier financier, notes. Seul ou à deux, gratuit."),
  path: "/",
});
}




const FEAT_STYLE = [
  { rot: "-rotate-1", bg: "from-violet-100 to-indigo-50" },
  { rot: "rotate-1", bg: "from-emerald-100 to-teal-50" },
  { rot: "-rotate-2", bg: "from-amber-100 to-orange-50" },
  { rot: "rotate-2", bg: "from-sky-100 to-blue-50" },
  { rot: "rotate-1", bg: "from-rose-100 to-pink-50" },
  { rot: "-rotate-1", bg: "from-fuchsia-100 to-purple-50" },
  { rot: "rotate-1", bg: "from-orange-100 to-rose-50" },
  { rot: "-rotate-2", bg: "from-indigo-100 to-sky-50" },
];

const FEAT_SHORT: Record<string, string> = {
  agenda: "Tâches, routines et rentrées d'argent sur une grille horaire.",
  "paiements-automatiques": "Chaque paiement Apple Pay arrive tout seul.",
  "analyse-bancaire": "Compte connecté en direct et analyse de tes dépenses.",
  "taches-et-routines": "Priorités, projets, routines à cocher et séries.",
  "recettes-et-menu-de-la-semaine": "Un menu par jour, quantités selon le nombre de personnes.",
  "liste-de-courses": "Quantités fusionnées, formats vendus, prix par enseigne.",
  "budget-et-finances": "Calendrier financier, reste à vivre, paiements Apple Pay.",
  notes: "Pages, blocs et recherche, façon Notion.",
};

const FAQ = [
  { q: "Flozea, c'est quoi exactement ?", a: "Un espace personnel qui regroupe un agenda, des tâches et routines, des listes de courses et des recettes, un budget avec calendrier financier et des notes. Il se partage à deux (couple, colocation, famille)." },
  { q: "Combien ça coûte ?", a: "L'offre gratuite donne accès à toutes les fonctionnalités : agenda, tâches, recettes, courses, budget et notes. Une offre à 3 € par mois est prévue pour connecter ton compte bancaire en direct et analyser tes dépenses." },
  { q: "Flozea remplace-t-il Notion, Excel, Jow et Google Agenda ?", a: "Pour un usage personnel ou à deux, oui : notes en pages, budget avec opérations récurrentes, recettes et menus, agenda horaire. Tu peux aussi garder ton agenda actuel grâce au flux de calendrier vers Google Agenda ou l'iPhone." },
  { q: "Comment les paiements Apple Pay arrivent-ils dans le budget ?", a: "Une automatisation de l'app Raccourcis de l'iPhone envoie chaque paiement par carte à ton espace, avec le commerçant et le montant. Le paiement est retiré de ton solde à sa date." },
  { q: "Mes données sont-elles partagées avec mon conjoint ?", a: "Uniquement avec les personnes que tu invites dans ton foyer : elles partagent alors les listes, le menu, l'agenda et le budget communs." },
  ...HOME_FAQ_EXTRA,
];

export default function LandingPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  const [featGuide, ...otherGuides] = GUIDES;
  return (
    <div className="relative overflow-x-clip">
      <JsonLd
        data={[
          { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: localeUrl("/", getLocale()), inLanguage: intlOf(getLocale()) },
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: SITE_NAME,
            url: localeUrl("/", getLocale()),
            applicationCategory: "LifestyleApplication",
            operatingSystem: "Web, iPhone, Android (application web)",
            description: tr("Agenda, tâches, routines, listes de courses, recettes, budget et notes dans un seul espace personnel, seul ou à deux."),
            inLanguage: intlOf(getLocale()),
            offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
          },
          faqJsonLd(FAQ),
        ]}
      />
      <Aurora />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto flex min-h-[calc(100svh-69px)] max-w-6xl items-center px-6 py-12 lg:py-8">
          <div className="grid w-full items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <FadeIn delay={80}>
                <h1>
                  <span className="block bg-gradient-to-r from-brand-500 via-violet-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl lg:text-[6.5rem] lg:leading-none">{tr("Flozea")}</span>
                  <span className="mt-4 block text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:leading-tight">{tr("Agenda, courses, budget et notes :")} <span className="text-brand-600">{tr("une seule appli")}</span></span>
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p className="mt-5 max-w-lg text-lg leading-relaxed text-stone-600">
                  {tr("Ton emploi du temps, tes repas, tes courses et ton budget au même endroit, seul ou à deux.")}
                </p>
              </FadeIn>
              <FadeIn delay={240}>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Link href="/signup" className="btn-primary px-6 py-3 text-base">{tr("Créer mon espace")}</Link>
                  <Link href="/fonctionnalites" className="px-2 py-3 text-base font-semibold text-stone-700 underline-offset-4 hover:text-brand-700 hover:underline">{tr("Découvrir les fonctionnalités →")}</Link>
                </div>
                <p className="mt-3 text-xs text-stone-500">{tr("Gratuit, sans carte bancaire.")} <Link href="/tarifs" className="underline underline-offset-2 hover:text-brand-600">{tr("Voir les tarifs")}</Link></p>
              </FadeIn>
            </div>

            {/* Aperçu du produit */}
            <FadeIn delay={200}>
              <div className="relative mx-auto w-full max-w-md" aria-hidden>
                <div className="card p-4 shadow-lift">
                  <div className="flex items-center justify-between text-xs font-semibold text-stone-800"><span>{tr("Agenda · semaine")}</span><span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-700">{tr("Aujourd'hui")}</span></div>
                  <div className="mt-3 grid grid-cols-5 gap-1.5 text-[10px] text-stone-500">
                    {[tr("Lun"), tr("Mar"), tr("Mer"), tr("Jeu"), tr("Ven")].map((d) => <span key={d} className="text-center">{tr(d)}</span>)}
                    <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">{tr("Réunion")}</span><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">{tr("↻ Sport")}</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-amber-500/15 px-1 py-4 text-amber-800">{tr("Appel client")}</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">{tr("↻ Lecture")}</span><span className="block rounded-md bg-sky-500/15 px-1 py-3 text-sky-800">{tr("Dentiste")}</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-brand-500/15 px-1 py-2 text-brand-800">{tr("Devis")}</span></div>
                    <div className="space-y-1"><span className="block rounded-md bg-emerald-500/15 px-1 py-1 text-emerald-700">{tr("↻ Sport")}</span><span className="block rounded-md bg-rose-500/15 px-1 py-2 text-rose-700">+ 1 845 €</span></div>
                  </div>
                </div>
                <div className="card -mt-3 ml-8 mr-[-1rem] p-4 shadow-lift">
                  <p className="text-xs font-semibold text-stone-800">{tr("Repas de la semaine")}</p>
                  <div className="mt-2 flex gap-2">
                    {[[tr("Lun"), "🍗", tr("Poulet basquaise")], [tr("Mar"), "🍝", tr("Pâtes tomate")], [tr("Mer"), "🌶️", tr("Chili sin carne")]].map(([d, e, n]) => (
                      <div key={d} className="flex-1 rounded-xl border border-line p-2"><p className="text-[10px] font-bold text-stone-700">{tr(d)}</p><p className="my-1 text-center text-2xl">{tr(e)}</p><p className="truncate text-[10px] text-stone-600">{tr(n)}</p></div>
                    ))}
                  </div>
                </div>
                <div className="card -mt-3 mr-8 p-4 shadow-lift">
                  <p className="text-xs text-stone-500">{tr("Reste à vivre jusqu'au prochain salaire")}</p>
                  <p className="text-2xl font-bold text-stone-900">642 €</p>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full w-2/3 rounded-full bg-gradient-to-r from-brand-400 to-brand-600" /></div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Tout au même endroit */}
        <AllInOne />

        {/* Les trois univers : section figée qui change au défilement */}
        <PinnedFeatures
          eyebrow={tr("Fonctionnalités")}
          title={tr("Tout ce dont tu as besoin,")}
          accent={tr("une seule logique.")}
          all={tr("Voir toutes les fonctionnalités →")}
          groups={CATEGORIES.map((c) => {
            const Mock = MOCKS[featuresOf(c)[0].mock];
            return {
              key: c.key,
              href: c.href,
              name: tr(c.name),
              icon: tr(c.icon),
              tagline: tr(c.tagline),
              gradient: c.gradient,
              see: `${tr("Voir")} ${lowerFor(getLocale(), tr(c.label))}`,
              cta: tr("Découvrir"),
              mock: <Mock />,
              features: featuresOf(c).map((f) => ({ slug: f.slug, name: tr(f.name), icon: tr(f.icon), text: tr(FEAT_SHORT[f.slug] ?? f.short), soon: !!f.soon, badge: tr("Bientôt"), soft: f.soft, gradient: f.gradient })),
            };
          })}
        />

        {/* Frise du quotidien */}
        <WeekTimeline />

        {/* Recettes */}
        <section className="relative flex items-center overflow-hidden bg-gradient-to-b from-amber-50/80 to-transparent lg:min-h-[calc(100svh-69px)]">
          <Ambience tone="amber" emojis={["🍅","🥕","🧅","🧀","🌿"]} />
          <div className="relative mx-auto w-full max-w-6xl px-6 py-24 lg:py-28">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">{tr("Des recettes, et la liste de courses qui va avec")}</h2>
            <p className="mt-4 text-stone-600">{tr("Choisis une recette et un nombre de personnes : Flozea calcule les quantités à acheter, avec les prix de ton enseigne.")}</p>
          </FadeIn>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RECIPES.slice(0, 4).map((r, i) => (
              <FadeIn key={r.slug} delay={i * 70}>
                <RecipeCard recipe={r} size="small" />
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={280} className="mt-8 text-center">
            <Link href="/recettes" className="btn-secondary px-5 py-2.5">{tr("Voir toutes les recettes →")}</Link>
          </FadeIn>
        </div>
        </section>

        {/* Guides : un guide à la une + liste numérotée */}
        <section className="relative flex items-center overflow-hidden bg-indigo-50/50 lg:min-h-[calc(100svh-69px)]" aria-labelledby="guides">
          <Ambience tone="sky" emojis={["📖","💡","🎯"]} />
          <div className="relative mx-auto w-full max-w-6xl px-6 py-24 lg:py-28">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="guides" className="text-3xl font-bold tracking-tight sm:text-4xl">{tr("Articles pratiques")}</h2>
            <p className="mt-4 text-stone-600">{tr("Budget, repas, courses, routines : des méthodes simples pour mieux t'organiser.")}</p>
          </FadeIn>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <FadeIn>
              <Link href={`/guides/${featGuide.slug}`} className="group relative block h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-violet-800 p-8 text-white">
                <span className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.14),transparent)]" aria-hidden />
                <p className="relative text-xs font-semibold uppercase tracking-widest text-brand-200">{tr("À la une ·")} {tr(featGuide.category)}</p>
                <h3 className="relative mt-4 text-2xl font-bold leading-tight sm:text-3xl">{tr(featGuide.h1)}</h3>
                <p className="relative mt-3 line-clamp-4 text-brand-100">{tr(featGuide.description)}</p>
                <p className="relative mt-6 font-semibold transition group-hover:translate-x-1">{tr("Lire l'article →")}</p>
              </Link>
            </FadeIn>
            <ol className="divide-y divide-line">
              {otherGuides.slice(0, 5).map((g, i) => (
                <FadeIn key={g.slug} delay={i * 60}>
                  <li>
                    <Link href={`/guides/${g.slug}`} className="group flex items-center gap-4 py-4">
                      <span className="w-8 text-2xl font-bold text-brand-200 transition group-hover:text-brand-500">{String(i + 2).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className="block text-[11px] font-semibold text-brand-700">{tr(g.category)}</span>
                        <span className="block font-semibold leading-snug text-stone-900 group-hover:text-brand-700">{tr(g.h1)}</span>
                      </span>
                      <span className="text-stone-300 transition group-hover:translate-x-1 group-hover:text-brand-500">→</span>
                    </Link>
                  </li>
                </FadeIn>
              ))}
            </ol>
          </div>
        </div>
        </section>

        {/* FAQ */}
        <section className="mx-auto max-w-3xl px-6 py-24 lg:py-28" aria-labelledby="faq">
          <h2 id="faq" className="text-center text-3xl font-bold tracking-tight">{tr("Questions fréquentes")}</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">{tr(f.q)}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{tr(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-28">
          <CtaBanner title={tr("Prêt à tout regrouper ?")} text={tr("Crée ton espace gratuit en quelques secondes.")} secondary={{ href: "/tarifs", label: tr("Voir les tarifs") }} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
