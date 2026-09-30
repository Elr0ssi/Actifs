import { getAppContext } from "@/lib/data/context";
import { NotesShell } from "@/components/app/notes/notes-shell";
import type { NoteMeta } from "@/lib/notes";

export default async function PagesLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("notes")
    .select("id, parent_id, title, icon, pinned, updated_at, search")
    .eq("household_id", ctx.profile?.household_id ?? "")
    .order("updated_at", { ascending: false })
    .limit(500)
    .returns<NoteMeta[]>();
  return <NotesShell notes={(data ?? []).map((n) => ({ ...n, search: n.search.slice(0, 4000) }))}>{children}</NotesShell>;
}
