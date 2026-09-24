import { redirect } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import { Sidebar } from "@/components/app/sidebar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) redirect("/login");

  const displayName = ctx.profile?.display_name || ctx.user.email || "Toi";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar displayName={displayName} inviteCode={ctx.household?.invite_code} />
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-6 py-8 sm:px-10">{children}</div>
      </main>
    </div>
  );
}
