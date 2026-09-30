import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Profile } from "@/lib/types";
import { updateProfile, updateHouseholdName, joinHousehold, changePassword } from "@/app/app/settings/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { cookies } from "next/headers";
import { CalendarFeedCard } from "@/components/app/calendar-feed-card";
import { AppearancePicker } from "@/components/app/appearance-picker";
import { ACCENT_COOKIE, THEME_COOKIE, parseAccent, parseMode } from "@/lib/theme";

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
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Paramètres</h1>
        <p className="mt-1 text-sm text-stone-500">Ton profil et ton foyer partagé.</p>
      </div>

      <section className="card p-6">
        <h2 className="mb-1 font-semibold text-stone-900">Apparence</h2>
        <p className="mb-4 text-xs text-stone-500">Mode clair ou sombre et couleur d'accent, enregistrés sur cet appareil.</p>
        <AppearancePicker mode={parseMode(cookies().get(THEME_COOKIE)?.value)} accent={parseAccent(cookies().get(ACCENT_COOKIE)?.value)} />
      </section>

      <section className="card p-6">
        <h2 className="mb-1 font-semibold text-stone-900">Synchroniser mon calendrier</h2>
        <p className="mb-4 text-xs text-stone-500">Retrouve tes tâches (avec heure) et tes routines dans Google Agenda ou le Calendrier de ton iPhone.</p>
        <CalendarFeedCard token={(household as { ical_token?: string } | null)?.ical_token ?? ""} />
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-stone-900">Mon profil</h2>
        <p className="mb-4 text-sm text-stone-500">{user.email}</p>
        <form action={updateProfile} className="flex gap-2">
          <input name="display_name" defaultValue={profile?.display_name ?? ""} className="input flex-1" />
          <SubmitButton className="btn-primary">Enregistrer</SubmitButton>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-1 font-semibold text-stone-900">Mot de passe</h2>
        <p className="mb-4 text-xs text-stone-500">Si ton navigateur signale ton mot de passe comme compromis, choisis-en un nouveau, unique (8 caractères min.).</p>
        <form action={changePassword} className="flex gap-2">
          <input name="password" type="password" autoComplete="new-password" minLength={8} placeholder="Nouveau mot de passe" className="input flex-1" required />
          <SubmitButton className="btn-primary">Changer</SubmitButton>
        </form>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 font-semibold text-stone-900">Mon foyer</h2>
        <form action={updateHouseholdName} className="mb-5 flex gap-2">
          <input name="household_name" defaultValue={household?.name ?? ""} className="input flex-1" />
          <SubmitButton className="btn-primary">Renommer</SubmitButton>
        </form>

        <p className="mb-2 text-sm font-medium text-stone-700">Membres</p>
        <ul className="mb-5 space-y-1">
          {(members ?? []).map((m) => (
            <li key={m.id} className="text-sm text-stone-600">• {m.display_name || m.id}</li>
          ))}
        </ul>

        <div className="rounded-xl border border-dashed border-stone-200 p-4">
          <p className="text-sm font-medium text-stone-700">Inviter ton/ta partenaire</p>
          <p className="mt-1 text-xs text-stone-500">Partage-lui ce code pour qu'il/elle rejoigne ton espace :</p>
          <p className="mt-2 inline-block rounded-lg bg-stone-100 px-3 py-1.5 font-mono text-sm font-semibold tracking-wider text-stone-800">
            {household?.invite_code}
          </p>
        </div>

        <form action={joinHousehold} className="mt-5 flex gap-2">
          <input name="invite_code" placeholder="Rejoindre un autre foyer avec un code" className="input flex-1" />
          <SubmitButton className="btn-secondary">Rejoindre</SubmitButton>
        </form>
      </section>
    </div>
  );
}
