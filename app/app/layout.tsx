import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import { Sidebar } from "@/components/app/sidebar";
import { PageTransition } from "@/components/app/page-transition";

// Interface applicative plus dense que le site vitrine : toute l'échelle rem descend d'un cran sur grand écran.
const DENSITY = "@media (min-width:1024px){html{font-size:14.5px}}";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");

  const displayName = ctx.profile?.display_name || ctx.user.email || "Toi";

  return (
    <div className="flex min-h-screen bg-canvas">
      <style>{DENSITY}</style>
      <Sidebar displayName={displayName} inviteCode={ctx.household?.invite_code} />
      <main className="min-w-0 flex-1 pb-20 pt-12 lg:pb-0 lg:pt-0">
        <div className="mx-auto max-w-[1400px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
          <PageTransition>{children}</PageTransition>
        </div>
      </main>
    </div>
  );
}
