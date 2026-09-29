import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Notes" subtitle="Ta base de vocabulaire perso, et bientôt d'autres types de notes." />
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
