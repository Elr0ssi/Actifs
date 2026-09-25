"use client";

import { useState } from "react";

export function ShareWeekButton({ summaryText }: { summaryText: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(summaryText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (e.g. insecure context) — silently ignore
    }
  }

  return (
    <button onClick={handleClick} className="btn-secondary py-1.5 text-xs">
      {copied ? "Copié ✓" : "📤 Partager le résumé"}
    </button>
  );
}
