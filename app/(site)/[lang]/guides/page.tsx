import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { GUIDES } from "@/lib/marketing/guides";
import { absolute, pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Guides budget, courses, repas et organisation — Flozea"),
  description: tr("Guides pratiques pour faire un budget mensuel, calculer son reste à vivre, planifier ses repas, faire sa liste de courses et s'organiser au quotidien."),
  path: "/guides",
});
}

const CATEGORIES = [
  { name: "Budget", emoji: "💶", band: "bg-emerald-50/70", chip: "bg-emerald-100 text-emerald-800", grad: "from-emerald-500 to-teal-700" },
  { name: "Courses & repas", emoji: "🍽️", band: "bg-amber-50/70", chip: "bg-amber-100 text-amber-800", grad: "from-amber-500 to-orange-700" },
  { name: "Organisation", emoji: "✅", band: "bg-rose-50/60", chip: "bg-rose-100 text-rose-800", grad: "from-rose-500 to-pink-700" },
  { name: "Agenda & notes", emoji: "📅", band: "bg-indigo-50/60", chip: "bg-indigo-100 text-indigo-800", grad: "from-brand-500 to-violet-700" },
] as const;

export default function GuidesPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Guides", url: absolute("/guides") }])} />
      <SiteHeader current="guides" />
      <main>
        <header className="mx-auto max-w-2xl px-6 pb-12 pt-16 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{tr("Guides pour mieux t'organiser")}</h1>
          <p className="mt-4 text-lg text-stone-600">{tr("Budget, courses, repas, routines, agenda :")} {GUIDES.length} {tr("méthodes simples et concrètes,.")}</p>
          <nav aria-label={tr("Catégories")} className="mt-6 flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((c) => <a key={c.name} href={`#${c.name.replace(/\W+/g, "-")}`} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${c.chip}`}>{tr(c.emoji)} {tr(c.name)}</a>)}
          </nav>
        </header>

        {CATEGORIES.map((c) => {
          const list = GUIDES.filter((g) => g.category === c.name);
          const [first, ...rest] = list;
          if (!first) return null;
          return (
            <section key={c.name} id={c.name.replace(/\W+/g, "-")} className={`${c.band} py-14`}>
              <div className="mx-auto max-w-5xl px-6">
                <h2 className="text-2xl font-bold text-stone-900">{tr(c.emoji)} {tr(c.name)}</h2>
                <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                  <Link href={`/guides/${first.slug}`} className={`group relative block overflow-hidden rounded-[2rem] bg-gradient-to-br ${c.grad} p-7 text-white`}>
                    <span className="fx-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,0.14),transparent)]" aria-hidden />
                    <p className="relative text-xs font-semibold uppercase tracking-widest text-white/70">{tr("À lire en premier ·")} {first.minutes} {tr("min")}</p>
                    <h3 className="relative mt-3 text-2xl font-bold leading-tight">{tr(first.h1)}</h3>
                    <p className="relative mt-3 line-clamp-3 text-white/85">{tr(first.description)}</p>
                    <p className="relative mt-5 font-semibold transition group-hover:translate-x-1">{tr("Lire le guide →")}</p>
                  </Link>
                  <ul className="divide-y divide-stone-200/80">
                    {rest.map((g) => (
                      <li key={g.slug}>
                        <Link href={`/guides/${g.slug}`} className="group flex items-start gap-3 py-3.5">
                          <span className="mt-1 text-brand-400 transition group-hover:translate-x-1">→</span>
                          <span>
                            <span className="block font-semibold leading-snug text-stone-900 group-hover:text-brand-700">{tr(g.h1)}</span>
                            <span className="text-xs text-stone-500">{g.minutes} {tr("min de lecture")}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </main>
      <SiteFooter />
    </div>
  );
}
