import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { Aurora, Counter, InView, Marquee } from "@/components/marketing/fx";
import { CtaBanner, FlowChain } from "@/components/marketing/sections";
import { FEATURES } from "@/lib/marketing/features";
import { cx } from "@/lib/utils";
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

const PAINS = [
  { icon: "😵", pain: "Tout est éparpillé", fix: "Le menu alimente les courses, les courses pèsent sur le budget, tout apparaît dans l'agenda.", tone: "from-brand-500 to-violet-600" },
  { icon: "🛒", pain: "Les courses coûtent cher, on jette", fix: "Une liste aux bonnes quantités, arrondie aux formats vendus, pour le bon nombre de personnes.", tone: "from-emerald-500 to-teal-600" },
  { icon: "💸", pain: "On ne sait pas où va l'argent", fix: "Calendrier financier, reste à vivre jusqu'à la prochaine paie, paiements par carte ajoutés tout seuls.", tone: "from-amber-500 to-orange-600" },
  { icon: "🔁", pain: "Les habitudes ne tiennent pas", fix: "Des routines à cocher dans l'agenda et une courbe de régularité par semaine, mois et année.", tone: "from-rose-500 to-pink-600" },
];

const REPLACES = ["Notion", "Excel", "Google Sheets", "Jow", "Google Agenda", "Todoist", "Apple Notes", "Listes papier", "Splitwise"];

const FLOW = [
  { icon: "🍽️", title: "Tu planifies le menu", sub: "Un repas par jour, pour N personnes", tone: "from-amber-400 to-orange-500" },
  { icon: "🛒", title: "La liste se crée", sub: "Quantités fusionnées, formats vendus", tone: "from-emerald-400 to-teal-500" },
  { icon: "💶", title: "Le budget suit", sub: "Dépense prévue, reste à vivre", tone: "from-sky-400 to-blue-500" },
  { icon: "📅", title: "L'agenda affiche tout", sub: "Tâches, routines, rentrées d'argent", tone: "from-brand-400 to-violet-600" },
];

const TOOLS = [
  { href: "/outils/budget-mensuel", icon: "💶", t: "Budget & reste à vivre", d: "Revenus, charges, règle 50/30/20.", rot: "-rotate-2", bg: "from-emerald-100 to-teal-50" },
  { href: "/outils/liste-de-courses", icon: "🛒", t: "Liste de courses", d: "Depuis des recettes, aux bonnes quantités.", rot: "rotate-1", bg: "from-amber-100 to-orange-50" },
  { href: "/outils/suivi-habitudes", icon: "🔁", t: "Suivi d'habitudes", d: "Jours prévus, séries, régularité.", rot: "-rotate-1", bg: "from-rose-100 to-pink-50" },
  { href: "/calculateurs", icon: "🧾", t: "Salaire net & impôt", d: "Du brut annuel au net mensuel.", rot: "rotate-2", bg: "from-sky-100 to-indigo-50" },
];

const COMPARE = [
  { before: "Notion", now: "Pages, tâches et listes reliées", icon: "📝" },
  { before: "Excel / Sheets", now: "Calendrier financier et reste à vivre", icon: "💶" },
  { before: "Jow", now: "Recettes, menu de la semaine, quantités par personne", icon: "🍽️" },
  { before: "Google Agenda", now: "Agenda horaire + flux vers Google / iPhone", icon: "📅" },
];

const FAQ = [
  { q: "All In, c'est quoi exactement ?", a: "Un espace personnel qui regroupe un agenda, des tâches et routines, des listes de courses et des recettes, un budget avec calendrier financier et des notes. Il se partage à deux (couple, colocation, famille)." },
  { q: "Puis-je essayer sans créer de compte ?", a: "Oui. Les outils gratuits (budget mensuel et reste à vivre, liste de courses par recettes, suivi d'habitudes, salaire net et impôt) fonctionnent directement dans ton navigateur, sans inscription ni abonnement." },
  { q: "All In remplace-t-il Notion, Excel, Jow et Google Agenda ?", a: "Pour un usage personnel ou à deux, oui : notes en pages, budget avec opérations récurrentes, recettes et menus, agenda horaire. Tu peux aussi garder ton agenda actuel grâce au flux de calendrier vers Google Agenda ou l'iPhone." },
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

        {/* Ce que ça remplace : défilement */}
        <section className="py-6" aria-label="Outils remplacés">
          <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-stone-400">Fini de jongler entre</p>
          <Marquee speed={50} items={REPLACES.map((r) => <span key={r} className="rounded-full border border-line bg-surface px-5 py-2 text-sm font-medium text-stone-500 line-through decoration-brand-400 decoration-2 shadow-soft">{r}</span>)} />
        </section>

        {/* Problèmes → solutions : lignes alternées, sans cartes */}
        <section className="mx-auto max-w-5xl px-6 py-24" aria-labelledby="besoins">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="besoins" className="text-3xl font-bold tracking-tight sm:text-4xl">Pour celles et ceux qui jonglent entre 5 outils</h2>
            <p className="mt-4 text-stone-600">Étudiants, jeunes actifs, couples, familles, indépendants : si tu organises ton temps, tes repas et ton argent à plusieurs endroits, All In les réunit.</p>
          </FadeIn>
          <div className="mt-16 space-y-14">
            {PAINS.map((n, i) => (
              <InView key={n.pain}>
                <div className={cx("flex flex-col items-center gap-6 sm:flex-row sm:gap-10", i % 2 === 1 && "sm:flex-row-reverse")}>
                  <div className={cx("fx-in relative flex h-28 w-28 shrink-0 items-center justify-center rounded-[2rem] bg-gradient-to-br text-5xl text-white shadow-lift", n.tone)}>
                    <span className="fx-float" style={{ "--d": `${i * 0.5}s`, "--a": "6px" } as React.CSSProperties}>{n.icon}</span>
                    <span className="absolute -inset-3 -z-10 rounded-[2.4rem] bg-gradient-to-br opacity-20 blur-xl" />
                  </div>
                  <div className={cx("fx-in text-center sm:text-left", i % 2 === 1 && "sm:text-right")} style={{ "--d": "0.12s" } as React.CSSProperties}>
                    <p className="text-sm font-semibold uppercase tracking-wider text-stone-400 line-through decoration-rose-400">{n.pain}</p>
                    <p className="mt-2 max-w-lg text-xl font-semibold leading-snug text-stone-900 sm:text-2xl">{n.fix}</p>
                  </div>
                </div>
              </InView>
            ))}
          </div>
        </section>

        {/* Fonctionnalités : pastilles-orbes vers les pages dédiées */}
        <section id="fonctionnalites" className="relative bg-stone-900 py-24 text-white">
          <div className="mx-auto max-w-6xl px-6">
            <FadeIn className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Six modules, une seule logique</h2>
              <p className="mt-4 text-stone-300">Chaque module a sa page. Clique pour voir ce qu'il fait, à quoi il sert et comment l'utiliser.</p>
            </FadeIn>
            <InView>
              <div className="mt-14 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-6">
                {FEATURES.map((f, i) => (
                  <Link key={f.slug} href={`/fonctionnalites/${f.slug}`} className="fx-in group flex flex-col items-center text-center" style={{ "--d": `${i * 0.08}s` } as React.CSSProperties}>
                    <span className={cx("fx-float flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br text-4xl shadow-lift ring-4 ring-white/10 transition group-hover:scale-110 group-hover:ring-white/30", f.gradient)} style={{ "--d": `${i * 0.6}s`, "--a": "7px" } as React.CSSProperties}>{f.icon}</span>
                    <span className="mt-4 text-sm font-semibold">{f.name}</span>
                    <span className="mt-1 line-clamp-3 text-xs leading-relaxed text-stone-400">{f.short}</span>
                  </Link>
                ))}
              </div>
            </InView>
            <p className="mt-12 text-center"><Link href="/fonctionnalites" className="inline-block rounded-xl bg-white px-6 py-3 text-sm font-semibold text-stone-900 transition hover:-translate-y-0.5 hover:bg-brand-50">Voir toutes les fonctionnalités →</Link></p>
          </div>
        </section>

        {/* Tout est relié */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ce qui change tout : c'est relié</h2>
            <p className="mt-4 text-stone-600">Une décision dans un module se répercute dans les autres. Aucune ressaisie.</p>
          </FadeIn>
          <FlowChain steps={FLOW} />
        </section>

        {/* Chiffres */}
        <section className="mx-auto max-w-6xl px-6">
          <div className="grid gap-px overflow-hidden rounded-[2rem] bg-gradient-to-r from-brand-500 via-violet-600 to-brand-800 p-px sm:grid-cols-4">
            {[[RECIPES.length, "", "recettes avec quantités par personne"], [FEATURES.length, "", "modules reliés entre eux"], [4, "", "outils gratuits, sans compte"], [GUIDES.length, "", "guides pratiques"]].map(([n, suf, l]) => (
              <div key={String(l)} className="bg-surface px-6 py-8 text-center">
                <p className="text-5xl font-bold tracking-tight text-brand-700"><Counter to={Number(n)} suffix={String(suf)} /></p>
                <p className="mt-2 text-sm text-stone-500">{l}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Outils gratuits : cartes inclinées */}
        <section className="mx-auto max-w-6xl px-6 py-24" aria-labelledby="outils">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="outils" className="text-3xl font-bold tracking-tight sm:text-4xl">Essaie gratuitement, sans compte</h2>
            <p className="mt-4 text-stone-600">Une version simple d'All In, directement dans ton navigateur. Pas d'inscription, pas d'abonnement : tes données restent chez toi.</p>
          </FadeIn>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((t, i) => (
              <FadeIn key={t.href} delay={i * 80}>
                <Link href={t.href} className={cx("group block rounded-[1.75rem] bg-gradient-to-br p-6 shadow-soft transition duration-300 hover:rotate-0 hover:-translate-y-2 hover:shadow-lift", t.bg, t.rot)}>
                  <span className="fx-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft" style={{ "--d": `${i * 0.4}s`, "--a": "5px" } as React.CSSProperties}>{t.icon}</span>
                  <h3 className="mt-5 text-lg font-bold leading-tight text-stone-900">{t.t}</h3>
                  <p className="mt-1 text-sm text-stone-600">{t.d}</p>
                  <p className="mt-5 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">Essayer →</p>
                </Link>
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Comparatif : avant → maintenant */}
        <section className="bg-stone-50 py-24" aria-labelledby="remplace">
          <div className="mx-auto max-w-4xl px-6">
            <FadeIn className="text-center">
              <h2 id="remplace" className="text-3xl font-bold tracking-tight sm:text-4xl">Ce que All In remplace</h2>
              <p className="mt-4 text-stone-600">Garde le meilleur de chaque outil, dans un seul endroit.</p>
            </FadeIn>
            <InView>
              <div className="mt-12 space-y-4">
                {COMPARE.map((c, i) => (
                  <div key={c.before} className="fx-slide flex flex-wrap items-center gap-3 sm:flex-nowrap sm:gap-4" style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>
                    <span className="rounded-full bg-stone-200 px-4 py-2 text-sm font-medium text-stone-500 line-through">{c.before}</span>
                    <span className="hidden h-px flex-1 bg-gradient-to-r from-stone-300 to-brand-400 sm:block" />
                    <span className="text-brand-500">→</span>
                    <span className="flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-lift"><span>{c.icon}</span>{c.now}</span>
                  </div>
                ))}
              </div>
            </InView>
            <p className="mt-8 text-center text-sm text-stone-500">
              <Link href="/guides/remplacer-notion-excel-jow" className="text-brand-600 underline underline-offset-4 hover:text-brand-800">Lire le guide : remplacer Notion, Excel et Jow</Link>
            </p>
          </div>
        </section>

        {/* Recettes */}
        <section className="mx-auto max-w-6xl px-6 py-24">
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

        {/* Guides : un guide à la une + liste numérotée */}
        <section className="mx-auto max-w-6xl px-6 pb-24" aria-labelledby="guides">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="guides" className="text-3xl font-bold tracking-tight sm:text-4xl">Guides pratiques</h2>
            <p className="mt-4 text-stone-600">Budget, repas, courses, routines : des méthodes simples pour mieux t'organiser.</p>
          </FadeIn>
          <div className="mt-12 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <FadeIn>
              <Link href={`/guides/${featGuide.slug}`} className="group relative block h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-600 to-violet-800 p-8 text-white">
                <span className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.14),transparent)]" aria-hidden />
                <p className="relative text-xs font-semibold uppercase tracking-widest text-brand-200">À la une · {featGuide.category}</p>
                <h3 className="relative mt-4 text-2xl font-bold leading-tight sm:text-3xl">{featGuide.h1}</h3>
                <p className="relative mt-3 line-clamp-4 text-brand-100">{featGuide.description}</p>
                <p className="relative mt-6 font-semibold transition group-hover:translate-x-1">Lire le guide →</p>
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
          <p className="mt-8 text-center"><Link href="/guides" className="btn-secondary px-5 py-2.5">Tous les guides →</Link></p>
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
          <CtaBanner title="Prêt à tout regrouper ?" text="Crée ton espace en quelques secondes, ou commence par un outil gratuit sans compte." secondary={{ href: "/outils", label: "Outils gratuits" }} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
