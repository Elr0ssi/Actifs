import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { pageMeta } from "@/lib/marketing/site";
import { TaxCalculator } from "@/components/app/finance/tax-calculator";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Calculateur salaire brut net et impôt sur le revenu — gratuit"),
  description: tr("Passe du salaire brut annuel au net mensuel et estime ta provision d'impôt sur le revenu (barème progressif, alternance). Gratuit, sans compte."),
  path: "/calculateurs",
});
}

const POINTS = [
  { icon: "💶", title: "Brut → net mensuel", desc: "Un ratio indicatif adapté à ton statut (cadre ou non-cadre)." },
  { icon: "🧾", title: "Impôt estimé", desc: "Barème progressif français par tranches, toujours donné en fourchette." },
  { icon: "🎓", title: "Alternance prise en compte", desc: "Exonération jusqu'à 21 000 €/an sur les périodes d'alternance." },
  { icon: "📅", title: "Suivi mois après mois", desc: "Dans ton espace Flozea, ces montants sont tracés, pas juste calculés une fois." },
];

export default function CalculateursPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <SiteHeader current="calculateurs" />
      <main>
        <section className="mx-auto max-w-4xl px-6 py-16 text-center">
          <FadeIn>
            <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">{tr("Ton salaire net et ton impôt, calculés")}</h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-stone-600">
              {tr("Un aperçu gratuit de l'outil Finance de Flozea : passe du brut annuel au net mensuel, et connais ta provision d'impôt indicative. Aucun compte requis pour essayer.")}
            </p>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-3xl px-6">
          <FadeIn>
            <div className="card p-6 sm:p-8">
              <TaxCalculator />
            </div>
          </FadeIn>
          <FadeIn delay={80} className="mt-6 text-center">
            <Link href="/signup" className="btn-primary px-6 py-3 text-base">{tr("Suivre mon budget précisément →")}</Link>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-24">
          <div className="grid gap-6 sm:grid-cols-2">
            {POINTS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 70}>
                <div className="card h-full p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">{tr(p.icon)}</div>
                  <h3 className="mt-4 font-semibold text-stone-900">{tr(p.title)}</h3>
                  <p className="mt-2 text-sm text-stone-600">{tr(p.desc)}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn delay={280}>
            <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-stone-500">
              {tr("Estimation indicative à partir de ratios et d'un barème publics. Ne remplace pas ta fiche de paie ni un simulateur officiel — utile pour anticiper, pas pour déclarer.")}
            </p>
          </FadeIn>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
