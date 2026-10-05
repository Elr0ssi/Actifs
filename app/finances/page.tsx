import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export const metadata: Metadata = pageMeta({
  title: "Flozea Finances : budget, calendrier financier et paiements automatiques",
  description: "Calendrier financier avec reste à vivre, paiements Apple Pay ajoutés automatiquement et, bientôt, connexion directe à ton compte bancaire.",
  path: "/finances",
});

export default function Page() {
  return <CategoryView category="finances" />;
}
