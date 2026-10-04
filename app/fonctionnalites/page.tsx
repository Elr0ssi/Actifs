import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { Aurora, Bubble, Float, InView, Marquee } from "@/components/marketing/fx";
import { CtaBanner, FlowChain } from "@/components/marketing/sections";
import { MOCKS } from "@/components/marketing/mocks";
import { FEATURES } from "@/lib/marketing/features";
import { absolute, pageMeta } from "@/lib/marketing/site";
import { cx } from "@/lib/utils";

export const metadata: Metadata = pageMeta({
  title: "Fonctionnalités All In : agenda, tâches, recettes, courses, budget, notes",
  description: "Découvre tout ce que fait All In : agenda horaire, tâches et routines, recettes et menu de la semaine, listes de courses, budget et calendrier financier, notes en pages.",
  path: "/fonctionnalites",
});

const USES = ["Faire ses courses à deux", "Planifier la semaine", "Suivre son reste à vivre", "Cocher ses routines", "Cuisiner pour 2 ou pour 6", "Ranger ses notes", "Voir le salaire du lundi", "Comparer les enseignes", "Ajouter un paiement Apple Pay", "Garder Google Agenda"];

const FLOW = [
  { icon: "🍽️", title: "Menu de la semaine", sub: "Tu choisis les recettes et le nombre de personnes.", tone: "from-amber-400 to-orange-600" },
  { icon: "🛒", title: "Liste de courses", sub: "Les quantités sont fusionnées et arrondies aux formats vendus.", tone: "from-sky-400 to-blue-600" },
  { icon: "💶", title: "Budget", sub: "Tes paiements réduisent le solde et le reste à vivre.", tone: "from-fuchsia-400 to-brand-600" },
  { icon: "📅", title: "Agenda", sub: "Tâches, routines et rentrées d'argent au même endroit.", tone: "from-brand-400 to-violet-700" },
];

export default function FeaturesPage() {
  const [agenda, ...others] = FEATURES;
  const Mock = MOCKS[agenda.mock];
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Fonctionnalités", url: absolute("/fonctionnalites") }])} />
      <SiteHeader current="fonctionnalites" />
      <Aurora />
      <main>
        {/* Hero avec bulles flottantes */}
        <section className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 text-center">
          <Float delay={0} duration={7} amp={12} rot={2} className="absolute left-[2%] top-24 hidden lg:block"><Bubble icon="🍝" title="Pâtes tomate" sub="25 min · 2 pers." tone="amber" /></Float>
          <Float delay={1.5} duration={8} amp={14} rot={-2} className="absolute right-[2%] top-16 hidden lg:block"><Bubble icon="💶" title="+ 1 845 €" sub="salaire reçu" tone="green" /></Float>
          <Float delay={0.8} duration={6.5} amp={10} rot={3} className="absolute left-[6%] top-[19rem] hidden lg:block"><Bubble icon="🔥" title="12 jours" sub="série de routines" tone="rose" /></Float>
          <Float delay={2.2} duration={7.5} amp={12} rot={-3} className="absolute right-[6%] top-[18rem] hidden lg:block"><Bubble icon="🛒" title="1 kg d'oignons" sub="besoin 300 g" tone="sky" /></Float>
          <span className="rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold text-brand-700">Six modules, un seul espace</span>
          <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">
            Tout ce que fait <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">All In</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-stone-600">
            Agenda, tâches, recettes, courses, budget et notes. Chaque module a sa page, mais ils fonctionnent ensemble : le menu alimente les courses, les courses pèsent sur le budget, et tout s'affiche dans l'agenda.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">Créer mon espace</Link>
            <Link href="/outils" className="btn-secondary px-6 py-3 text-base">Outils gratuits</Link>
          </div>
        </section>

        {/* Bento */}
        <section className="mx-auto max-w-6xl px-6 pb-20" aria-label="Les fonctionnalités">
          <InView>
            <div className="grid auto-rows-[minmax(14rem,auto)] gap-4 md:grid-cols-3">
              <Link href={`/fonctionnalites/${agenda.slug}`} className={cx("fx-in group relative overflow-hidden rounded-[2rem] bg-gradient-to-br p-7 text-white md:col-span-2 md:row-span-2", agenda.gradient)}>
                <span className="text-4xl">{agenda.icon}</span>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">{agenda.name}</h2>
                <p className="mt-2 max-w-sm text-white/80">{agenda.short}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Découvrir <span className="transition group-hover:translate-x-1">→</span></span>
                <div className="pointer-events-none absolute -bottom-6 -right-6 hidden w-[62%] translate-y-4 rotate-[-4deg] transition duration-500 group-hover:rotate-0 sm:block"><Mock /></div>
              </Link>
              {others.slice(0, 2).map((f, i) => (
                <Link key={f.slug} href={`/fonctionnalites/${f.slug}`} className="fx-in group relative overflow-hidden rounded-[2rem] border border-line bg-surface p-6 transition hover:-translate-y-1 hover:shadow-lift" style={{ "--d": `${0.12 * (i + 1)}s` } as React.CSSProperties}>
                  <span className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl", f.soft)}>{f.icon}</span>
                  <h2 className="mt-4 text-xl font-bold text-stone-900">{f.name}</h2>
                  <p className="mt-1 text-sm text-stone-600">{f.short}</p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-600">Découvrir →</span>
                  <span className={cx("pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition group-hover:opacity-40", f.gradient)} />
                </Link>
              ))}
              {others.slice(2).map((f, i) => (
                <Link key={f.slug} href={`/fonctionnalites/${f.slug}`} className={cx("fx-in group relative overflow-hidden rounded-[2rem] p-6 transition hover:-translate-y-1 hover:shadow-lift", i % 2 === 0 ? "bg-stone-900 text-white" : "border border-line bg-surface")} style={{ "--d": `${0.12 * (i + 3)}s` } as React.CSSProperties}>
                  <span className={cx("flex h-12 w-12 items-center justify-center rounded-2xl text-2xl", i % 2 === 0 ? "bg-white/10" : f.soft)}>{f.icon}</span>
                  <h2 className="mt-4 text-xl font-bold">{f.name}</h2>
                  <p className={cx("mt-1 text-sm", i % 2 === 0 ? "text-stone-300" : "text-stone-600")}>{f.short}</p>
                  <span className={cx("mt-3 inline-block text-sm font-semibold", i % 2 === 0 ? "text-brand-300" : "text-brand-600")}>Découvrir →</span>
                </Link>
              ))}
            </div>
          </InView>
        </section>

        {/* Flux relié */}
        <section className="bg-stone-50 py-20" aria-labelledby="relie">
          <div className="mx-auto max-w-6xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 id="relie" className="text-3xl font-bold tracking-tight sm:text-4xl">Tout est relié</h2>
              <p className="mt-3 text-stone-600">C'est ce qui change tout par rapport à cinq applications séparées : ce que tu fais dans un module profite aux autres.</p>
            </div>
            <div className="mt-12"><FlowChain steps={FLOW} /></div>
          </div>
        </section>

        {/* Usages défilants */}
        <section className="py-16" aria-label="Exemples d'usages">
          <Marquee speed={45} items={USES.map((u) => <span key={u} className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-medium text-stone-700 shadow-soft">{u}</span>)} />
          <Marquee reverse speed={55} className="mt-3" items={[...USES].reverse().map((u) => <span key={u} className="rounded-full bg-brand-50 px-5 py-2.5 text-sm font-medium text-brand-700">{u}</span>)} />
        </section>

        <section className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title="Prêt à tout regrouper ?" text="Crée ton espace en quelques secondes, ou commence par un outil gratuit sans compte." secondary={{ href: "/outils", label: "Essayer sans compte" }} />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
