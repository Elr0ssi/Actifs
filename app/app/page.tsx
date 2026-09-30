import { getAppContext } from "@/lib/data/context";
import { loadWidgetData, loadWidgetLayout } from "@/lib/data/widgets";
import { WidgetBoard } from "@/components/app/widgets/board";
import { routineStreak, scheduledOn } from "@/components/app/widgets/helpers";
import { Icon, type IconName } from "@/components/app/icons";
import { cx } from "@/lib/utils";

function greeting() {
  const hour = Number(new Intl.DateTimeFormat("fr-FR", { hour: "numeric", hourCycle: "h23", timeZone: "Europe/Paris" }).format(new Date()));
  if (hour < 5) return "Bonne nuit";
  if (hour < 12) return "Bonjour";
  if (hour < 18) return "Bon après-midi";
  return "Bonsoir";
}

function Chip({ icon, children, tone = "neutral" }: { icon: IconName; children: React.ReactNode; tone?: "neutral" | "warn" | "good" }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[12px] font-medium backdrop-blur",
        tone === "warn" ? "border-rose-500/20 bg-rose-500/10 text-rose-600" : tone === "good" ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700" : "border-line bg-surface/70 text-stone-600"
      )}
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {children}
    </span>
  );
}

export default async function DashboardPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const [data, layout] = await Promise.all([loadWidgetData(), loadWidgetLayout("dashboard")]);
  if (!data) return null;

  const name = ctx.profile?.display_name?.split(" ")[0] ?? "";
  const dateLabel = new Date(`${data.today}T00:00:00Z`).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

  const open = data.tasks.filter((t) => t.status !== "done");
  const dueToday = open.filter((t) => t.due_date === data.today).length;
  const overdue = open.filter((t) => t.due_date && t.due_date < data.today).length;
  const routinesToday = data.routines.filter((r) => scheduledOn(r, data.today));
  const routinesDone = routinesToday.filter((r) => data.logs.some((l) => l.done && l.routine_id === r.id && l.log_date === data.today)).length;
  const streak = routineStreak(data.routines, data.logs, data.today);

  return (
    <WidgetBoard
      page="dashboard"
      initial={layout}
      data={data}
      toolbar={
        <div>
          <p className="text-[13px] font-medium capitalize text-brand-700">{dateLabel}</p>
          <h1 className="mt-0.5 text-3xl font-bold tracking-tight text-stone-900 sm:text-[2.1rem]">
            {greeting()}
            {name && (
              <>
                , <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent">{name}</span>
              </>
            )}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <Chip icon="tasks">{dueToday > 0 ? `${dueToday} tâche${dueToday > 1 ? "s" : ""} aujourd'hui` : "Aucune tâche prévue aujourd'hui"}</Chip>
            {overdue > 0 && <Chip icon="close" tone="warn">{overdue} en retard</Chip>}
            {routinesToday.length > 0 && (
              <Chip icon="repeat" tone={routinesDone === routinesToday.length ? "good" : "neutral"}>
                Routines {routinesDone}/{routinesToday.length}
              </Chip>
            )}
            {streak > 1 && <Chip icon="bolt" tone="good">{streak} jours de série</Chip>}
          </div>
        </div>
      }
    />
  );
}
