import { getT } from "@/lib/i18n/server";
import Link from "@/components/marketing/link";
import { LogoWordmark } from "@/components/logo";
import { Aurora, Bubble, Float } from "@/components/marketing/fx";
import { LanguageMenu } from "@/components/marketing/language-switch";

export function AuthShell({
  title,
  subtitle,
  footer,
  children,
}: {
  title: string;
  subtitle: string;
  footer: React.ReactNode;
  children: React.ReactNode;
}) {
  const tr = getT();
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-stone-50">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)]" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Flozea"><LogoWordmark className="text-lg" /></Link>
          <LanguageMenu />
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1fr_26rem] lg:gap-24">
          {/* Côté gauche : une phrase et quelques bulles flottantes, comme sur la vitrine */}
          <div className="relative hidden h-[26rem] lg:block" aria-hidden={false}>
            <h2 className="max-w-md text-5xl font-extrabold leading-[1.1] tracking-tight text-stone-900">
              {tr("Tout ce que tu utilises déjà,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("au même endroit.")}</span>
            </h2>
            <Float delay={0} duration={7} amp={12} rot={2} className="absolute left-0 top-56"><Bubble icon="🍝" title={tr("Pâtes tomate")} sub={tr("25 min · 2 pers.")} tone="amber" /></Float>
            <Float delay={1.5} duration={8} amp={14} rot={-2} className="absolute left-56 top-44"><Bubble icon="💶" title="+ 1 845 €" sub={tr("salaire reçu")} tone="green" /></Float>
            <Float delay={0.8} duration={6.5} amp={10} rot={3} className="absolute left-24 top-[22rem]"><Bubble icon="🔥" title={tr("12 jours")} sub={tr("série de routines")} tone="rose" /></Float>
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <div className="rounded-[2rem] border border-white/70 bg-surface/90 p-8 shadow-lift backdrop-blur-xl">
              <h1 className="text-2xl font-bold tracking-tight text-stone-900">{tr(title)}</h1>
              <p className="mt-1 text-sm text-stone-500">{tr(subtitle)}</p>
              <div className="mt-6">{children}</div>
            </div>
            <div className="mt-6 text-center">{footer}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
