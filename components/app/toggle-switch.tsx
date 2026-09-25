"use client";

import { useState, useTransition } from "react";
import { cx } from "@/lib/utils";

export function ToggleSwitch({
  initialChecked,
  onToggle,
}: {
  initialChecked: boolean;
  onToggle: (checked: boolean) => Promise<void>;
}) {
  const [checked, setChecked] = useState(initialChecked);
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={isPending}
      onClick={() => {
        const next = !checked;
        setChecked(next);
        startTransition(() => {
          onToggle(next);
        });
      }}
      className={cx(
        "relative h-5 w-9 shrink-0 rounded-full transition",
        checked ? "bg-emerald-500" : "bg-slate-200",
        isPending && "opacity-60"
      )}
    >
      <span
        className={cx(
          "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
