import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import { ACCENT_COOKIE, THEME_COOKIE, parseAccent, parseMode } from "@/lib/theme";
import { cx } from "@/lib/utils";
import { dictFor, getLocale } from "@/lib/i18n/server";
import { I18nProvider } from "@/components/i18n/provider";
import { HtmlLang } from "@/components/i18n/html-lang";
import { Sidebar } from "@/components/app/sidebar";
import { PageTransition } from "@/components/app/page-transition";
import { ThemeSync } from "@/components/app/theme-sync";
import { CommandPalette } from "@/components/app/command-palette";
import { QuickAdd } from "@/components/app/quick-add";

// Interface applicative plus dense que le site vitrine : toute l'échelle rem descend d'un cran sur grand écran.
const DENSITY = "@media (min-width:1024px){html{font-size:14.5px}}";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");

  const jar = cookies();
  const mode = parseMode(jar.get(THEME_COOKIE)?.value);
  const accent = parseAccent(jar.get(ACCENT_COOKIE)?.value);
  const locale = getLocale();
  const displayName = ctx.profile?.display_name || ctx.user.email || "Toi";

  return (
    <I18nProvider locale={locale} dict={dictFor(locale)}>
    <HtmlLang locale={locale} />
    <div className={cx("relative isolate flex min-h-screen bg-canvas text-stone-900", mode === "dark" && "dark", mode === "auto" && "theme-auto")} data-accent={accent}>
      <style>{DENSITY}</style>
      <ThemeSync mode={mode} accent={accent} />
      <div className="aurora" aria-hidden>
        <span className="-left-[10%] -top-[18%] h-[560px] w-[560px] animate-orbA bg-brand-400" />
        <span className="-right-[8%] top-[18%] h-[480px] w-[480px] animate-orbB bg-sky-400" />
      </div>
      <Sidebar displayName={displayName} inviteCode={ctx.household?.invite_code} mode={mode} />
      <main className="relative z-10 min-w-0 flex-1 pb-28 pt-14 lg:pb-0 lg:pt-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
      <CommandPalette mode={mode} />
      <QuickAdd />
    </div>
    </I18nProvider>
  );
}
