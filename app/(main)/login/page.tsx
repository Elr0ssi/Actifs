import { getT } from "@/lib/i18n/server";
import Link from "next/link";
import type { Metadata } from "next";
import { login } from "@/app/(main)/(auth)/actions";
import { AuthShell } from "@/components/marketing/auth-shell";
import { GoogleButton } from "@/components/marketing/google-button";
import { RememberedEmailInput } from "@/components/marketing/remembered-email-input";
import { CredentialForm } from "@/components/marketing/credential-form";

export function generateMetadata(): Metadata {
  return { title: getT()("Connexion") };
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  const tr = getT();
  return (
    <AuthShell
      title={tr("Content de te revoir")}
      subtitle={tr("Connecte-toi à ton espace Flozea.")}
      footer={
        <p className="text-sm text-stone-500">
          {tr("Pas encore de compte ?")} <Link href="/signup" className="font-semibold text-brand-600">{tr("Créer un espace")}</Link>
        </p>
      }
    >
      <div className="mb-4 space-y-4">
        <GoogleButton label={tr("Continuer avec Google")} />
        <div className="flex items-center gap-3 text-xs text-stone-500"><span className="h-px flex-1 bg-stone-200" />{tr("ou avec ton email")}<span className="h-px flex-1 bg-stone-200" /></div>
      </div>
      <CredentialForm action={login} className="space-y-4">
        {searchParams?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}
        <div>
          <label className="label" htmlFor="email">{tr("Email")}</label>
          <RememberedEmailInput />
        </div>
        <div>
          <label className="label" htmlFor="password">{tr("Mot de passe")}</label>
          <input className="input mt-1.5" id="password" name="password" type="password" autoComplete="current-password" required minLength={6} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">{tr("Se connecter")}</button>
      </CredentialForm>
    </AuthShell>
  );
}
