import { getAppContext } from "@/lib/data/context";
import { loadWidgetData, loadWidgetLayout } from "@/lib/data/widgets";
import { WidgetBoard } from "@/components/app/widgets/board";

export default async function DashboardPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const [data, layout] = await Promise.all([loadWidgetData(), loadWidgetLayout("dashboard")]);
  if (!data) return null;

  const name = ctx.profile?.display_name?.split(" ")[0] ?? "";
  const dateLabel = new Date(`${data.today}T00:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  return (
    <WidgetBoard
      page="dashboard"
      initial={layout}
      data={data}
      toolbar={
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Bonjour{name ? ` ${name}` : ""} 👋</h1>
          <p className="mt-0.5 text-sm capitalize text-stone-500">{dateLabel}</p>
        </div>
      }
    />
  );
}
