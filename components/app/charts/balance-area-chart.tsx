import { formatEUR } from "@/lib/utils";

export function BalanceAreaChart({
  points,
  width = 640,
  height = 180,
}: {
  points: { date: string; balance: number }[];
  width?: number;
  height?: number;
}) {
  if (points.length === 0) {
    return <p className="text-sm text-slate-400">Aucune échéance à venir sur la période.</p>;
  }

  const values = points.map((p) => p.balance);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const padY = 16;
  const chartH = height - padY * 2;

  const toX = (i: number) => (points.length > 1 ? (i / (points.length - 1)) * width : width / 2);
  const toY = (v: number) => padY + chartH - ((v - min) / span) * chartH;
  const zeroY = toY(0);

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.balance).toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${toX(points.length - 1).toFixed(1)} ${zeroY.toFixed(1)} L ${toX(0).toFixed(1)} ${zeroY.toFixed(1)} Z`;

  const last = points[points.length - 1];
  const positive = last.balance >= 0;
  const lineColor = positive ? "#059669" : "#e11d48";

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" role="img" aria-label="Solde cumulé projeté">
      <defs>
        <linearGradient id="balance-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity="0.18" />
          <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={0} x2={width} y1={zeroY} y2={zeroY} stroke="#c3c2b7" strokeWidth={1} strokeDasharray="4 4" />
      <path d={areaPath} fill="url(#balance-fill)" />
      <path d={linePath} fill="none" stroke={lineColor} strokeWidth={2} />
      {points.map((p, i) => (
        <circle key={i} cx={toX(i)} cy={toY(p.balance)} r={3.5} fill={lineColor} stroke="#fcfcfb" strokeWidth={1.5}>
          <title>{`${p.date} — solde ${formatEUR(p.balance)}`}</title>
        </circle>
      ))}
    </svg>
  );
}
