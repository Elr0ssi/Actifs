import type { Metadata } from "next";
import { NotFoundView } from "@/components/marketing/not-found-view";
import { getT } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  return { title: getT()("Page introuvable"), robots: { index: false } };
}

export default function NotFound() {
  return <NotFoundView />;
}
