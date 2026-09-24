"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/types";

async function getHouseholdId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#4d5dfb");
  const icon = String(formData.get("icon") || "📁");
  if (!name) return;
  const { supabase, householdId, userId } = await getHouseholdId();
  if (!householdId) return;
  await supabase.from("projects").insert({ household_id: householdId, name, color, icon, created_by: userId });
  revalidatePath("/app/tasks");
}

export async function archiveProject(projectId: string) {
  const { supabase } = await getHouseholdId();
  await supabase.from("projects").update({ archived: true }).eq("id", projectId);
  revalidatePath("/app/tasks");
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("project_id") || "") || null;
  const priority = String(formData.get("priority") || "medium") as TaskPriority;
  const dueDate = String(formData.get("due_date") || "") || null;
  if (!title) return;
  const { supabase, householdId, userId } = await getHouseholdId();
  if (!householdId) return;
  await supabase.from("tasks").insert({
    household_id: householdId,
    title,
    project_id: projectId,
    priority,
    due_date: dueDate,
    status: "todo",
    created_by: userId,
  });
  revalidatePath("/app/tasks");
  revalidatePath("/app");
}

export async function deleteTask(taskId: string) {
  const { supabase } = await getHouseholdId();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/app/tasks");
  revalidatePath("/app");
}
