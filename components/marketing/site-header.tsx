import Link from "next/link";

export function SiteHeader({ current }: { current?: "recettes" | "calculateurs" | "tarifs" }) {
  const link = (href: string, label: string, key?: typeof current) => (
    <Link href={href} className={key && key === current ? "text-slate-900" : "hover:text-slate-900"}>
      {label}
    </Link>
  );
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">A</span>
          Actifs
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <Link href="/#fonctionnalites" className="hover:text-slate-900">Fonctionnalités</Link>
          {link("/recettes", "Recettes", "recettes")}
          {link("/calculateurs", "Calculateurs", "calculateurs")}
          {link("/tarifs", "Tarifs", "tarifs")}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/login" className="hidden text-sm font-semibold text-slate-700 hover:text-slate-900 sm:block">
            Connexion
          </Link>
          <Link href="/signup" className="btn-primary">Créer mon espace</Link>
        </div>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
        <p className="text-sm text-slate-500">© {new Date().getFullYear()} Actifs. Organise ta vie, simplement.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm font-medium text-slate-500">
          <Link href="/recettes" className="hover:text-slate-800">Recettes</Link>
          <Link href="/calculateurs" className="hover:text-slate-800">Calculateurs</Link>
          <Link href="/tarifs" className="hover:text-slate-800">Tarifs</Link>
          <span className="text-slate-300">·</span>
          <Link href="/login" className="hover:text-slate-800">Connexion</Link>
          <Link href="/signup" className="hover:text-slate-800">Inscription</Link>
        </div>
      </div>
    </footer>
  );
}
