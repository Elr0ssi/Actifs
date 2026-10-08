import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";
import { signup } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/marketing/auth-shell";
import { GoogleButton } from "@/components/marketing/google-button";
import { CredentialForm } from "@/components/marketing/credential-form";

export function generateMetadata(): Metadata {
  return { title: getT()("Créer mon espace") };
}

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  const tr = getT();
  return (
    <AuthShell
      title={tr("Crée ton espace gratuit")}
      subtitle={tr("30 secondes, aucune carte bancaire.")}
      footer={
        <p className="text-sm text-stone-500">
          {tr("Déjà un compte ?")} <Link href="/login" className="font-semibold text-brand-600">{tr("Se connecter")}</Link>
        </p>
      }
    >
      <div className="mb-4 space-y-4">
        <GoogleButton label={tr("S'inscrire avec Google")} />
        <div className="flex items-center gap-3 text-xs text-stone-500"><span className="h-px flex-1 bg-stone-200" />{tr("ou avec ton email")}<span className="h-px flex-1 bg-stone-200" /></div>
      </div>
      <CredentialForm action={signup} className="space-y-4">
        {searchParams?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}
        <div>
          <label className="label" htmlFor="displayName">{tr("Prénom")}</label>
          <input className="input mt-1.5" id="displayName" name="displayName" type="text" autoComplete="given-name" maxLength={60} required placeholder={tr("Val")} />
        </div>
        <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
          <label htmlFor="website">{tr("Ne pas remplir")}</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>
        <div>
          <label className="label" htmlFor="email">{tr("Email")}</label>
          <input className="input mt-1.5" id="email" name="email" type="email" autoComplete="email" inputMode="email" maxLength={200} required placeholder={tr("toi@exemple.com")} />
        </div>
        <div>
          <label className="label" htmlFor="password">{tr("Mot de passe")}</label>
          <input className="input mt-1.5" id="password" name="password" type="password" autoComplete="new-password" required minLength={6} maxLength={200} placeholder={tr("6 caractères min.")} />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">{tr("Créer mon espace")}</button>
      </CredentialForm>
    </AuthShell>
  );
}
