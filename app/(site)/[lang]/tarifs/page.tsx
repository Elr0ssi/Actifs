import { TARIFS_FAQ_EXTRA } from "@/lib/marketing/faq-extra";
import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { FadeIn } from "@/components/marketing/fade-in";
import { JsonLd, faqJsonLd } from "@/components/marketing/json-ld";
import { Bubble, Float } from "@/components/marketing/fx";
import { Ambience, CtaBanner } from "@/components/marketing/sections";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Tarifs Flozea : offre gratuite complète et offre à 3 € par mois"),
  description: tr("Flozea est gratuit : agenda, tâches, recettes, courses, budget et notes. L'offre à 3 € par mois, bientôt, connecte ton compte bancaire en direct et analyse tes dépenses."),
  path: "/tarifs",
});
}

const FREE = [
  { icon: "📅", text: "Agenda horaire, vues jour, semaine et mois" },
  { icon: "✅", text: "Tâches, projets et routines illimités" },
  { icon: "📝", text: "Notes en pages et sous-pages" },
  { icon: "🍽️", text: "Recettes et menu de la semaine" },
  { icon: "🛒", text: "Listes de courses aux bonnes quantités" },
  { icon: "💶", text: "Calendrier financier et reste à vivre" },
  { icon: "💳", text: "Paiements Apple Pay ajoutés automatiquement" },
  { icon: "👫", text: "Partage avec ton foyer" },
  { icon: "🔗", text: "Flux vers Google Agenda et iPhone" },
];

const PREMIUM = [
  { icon: "✨", text: "Tout ce qui est dans l'offre gratuite" },
  { icon: "🔗", text: "Connexion directe de ton compte bancaire" },
  { icon: "⚡", text: "Opérations importées automatiquement" },
  { icon: "📊", text: "Analyse de tes dépenses par catégorie" },
  { icon: "🔁", text: "Repérage des abonnements et récurrences" },
];

const FAQ = [
  { q: "Flozea est-il vraiment gratuit ?", a: "Oui. L'offre gratuite donne accès à toutes les fonctionnalités : agenda, tâches, recettes, courses, budget et notes. Aucune carte bancaire n'est demandée à l'inscription." },
  { q: "Y a-t-il une limite de listes, tâches ou opérations ?", a: "Non, tout est illimité dans l'offre gratuite : projets, listes, routines, opérations financières." },
  { q: "Que fait l'offre à 3 € par mois ?", a: "Elle permettra de connecter ton compte bancaire en direct pour que tes opérations arrivent automatiquement, et d'obtenir une analyse de tes dépenses." },
  { q: "L'offre à 3 € par mois est-elle disponible ?", a: "Pas encore : elle est en préparation. Tu peux utiliser dès aujourd'hui l'offre gratuite, y compris les paiements Apple Pay automatiques." },
  { q: "Puis-je partager mon espace ?", a: "Oui, invite ton ou ta partenaire avec un code : vous partagez alors listes, menu, agenda et budget." },
  ...TARIFS_FAQ_EXTRA,
];

export default function TarifsPage({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <JsonLd data={faqJsonLd(FAQ)} />
      <SiteHeader current="tarifs" />
      <main>
        <section className="relative">
          <Ambience tone="violet" emojis={["💶", "🎁", "✨", "🏦"]} />
          <div className="relative mx-auto max-w-3xl px-6 pb-12 pt-16 text-center">
            <FadeIn>
              <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-6xl">{tr("Des tarifs")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("simples")}</span></h1>
              <p className="mx-auto mt-5 max-w-xl text-lg text-stone-600">{tr("Une offre gratuite complète pour organiser ta vie, et une offre à 3 € par mois pour connecter ton compte bancaire.")}</p>
            </FadeIn>
          </div>
        </section>

        <section className="relative mx-auto grid max-w-5xl gap-6 px-6 pb-10 lg:grid-cols-2">
          <FadeIn>
            <div className="h-full rounded-[2rem] border border-brand-200 bg-gradient-to-br from-brand-50 to-surface p-8">
              <p className="text-sm font-bold uppercase tracking-widest text-brand-700">{tr("Gratuit")}</p>
              <p className="mt-3 flex items-end gap-2"><span className="text-6xl font-bold text-stone-900">0 €</span><span className="pb-2 text-sm text-stone-500">{tr("pour toujours")}</span></p>
              <p className="mt-2 text-sm text-stone-600">{tr("Toutes les fonctionnalités, sans limite.")}</p>
              <ul className="mt-6 space-y-2.5">
                {FREE.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm text-stone-700">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-base shadow-soft">{tr(f.icon)}</span>{tr(f.text)}
                  </li>
                ))}
              </ul>
              <Link href="/signup" className="btn-primary mt-8 block w-full py-3 text-center">{tr("Créer mon espace gratuit")}</Link>
            </div>
          </FadeIn>

          <FadeIn delay={120}>
            <div className="relative h-full overflow-hidden rounded-[2rem] bg-gradient-to-br from-stone-900 via-indigo-950 to-violet-900 p-8 text-white">
              <div className="fx-drift pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-500/40 blur-3xl" aria-hidden />
              <div className="relative flex items-center justify-between">
                <p className="text-sm font-bold uppercase tracking-widest text-violet-200">{tr("Connexion bancaire")}</p>
                <span className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase text-white">{tr("Bientôt")}</span>
              </div>
              <p className="relative mt-3 flex items-end gap-2"><span className="text-6xl font-bold">3 €</span><span className="pb-2 text-sm text-violet-200">{tr("par mois")}</span></p>
              <p className="relative mt-2 text-sm text-violet-100">{tr("Ton compte bancaire relié en direct, et une analyse de tes dépenses.")}</p>
              <ul className="relative mt-6 space-y-2.5">
                {PREMIUM.map((f) => (
                  <li key={f.text} className="flex items-center gap-3 text-sm text-violet-50">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/10 text-base">{tr(f.icon)}</span>{tr(f.text)}
                  </li>
                ))}
              </ul>
              <Float delay={0.4} duration={7} amp={10} rot={2} className="absolute right-4 bottom-28 hidden sm:block"><Bubble icon="📊" title={tr("Alimentation")} sub={tr("− 8 % ce mois-ci")} tone="green" /></Float>
              <span className="relative mt-8 block w-full cursor-not-allowed rounded-xl bg-white/15 py-3 text-center text-sm font-semibold text-white/80">{tr("Bientôt disponible")}</span>
              <p className="relative mt-3 text-center text-xs text-violet-200">{tr("En attendant, les paiements Apple Pay automatiques sont déjà dans l'offre gratuite.")}</p>
            </div>
          </FadeIn>
        </section>

        <section className="mx-auto max-w-2xl px-6 py-20">
          <FadeIn>
            <h2 className="text-center text-2xl font-bold tracking-tight text-stone-900">{tr("Questions fréquentes")}</h2>
          </FadeIn>
          <div className="mt-8 divide-y divide-line border-y border-line">
            {FAQ.map((f) => (
              <details key={f.q} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-stone-900">{tr(f.q)}<span className="text-xl text-brand-500 transition group-open:rotate-45">+</span></summary>
                <p className="mt-2 text-sm leading-relaxed text-stone-600">{tr(f.a)}</p>
              </details>
            ))}
          </div>
        </section>

        <div className="mx-auto max-w-5xl px-6 pb-24">
          <CtaBanner title={tr("Commence gratuitement")} text={tr("Crée ton espace en quelques secondes, sans carte bancaire.")} secondary={{ href: "/fonctionnalites", label: tr("Voir les fonctionnalités") }} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
