import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Recettes, menu de la semaine et liste de courses : All In",
  description: "Une liste de courses aux bonnes quantités arrondies aux formats vendus, des recettes et un menu de la semaine pour le bon nombre de personnes.",
  path: "/repas",
});

export default function Page() {
  return <CategoryView category="repas" />;
}
