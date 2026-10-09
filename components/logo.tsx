import { cx } from "@/lib/utils";
import { AnimatedLogo, type LogoSection } from "@/components/animated-logo";

/**
 * Marque "Flozea" : trois bulles (Budget, Recettes, Planning) qui se réorganisent selon la section affichée.
 * Un seul composant animé : voir `animated-logo.tsx`.
 */
export function LogoMark({ className, section }: { className?: string; section?: LogoSection }) {
  return <AnimatedLogo section={section} className={cx("h-10 w-10", className)} />;
}

export function LogoWordmark({ className, section }: { className?: string; section?: LogoSection }) {
  return (
    <span className={cx("flex items-center gap-2 font-bold tracking-tight text-stone-900", className)}>
      <LogoMark section={section} />
      Flozea
    </span>
  );
}
