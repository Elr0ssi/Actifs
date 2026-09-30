import { cx } from "@/lib/utils";

/**
 * Marque "All In" : trois formes qui convergent vers une seule — l'idée du tout-en-un.
 * Le fond en dégradé suit la couleur d'accent choisie dans Paramètres (en CSS, pour éviter les identifiants SVG dupliqués).
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cx("inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] bg-gradient-to-br from-brand-400 to-brand-700 shadow-glow", className)} aria-hidden>
      <svg viewBox="0 0 32 32" className="h-full w-full" fill="none">
        <circle cx="11" cy="12" r="3.4" fill="white" fillOpacity="0.55" />
        <circle cx="21" cy="12" r="3.4" fill="white" fillOpacity="0.55" />
        <circle cx="16" cy="20" r="4.6" fill="white" />
      </svg>
    </span>
  );
}

export function LogoWordmark({ className }: { className?: string }) {
  return (
    <span className={cx("flex items-center gap-2 font-bold tracking-tight text-stone-900", className)}>
      <LogoMark />
      All In
    </span>
  );
}
