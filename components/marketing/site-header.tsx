import { getT } from "@/lib/i18n/server";
import Link from "@/components/marketing/link";
import { LogoWordmark } from "@/components/logo";
import { CATEGORIES, featuresOf, type CategoryKey, type Feature } from "@/lib/marketing/features";
import { cx } from "@/lib/utils";
import { LanguageLinks, LanguageMenu } from "@/components/marketing/language-switch";
import { MobileMenu, type MenuData } from "@/components/marketing/mobile-menu";

type Current = "recettes" | "calculateurs" | "tarifs" | "outils" | "guides" | "fonctionnalites" | CategoryKey;

// Le survol n'ouvre les sous-menus que sur les appareils à souris ; au doigt (tablette) on utilise le focus, sans panneau « collé ».
const panel =
  "invisible absolute top-full z-50 pt-3 opacity-0 transition duration-150 group-focus-within:visible group-focus-within:opacity-100 [@media(hover:hover)]:group-hover:visible [@media(hover:hover)]:group-hover:opacity-100";
const center = "left-1/2 -translate-x-1/2";

function FeatureLink({ f }: { f: Feature }) {
  const tr = getT();
  return (
    <Link href={`/fonctionnalites/${f.slug}`} className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 hover:bg-stone-50">
      <span className={cx("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base", f.soft)}>{tr(f.icon)}</span>
      <span className="min-w-0">
        <span className="flex items-center gap-1.5 text-[13px] font-semibold text-stone-900">
          {tr(f.name)}
          {f.soon && <span className="rounded-full bg-indigo-100 px-1.5 py-px text-[9px] font-bold uppercase text-indigo-700">{tr("Bientôt")}</span>}
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader({ current }: { current?: Current }) {
  const tr = getT();
  const item = (active: boolean) => cx("inline-flex items-center gap-1 py-2", active ? "text-stone-900" : "hover:text-stone-900");
  const menu: MenuData = {
    labels: {
      open: tr("Ouvrir le menu"), close: tr("Fermer le menu"), menu: tr("Menu"), back: tr("Menu"), main: tr("Navigation principale"),
      features: tr("Fonctionnalités"), featuresHint: tr("Agenda, repas et finances"), allFeatures: tr("Toutes les fonctionnalités"),
      resources: tr("Recettes et guides"), resourcesHint: tr("Recettes, idées, guides et outils"),
      pricing: tr("Tarifs"), login: tr("Connexion"), loginHint: tr("Accéder à mon espace"), signup: tr("Créer mon espace"), language: tr("Langue"),
    },
    groups: CATEGORIES.map((c) => ({
      key: c.key, href: c.href, name: tr(c.name), icon: tr(c.icon),
      items: featuresOf(c).map((f) => ({ href: `/fonctionnalites/${f.slug}`, name: tr(f.name), icon: tr(f.icon), soon: f.soon ? tr("Bientôt") : undefined })),
    })),
    resources: [
      { href: "/recettes", name: tr("Recettes"), icon: "🍲" },
      { href: "/recettes/idees", name: tr("Idées de recettes"), icon: "💡" },
      { href: "/guides", name: tr("Guides"), icon: "📖" },
      { href: "/outils", name: tr("Outils gratuits"), icon: "🧮" },
    ],
  };
  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/70 bg-surface/95 md:bg-surface/70 md:backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 sm:py-3.5">
        <Link href="/" className="shrink-0"><LogoWordmark className="text-xl sm:text-2xl" /></Link>
        <nav aria-label={tr("Navigation principale")} className="hidden items-center gap-5 text-sm font-medium text-stone-600 md:flex">
          <Link href="/fonctionnalites" className={item(current === "fonctionnalites")}>{tr("Fonctionnalités")}</Link>
          {/* Un onglet par catégorie, avec ses pages en sous-menu */}
          {CATEGORIES.map((c) => (
            <div key={c.key} className="group relative">
              <Link href={c.href} className={item(current === c.key)}>{tr(c.label)} <span className="text-[10px] text-stone-500">▾</span></Link>
              <div className={cx(panel, center)}>
                <div className="w-64 rounded-3xl border border-line bg-surface p-2.5 shadow-lift">
                  <Link href={c.href} className="block rounded-xl px-2.5 py-1.5 text-xs font-bold uppercase tracking-wide text-stone-500 hover:text-brand-700">{tr(c.name)}</Link>
                  {featuresOf(c).map((f) => <FeatureLink key={f.slug} f={f} />)}
                </div>
              </div>
            </div>
          ))}
          <Link href="/recettes" className={item(current === "recettes")}>{tr("Recettes")}</Link>
          <Link href="/tarifs" className={item(current === "tarifs")}>{tr("Tarifs")}</Link>
        </nav>
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="hidden md:block"><LanguageMenu /></div>
          <Link href="/login" className="hidden text-sm font-semibold text-stone-700 hover:text-stone-900 md:block">
            {tr("Connexion")}
          </Link>
          <Link href="/signup" className="btn-primary hidden whitespace-nowrap min-[390px]:inline-flex">{tr("Créer mon espace")}</Link>
          <MobileMenu data={menu} />
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
    title: "Flozea",
    links: [
      ["/fonctionnalites", "Toutes les fonctionnalités"],
      ["/recettes", "Recettes"],
      ["/recettes/idees", "Idées de recettes"],
      ["/tarifs", "Tarifs"],
      ["/login", "Connexion"],
      ["/signup", "Inscription"],
    ],
  },
];

export function SiteFooter() {
  const tr = getT();
  return (
    <footer className="border-t border-stone-200 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <LogoWordmark className="text-2xl" />
            <p className="mt-3 max-w-xs text-sm text-stone-500">{tr("Tâches, agenda, courses, recettes, budget et notes : un seul endroit pour organiser ta vie, seul ou à deux.")}</p>
          </div>
          {FOOTER_COLUMNS.map((col) => (
            <nav key={col.title} aria-label={tr(col.title)}>
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{tr(col.title)}</p>
              <ul className="mt-3 space-y-2 text-sm text-stone-600">
                {col.links.map(([href, label]) => (
                  <li key={href}><Link href={href} className="inline-flex min-h-9 items-center hover:text-stone-900">{tr(label)}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-x-6 gap-y-4 border-t border-stone-200 pt-6 text-sm text-stone-500">
          <nav aria-label={tr("Informations légales")} className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/mentions-legales" prefetch={false} className="inline-flex min-h-11 items-center hover:text-stone-900">{tr("Mentions légales")}</Link>
            <Link href="/confidentialite" prefetch={false} className="inline-flex min-h-11 items-center hover:text-stone-900">{tr("Confidentialité")}</Link>
            <Link href="/cgu" prefetch={false} className="inline-flex min-h-11 items-center hover:text-stone-900">{tr("CGU")}</Link>
            <span className="hidden text-stone-300 sm:inline" aria-hidden>·</span>
            <span>© {new Date().getFullYear()} {tr("Flozea. Organise ta vie, simplement.")}</span>
          </nav>
          <LanguageLinks />
        </div>
      </div>
    </footer>
  );
}
