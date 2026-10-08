import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { JsonLd, breadcrumbJsonLd } from "@/components/marketing/json-ld";
import { absolute, pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Outils gratuits : budget, liste de courses, habitudes, salaire net — sans inscription"),
  description: tr("Quatre outils gratuits sans compte ni abonnement : calculateur de budget et reste à vivre, générateur de liste de courses, suivi d'habitudes, salaire net et impôt."),
  path: "/outils",
});
}

const TOOLS = [
  { href: "/outils/budget-mensuel", icon: "💶", title: "Budget mensuel & reste à vivre", text: "Revenus, charges, épargne : ton reste à vivre, ton budget par jour et la règle 50/30/20." },
  { href: "/outils/liste-de-courses", icon: "🛒", title: "Liste de courses par recettes", text: "Choisis des recettes et le nombre de personnes : liste fusionnée, classée par rayon, aux bons formats." },
  { href: "/outils/suivi-habitudes", icon: "🔁", title: "Suivi d'habitudes", text: "Un habit tracker simple : jours prévus, séries, régularité de la semaine." },
  { href: "/calculateurs", icon: "🧾", title: "Salaire net & impôt", text: "Du brut annuel au net mensuel, et une provision d'impôt indicative." },
];

export default function OutilsPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", url: absolute("/") }, { name: "Outils gratuits", url: absolute("/outils") }])} />
      <SiteHeader current="outils" />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <header className="mx-auto max-w-2xl text-center">
          <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{tr("Gratuits · sans compte · sans abonnement")}</span>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{tr("Des outils gratuits pour t'organiser")}</h1>
          <p className="mt-4 text-lg text-stone-600">{tr("La version simple de Flozea, directement dans ton navigateur. Tes données restent sur ton appareil : rien à créer, rien à payer.")}</p>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href} className="card card-hover block p-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl">{tr(t.icon)}</span>
              <h2 className="mt-4 text-lg font-semibold text-stone-900">{tr(t.title)}</h2>
              <p className="mt-1 text-sm text-stone-600">{tr(t.text)}</p>
              <p className="mt-4 text-sm font-semibold text-brand-600">{tr("Ouvrir l'outil →")}</p>
            </Link>
          ))}
        </div>

        <section className="mt-20 rounded-3xl border border-line bg-surface p-8">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">{tr("Gratuit sans compte, ou espace complet")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="font-semibold text-stone-900">{tr("Les outils gratuits")}</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {[tr("Aucune inscription, aucun abonnement"), tr("Données stockées dans ton navigateur"), tr("Parfaits pour tester une méthode ou un calcul"), tr("Un outil à la fois, sur un seul appareil")].map((i) => <li key={i} className="flex gap-2"><span className="text-emerald-600">✓</span>{tr(i)}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-stone-900">{tr("L'espace Flozea")}</h3>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {[tr("Tout relié : agenda, tâches, courses, recettes, budget, notes"), tr("Synchronisé sur tous tes appareils et partagé à deux"), tr("Prix par enseigne, paiements Apple Pay, calendrier financier"), tr("Flux d'agenda vers Google Agenda et iPhone")].map((i) => <li key={i} className="flex gap-2"><span className="text-brand-600">✓</span>{tr(i)}</li>)}
              </ul>
              <Link href="/signup" className="btn-primary mt-5 inline-block px-5 py-2.5">{tr("Créer mon espace")}</Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
