import Link from "next/link";
import type { Metadata } from "next";
import { login } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/marketing/auth-shell";
import { GoogleButton } from "@/components/marketing/google-button";
import { RememberedEmailInput } from "@/components/marketing/remembered-email-input";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell
      title="Content de te revoir"
      subtitle="Connecte-toi à ton espace Actifs."
      footer={
        <p className="text-sm text-slate-500">
          Pas encore de compte ? <Link href="/signup" className="font-semibold text-brand-600">Créer un espace</Link>
        </p>
      }
    >
      <div className="mb-4 space-y-4">
        <GoogleButton label="Continuer avec Google" />
        <div className="flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />ou avec ton email<span className="h-px flex-1 bg-slate-200" /></div>
      </div>
      <form action={login} className="space-y-4">
        {searchParams?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}
        <div>
          <label className="label" htmlFor="email">Email</label>
          <RememberedEmailInput />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input className="input mt-1.5" id="password" name="password" type="password" autoComplete="current-password" required minLength={6} placeholder="••••••••" />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">Se connecter</button>
      </form>
    </AuthShell>
  );
}
