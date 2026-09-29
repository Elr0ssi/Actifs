"use client";

import { useState, useTransition } from "react";
import { updateDashboardWidgets } from "@/app/app/actions";
import { cx } from "@/lib/utils";
import type { DashboardWidget } from "@/lib/types";

const OPTIONS: { key: DashboardWidget; label: string; icon: string }[] = [
  { key: "tasks", label: "Tâches en cours", icon: "✅" },
  { key: "routines", label: "Routines du jour", icon: "🔁" },
  { key: "budget", label: "Résumé budget", icon: "💶" },
  { key: "breakdown", label: "Répartition du budget (camembert)", icon: "🥧" },
  { key: "calendar", label: "Mini-calendrier", icon: "📅" },
];

export function DashboardCustomizer({ enabled }: { enabled: DashboardWidget[] }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<DashboardWidget[]>(enabled);
  const [pending, start] = useTransition();

  const toggle = (key: DashboardWidget) => {
    const next = selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key];
    setSelected(next);
    start(() => updateDashboardWidgets(next));
  };

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className={cx("btn-secondary text-sm", pending && "opacity-60")}>
        ⚙️ Personnaliser
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Widgets affichés</p>
            <div className="space-y-1">
              {OPTIONS.map((o) => (
                <label key={o.key} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                  <input type="checkbox" checked={selected.includes(o.key)} onChange={() => toggle(o.key)} className="h-4 w-4 rounded border-slate-300 accent-brand-600" />
                  <span>{o.icon}</span>
                  {o.label}
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
