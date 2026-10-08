import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { loadWidgetData, loadWidgetLayout } from "@/lib/data/widgets";
import { WidgetBoard } from "@/components/app/widgets/board";

export function generateMetadata(): Metadata {
  return { title: getT()("Courses — Vue d'ensemble") };
}

export default async function Overview() {
  const tr = getT();
  const [data, layout] = await Promise.all([loadWidgetData(), loadWidgetLayout("courses")]);
  if (!data) return null;
  return (
    <WidgetBoard
      page="courses"
      initial={layout}
      data={data}
      toolbar={<p className="text-xs text-stone-500">{tr("Ta vue d'ensemble est faite de widgets : personnalise-la comme tu veux.")}</p>}
    />
  );
}
