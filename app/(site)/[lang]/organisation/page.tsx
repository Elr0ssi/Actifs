import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Flozea Agenda : agenda, tâches et notes en ligne"),
  description: tr("Un agenda horaire où tâches, routines et rentrées d'argent vivent ensemble, des tâches avec projets et notes, et des notes en pages façon Notion."),
  path: "/organisation",
});
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  return <CategoryView category="organisation" />;
}
