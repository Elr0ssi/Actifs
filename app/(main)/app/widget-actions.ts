"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { sanitizeLayout, type WidgetItem, type WidgetPage } from "@/lib/widgets/registry";

const PATHS: Record<WidgetPage, string> = { dashboard: "/app", finance: "/app/finance", tasks: "/app/tasks", courses: "/app/lists", notes: "/app/notes" };

export async function saveWidgetLayout(page: WidgetPage, items: WidgetItem[]) {
  if (!(page in PATHS)) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  if (!user) return;
  const { data: profile } = await supabase.from("profiles").select("widget_layouts").eq("id", user.id).single();
  const layouts = { ...((profile?.widget_layouts as Record<string, unknown>) ?? {}), [page]: sanitizeLayout(items, page) };
  await supabase.from("profiles").update({ widget_layouts: layouts }).eq("id", user.id);
  revalidatePath(PATHS[page]);
}
