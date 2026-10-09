import { getT } from "@/lib/i18n/server";
import type { Metadata } from "next";
import { getAppContext } from "@/lib/data/context";
import type { Profile } from "@/lib/types";
import { updateProfile, updateHouseholdName, joinHousehold, changePassword } from "@/app/(main)/app/settings/actions";
import { SubmitButton } from "@/components/ui/submit-button";
import { cookies } from "next/headers";
import { LanguagePicker } from "@/components/app/language-picker";
import { CalendarFeedCard } from "@/components/app/calendar-feed-card";
import { AppearancePicker } from "@/components/app/appearance-picker";
import { CopyField } from "@/components/app/copy-field";
import { Icon, type IconName } from "@/components/app/icons";
import { ACCENT_COOKIE, THEME_COOKIE, parseAccent, parseMode } from "@/lib/theme";

export function generateMetadata(): Metadata {
  return { title: getT()("Paramètres") };
}

export default async function SettingsPage() {
  const tr = getT();
  const ctx = await getAppContext();
  if (!ctx) return null;
  const { supabase, profile, household, user } = ctx;

  const { data: members } = await supabase
    .from("profiles")
    .select("*")
    .eq("household_id", profile?.household_id ?? "")
    .returns<Profile[]>();

  const name = profile?.display_name || user.email?.split("@")[0] || "";
  const initial = (name || "?").slice(0, 1).toUpperCase();
  const nav = [
    { id: "profil", icon: "home" as const, label: tr("Profil") },
    { id: "foyer", icon: "list" as const, label: tr("Foyer") },
    { id: "langue", icon: "swap" as const, label: tr("Langue") },
    { id: "apparence", icon: "sparkle" as const, label: tr("Apparence") },
    { id: "calendrier", icon: "calendar" as const, label: tr("Calendrier") },
    { id: "securite", icon: "target" as const, label: tr("Mot de passe") },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">{tr("Paramètres")}</h1>
        <p className="mt-1 text-sm text-stone-500">{tr("Ton profil et ton foyer partagé.")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[11rem_1fr]">
        <nav aria-label={tr("Paramètres")} className="hidden lg:block">
          <ul className="sticky top-6 space-y-1">
            {nav.map((n) => (
              <li key={n.id}>
                <a href={`#${n.id}`} className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-[13px] font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900">
                  <Icon name={n.icon} className="h-4 w-4 text-stone-400" />{n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="min-w-0 space-y-6">
          <section id="profil" className="card relative scroll-mt-6 overflow-hidden p-0">
            <div className="h-20 bg-gradient-to-r from-brand-500 via-violet-500 to-fuchsia-500 opacity-90" aria-hidden />
            <div className="px-6 pb-6">
              <div className="-mt-9 flex flex-wrap items-end gap-4">
                <span className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-3xl border-4 border-surface bg-gradient-to-br from-brand-500 to-violet-700 text-3xl font-bold text-white shadow-lift">{initial}</span>
                <div className="min-w-0 pb-1">
                  <p className="truncate text-lg font-bold text-stone-900">{name}</p>
                  <p className="truncate text-xs text-stone-500">{user.email}</p>
                </div>
              </div>
              <form action={updateProfile} className="mt-5 flex flex-wrap gap-2">
                <label className="sr-only" htmlFor="display_name">{tr("Nom affiché")}</label>
                <input id="display_name" name="display_name" defaultValue={profile?.display_name ?? ""} placeholder={tr("Nom affiché")} className="input min-w-0 flex-1" />
                <SubmitButton className="btn-primary">{tr("Enregistrer")}</SubmitButton>
              </form>
            </div>
          </section>

          <Section id="foyer" icon="list" title={tr("Mon foyer")} desc={tr("L'espace que tu partages : listes, menu, agenda et budget communs.")}>
            <form action={updateHouseholdName} className="flex flex-wrap gap-2">
              <input name="household_name" defaultValue={household?.name ?? ""} className="input min-w-0 flex-1" />
              <SubmitButton className="btn-secondary">{tr("Renommer")}</SubmitButton>
            </form>

            <p className="label mb-2 mt-6">{tr("Membres")}</p>
            <ul className="flex flex-wrap gap-2">
              {(members ?? []).map((m) => (
                <li key={m.id} className="flex items-center gap-2 rounded-full border border-line bg-surface py-1 pl-1 pr-3 text-[13px] font-medium text-stone-700">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-600 text-xs font-bold text-white">{(m.display_name || "?").slice(0, 1).toUpperCase()}</span>
                  {m.display_name || m.id}
                  {m.id === user.id && <span className="rounded-full bg-stone-100 px-1.5 py-px text-[10px] font-semibold text-stone-500">{tr("Toi")}</span>}
                </li>
              ))}
            </ul>

            <div className="mt-6 rounded-2xl bg-stone-50 p-4">
              <p className="text-sm font-semibold text-stone-800">{tr("Inviter ton/ta partenaire")}</p>
              <p className="mb-3 mt-1 text-xs text-stone-500">{tr("Partage-lui ce code pour qu'il/elle rejoigne ton espace :")}</p>
              <CopyField value={household?.invite_code ?? ""} label={tr("Copier le code")} />
            </div>

            <form action={joinHousehold} className="mt-4 flex flex-wrap gap-2">
              <input name="invite_code" placeholder={tr("Rejoindre un autre foyer avec un code")} className="input min-w-0 flex-1" />
              <SubmitButton className="btn-secondary">{tr("Rejoindre")}</SubmitButton>
            </form>
          </Section>

          <Section id="langue" icon="swap" title={tr("Langue")} desc={tr("Langue de l'interface. Elle s'applique tout de suite.")}>
            <LanguagePicker />
          </Section>

          <Section id="apparence" icon="sparkle" title={tr("Apparence")} desc={tr("Mode clair ou sombre et couleur d'accent, enregistrés sur cet appareil.")}>
            <AppearancePicker mode={parseMode(cookies().get(THEME_COOKIE)?.value)} accent={parseAccent(cookies().get(ACCENT_COOKIE)?.value)} />
          </Section>

          <Section id="calendrier" icon="calendar" title={tr("Synchroniser mon calendrier")} desc={tr("Retrouve tes tâches (avec heure) et tes routines dans Google Agenda ou le Calendrier de ton iPhone.")}>
            <CalendarFeedCard token={(household as { ical_token?: string } | null)?.ical_token ?? ""} />
          </Section>

          <Section id="securite" icon="target" title={tr("Mot de passe")} desc={tr("Si ton navigateur signale ton mot de passe comme compromis, choisis-en un nouveau, unique (8 caractères min.).")}>
            <form action={changePassword} className="flex flex-wrap gap-2">
              <input name="password" type="password" autoComplete="new-password" minLength={8} placeholder={tr("Nouveau mot de passe")} className="input min-w-0 flex-1" required />
              <SubmitButton className="btn-primary">{tr("Changer")}</SubmitButton>
            </form>
          </Section>
        </div>
      </div>
    </div>
  );
}

function Section({ id, icon, title, desc, children }: { id: string; icon: IconName; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section id={id} className="card scroll-mt-6 p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><Icon name={icon} className="h-[18px] w-[18px]" /></span>
        <div className="min-w-0">
          <h2 className="font-semibold text-stone-900">{title}</h2>
          <p className="mt-0.5 text-xs text-stone-500">{desc}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
