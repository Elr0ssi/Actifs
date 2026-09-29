import { cx } from "@/lib/utils";

/**
 * Marque "All In" : trois formes qui convergent vers une seule — l'idée du tout-en-un.
 * Pas de dépendance à un fichier image, donc net à toutes les tailles.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cx("h-8 w-8", className)} fill="none" aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-brand-600" />
      <circle cx="11" cy="12" r="3.4" fill="white" fillOpacity="0.55" />
      <circle cx="21" cy="12" r="3.4" fill="white" fillOpacity="0.55" />
      <circle cx="16" cy="20" r="4.6" fill="white" />
    </svg>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={cx("flex items-center gap-2 font-bold tracking-tight", className)}>
      <LogoMark />
      All In
    </span>
  );
}
