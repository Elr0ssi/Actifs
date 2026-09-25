import Link from "next/link";
import type { Metadata } from "next";
import { signup } from "@/app/(auth)/actions";
import { AuthShell } from "@/components/marketing/auth-shell";

export const metadata: Metadata = { title: "Créer mon espace" };

export default function SignupPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <AuthShell
      title="Crée ton espace gratuit"
      subtitle="30 secondes, aucune carte bancaire."
      footer={
        <p className="text-sm text-slate-500">
          Déjà un compte ? <Link href="/login" className="font-semibold text-brand-600">Se connecter</Link>
        </p>
      }
    >
      <form action={signup} className="space-y-4">
        {searchParams?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{searchParams.error}</p>
        )}
        <div>
          <label className="label" htmlFor="displayName">Prénom</label>
          <input className="input mt-1.5" id="displayName" name="displayName" type="text" required placeholder="Val" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input className="input mt-1.5" id="email" name="email" type="email" autoComplete="email" required placeholder="toi@exemple.com" />
        </div>
        <div>
          <label className="label" htmlFor="password">Mot de passe</label>
          <input className="input mt-1.5" id="password" name="password" type="password" autoComplete="new-password" required minLength={6} placeholder="6 caractères min." />
        </div>
        <button type="submit" className="btn-primary w-full py-2.5">Créer mon espace</button>
      </form>
    </AuthShell>
  );
}
