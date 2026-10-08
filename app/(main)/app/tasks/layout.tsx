import { getT } from "@/lib/i18n/server";
import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  const tr = getT();
  return (
    <div className="space-y-5">
      <SectionHeader title={tr("Tâches, routines & projets")} subtitle={tr("Organise ton quotidien et suis tes progrès.")} />
      <SectionTabs
        label={tr("Sections Tâches")}
        tabs={[
          { href: "/app/tasks", label: tr("Vue d'ensemble") },
          { href: "/app/tasks/list", label: tr("Tâches & projets") },
          { href: "/app/tasks/routines", label: tr("Routines") },
          { href: "/app/tasks/calendar", label: tr("Calendrier") },
        ]}
      />
      {children}
    </div>
  );
}
