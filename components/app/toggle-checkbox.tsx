"use client";

import { useState, useTransition } from "react";
import { cx } from "@/lib/utils";

export function ToggleCheckbox({
  initialChecked,
  onToggle,
  label,
  sublabel,
  strikeThrough = true,
}: {
  initialChecked: boolean;
  onToggle: (checked: boolean) => Promise<void>;
  label: string;
  sublabel?: string;
  strikeThrough?: boolean;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [isPending, startTransition] = useTransition();

  return (
    <label className={cx("flex cursor-pointer items-start gap-3 rounded-xl p-2 transition hover:bg-slate-50", isPending && "opacity-60")}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
          const next = e.target.checked;
          setChecked(next);
          startTransition(() => {
            onToggle(next);
          });
        }}
        className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-600 focus:ring-brand-400"
      />
      <span className="min-w-0">
        <span className={cx("block truncate text-sm font-medium text-slate-800", checked && strikeThrough && "text-slate-400 line-through")}>
          {label}
        </span>
        {sublabel && <span className="block truncate text-xs text-slate-400">{sublabel}</span>}
      </span>
    </label>
  );
}
