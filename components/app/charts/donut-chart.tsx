import { formatEUR } from "@/lib/utils";
import { categoryColor } from "@/components/app/charts/palette";

export function DonutChart({
  items,
  size = 180,
  strokeWidth = 26,
  centerCaption = "/ mois",
  selected,
  onSelect,
}: {
  items: { label: string; value: number }[];
  size?: number;
  strokeWidth?: number;
  centerCaption?: string;
  selected?: string | null;
  onSelect?: (label: string) => void;
}) {
  const total = items.reduce((s, i) => s + i.value, 0);
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  if (total <= 0) {
    return <p className="text-sm text-slate-400">Aucune donnée pour l'instant.</p>;
  }

  // Color follows the category's identity (alphabetical slot), never its rank by
  // value — otherwise segments would repaint as amounts change month to month.
  const colorIndex = new Map([...items].map((i) => i.label).sort().map((label, i) => [label, i]));

  let cumulative = 0;
  const segments = items
    .filter((i) => i.value > 0)
    .map((item) => {
      const fraction = item.value / total;
      const segLen = fraction * circumference;
      const gap = items.length > 1 ? 2 : 0; // 2px surface gap between segments
      const dasharray = `${Math.max(segLen - gap, 0)} ${circumference - segLen + gap}`;
      const dashoffset = -cumulative;
      cumulative += segLen;
      const color = categoryColor(colorIndex.get(item.label) ?? 0);
      return { ...item, dasharray, dashoffset, color: color.light, pct: fraction * 100 };
    });

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" role="img" aria-label="Répartition des charges par catégorie">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e1e0d9" strokeWidth={strokeWidth} />
          {segments.map((s, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={strokeWidth}
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              strokeLinecap="butt"
              opacity={selected && selected !== s.label ? 0.35 : 1}
              onClick={onSelect ? () => onSelect(s.label) : undefined}
              className={onSelect ? "cursor-pointer transition-opacity" : undefined}
            >
              <title>{`${s.label} — ${formatEUR(s.value)} (${s.pct.toFixed(0)}%)`}</title>
            </circle>
          ))}
        </g>
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-900 text-[15px] font-bold">
          {formatEUR(total)}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400 text-[10px]">
          {centerCaption}
        </text>
      </svg>

      <ul className="min-w-[160px] flex-1 space-y-1.5">
        {segments.map((s, i) => (
          <li
            key={i}
            onClick={onSelect ? () => onSelect(s.label) : undefined}
            className={`flex items-center justify-between gap-3 rounded-lg text-sm ${onSelect ? "cursor-pointer px-1 hover:bg-slate-50" : ""} ${selected === s.label ? "bg-slate-50" : ""}`}
          >
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="truncate text-slate-700">{s.label}</span>
            </span>
            <span className="shrink-0 font-medium text-slate-500">{formatEUR(s.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
