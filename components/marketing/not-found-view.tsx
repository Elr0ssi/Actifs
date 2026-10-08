import { getT } from "@/lib/i18n/server";
import Link from "@/components/marketing/link";
import { SiteHeader, SiteFooter } from "@/components/marketing/site-header";
import { Float } from "@/components/marketing/fx";
import { Ambience } from "@/components/marketing/sections";

const LINKS = [
  { href: "/organisation", label: "Flozea Agenda", icon: "📅" },
  { href: "/repas", label: "Flozea Repas", icon: "🍽️" },
  { href: "/finances", label: "Flozea Finances", icon: "💶" },
  { href: "/recettes", label: "Recettes", icon: "🥘" },
];

export function NotFoundView() {
  const tr = getT();
  return (
    <div className="relative overflow-hidden">
      <SiteHeader />
      <main className="relative">
        <Ambience tone="violet" emojis={["🧭", "🔎", "✨"]} />
        <div className="relative mx-auto max-w-2xl px-6 py-24 text-center">
          <Float duration={6} amp={10} rot={3} className="inline-block"><span className="text-7xl">🧭</span></Float>
          <p className="mt-6 bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent">404</p>
          <h1 className="mt-2 text-2xl font-bold text-stone-900 sm:text-3xl">{tr("Cette page n'existe pas (ou plus)")}</h1>
          <p className="mx-auto mt-3 max-w-md text-stone-600">{tr("Le lien est peut-être erroné. Voici où aller :")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="flex items-center gap-2 rounded-2xl border border-line bg-surface px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lift">
                <span>{tr(l.icon)}</span>{tr(l.label)}
              </Link>
            ))}
          </div>
          <Link href="/" className="btn-primary mt-8 inline-block px-6 py-3">{tr("Retour à l'accueil")}</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
