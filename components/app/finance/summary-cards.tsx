import { formatEUR } from "@/lib/utils";
import { cx } from "@/lib/utils";

export function FinanceSummaryCards({
  income,
  fixedCharges,
  variableBudget,
  savings,
  resteAVivre,
  daysInMonth,
}: {
  income: number;
  fixedCharges: number;
  variableBudget: number;
  savings: number;
  resteAVivre: number;
  daysInMonth: number;
}) {
  const pct = (n: number) => (income > 0 ? `${Math.round((n / income) * 100)}% des revenus` : "—");
  const perDay = resteAVivre / Math.max(1, daysInMonth);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <Card icon="↑" label="Revenus du mois" value={formatEUR(income)} sub="revenus prévus" accent="text-emerald-600" iconBg="bg-emerald-50 text-emerald-600" />
      <Card icon="🏠" label="Charges fixes" value={formatEUR(fixedCharges)} sub={pct(fixedCharges)} accent="text-rose-600" iconBg="bg-rose-50 text-rose-600" />
      <Card icon="🛍️" label="Budget variable" value={formatEUR(variableBudget)} sub={pct(variableBudget)} accent="text-amber-600" iconBg="bg-amber-50 text-amber-600" />
      <Card icon="🌱" label="Épargne / Investissement" value={formatEUR(savings)} sub={pct(savings)} accent="text-brand-600" iconBg="bg-brand-50 text-brand-600" />
      <Card
        icon="🏦"
        label="Reste à vivre du mois"
        value={formatEUR(resteAVivre)}
        sub={`${formatEUR(perDay)}/jour en moyenne`}
        accent={resteAVivre >= 0 ? "text-emerald-700" : "text-rose-600"}
        iconBg="bg-emerald-50 text-emerald-600"
        highlight
      />
    </div>
  );
}

function Card({
  icon,
  label,
  value,
  sub,
  accent,
  iconBg,
  highlight,
}: {
  icon: string;
  label: string;
  value: string;
  sub: string;
  accent: string;
  iconBg: string;
  highlight?: boolean;
}) {
  return (
    <div className={cx("card p-5", highlight && "border-emerald-200 bg-emerald-50/40 ring-1 ring-emerald-100")}>
      <div className={cx("mb-3 flex h-8 w-8 items-center justify-center rounded-lg text-sm", iconBg)}>{icon}</div>
      <p className="label">{label}</p>
      <p className={cx("mt-1 text-xl font-bold", accent)}>{value}</p>
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </div>
  );
}
