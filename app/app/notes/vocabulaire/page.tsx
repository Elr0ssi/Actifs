import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import { VocabList } from "@/components/app/notes/vocab-list";
import { addWord, bulkAddWords } from "@/app/app/notes/actions";
import { SubmitButton } from "@/components/ui/submit-button";

export const metadata: Metadata = { title: "Notes" };

export default async function NotesPage() {
  const tr = getT();
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
      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">{tr("📚 Vocabulaire")}</h2>
          <p className="text-xs text-stone-400">{tr("Un mot enregistré à sa date — de quoi le retester plus tard.")}</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <form action={addWord} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ajout manuel")}</p>
            <div className="flex gap-2">
              <input name="french" placeholder={tr("Français (ex. chat)")} className="input" required />
              <input name="english" placeholder={tr("Anglais (ex. cat)")} className="input" required />
            </div>
            <SubmitButton className="btn-primary w-full">{tr("Ajouter le mot")}</SubmitButton>
          </form>

          <form action={bulkAddWords} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">{tr("Ajout massif")}</p>
            <textarea
              name="bulk"
              rows={3}
              placeholder={tr("Une paire par ligne :\nchat - cat\nmaison : house\nvoiture, car")}
              className="input"
            />
            <SubmitButton className="btn-secondary w-full">{tr("Importer la liste")}</SubmitButton>
          </form>
        </div>
      </section>

      <VocabList words={words ?? []} />
    </div>
  );
}
