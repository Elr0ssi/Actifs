import type { Metadata } from "next";
import Link from "next/link";
import { FadeIn } from "@/components/marketing/fade-in";
import { Aurora, Counter, Float, InView, Marquee } from "@/components/marketing/fx";
import { Ambience, CtaBanner, FlowChain } from "@/components/marketing/sections";
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

const CHAOS = [
  { n: "Notion", i: "📄", r: 3, y: 0, tone: "border-stone-200 bg-white text-stone-600" },
  { n: "Excel", i: "📊", r: -4, y: 10, tone: "border-emerald-200 bg-emerald-50 text-emerald-700" },
  { n: "Jow", i: "🍲", r: 2, y: -6, tone: "border-amber-200 bg-amber-50 text-amber-700" },
  { n: "Google Agenda", i: "📆", r: -3, y: 8, tone: "border-sky-200 bg-sky-50 text-sky-700" },
  { n: "Notes iPhone", i: "🗒️", r: 4, y: -4, tone: "border-yellow-200 bg-yellow-50 text-yellow-700" },
  { n: "Listes papier", i: "🧾", r: -2, y: 6, tone: "border-rose-200 bg-rose-50 text-rose-700" },
];

const REPLACES = ["Notion", "Excel", "Google Sheets", "Jow", "Google Agenda", "Todoist", "Apple Notes", "Listes papier", "Splitwise"];

const FLOW = [
  { icon: "🍽️", title: "Tu planifies le menu", sub: "Un repas par jour, pour N personnes", tone: "from-amber-400 to-orange-500" },
  { icon: "🛒", title: "La liste se crée", sub: "Quantités fusionnées, formats vendus", tone: "from-emerald-400 to-teal-500" },
  { icon: "💶", title: "Le budget suit", sub: "Dépense prévue, reste à vivre", tone: "from-sky-400 to-blue-500" },
  { icon: "📅", title: "L'agenda affiche tout", sub: "Tâches, routines, rentrées d'argent", tone: "from-brand-400 to-violet-600" },
];

const FEAT_STYLE = [
  { rot: "-rotate-1", bg: "from-violet-100 to-indigo-50" },
  { rot: "rotate-1", bg: "from-emerald-100 to-teal-50" },
  { rot: "-rotate-2", bg: "from-amber-100 to-orange-50" },
  { rot: "rotate-2", bg: "from-sky-100 to-blue-50" },
  { rot: "rotate-1", bg: "from-rose-100 to-pink-50" },
  { rot: "-rotate-1", bg: "from-fuchsia-100 to-purple-50" },
];

const FEAT_SHORT: Record<string, string> = {
  agenda: "Tâches, routines et rentrées d'argent sur une grille horaire.",
  "taches-et-routines": "Priorités, projets, routines à cocher et séries.",
  "recettes-et-menu-de-la-semaine": "Un menu par jour, quantités selon le nombre de personnes.",
  "liste-de-courses": "Quantités fusionnées, formats vendus, prix par enseigne.",
  "budget-et-finances": "Calendrier financier, reste à vivre, paiements Apple Pay.",
  notes: "Pages, blocs et recherche, façon Notion.",
};

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
        <section className="relative overflow-hidden" aria-labelledby="besoins">
          <Ambience tone="violet" emojis={["😵","✨","🧩"]} />
          <div className="relative mx-auto max-w-5xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 id="besoins" className="text-3xl font-bold tracking-tight sm:text-4xl">Pour celles et ceux qui jonglent entre 5 outils</h2>
            <p className="mt-4 text-stone-600">Étudiants, jeunes actifs, couples, familles, indépendants : si tu organises ton temps, tes repas et ton argent à plusieurs endroits, All In les réunit.</p>
          </FadeIn>

          {/* Du chaos à un seul endroit */}
          <InView>
            <div className="mt-14 flex flex-wrap items-center justify-center gap-3 sm:gap-4" aria-hidden>
              {CHAOS.map((c, i) => (
                <Float key={c.n} delay={i * 0.5} duration={5 + (i % 3)} amp={8} rot={c.r} className="fx-in" >
                  <span className={cx("inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-semibold shadow-soft", c.tone)} style={{ transform: `translateY(${c.y}px)` }}>
                    <span>{c.i}</span>{c.n}
                  </span>
                </Float>
              ))}
            </div>
            <div className="relative mx-auto my-2 flex h-28 w-full max-w-xs items-center justify-center" aria-hidden>
              <svg className="absolute inset-x-0 top-0 h-16 w-full" viewBox="0 0 200 60" preserveAspectRatio="none" fill="none">
                <path d="M10 0 C 60 40, 90 30, 100 58" stroke="rgb(var(--brand-300))" strokeWidth="2" className="fx-dash" vectorEffect="non-scaling-stroke" />
                <path d="M190 0 C 140 40, 110 30, 100 58" stroke="rgb(var(--brand-300))" strokeWidth="2" className="fx-dash" vectorEffect="non-scaling-stroke" />
                <path d="M100 0 L 100 58" stroke="rgb(var(--brand-300))" strokeWidth="2" className="fx-dash" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="fx-ring absolute bottom-0 h-12 w-40 rounded-full border border-brand-400" />
              <span className="fx-in relative mt-12 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-violet-700 px-6 py-2.5 text-sm font-bold text-white shadow-lift">✨ All In : un seul endroit</span>
            </div>
            <div className="mt-10 grid divide-stone-200/80 sm:grid-cols-2 sm:divide-x lg:grid-cols-4">
              {PAINS.map((n, i) => (
                <div key={n.pain} className="fx-in px-6 py-6 text-center" style={{ "--d": `${i * 0.12}s` } as React.CSSProperties}>
                  <span className={cx("mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-2xl text-white shadow-lift", n.tone)}>{n.icon}</span>
                  <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-stone-400 line-through decoration-rose-400">{n.pain}</p>
                  <p className="mt-2 text-sm leading-relaxed text-stone-700">{n.fix}</p>
                </div>
              ))}
            </div>
          </InView>
          </div>
        </section>

        {/* Fonctionnalités : cartes inclinées vers les pages dédiées */}
        <section id="fonctionnalites" className="relative overflow-hidden bg-gradient-to-b from-transparent via-brand-50/70 to-transparent">
          <Ambience tone="rose" emojis={["📅","📝","🍽️","💶"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Six modules, une seule logique</h2>
            <p className="mt-4 text-stone-600">Chaque module a sa page. Clique pour voir ce qu'il fait et comment l'utiliser.</p>
          </FadeIn>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <FadeIn key={f.slug} delay={i * 70}>
                <Link href={`/fonctionnalites/${f.slug}`} className={cx("group block rounded-[1.75rem] bg-gradient-to-br p-6 shadow-soft transition duration-300 hover:-translate-y-2 hover:rotate-0 hover:shadow-lift", FEAT_STYLE[i % FEAT_STYLE.length].bg, FEAT_STYLE[i % FEAT_STYLE.length].rot)}>
                  <span className="fx-float flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl shadow-soft" style={{ "--d": `${i * 0.4}s`, "--a": "5px" } as React.CSSProperties}>{f.icon}</span>
                  <h3 className="mt-5 text-lg font-bold leading-tight text-stone-900">{f.name}</h3>
                  <p className="mt-1 text-sm text-stone-600">{FEAT_SHORT[f.slug] ?? f.short}</p>
                  <p className="mt-5 text-sm font-semibold text-brand-700 transition group-hover:translate-x-1">Découvrir →</p>
                </Link>
              </FadeIn>
            ))}
          </div>
          <p className="mt-12 text-center"><Link href="/fonctionnalites" className="btn-secondary px-5 py-2.5">Voir toutes les fonctionnalités →</Link></p>
        </div>
        </section>

        {/* Tout est relié */}
        <section className="relative overflow-hidden bg-sky-50/60">
          <Ambience tone="sky" emojis={["🔗","⚡","🔄"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
          <FadeIn className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ce qui change tout : c'est relié</h2>
            <p className="mt-4 text-stone-600">Une décision dans un module se répercute dans les autres. Aucune ressaisie.</p>
          </FadeIn>
          <FlowChain steps={FLOW} />
        </div>
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

        {/* Recettes */}
        <section className="relative overflow-hidden bg-gradient-to-b from-amber-50/80 to-transparent">
          <Ambience tone="amber" emojis={["🍅","🥕","🧅","🧀","🌿"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
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
        </div>
        </section>

        {/* Guides : un guide à la une + liste numérotée */}
        <section className="relative overflow-hidden bg-indigo-50/50" aria-labelledby="guides">
          <Ambience tone="sky" emojis={["📖","💡","🎯"]} />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
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
          <CtaBanner title="Prêt à tout regrouper ?" text="Crée ton espace en quelques secondes, ou commence par un outil gratuit sans compte." secondary={{ href: "/outils", label: "Outils gratuits" }} />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
