import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Flozea Repas : recettes, menu de la semaine et liste de courses"),
  description: tr("Une liste de courses aux bonnes quantités arrondies aux formats vendus, des recettes et un menu de la semaine pour le bon nombre de personnes."),
  path: "/repas",
});
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  return <CategoryView category="repas" />;
}
