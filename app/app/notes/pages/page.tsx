import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import Link from "next/link";
import { getAppContext } from "@/lib/data/context";
import { createNote } from "./actions";
import { Icon } from "@/components/app/icons";

export const metadata: Metadata = { title: "Notes — Mes pages" };

export default async function PagesIndex() {
  const tr = getT();
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { data } = await ctx.supabase
    .from("notes")
    .select("id, title, icon, search, updated_at")
    .eq("household_id", ctx.profile?.household_id ?? "")
    .order("updated_at", { ascending: false })
    .limit(12);
  const notes = data ?? [];
  return (
    <div className="space-y-4">
      <div className="card p-6 text-center">
        <p className="text-2xl">📝</p>
        <h2 className="mt-2 text-lg font-bold text-stone-900">{tr("Tes pages")}</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-stone-500">
          Écris comme dans Notion : tape <kbd className="rounded bg-stone-100 px-1.5 py-px font-mono text-xs">/</kbd> pour choisir un type de bloc, ou utilise les raccourcis Markdown (<span className="font-mono text-xs">#</span>, <span className="font-mono text-xs">- </span>, <span className="font-mono text-xs">[] </span>…). Les sous-pages te permettent de tout ranger.
        </p>
        <form action={createNote.bind(null, null)} className="mt-4">
          <button className="btn-primary"><Icon name="plus" className="h-4 w-4" />Nouvelle page</button>
        </form>
      </div>
      {notes.length > 0 && (
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">{tr("Récemment modifiées")}</p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {notes.map((n) => (
              <Link key={n.id} href={`/app/notes/pages/${n.id}`} className="card card-hover p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-stone-900"><span>{n.icon || "📄"}</span><span className="truncate">{n.title || tr("Sans titre")}</span></p>
                <p className="mt-1.5 line-clamp-2 text-xs text-stone-500">{n.search || tr("Page vide")}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
