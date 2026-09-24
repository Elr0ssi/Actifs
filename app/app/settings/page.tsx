import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Profile } from "@/lib/types";
import { updateProfile, updateHouseholdName, joinHousehold } from "@/app/app/settings/actions";

export const metadata: Metadata = { title: "Paramètres" };

export default async function SettingsPage() {
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household, user } = ctx;

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("household_id", profile?.household_id ?? "")
    .returns<Profile[]>();

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Paramètres</h1>
        <p className="mt-1 text-sm text-slate-500">Ton profil et ton foyer partagé.</p>
      </div>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Mon profil</h2>
        <p className="mb-4 text-sm text-slate-500">{user.email}</p>
        <form action={updateProfile} className="flex gap-2">
          <input name="display_name" defaultValue={profile?.display_name ?? ""} className="input flex-1" />
          <button className="btn-primary">Enregistrer</button>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-slate-900">Mon foyer</h2>
        <form action={updateHouseholdName} className="mb-5 flex gap-2">
          <input name="household_name" defaultValue={household?.name ?? ""} className="input flex-1" />
          <button className="btn-primary">Renommer</button>
        </form>

        <p className="mb-2 text-sm font-medium text-slate-700">Membres</p>
        <ul className="mb-5 space-y-1">
          {(members ?? []).map((m) => (
            <li key={m.id} className="text-sm text-slate-600">• {m.display_name || m.id}</li>
          ))}
        </ul>

        <div className="rounded-xl border border-dashed border-slate-200 p-4">
          <p className="text-sm font-medium text-slate-700">Inviter ton/ta partenaire</p>
          <p className="mt-1 text-xs text-slate-500">Partage-lui ce code pour qu'il/elle rejoigne ton espace :</p>
          <p className="mt-2 inline-block rounded-lg bg-slate-100 px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-slate-800">
            {household?.invite_code}
          </p>
        </div>

        <form action={joinHousehold} className="mt-5 flex gap-2">
          <input name="invite_code" placeholder="Rejoindre un autre foyer avec un code" className="input flex-1" />
          <button className="btn-secondary">Rejoindre</button>
        </form>
      </section>
    </div>
  );
}
