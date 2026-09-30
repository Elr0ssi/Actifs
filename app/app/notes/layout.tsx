import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Notes" subtitle="Tes pages façon Notion, et ta base de vocabulaire." />
      <SectionTabs
        label="Sections Notes"
        tabs={[
          { href: "/app/notes", label: "Vue d'ensemble" },
          { href: "/app/notes/pages", label: "Mes pages" },
          { href: "/app/notes/vocabulaire", label: "Vocabulaire" },
        ]}
      />
      {children}
    </div>
  );
}
