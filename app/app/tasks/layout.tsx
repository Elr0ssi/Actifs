import Link from "next/link";
import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Tâches, routines & projets"
        subtitle="Organise ton quotidien et suis tes progrès."
        action={<Link href="/app/tasks/list" className="btn-primary">+ Nouvelle tâche</Link>}
      />
      <SectionTabs
        label="Sections Tâches"
        tabs={[
          { href: "/app/tasks", label: "Vue d'ensemble" },
          { href: "/app/tasks/list", label: "Tâches & projets" },
          { href: "/app/tasks/routines", label: "Routines" },
        ]}
      />
      {children}
    </div>
  );
}
