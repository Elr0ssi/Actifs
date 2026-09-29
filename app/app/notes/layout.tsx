import Link from "next/link";
import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Notes"
        subtitle="Ta base de vocabulaire perso, et bientôt d'autres types de notes."
        action={<Link href="/app/notes/vocabulaire" className="btn-primary">+ Ajouter un mot</Link>}
      />
      <SectionTabs
        label="Sections Notes"
        tabs={[
          { href: "/app/notes", label: "Vue d'ensemble" },
          { href: "/app/notes/vocabulaire", label: "Vocabulaire" },
        ]}
      />
      {children}
    </div>
  );
}
