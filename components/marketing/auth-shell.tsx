import { getT } from "@/lib/i18n/server";
import Link from "@/components/marketing/link";
import { LogoWordmark } from "@/components/logo";
import { Aurora } from "@/components/marketing/fx";
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
  const points = [
    ["📅", tr("Agenda, tâches et routines")],
    ["🍽️", tr("Recettes, menu et liste de courses")],
    ["💶", tr("Budget et paiements automatiques")],
    ["📝", tr("Notes en pages")],
  ];
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-stone-50">
      <Aurora />
      <div className="pointer-events-none absolute inset-0 bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_30%,transparent_100%)]" aria-hidden />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <Link href="/" aria-label="Flozea"><LogoWordmark className="text-lg" /></Link>
          <LanguageMenu />
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1fr_26rem] lg:gap-20">
          <div className="hidden lg:block">
            <p className="inline-flex rounded-full border border-brand-200 bg-brand-50 px-3.5 py-1 text-xs font-semibold text-brand-700">{tr("Gratuit · seul ou à deux")}</p>
            <h2 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-stone-900">
              {tr("Tout ce que tu utilises déjà,")} <span className="bg-gradient-to-r from-brand-500 to-violet-700 bg-clip-text text-transparent">{tr("au même endroit.")}</span>
            </h2>
            <ul className="mt-8 space-y-3">
              {points.map(([icon, label]) => (
                <li key={label} className="flex w-fit items-center gap-3 rounded-2xl border border-white/70 bg-surface/80 px-4 py-2.5 text-sm font-semibold text-stone-800 shadow-soft backdrop-blur-xl">
                  <span className="text-lg">{icon}</span>{label}
                </li>
              ))}
            </ul>
          </div>

          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <div className="rounded-[2rem] border border-white/70 bg-surface/90 p-8 shadow-lift backdrop-blur-xl">
              <h1 className="text-xl font-bold text-stone-900">{tr(title)}</h1>
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
