import type { Metadata } from "next";
import Link from "next/link";
import { getAppContext } from "@/lib/data/context";
import type { Routine } from "@/lib/types";
import { WEEKDAYS_FR } from "@/lib/utils";
import { createRoutine, archiveRoutine, restoreRoutine, deleteRoutineForever } from "@/app/app/calendar/actions";
import { RoutineTracker } from "@/components/app/routine-tracker";
import { addDays } from "@/lib/finance-engine";
import { loadWidgetData } from "@/lib/data/widgets";
import { RoutinesCurvePage } from "@/components/app/widgets/standalone";
import { todayISO } from "@/lib/utils";

export const metadata: Metadata = { title: "Gérer mes routines" };

export default async function RoutinesPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile } = ctx;
  const householdId = profile?.household_id ?? "";

  const { data: routines } = await supabase.from("routines").select("*").eq("household_id", householdId).order("created_at", { ascending: false }).returns<Routine[]>();
  const today = todayISO();
  const widgetData = await loadWidgetData();
  const { data: recent } = await supabase.from("routine_logs").select("routine_id, log_date").gte("log_date", addDays(today, -6)).lte("log_date", today);
  const doneKeys = (recent ?? []).map((l) => `${l.routine_id}_${l.log_date}`);
  const active = (routines ?? []).filter((r) => r.active);
  const archived = (routines ?? []).filter((r) => !r.active);

  return (
    <div className="space-y-6">
      <p className="text-xs text-stone-500">Crée, archive et restaure tes routines. Une routine archivée disparaît du calendrier mais reste récupérable.</p>

      {widgetData && <RoutinesCurvePage data={widgetData} />}

      <section className="card p-5">
        <h2 className="mb-1 font-semibold text-stone-900">Suivi des 7 derniers jours</h2>
        <p className="mb-3 text-xs text-stone-500">Coche ce que tu as fait, y compris un jour oublié : la courbe se met à jour.</p>
        <RoutineTracker routines={active} doneKeys={doneKeys} today={today} />
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-stone-900">Nouvelle routine</h2>
        <form action={createRoutine} className="flex flex-wrap items-end gap-2">
          <div>
            <label className="label">Titre</label>
            <input name="title" placeholder="Ex. Séance de sport" className="input mt-1 w-56" required />
          </div>
          <div>
            <label className="label">Catégorie</label>
            <input name="category" placeholder="Sport, Projet…" className="input mt-1 w-40" />
          </div>
          <div>
            <label className="label">Fréquence</label>
            <select name="frequency" className="input mt-1 w-36" defaultValue="daily">
              <option value="daily">Quotidienne</option>
              <option value="weekly">Hebdomadaire</option>
            </select>
          </div>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS_FR.map((d, i) => (
              <label key={d} className="flex items-center gap-1 rounded-lg border border-stone-200 px-2 py-1.5 text-xs">
                <input type="checkbox" name="days" value={i} className="h-3 w-3" /> {d}
              </label>
            ))}
          </div>
          <button className="btn-primary">Créer</button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-stone-900">Actives ({active.length})</h2>
        {active.length === 0 && <p className="text-sm text-stone-400">Aucune routine active.</p>}
        <ul className="space-y-2">
          {active.map((r) => (
            <li key={r.id} className="flex items-center justify-between rounded-xl border border-stone-100 px-3 py-2 text-sm">
              <span>
                <span className="font-medium text-stone-800">{r.title}</span>
                <span className="ml-2 text-xs text-stone-400">
                  {r.category} · {r.frequency === "daily" ? "Quotidienne" : "Hebdo"}
                  {r.frequency === "weekly" && r.days_of_week?.length ? ` (${r.days_of_week.map((d) => WEEKDAYS_FR[d]).join(", ")})` : ""}
                </span>
              </span>
              <form action={archiveRoutine.bind(null, r.id)}>
                <button className="text-xs text-stone-400 hover:text-rose-600">Archiver</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      {archived.length > 0 && (
        <section className="card p-6">
          <h2 className="mb-1 font-semibold text-stone-900">Archivées ({archived.length})</h2>
          <p className="mb-4 text-xs text-stone-400">Retrouvées ici, mais retirées du calendrier tant qu'elles ne sont pas restaurées.</p>
          <ul className="space-y-2">
            {archived.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/60 px-3 py-2 text-sm text-stone-500">
                <span>
                  <span className="font-medium">{r.title}</span>
                  <span className="ml-2 text-xs text-stone-400">{r.category} · {r.frequency === "daily" ? "Quotidienne" : "Hebdo"}</span>
                </span>
                <div className="flex items-center gap-3">
                  <form action={restoreRoutine.bind(null, r.id)}>
                    <button className="text-xs font-medium text-brand-600 hover:underline">Restaurer</button>
                  </form>
                  <form action={deleteRoutineForever.bind(null, r.id)}>
                    <button className="text-xs text-stone-400 hover:text-rose-600">Supprimer définitivement</button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
