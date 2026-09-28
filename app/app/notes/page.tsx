import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { VocabList } from "@/components/app/notes/vocab-list";
import { addWord, bulkAddWords } from "@/app/app/notes/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const { data: words } = await supabase
    .from("vocab_words")
    .select("id, french, english, created_at")
    .eq("household_id", householdId)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Notes</h1>
        <p className="mt-1 text-sm text-slate-500">D'autres types de notes arriveront ici. Pour l'instant : ta base de vocabulaire perso.</p>
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-slate-900">📚 Vocabulaire</h2>
          <p className="text-xs text-slate-400">Un mot enregistré à sa date — de quoi le retester plus tard.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <form action={addWord} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ajout manuel</p>
            <div className="flex gap-2">
              <input name="french" placeholder="Français (ex. chat)" className="input" required />
              <input name="english" placeholder="Anglais (ex. cat)" className="input" required />
            </div>
            <SubmitButton className="btn-primary w-full">Ajouter le mot</SubmitButton>
          </form>

          <form action={bulkAddWords} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Ajout massif</p>
            <textarea
              name="bulk"
              rows={3}
              placeholder={"Une paire par ligne :\nchat - cat\nmaison : house\nvoiture, car"}
              className="input"
            />
            <SubmitButton className="btn-secondary w-full">Importer la liste</SubmitButton>
          </form>
        </div>
      </section>

      <VocabList words={words ?? []} />
    </div>
  );
}
