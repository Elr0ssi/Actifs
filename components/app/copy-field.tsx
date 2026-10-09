"use client";

import { useT } from "@/components/i18n/provider";
import { useState } from "react";
import { cx } from "@/lib/utils";

/** Valeur à copier d'un clic (code d'invitation, etc.). */
export function CopyField({ value, label, className }: { value: string; label: string; className?: string }) {
  const tr = useT();
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* presse-papiers indisponible */ } }}
      className={cx("group inline-flex items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 px-4 py-2.5 text-left transition hover:border-brand-500 hover:bg-brand-50", className)}
      aria-label={label}
    >
      <span className="font-mono text-base font-bold tracking-[0.2em] text-brand-800">{value}</span>
      <span className="text-xs font-semibold text-brand-700">{copied ? tr("Copié ✓") : label}</span>
    </button>
  );
}
