"use client";

import { useFormStatus } from "react-dom";
import { cx } from "@/lib/utils";

/** Bouton de formulaire qui réagit tout de suite (état "en cours") pendant que le serveur enregistre. */
export function SubmitButton({ children, className, pendingLabel = "…" }: { children: React.ReactNode; className?: string; pendingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button disabled={pending} aria-busy={pending} className={cx(className, pending && "cursor-wait opacity-60")}>
      {pending ? pendingLabel : children}
    </button>
  );
}
