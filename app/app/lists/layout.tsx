import { SectionHeader, SectionTabs } from "@/components/app/section-tabs";

export default function ListsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-5">
      <SectionHeader title="Courses" subtitle="Retrouve tes recettes, génère tes listes et planifie tes repas." />
      <SectionTabs
        label="Sections Courses"
        tabs={[
          { href: "/app/lists", label: "Vue d'ensemble" },
          { href: "/app/lists/mes-listes", label: "Listes de courses", fallback: true },
          { href: "/app/lists/recipes", label: "Recettes" },
          { href: "/app/lists/ingredients", label: "Ingrédients & prix" },
        ]}
      />
      {children}
    </div>
  );
}
