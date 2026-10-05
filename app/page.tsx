import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { Aurora, Counter, Float, InView, Marquee } from "@/components/marketing/fx";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { CATEGORIES, FEATURES, categoryOf, featuresOf } from "@/lib/marketing/features";
import { cx } from "@/lib/utils";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { RECIPES } from "@/lib/marketing/recipes";
import { RecipeCard } from "@/components/marketing/recipe-card";
import { GUIDES } from "@/lib/marketing/guides";
import { SITE_NAME, SITE_URL, pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Flozea — Agenda, tâches, courses, recettes, budget et notes dans une seule appli",
  description:
    "Remplace Notion, Excel, Jow et Google Agenda par un seul espace : agenda horaire, tâches et routines, listes de courses et recettes à la bonne quantité, budget et calendrier financier, notes. Seul ou à deux, gratuit.",
  path: "/",
});

const PAINS = [
  { icon: "🧩", short: "Tout au même endroit", tone: "from-brand-500 to-violet-600" },
  { icon: "🛒", short: "Courses sans gaspillage", tone: "from-emerald-500 to-teal-600" },
  { icon: "💶", short: "Argent sous contrôle", tone: "from-amber-500 to-orange-600" },
  { icon: "🔥", short: "Habitudes qui tiennent", tone: "from-rose-500 to-pink-600" },
];

const CHAOS = [
  { n: "Notion", i: "📄", tone: "border-stone-200 bg-white text-stone-600" },
  { n: "Excel", i: "📊", tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { n: "Jow", i: "🍲", tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { n: "Agenda", i: "📆", tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { n: "Notes", i: "🗒️", tone: "border-yellow-200 bg-yellow-50 text-yellow-700" },
];

const REPLACES = ["Notion", "Excel", "Google Sheets", "Jow", "Google Agenda", "Todoist", "Apple Notes", "Listes papier", "Splitwise"];

const CASCADE = [
  { icon: "🍽️", t: "Pâtes tomate ajoutées", s: "Menu de samedi · 2 personnes", tone: "from-amber-400 to-orange-500" },
  { icon: "🛒", t: "+ 160 g de pâtes, 400 g de tomates", s: "Ta liste de courses", tone: "from-emerald-400 to-teal-500" },
  { icon: "💶", t: "− 3,40 € prévus", s: "Budget courses", tone: "from-sky-400 to-blue-500" },
  { icon: "📅", t: "Courses samedi, 10 h", s: "Dans ton agenda", tone: "from-brand-400 to-violet-600" },
];

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
];

export default function LandingPage() {
  const [featGuide, ...otherGuides] = GUIDES;
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
      <Aurora />
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-16 sm:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <FadeIn>
                <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">
                  Gratuit · seul ou à deux
                </span>
              </FadeIn>
              <FadeIn delay={80}>
                <h1 className="mt-6">
                  <span className="block bg-gradient-to-r from-brand-500 via-violet-600 to-fuchsia-600 bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl lg:text-[7.5rem] lg:leading-none">Flozea</span>
                  <span className="mt-5 block text-2xl font-bold tracking-tight text-stone-900 sm:text-3xl lg:text-4xl lg:leading-tight">Agenda, courses, budget et notes : <span className="text-brand-600">une seule appli</span></span>
                </h1>
              </FadeIn>
              <FadeIn delay={160}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-stone-600">
                  Flozea remplace Notion, Excel, Jow et Google Agenda. Ton menu de la semaine génère ta liste de courses, tes courses alimentent ton budget, et tout apparaît dans ton agenda.
                </p>
              </FadeIn>
              <FadeIn delay={240}>
                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace</Link>
                  <Link href="/fonctionnalites" className="btn-secondary px-6 py-3 text-base">Découvrir les fonctionnalités</Link>
                </div>
                <p className="mt-3 text-xs text-stone-400">Gratuit, sans carte bancaire. <Link href="/tarifs" className="underline underline-offset-2 hover:text-brand-600">Voir les tarifs</Link></p>
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

        {/* Ce que ça remplace : défilement */}
        <section className="py-6" aria-label="Outils remplacés">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-stone-400">Fini de jongler entre</p>
          <Marquee speed={50} items={REPLACES.map((r) => <span key={r} className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-medium text-stone-500 line-through decoration-brand-400 decoration-2 shadow-soft">{r}</span>)} />
        </section>

        {/* Problèmes → solutions : lignes alternées, sans cartes */}
        <section className="relative overflow-hidden" aria-labelledby="besoins">
          <Ambience tone="violet" emojis={["✨", "🧩"]} />
          <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
            <FadeIn>
              <h2 id="besoins" className="text-4xl font-extrabold tracking-tight sm:text-5xl">5 applis. <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">Une seule.</span></h2>
              <p className="mx-auto mt-3 max-w-md text-stone-600">Fini de jongler : Flozea réunit tout au même endroit.</p>
            </FadeIn>

            <div className="relative mx-auto mt-14 h-[19rem] w-[19rem] sm:h-[22rem] sm:w-[22rem]" aria-hidden>
              <span className="absolute inset-0 rounded-full border border-dashed border-brand-300/70" />
              <span className="absolute inset-[18%] rounded-full border border-brand-200/70" />
              <span className="fx-ring absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-brand-400" />
              <span className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-brand-500 to-violet-700 shadow-lift">
                <svg viewBox="0 0 32 32" className="h-14 w-14" fill="none"><circle cx="11" cy="12" r="3.4" fill="white" fillOpacity="0.55" /><circle cx="21" cy="12" r="3.4" fill="white" fillOpacity="0.55" /><circle cx="16" cy="20" r="4.6" fill="white" /></svg>
              </span>
              <div className="fx-orbit absolute inset-0" style={{ "--t": "48s" } as React.CSSProperties}>
                {CHAOS.map((c, i) => {
                  const ang = (i / CHAOS.length) * Math.PI * 2 - Math.PI / 2;
                  return (
                    <span key={c.n} className="absolute" style={{ left: `${50 + 44 * Math.cos(ang)}%`, top: `${50 + 44 * Math.sin(ang)}%`, transform: "translate(-50%, -50%)" }}>
                      <span className="fx-orbit-rev block" style={{ "--t": "48s" } as React.CSSProperties}>
                        <span className={cx("inline-flex items-center gap-1.5 whitespace-nowrap rounded-2xl border px-3 py-1.5 text-xs font-semibold shadow-soft sm:text-sm", c.tone)}><span>{c.i}</span>{c.n}</span>
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
              {PAINS.map((n, i) => (
                <FadeIn key={n.short} delay={i * 80}>
                  <span className={cx("mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br text-xl text-white shadow-lift", n.tone)}>{n.icon}</span>
                  <p className="mt-2 text-sm font-semibold text-stone-800">{n.short}</p>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>

        {/* Fonctionnalités : cartes inclinées vers les pages dédiées */}
        <section id="fonctionnalites" className="relative overflow-hidden bg-gradient-to-b from-transparent via-brand-50/70 to-transparent">
          <Ambience tone="rose" emojis={["📅","📝","🍽️","💶"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Trois univers, une seule logique</h2>
            <p className="mt-4 text-stone-600">Agenda, repas, finances : chaque fonctionnalité a sa page.</p>
          </FadeIn>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.flatMap(featuresOf).map((f, i) => (
              <FadeIn key={f.slug} delay={i * 70}>
                <Link href={`/fonctionnalites/${f.slug}`} className={cx("group block rounded-[1.75rem] bg-gradient-to-br p-6 shadow-soft transition duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-lift", FEAT_STYLE[i % FEAT_STYLE.length].bg, FEAT_STYLE[i % FEAT_STYLE.length].rot)}>
                  <span className="fx-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft" style={{ "--d": `${i * 0.4}s`, "--a": "5px" } as React.CSSProperties}>{f.icon}</span>
                  <p className="mt-4 text-[11px] font-bold uppercase tracking-wider text-stone-400">Flozea {categoryOf(f).label}</p>
                  <h3 className="mt-1 flex items-center gap-2 text-lg font-bold leading-tight text-stone-900">{f.name}{f.soon && <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">Bientôt</span>}</h3>
                  <p className="mt-1 text-sm text-stone-600">{FEAT_SHORT[f.slug] ?? f.short}</p>
                  <p className="mt-5 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">Découvrir →</p>
                </Link>
              </FadeIn>
            ))}
          </div>
          <p className="mt-12 text-center"><Link href="/fonctionnalites" className="btn-secondary px-5 py-2.5">Voir toutes les fonctionnalités →</Link></p>
        </div>
        </section>

        {/* Tout est relié : cascade de notifications */}
        <section className="relative overflow-hidden bg-sky-50/60">
          <Ambience tone="sky" emojis={["🔗", "⚡"]} />
          <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 py-24 lg:grid-cols-[1fr_1.1fr]">
            <FadeIn>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Un repas planifié.<br /><span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">Tout le reste suit.</span></h2>
              <p className="mt-4 max-w-sm text-stone-600">Menu, courses, budget et agenda se mettent à jour ensemble.</p>
            </FadeIn>
            <InView>
              <div className="relative mx-auto w-full max-w-md">
                <span className="pointer-events-none absolute left-[1.65rem] top-6 bottom-6 w-px border-l-2 border-dashed border-brand-300" aria-hidden />
                <ul className="space-y-4">
                  {CASCADE.map((c, i) => (
                    <li key={c.t} className="fx-in relative flex items-center gap-3 rounded-2xl border border-white/70 bg-surface/85 p-3 pr-4 shadow-lift backdrop-blur-xl" style={{ "--d": `${i * 0.25}s`, marginLeft: `${i % 2 ? 1.5 : 0}rem` } as React.CSSProperties}>
                      <span className={cx("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl text-white", c.tone)}>{c.icon}</span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-sm font-semibold text-stone-900">{c.t}</span>
                        <span className="block text-xs text-stone-500">{c.s}</span>
                      </span>
                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">{i === 0 ? "Toi" : "Auto"}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </InView>
          </div>
        </section>

        {/* Chiffres */}
        <section className="mx-auto max-w-6xl px-6 pb-12 pt-10">
          <div className="grid gap-px overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-500 via-violet-600 to-brand-800 p-px sm:grid-cols-3">
            {[[RECIPES.length, "", "recettes avec quantités par personne"], [FEATURES.length, "", "fonctionnalités reliées entre elles"], [GUIDES.length, "", "articles pratiques"]].map(([n, suf, l]) => (
              <div key={String(l)} className="bg-surface px-6 py-8 text-center">
                <p className="text-5xl font-bold tracking-tight text-brand-700"><Counter to={Number(n)} suffix={String(suf)} /></p>
                <p className="mt-2 text-sm text-stone-500">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Recettes */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 to-transparent">
          <Ambience tone="amber" emojis={["🍅","🥕","🧅","🧀","🌿"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Des recettes, et la liste de courses qui va avec</h2>
            <p className="mt-4 text-stone-600">Choisis une recette et un nombre de personnes : Flozea calcule les quantités à acheter, avec les prix de ton enseigne.</p>
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
        </div>
        </section>

        {/* Guides : un guide à la une + liste numérotée */}
        <section className="relative overflow-hidden bg-indigo-50/50" aria-labelledby="guides">
          <Ambience tone="sky" emojis={["📖","💡","🎯"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="guides" className="text-3xl font-bold tracking-tight sm:text-4xl">Articles pratiques</h2>
            <p className="mt-4 text-stone-600">Budget, repas, courses, routines : des méthodes simples pour mieux t'organiser.</p>
          </FadeIn>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <FadeIn>
              <Link href={`/guides/${featGuide.slug}`} className="group relative block h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-violet-800 p-8 text-white">
                <span className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.14),transparent)]" aria-hidden />
                <p className="relative text-xs font-semibold uppercase tracking-widest text-brand-200">À la une · {featGuide.category}</p>
                <h3 className="relative mt-4 text-2xl font-bold leading-tight sm:text-3xl">{featGuide.h1}</h3>
                <p className="relative mt-3 line-clamp-4 text-brand-100">{featGuide.description}</p>
                <p className="relative mt-6 font-semibold transition group-hover:translate-x-1">Lire l'article →</p>
              </Link>
            </FadeIn>
            <ol className="divide-y divide-line">
              {otherGuides.slice(0, 5).map((g, i) => (
                <FadeIn key={g.slug} delay={i * 60}>
                  <li>
                    <Link href={`/guides/${g.slug}`} className="group flex items-center gap-4 py-4">
                      <span className="w-8 text-2xl font-bold text-brand-200 transition group-hover:text-brand-500">{String(i + 2).padStart(2, "0")}</span>
                      <span className="flex-1">
                        <span className="block text-[11px] font-semibold text-brand-700">{g.category}</span>
                        <span className="block font-semibold leading-snug text-stone-900 group-hover:text-brand-700">{g.h1}</span>
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
        <section className="mx-auto max-w-3xl px-6 pb-24" aria-labelledby="faq">
          <h2 id="faq" className="text-center text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">{f.q}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-6 pb-24">
          <CtaBanner title="Prêt à tout regrouper ?" text="Crée ton espace gratuit en quelques secondes." secondary={{ href: "/tarifs", label: "Voir les tarifs" }} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
