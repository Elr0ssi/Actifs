"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { todayISO } from "@/lib/utils";

export async function toggleTaskStatus(taskId: string, done: boolean) {
  const supabase = createClient();
  await supabase
    .from("tasks")
    .update({ status: done ? "done" : "todo", completed_at: done ? new Date().toISOString() : null })
    .eq("id", taskId);
  revalidatePath("/app");
  revalidatePath("/app/tasks");
}

export async function toggleRoutineLog(routineId: string, date: string, done: boolean) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (done) {
    await supabase
      .from("routine_logs")
      .upsert({ routine_id: routineId, log_date: date, done: true, user_id: user?.id }, { onConflict: "routine_id,log_date,user_id" });
  } else {
    await supabase
      .from("routine_logs")
      .delete()
      .eq("routine_id", routineId)
      .eq("log_date", date)
      .eq("user_id", user?.id ?? "");
  }
  revalidatePath("/app");
  revalidatePath("/app/calendar");
}

export async function quickAddTask(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  if (!title) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  if (!profile?.household_id) return;

  await supabase.from("tasks").insert({
    household_id: profile.household_id,
    title,
    priority: "medium",
    status: "todo",
    due_date: todayISO(),
    created_by: user?.id,
  });
  revalidatePath("/app");
  revalidatePath("/app/tasks");
}

export async function updateBalance(formData: FormData) {
  const balance = Number(formData.get("current_balance"));
  if (Number.isNaN(balance)) return;
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  if (!profile?.household_id) return;

  await supabase.from("households").update({ current_balance: balance, balance_ref_date: todayISO() }).eq("id", profile.household_id);
  await supabase
    .from("balance_entries")
    .upsert({ household_id: profile.household_id, entry_date: todayISO(), balance }, { onConflict: "household_id,entry_date" });
  revalidatePath("/app");
  revalidatePath("/app/finance");
}
