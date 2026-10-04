import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { GUIDES } from "@/lib/marketing/guides";
import { absolute, pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Guides budget, courses, repas et organisation — All In",
  description: "Guides pratiques pour faire un budget mensuel, calculer son reste à vivre, planifier ses repas, faire sa liste de courses et s'organiser au quotidien.",
  path: "/guides",
});

const CATEGORIES = ["Budget", "Courses & repas", "Organisation"] as const;

export default function GuidesPage() {
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Guides", url: absolute("/guides") }])} />
      <SiteHeader current="guides" />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <header className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Guides pour mieux t'organiser</h1>
          <p className="mt-4 text-lg text-stone-600">Budget, courses, repas, routines : des méthodes simples et concrètes, avec des outils gratuits à essayer sans compte.</p>
        </header>

        {CATEGORIES.map((cat) => (
          <section key={cat} className="mt-14">
            <h2 className="text-xl font-bold text-stone-900">{cat}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {GUIDES.filter((g) => g.category === cat).map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="card card-hover block p-6">
                  <p className="text-xs font-medium text-brand-700">{g.minutes} min de lecture</p>
                  <h3 className="mt-2 text-lg font-semibold leading-snug text-stone-900">{g.h1}</h3>
                  <p className="mt-2 text-sm text-stone-600">{g.description}</p>
                  <p className="mt-4 text-sm font-semibold text-brand-600">Lire le guide →</p>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
      <SiteFooter />
    </div>
  );
}
