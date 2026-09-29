import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";

export const metadata: Metadata = {
  title: "Tarifs — All In",
  description: "All In est 100% gratuit : tâches, listes, routines, calendrier et finances, sans carte bancaire ni limite.",
};

const INCLUDED = [
  "Tâches, projets & routines illimités",
  "Listes de courses et recettes partagées",
  "Calendrier & suivi financier complets",
  "Comptes Courant, Épargne, Investissement",
  "Calculateurs salaire net & impôt",
  "Partage avec ton foyer",
];

const FAQ = [
  { q: "All In est-il vraiment gratuit ?", a: "Oui, entièrement. Aucune carte bancaire n'est demandée à l'inscription, et il n'y a pas de palier payant caché." },
  { q: "Y a-t-il une limite de listes, tâches ou opérations ?", a: "Non, tout est illimité : projets, listes, routines, opérations financières." },
  { q: "Puis-je partager mon espace ?", a: "Oui, invite ton/ta partenaire avec un code : vous partagez alors listes, budget et objectifs à deux." },
  { q: "Est-ce que mes données financières sont fiables ?", a: "All In affiche toujours des estimations tracées et explicables, jamais des montants inventés — et le calcul détaillé est visible à chaque fois." },
];

export default function TarifsPage() {
  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="tarifs" />
      <main>
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">Complètement gratuit</h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">
              All In est un outil gratuit pour organiser ta vie, ton temps et tes finances. Aucune carte bancaire,
              aucune limite artificielle.
            </p>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-lg px-6">
          <FadeIn>
            <div className="rounded-3xl border border-brand-200 bg-brand-50 p-8 text-center">
              <p className="text-6xl font-bold text-brand-700">0€</p>
              <p className="mt-1 text-sm text-brand-700/80">pour toujours</p>
              <ul className="mt-6 space-y-2 text-left text-sm text-slate-700">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-0.5 text-emerald-600">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary mt-8 block w-full py-3">Créer mon espace gratuit</Link>
            </div>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-24">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">Questions fréquentes</h2>
          </FadeIn>
          <div className="mt-8 space-y-3">
            {FAQ.map((f, i) => (
              <FadeIn key={f.q} delay={i * 60}>
                <details className="card group p-5">
                  <summary className="cursor-pointer list-none font-medium text-slate-900">
                    <span className="mr-2 inline-block transition group-open:rotate-90">›</span>{f.q}
                  </summary>
                  <p className="mt-2 pl-4 text-sm text-slate-600">{f.a}</p>
                </details>
              </FadeIn>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
