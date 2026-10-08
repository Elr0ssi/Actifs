"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALES, type Locale } from "@/lib/i18n";
import { setLanguage } from "@/app/(main)/app/settings/actions";
import { useLocale } from "@/components/i18n/provider";
import { Flag } from "@/components/ui/flag";
import { cx } from "@/lib/utils";

export function LanguagePicker() {
  const current = useLocale();
  const router = useRouter();
  const [pending, start] = useTransition();
  const choose = (code: Locale) => {
    if (code === current) return;
    start(async () => {
      await setLanguage(code);
      router.refresh();
    });
  };
  return (
    <div className={cx("grid grid-cols-2 gap-2 sm:grid-cols-4", pending && "opacity-70")} role="radiogroup" aria-label="Language">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          type="button"
          role="radio"
          aria-checked={current === l.code}
          onClick={() => choose(l.code)}
          lang={l.code}
          className={cx("flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left text-sm font-semibold transition", current === l.code ? "border-brand-400 bg-brand-50 text-brand-800 ring-2 ring-brand-200" : "border-line bg-surface text-stone-700 hover:border-brand-300")}
        >
          <Flag code={l.code} className="h-6 w-6 shrink-0" />
          {l.label}
        </button>
      ))}
    </div>
  );
}
