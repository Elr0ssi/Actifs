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
    <label className={cx("flex cursor-pointer items-start gap-2.5 rounded-lg px-1.5 py-1 transition hover:bg-stone-50", isPending && "opacity-60")}>
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
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-stone-300 accent-brand-600"
      />
      <span className="min-w-0">
        <span className={cx("block truncate text-[13px] font-medium text-stone-800", checked && strikeThrough && "text-stone-400 line-through")}>
          {label}
        </span>
        {sublabel && <span className="block truncate text-[11px] text-stone-400">{sublabel}</span>}
      </span>
    </label>
  );
}
