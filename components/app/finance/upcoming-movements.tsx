import { formatEUR } from "@/lib/utils";

export function UpcomingMovements({ items }: { items: { date: string; label: string; amount: number; kind: "income" | "expense" }[] }) {
  return (
    <section className="card p-6">
      <h2 className="mb-4 font-semibold text-slate-900">Prochains mouvements</h2>
      <ul className="space-y-3">
        {items.slice(0, 8).map((it, i) => (
          <li key={i} className="flex items-center gap-3">
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${it.kind === "income" ? "bg-emerald-50" : "bg-rose-50"}`}>
              {it.kind === "income" ? "↑" : "↓"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">{it.label}</p>
              <p className="text-xs text-slate-400">{it.date}</p>
            </div>
            <span className={`text-sm font-semibold ${it.kind === "income" ? "text-emerald-600" : "text-rose-600"}`}>
              {it.kind === "income" ? "+" : "-"}
              {formatEUR(it.amount)}
            </span>
          </li>
        ))}
        {items.length === 0 && <p className="text-sm text-slate-400">Aucune échéance à venir.</p>}
      </ul>
    </section>
  );
}
