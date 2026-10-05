import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Flozea Agenda : agenda, tâches et notes en ligne",
  description: "Un agenda horaire où tâches, routines et rentrées d'argent vivent ensemble, des tâches avec projets et notes, et des notes en pages façon Notion.",
  path: "/organisation",
});

export default function Page() {
  return <CategoryView category="organisation" />;
}
