import { formatEUR } from "@/lib/utils";
import { INCOME_COLOR, EXPENSE_COLOR } from "@/components/app/charts/palette";

export function MonthlyBarChart({
  months,
  height = 220,
}: {
  months: { label: string; income: number; expense: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...months.map((m) => Math.max(m.income, m.expense)));
  const barWidth = 16;
  const groupGap = 44;
  const width = months.length * groupGap + 20;
  const chartHeight = height - 28; // reserve space for x-axis labels

  return (
    <div className="w-full overflow-x-auto">
      <svg width={Math.max(width, 260)} height={height} viewBox={`0 0 ${Math.max(width, 260)} ${height}`} role="img" aria-label="Revenus et dépenses par mois">
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={0}
            x2={Math.max(width, 260)}
            y1={chartHeight - chartHeight * f}
            y2={chartHeight - chartHeight * f}
            stroke="#e1e0d9"
            strokeWidth={1}
          />
        ))}
        {months.map((m, i) => {
          const gx = 20 + i * groupGap;
          const incomeH = (m.income / max) * chartHeight;
          const expenseH = (m.expense / max) * chartHeight;
          return (
            <g key={i}>
              <rect x={gx} y={chartHeight - incomeH} width={barWidth} height={incomeH} rx={4} fill={INCOME_COLOR.light}>
                <title>{`Revenus ${m.label} — ${formatEUR(m.income)}`}</title>
              </rect>
              <rect
                x={gx + barWidth + 4}
                y={chartHeight - expenseH}
                width={barWidth}
                height={expenseH}
                rx={4}
                fill={EXPENSE_COLOR.light}
              >
                <title>{`Charges ${m.label} — ${formatEUR(m.expense)}`}</title>
              </rect>
              <text x={gx + barWidth} y={chartHeight + 16} textAnchor="middle" className="fill-slate-400 text-[10px]">
                {m.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: INCOME_COLOR.light }} /> Revenus</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EXPENSE_COLOR.light }} /> Charges</span>
      </div>
    </div>
  );
}
