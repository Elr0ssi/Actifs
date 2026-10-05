import Link from "next/link";
import { LogoWordmark } from "@/components/logo";
import { CATEGORIES, featuresOf, type CategoryKey, type Feature } from "@/lib/marketing/features";
import { cx } from "@/lib/utils";

type Current = "recettes" | "calculateurs" | "tarifs" | "outils" | "guides" | "fonctionnalites" | CategoryKey;

const panel =
  "invisible absolute top-full z-50 pt-3 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100";
const center = "left-1/2 -translate-x-1/2";

function FeatureLink({ f }: { f: Feature }) {
  return (
    <Link href={`/fonctionnalites/${f.slug}`} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-stone-50">
      <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base", f.soft)}>{f.icon}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-stone-900">
          {f.name}
          {f.soon && <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">Bientôt</span>}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({ current }: { current?: Current }) {
  const item = (active: boolean) => cx("inline-flex items-center gap-1 py-2", active ? "text-stone-900" : "hover:text-stone-900");
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-surface/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5">
        <Link href="/"><LogoWordmark className="text-lg" /></Link>
        <nav aria-label="Navigation principale" className="hidden items-center gap-6 text-sm font-medium text-stone-600 md:flex">
          {/* Toutes les fonctionnalités */}
          <div className="group relative">
            <Link href="/fonctionnalites" className={item(current === "fonctionnalites")}>Fonctionnalités <span className="text-[10px] text-stone-400">▾</span></Link>
            <div className={cx(panel, "-left-4")}>
              <div className="grid w-[46rem] grid-cols-3 gap-2 rounded-3xl border border-line bg-surface p-4 shadow-lift">
                {CATEGORIES.map((c) => (
                  <div key={c.key}>
                    <Link href={c.href} className="mb-1 flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-400 hover:text-brand-700">
                      <span>{c.icon}</span>{c.name}
                    </Link>
                    {featuresOf(c).map((f) => <FeatureLink key={f.slug} f={f} />)}
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Un onglet par catégorie, avec ses pages en sous-menu */}
          {CATEGORIES.map((c) => (
            <div key={c.key} className="group relative">
              <Link href={c.href} className={item(current === c.key)}>{c.label} <span className="text-[10px] text-stone-400">▾</span></Link>
              <div className={cx(panel, center)}>
                <div className="w-64 rounded-3xl border border-line bg-surface p-2.5 shadow-lift">
                  <Link href={c.href} className="block rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-400 hover:text-brand-700">{c.name}</Link>
                  {featuresOf(c).map((f) => <FeatureLink key={f.slug} f={f} />)}
                </div>
              </div>
            </div>
          ))}
          <Link href="/recettes" className={item(current === "recettes")}>Recettes</Link>
          <Link href="/tarifs" className={item(current === "tarifs")}>Tarifs</Link>
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-stone-700 hover:text-stone-900 sm:block">
            Connexion
          </Link>
          <Link href="/signup" className="btn-primary">Créer mon espace</Link>
          {/* Menu mobile */}
          <details className="group relative md:hidden">
            <summary className="flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-xl border border-line bg-surface text-lg text-stone-700" aria-label="Menu">
              <span className="group-open:hidden">☰</span><span className="hidden group-open:inline">✕</span>
            </summary>
            <div className="absolute right-0 top-full mt-3 max-h-[75vh] w-72 overflow-y-auto rounded-3xl border border-line bg-surface p-3 shadow-lift">
              {CATEGORIES.map((c) => (
                <div key={c.key} className="mb-1">
                  <Link href={c.href} className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">{c.icon} {c.name}</Link>
                  {featuresOf(c).map((f) => <FeatureLink key={f.slug} f={f} />)}
                </div>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-1 border-t border-line pt-2 text-sm font-semibold text-stone-700">
                <Link href="/fonctionnalites" className="rounded-xl px-2.5 py-2 hover:bg-stone-50">Toutes les fonctions</Link>
                <Link href="/recettes" className="rounded-xl px-2.5 py-2 hover:bg-stone-50">Recettes</Link>
                <Link href="/tarifs" className="rounded-xl px-2.5 py-2 hover:bg-stone-50">Tarifs</Link>
                <Link href="/login" className="rounded-xl px-2.5 py-2 hover:bg-stone-50">Connexion</Link>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}

const FOOTER_COLUMNS: { title: string; links: [string, string][] }[] = [
  ...CATEGORIES.map((c): { title: string; links: [string, string][] } => ({
    title: c.name,
    links: featuresOf(c).map((f): [string, string] => [`/fonctionnalites/${f.slug}`, f.name]),
  })),
  {
    title: "All In",
    links: [
      ["/fonctionnalites", "Toutes les fonctionnalités"],
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
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
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
