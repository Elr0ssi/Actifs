import { redirect } from "next/navigation";

/** Finance s'ouvre sur le calendrier (reste à vivre, budget et réel). L'ancienne « vue d'ensemble » en widgets a été retirée pour simplifier. */
export default function FinanceIndexPage() {
  redirect("/app/finance/calendar");
}
