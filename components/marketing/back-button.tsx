"use client";

import { useRouter } from "next/navigation";
import { useT } from "@/components/i18n/provider";
import Link from "@/components/marketing/link";
import { cx } from "@/lib/utils";

/** Retour à la page précédente (au même endroit du défilement) ; sans historique sur le site, lien vers `fallback`. */
export function BackButton({ fallback, label, className }: { fallback: string; label?: string; className?: string }) {
  const router = useRouter();
  const tr = useT();
  const text = label ?? tr("← Retour");
  const cls = cx("inline-flex items-center rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-stone-600 transition hover:border-brand-300 hover:text-brand-700", className);
  return (
    <Link
      href={fallback}
      className={cls}
      onClick={(e) => {
        try {
          if (window.history.length > 1 && document.referrer && new URL(document.referrer).origin === window.location.origin) {
            e.preventDefault();
            router.back();
          }
        } catch { /* on garde le lien */ }
      }}
    >
      {text}
    </Link>
  );
}
