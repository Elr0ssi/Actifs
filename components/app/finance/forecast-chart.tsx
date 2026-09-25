import { formatEUR } from "@/lib/utils";

interface ForecastEvent {
  date: string;
  label: string;
  amount: number;
}

export function ForecastBalanceChart({
  points,
  events,
  monthLabel,
}: {
  points: { date: string; balance: number }[];
  events: ForecastEvent[];
  monthLabel: string;
}) {
  const width = 900;
  const height = 240;
  const padX = 12;
  const padTop = 46;
  const padBottom = 28;

  if (points.length < 2) {
    return <p className="text-sm text-slate-400">Pas assez de données pour ce mois.</p>;
  }

  const values = points.map((p) => p.balance);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const chartH = height - padTop - padBottom;
  const chartW = width - padX * 2;

  const toX = (i: number) => padX + (i / (points.length - 1)) * chartW;
  const toY = (v: number) => padTop + chartH - ((v - min) / span) * chartH;
  const zeroY = toY(0);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.balance).toFixed(1)}`).join(" ");
  const lastX = toX(points.length - 1);
  const areaPath = `${linePath} L ${lastX.toFixed(1)} ${zeroY.toFixed(1)} L ${toX(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  const indexByDate = new Map(points.map((p, i) => [p.date, i]));
  // Only label the biggest handful of events so the chart stays legible.
  const topEvents = [...events].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 6);
  const labeled = new Set(topEvents.map((e) => `${e.date}-${e.label}`));

  return (
    <div className="w-full overflow-x-auto">
      <div className="mb-1 text-xs font-medium text-slate-400">{monthLabel}</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label={`Solde prévisionnel ${monthLabel}`} style={{ minWidth: 480 }}>
        <defs>
          <linearGradient id="forecast-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={padX} x2={width - padX} y1={zeroY} y2={zeroY} stroke="#c3c2b7" strokeWidth={1} strokeDasharray="4 4" />
        <path d={areaPath} fill="url(#forecast-fill)" />
        <path d={linePath} fill="none" stroke="#0f172a" strokeWidth={2} />

        {events.map((e, i) => {
          const idx = indexByDate.get(e.date);
          if (idx === undefined) return null;
          const x = toX(idx);
          const y = toY(points[idx].balance);
          const isLabeled = labeled.has(`${e.date}-${e.label}`);
          const color = e.amount >= 0 ? "#059669" : "#e11d48";
          const above = e.amount >= 0;
          return (
            <g key={i}>
              <circle cx={x} cy={y} r={4} fill={color} stroke="#fcfcfb" strokeWidth={1.5}>
                <title>{`${e.date} · ${e.label} · ${e.amount >= 0 ? "+" : ""}${formatEUR(e.amount)}`}</title>
              </circle>
              {isLabeled && (
                <text x={x} y={above ? y - 22 : y + 34} textAnchor="middle" className="fill-slate-500 text-[10px] font-medium">
                  <tspan x={x} dy="0">{e.date.slice(8)} {new Date(`${e.date}T00:00:00`).toLocaleDateString("fr-FR", { month: "short" })}</tspan>
                  <tspan x={x} dy="12" className={above ? "fill-emerald-600" : "fill-rose-600"} fontWeight={700}>
                    {e.amount >= 0 ? "+" : ""}{formatEUR(e.amount)}
                  </tspan>
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
