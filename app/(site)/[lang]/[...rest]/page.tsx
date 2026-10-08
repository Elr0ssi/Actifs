import { notFound } from "next/navigation";

/** Toute adresse inconnue passe ici pour afficher la page 404 du site, dans la bonne langue. */
export default function UnknownPage() {
  notFound();
}
