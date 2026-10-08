import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAppContext } from "@/lib/data/context";
import { NoteEditor } from "@/components/app/notes/note-editor";
import { sanitizeBlocks } from "@/lib/notes";

export function generateMetadata(): Metadata {
  return { title: getT()("Notes — Page") };
}

export default async function NotePage({ params }: { params: { id: string } }) {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { data: note } = await ctx.supabase.from("notes").select("id, parent_id, title, icon, blocks, pinned").eq("id", params.id).eq("household_id", ctx.profile?.household_id ?? "").maybeSingle();
  if (!note) notFound();
  const { data: all } = await ctx.supabase.from("notes").select("id, parent_id, title, icon").eq("household_id", ctx.profile?.household_id ?? "").limit(500);
  const list = all ?? [];
  const trail: { id: string; title: string; icon: string | null }[] = [];
  for (let cur = list.find((n) => n.id === note.parent_id); cur && trail.length < 10; cur = list.find((n) => n.id === cur!.parent_id)) trail.unshift({ id: cur.id, title: cur.title, icon: cur.icon });
  const children = list.filter((n) => n.parent_id === note.id).map(({ id, title, icon }) => ({ id, title, icon }));
  return <NoteEditor key={note.id} id={note.id} initialTitle={note.title} initialIcon={note.icon} initialBlocks={sanitizeBlocks(note.blocks)} pinned={note.pinned} trail={trail} children={children} />;
}
