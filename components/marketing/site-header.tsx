import Link from "next/link";
import { LogoWordmark } from "@/components/logo";

type Current = "recettes" | "calculateurs" | "tarifs" | "outils" | "guides" | "fonctionnalites";

export function SiteHeader({ current }: { current?: Current }) {
  const link = (href: string, label: string, key?: Current) => (
    <Link href={href} className={key && key === current ? "text-stone-900" : "hover:text-stone-900"}>
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/"><LogoWordmark className="text-lg" /></Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-7 text-sm font-medium text-stone-600 md:flex">
          {link("/fonctionnalites", "Fonctionnalités", "fonctionnalites")}
          {link("/outils", "Outils gratuits", "outils")}
          {link("/guides", "Guides", "guides")}
          {link("/recettes", "Recettes", "recettes")}
          {link("/tarifs", "Tarifs", "tarifs")}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-stone-700 hover:text-stone-900 sm:block">
            Connexion
          </Link>
          <Link href="/signup" className="btn-primary">Créer mon espace</Link>
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Outils gratuits",
    links: [
      ["/outils/budget-mensuel", "Budget mensuel & reste à vivre"],
      ["/outils/liste-de-courses", "Liste de courses par recettes"],
      ["/outils/suivi-habitudes", "Suivi d'habitudes"],
      ["/calculateurs", "Salaire net & impôt"],
    ],
  },
  {
    title: "Guides",
    links: [
      ["/guides/faire-un-budget-mensuel", "Faire un budget mensuel"],
      ["/guides/calculer-son-reste-a-vivre", "Calculer son reste à vivre"],
      ["/guides/planifier-ses-repas-de-la-semaine", "Planifier ses repas"],
      ["/guides/remplacer-notion-excel-jow", "Remplacer Notion, Excel et Jow"],
      ["/guides", "Tous les guides"],
    ],
  },
  {
    title: "All In",
    links: [
      ["/fonctionnalites", "Fonctionnalités"],
      ["/fonctionnalites/agenda", "Agenda"],
      ["/fonctionnalites/budget-et-finances", "Budget & finances"],
      ["/recettes", "Recettes"],
      ["/tarifs", "Tarifs"],
      ["/login", "Connexion"],
      ["/signup", "Inscription"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <LogoWordmark className="text-lg" />
            <p className="mt-3 max-w-xs text-sm text-stone-500">Tâches, agenda, courses, recettes, budget et notes : un seul endroit pour organiser ta vie, seul ou à deux.</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{col.title}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {col.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="hover:text-stone-900">{label}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <p className="mt-10 text-sm text-stone-400">© {new Date().getFullYear()} All In. Organise ta vie, simplement.</p>
      </div>
    </footer>
  );
}
