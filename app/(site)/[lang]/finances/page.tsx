import { getT, setRequestLocale } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { CategoryView } from "@/components/marketing/category-view";
import { pageMeta } from "@/lib/marketing/site";

export function generateMetadata({ params }: { params: { lang: string } }): Metadata {
  setRequestLocale(params.lang);
  const tr = getT();
  return pageMeta({
  title: tr("Flozea Finances : budget, calendrier financier et paiements automatiques"),
  description: tr("Calendrier financier avec reste à vivre, paiements Apple Pay ajoutés automatiquement et, bientôt, connexion directe à ton compte bancaire."),
  path: "/finances",
});
}

export default function Page({ params }: { params: { lang: string } }) {
  setRequestLocale(params.lang);
  return <CategoryView category="finances" />;
}
