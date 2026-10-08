"use server";

import { revalidatePath } from "next/cache";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import type { TaskPriority } from "@/lib/types";

async function getHouseholdId() {
  const supabase = createClient();
  const {
    data: { user },
  } = await getSessionUser(supabase);
  const { data: profile } = await supabase.from("profiles").select("household_id").eq("id", user?.id).single();
  return { supabase, householdId: profile?.household_id as string | undefined, userId: user?.id };
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const color = String(formData.get("color") || "#8b5cf6");
  const icon = String(formData.get("icon") || "📁");
  if (!name) return;
  const { supabase, householdId, userId } = await getHouseholdId();
  if (!householdId) return;
  await supabase.from("projects").insert({ household_id: householdId, name, color, icon, created_by: userId });
  revalidatePath("/app/tasks", "layout");
}

export async function archiveProject(projectId: string) {
  const { supabase } = await getHouseholdId();
  await supabase.from("projects").update({ archived: true }).eq("id", projectId);
  revalidatePath("/app/tasks", "layout");
}

export async function createTask(formData: FormData) {
  const title = String(formData.get("title") || "").trim();
  const projectId = String(formData.get("project_id") || "") || null;
  const priority = String(formData.get("priority") || "medium") as TaskPriority;
  const dueDate = String(formData.get("due_date") || "") || null;
  const dueTime = String(formData.get("due_time") || "") || null;
  const description = String(formData.get("description") || "").trim().slice(0, 10000) || null;
  const dueEnd = dueTime && String(formData.get("due_end") || "") > dueTime ? String(formData.get("due_end")) : null;
  if (!title) return;
  const { supabase, householdId, userId } = await getHouseholdId();
  if (!householdId) return;
  await supabase.from("tasks").insert({
    household_id: householdId,
    title,
    project_id: projectId,
    priority,
    due_date: dueDate,
    due_time: dueTime,
    due_end: dueEnd,
    description,
    status: "todo",
    created_by: userId,
  });
  revalidatePath("/app/tasks", "layout");
  revalidatePath("/app");
}

export async function deleteTask(taskId: string) {
  const { supabase } = await getHouseholdId();
  await supabase.from("tasks").delete().eq("id", taskId);
  revalidatePath("/app/tasks", "layout");
  revalidatePath("/app");
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/** Enregistre un rendez-vous / une tâche placée dans l'agenda (jour, heure de début et de fin) et ses infos principales. */
export async function saveTask(taskId: string, v: { description?: string | null; priority?: string; title?: string; project_id?: string | null; due_date?: string | null; due_time?: string | null; due_end?: string | null }) {
  const { supabase, householdId } = await getHouseholdId();
  if (!householdId) return;
  const patch: Record<string, string | null> = {};
  if (typeof v.title === "string" && v.title.trim()) patch.title = v.title.trim().slice(0, 300);
  if (v.description !== undefined) patch.description = v.description?.trim() ? v.description.trim().slice(0, 10000) : null;
  if (v.priority && ["low", "medium", "high"].includes(v.priority)) patch.priority = v.priority;
  if (v.project_id !== undefined) patch.project_id = v.project_id || null;
  if (v.due_date !== undefined) patch.due_date = v.due_date && DATE_RE.test(v.due_date) ? v.due_date : null;
  if (v.due_time !== undefined) patch.due_time = v.due_time && TIME_RE.test(v.due_time) ? v.due_time : null;
  if (v.due_end !== undefined) patch.due_end = v.due_end && TIME_RE.test(v.due_end) ? v.due_end : null;
  if (patch.due_time === null) patch.due_end = null;
  if (patch.due_time && patch.due_end && patch.due_end <= patch.due_time) patch.due_end = null;
  await supabase.from("tasks").update(patch).eq("id", taskId).eq("household_id", householdId);
  revalidatePath("/app/tasks", "layout");
  revalidatePath("/app");
}
